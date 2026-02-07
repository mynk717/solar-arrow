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
    if (sheetId) {
      try {
        const chatIdsData = await redis.get(`sheet:${sheetId}:quotation_notify`);
        const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];
        
        const message = `
${status === 'approved' ? '✅' : '❌'} *Quotation ${status === 'approved' ? 'Approved' : 'Rejected'}*

📋 *Quotation ID:* ${quotationId}
👤 *Customer:* ${enquiry.customerName}
⚡ *Capacity:* ${enquiry.capacity} kW

💵 *Final Cost:* ₹${(enquiry.finalCost || 0).toLocaleString()}

${status === 'approved' ? '🎉 Customer has approved the quotation! Proceed with registration.' : '⚠️ Customer has rejected the quotation. Follow up required.'}
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
    console.error('Error updating status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
