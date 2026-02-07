import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateEnquiryInSheet, fetchEnquiryById } from '@/lib/googleSheets';
import { telegramBot } from '@/lib/telegram';
import {redis} from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enquiryId, trackingNumber, transportCompany } = await request.json();

    if (!enquiryId || !trackingNumber || !transportCompany) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch enquiry details
    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    // Update Google Sheets
    await updateEnquiryInSheet(enquiryId, {
      dispatchDate: new Date().toISOString().split('T')[0],
      trackingNumber,
      transportCompany,
      status: 'dispatched',
    });

    // Send Telegram notifications
    const sheetId = session.user.sheetId;
    if (sheetId) {
      try {
        const chatIdsData = await redis.get(`sheet:${sheetId}:dispatch_notify`);
const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];
        
        const message = `
🚚 *Material Dispatched*

📋 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry.customerName}
📍 *Location:* ${enquiry.area}
⚡ *Capacity:* ${enquiry.capacity} kW

📦 *Tracking:* ${trackingNumber}
🚛 *Transport:* ${transportCompany}
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
    console.error('Error dispatching:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
