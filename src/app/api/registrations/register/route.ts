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

    const { enquiryId } = await request.json();

    if (!enquiryId) {
      return NextResponse.json({ error: 'Missing enquiry ID' }, { status: 400 });
    }

    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    // Generate registration numbers
    const timestamp = Date.now();
    const consumerRegNo = `CONS-${timestamp}`;
    const applicationNo = `APP-${timestamp}`;

    // Update with registration info
    await updateEnquiryInSheet(enquiryId, {
      consumerRegistrationNumber: consumerRegNo,
      applicationNumber: applicationNo,
      registrationDate: new Date().toISOString().split('T')[0],
      registrationStage: 'consumer_registered',
      status: 'registration-pending',
    });

    // Send Telegram notification
    const sheetId = session.user.sheetId;
    if (sheetId) {
      try {
        const chatIdsData = await redis.get(`sheet:${sheetId}:registration_notify`);
        const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];
        
        const message = `
🏛️ *CSPDCL Registration Initiated*

📋 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry.customerName}
⚡ *Capacity:* ${enquiry.capacity} kW

🆔 *Consumer Reg. No:* ${consumerRegNo}
📝 *Application No:* ${applicationNo}

✅ Consumer registration completed. Next: Application submission.
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
    console.error('Error registering:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
