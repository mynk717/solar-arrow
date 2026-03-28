import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateEnquiryInSheet, fetchEnquiryById } from '@/lib/googleSheets';
import { telegramBot } from '@/lib/telegram';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification, notifyNextStageUsers } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const orgId = (session.user as any).organizationId || 'default-org';
    const { enquiryId, surveyApproved, surveyNotes, roofType, roofArea } = await request.json();

    if (!enquiryId || surveyApproved === undefined || !surveyNotes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    await updateEnquiryInSheet(enquiryId, {
      surveyCompletedDate: new Date().toISOString().split('T')[0],
      surveyApproved,
      surveyNotes,
      roofType,
      roofArea,
      status: surveyApproved ? 'survey-completed' : 'survey-rejected',
    });

    // Send Telegram notification
    const sheetId = session.user.sheetId;
    try {
      await sendOrgGroupNotification(orgId, {
        text: `${surveyApproved ? '✅' : '❌'} *Survey ${surveyApproved ? 'Approved' : 'Rejected'}*\n\n📋 *Enquiry:* ${enquiryId}\n👤 *Customer:* ${enquiry.customerName}\n📍 ${enquiry.area}\n⚡ ${enquiry.capacity} kW\n\n${roofType ? `🏠 Roof: ${roofType}` : ''}\n${roofArea ? `📏 Area: ${roofArea} sq ft` : ''}\n📝 *Notes:* ${surveyNotes}\n\n${surveyApproved ? '⏭️ Next: Quotation & Registration' : '⚠️ Site not suitable'}`,
        parseMode: 'Markdown',
      });
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }
    if (surveyApproved) {
      await notifyNextStageUsers(
        orgId,
        '/registration',
        `🔔 *Action Required: Registration*\n\n📋 *Enquiry:* ${enquiryId}\n👤 *Customer:* ${enquiry.customerName}\n📍 *Area:* ${enquiry.area}\n⚡ *Capacity:* ${enquiry.capacity} kW\n\n_Survey approved. Please initiate CSPDCL registration._`
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error completing survey:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
