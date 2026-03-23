import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateEnquiryInSheet, fetchEnquiryById } from '@/lib/googleSheets';
import { telegramBot } from '@/lib/telegram';
import {redis} from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enquiryId, approved, inspectionOfficer, inspectionNotes } = await request.json();

    if (!enquiryId || approved === undefined || !inspectionOfficer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    await updateEnquiryInSheet(enquiryId, {
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectionOfficer,
      inspectionApproved: approved,
      inspectionNotes,
      activationDate: approved ? new Date().toISOString().split('T')[0] : undefined,
      status: approved ? 'active' : 'installation-completed',
    });

    // Send Telegram notifications
    const sheetId = session.user.sheetId;
    try {
      const orgId = (session.user as any).organizationId || 'default-org';
      await sendOrgGroupNotification(orgId, {
        text: `${approved ? '🎉' : '⚠️'} *Inspection ${approved ? 'Approved' : 'Rejected'}*\n\n📋 *Enquiry:* ${enquiryId}\n👤 *Customer:* ${enquiry.customerName}\n📍 ${enquiry.area}\n⚡ ${enquiry.capacity} kW\n\n👮 *Inspector:* ${inspectionOfficer}\n${inspectionNotes ? `📝 *Notes:* ${inspectionNotes}` : ''}\n\n${approved ? '✅ System now ACTIVE' : '❌ Requires rectification'}`,
        parseMode: 'Markdown',
      });
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error recording inspection:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
