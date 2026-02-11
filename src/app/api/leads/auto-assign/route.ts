import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchLeads, updateLead } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role || 'user';
    const accountType = session.user.accountType || 'user';
    
    if (!['admin', 'owner'].includes(userRole) && accountType !== 'admin' && accountType !== 'owner') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const { assignmentType = 'round-robin', branchId, userRole: targetRole = 'sales' } = await request.json();

    // Get unassigned leads
    const allLeads = await fetchLeads();
    const unassignedLeads = allLeads.filter((lead: any) => 
      lead.status === 'new' && !lead.assignedTo
    );

    if (unassignedLeads.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No unassigned leads found',
        assigned: 0
      });
    }

    // Get available users (sales role)
    const orgId = session.user.organizationId || 'hope-energy';
    const allUsers = await redis.smembers(`org:${orgId}:users`);
    
    const availableUsers = [];
    for (const userId of allUsers) {
      const userInfo = await redis.get(`user:${userId}:info`) as any;
      if (userInfo && userInfo.role === targetRole && userInfo.isActive) {
        if (!branchId || userInfo.branchId === branchId) {
          availableUsers.push(userInfo);
        }
      }
    }

    if (availableUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No available users for assignment' 
      }, { status: 400 });
    }

    // Round-robin assignment
    const assignments = [];
    let userIndex = 0;

    for (const lead of unassignedLeads) {
      const assignedUser = availableUsers[userIndex];
      
      try {
        await updateLead(
          lead.id,
          {
            assignedTo: assignedUser.email,
            assignedToName: assignedUser.name,
            assignedDate: new Date().toISOString(),
            status: 'assigned',
            lastActivityBy: session.user.email,
            lastActivityDate: new Date().toISOString(),
          },
          session.user.email || 'system'
        );

        assignments.push({
          leadId: lead.id,
          assignedTo: assignedUser.email,
          success: true
        });

        // Move to next user (round-robin)
        userIndex = (userIndex + 1) % availableUsers.length;
      } catch (error: any) {
        assignments.push({
          leadId: lead.id,
          error: error.message,
          success: false
        });
      }
    }

    const successCount = assignments.filter(a => a.success).length;

    return NextResponse.json({
      success: true,
      message: `Auto-assigned ${successCount} leads`,
      assigned: successCount,
      total: unassignedLeads.length,
      assignments
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
