import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateEnquiryInSheet, fetchEnquiryById } from '@/lib/googleSheets';
import { telegramBot } from '@/lib/telegram';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enquiryId, approved } = await request.json();

    if (!enquiryId || approved === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    await updateEnquiryInSheet(enquiryId, {
      wcrStatus: approved ? 'approved' : 'rejected',
      wcrApprovedDate: approved ? new Date().toISOString().split('T')[0] : undefined,
      status: approved ? 'wcr-approved' : 'installation-completed',
    });

    // Send Telegram notification
    const sheetId = session.user.sheetId;
    if (sheetId) {
      try {
        const chatIdsData = await redis.get(`sheet:${sheetId}:wcr_notify`);
        const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];
        
        const message = `
${approved ? '✅' : '❌'} *WCR ${approved ? 'Approved' : 'Rejected'}*

📄 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry.customerName}
⚡ *Capacity:* ${enquiry.capacity} kW

🆔 *Registration:* ${enquiry.registrationId || 'N/A'}

${approved ? '⏭️ *Next:* Inspection & Subsidy application' : '⚠️ *Status:* WCR needs revision'}
        `.trim();

        for (const chatId of chatIds) {
          if (chatId) {
            await telegramBot.sendMessage(chatId, message, 'Markdown');
          }
        }
      } catch (error) {
        console.error('Telegram notification failed:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error approving WCR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
