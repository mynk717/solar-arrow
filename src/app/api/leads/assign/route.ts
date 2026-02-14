import { notifyLeadAssigned } from '@/lib/telegram';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchLeads, updateLead } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and sales managers can assign
    const userRole = session.user.role || 'user';
    if (!['admin', 'sales'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { leadIds, assignToEmail, assignToName, assignmentType } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'Invalid lead IDs' }, { status: 400 });
    }

    if (!assignToEmail) {
      return NextResponse.json({ error: 'Assignee email required' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const leadId of leadIds) {
      try {
        // Update lead with assignment
        await updateLead(
          leadId,
          {
            assignedTo: assignToEmail,
            assignedToName: assignToName || assignToEmail,
            assignedDate: new Date().toISOString(),
            status: 'assigned',
            lastActivityBy: session.user.email,
            lastActivityDate: new Date().toISOString(),
          },
          session.user.email || 'system'
        );
        
        // 🔔 Telegram notification
        try {
          const orgId = session.user.organizationId || 'default-org';
          const allLeads = await fetchLeads();
          const lead = allLeads.find((l: any) => l.id === leadId);
        
          await notifyLeadAssigned(orgId, {
            id: leadId,
            customerName: lead?.customerName || 'Unknown',
            phone: lead?.phone || 'N/A',
            area: lead?.area,
            capacity: lead?.capacity,
            priority: (lead?.priority as any) || 'medium',
            assignedToName: assignToName || assignToEmail,
            assignedToEmail: assignToEmail,
          });
        } catch (err) {
          console.error('notifyLeadAssigned failed (non-blocking):', err);
        }
        
        results.push({ leadId, success: true });
        
      } catch (error: any) {
        errors.push({ leadId, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      assigned: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
