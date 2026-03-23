import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateLead } from '@/lib/googleSheets';
import { notifyLeadAssigned } from '@/lib/telegram';
import { invalidateLeadsCache } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role || 'user';
    if (!['admin', 'sales'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { leadId, newAssignee, newAssigneeName, reason } = await request.json();

    if (!leadId || !newAssignee) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await updateLead(
      leadId,
      {
        assignedTo: newAssignee,
        assignedToName: newAssigneeName || newAssignee,
        assignedDate: new Date().toISOString(),
        reassignmentReason: reason,
        lastActivityBy: session.user.email,
        lastActivityDate: new Date().toISOString(),
        notes: `Reassigned from previous user. Reason: ${reason || 'Not specified'}`
      },
      session.user.email || 'system'
    );
    const orgId = (session.user as any).organizationId || 'default-org';

    try {
      await notifyLeadAssigned(orgId, {
        id: leadId,
        customerName: leadId,
        phone: '',
        area: undefined,
        capacity: undefined,
        priority: 'medium',
        assignedToName: newAssigneeName || newAssignee,
        assignedToEmail: newAssignee,
      });
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }

    try {
      await invalidateLeadsCache(orgId);
    } catch (cacheErr) {
      console.error('Cache invalidation failed:', cacheErr);
    }
    return NextResponse.json({
      success: true,
      message: 'Lead reassigned successfully',
      leadId,
      newAssignee
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
