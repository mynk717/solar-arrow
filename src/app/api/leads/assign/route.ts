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
