// src/app/api/leads/log-call/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { logLeadActivity, updateLead } from '@/lib/googleSheets';
import { notifyLeadActivity } from '@/lib/notificationHelpers';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, callOutcome, notes, nextFollowupDate } = await request.json();

    if (!leadId || !callOutcome) {
      return NextResponse.json(
        { error: 'Lead ID and call outcome required' },
        { status: 400 }
      );
    }

    // Log activity in ACTIVITY_LOG tab
    await logLeadActivity(leadId, {
      activityType: 'call',
      outcome: callOutcome,
      notes,
      performedBy: session.user.email,
      timestamp: new Date().toISOString(),
    });

    // Update lead with last contact and next followup
    await updateLead(
      leadId,
      {
        lastContactDate: new Date(),
        nextFollowUpDate: nextFollowupDate ? new Date(nextFollowupDate) : undefined,
        lastActivityBy: session.user.email,
        lastActivityDate: new Date(),
        notes: notes,
      },
      session.user.email
    );
    try {
      const orgId = (session.user as any).organizationId || 'default-org';
      await notifyLeadActivity(
        orgId,
        leadId,
        leadId, // no customerName available here; optionally fetch lead first
        'call',
        {
          callOutcome,
          nextFollowupDate: nextFollowupDate || 'Not set',
        },
        session.user.email!,
        notes || ''
      );
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error logging call:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log call' },
      { status: 500 }
    );
  }
}