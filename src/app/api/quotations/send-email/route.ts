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

    const { quotationId } = await request.json();

    if (!quotationId) {
      return NextResponse.json({ error: 'Missing quotation ID' }, { status: 400 });
    }

    const enquiryId = quotationId.replace('QUOT-', 'ENQ-');
    const enquiry = await fetchEnquiryById(enquiryId);

    if (!enquiry) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Update status to 'sent'
    await updateEnquiryInSheet(enquiryId, {
      quotationStatus: 'sent',
      quotationSentDate: new Date().toISOString().split('T')[0],
    });

    // Send Telegram notification
    const sheetId = session.user.sheetId;
    if (sheetId) {
      try {
        const chatIdsData = await redis.get(`sheet:${sheetId}:quotation_notify`);
        const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];
        
        const message = `
📧 *Quotation Sent*

📋 *Quotation ID:* ${quotationId}
👤 *Customer:* ${enquiry.customerName}
⚡ *Capacity:* ${enquiry.capacity} kW

💰 *System Cost:* ₹${(enquiry.systemCost || 0).toLocaleString()}
💚 *Subsidy:* ₹${(enquiry.subsidyAmount || 0).toLocaleString()}
💵 *Final Cost:* ₹${(enquiry.finalCost || 0).toLocaleString()}

✅ Quotation has been sent to customer via email.
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
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
