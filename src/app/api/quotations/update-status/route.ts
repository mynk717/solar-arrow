import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateEnquiryInSheet, fetchEnquiryById } from '@/lib/googleSheets';
import { telegramBot } from '@/lib/telegram';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quotationId, status } = await request.json();

    if (!quotationId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const enquiryId = quotationId.replace('QUOT-', 'ENQ-');
    const enquiry = await fetchEnquiryById(enquiryId);

    if (!enquiry) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Update quotation status
    await updateEnquiryInSheet(enquiryId, {
      quotationStatus: status,
      status: status === 'approved' ? 'quotation-approved' : 'survey-completed',
    });

    const sheetId = session.user.sheetId;
    try {
      const orgId = (session.user as any).organizationId || 'default-org';
      await sendOrgGroupNotification(orgId, {
        text: `${status === 'approved' ? '✅' : '❌'} *Quotation ${status === 'approved' ? 'Approved' : 'Rejected'}*\n\n📋 *Quotation:* ${quotationId}\n👤 *Customer:* ${enquiry.customerName}\n⚡ ${enquiry.capacity} kW\n\n${status === 'approved' ? '🎉 Proceed with registration.' : '⚠️ Follow up required.'}`,
        parseMode: 'Markdown',
      });
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
