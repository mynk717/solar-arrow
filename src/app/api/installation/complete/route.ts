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

    const { enquiryId, installedBy, installationNotes } = await request.json();

    if (!enquiryId || !installedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    await updateEnquiryInSheet(enquiryId, {
      installationDate: new Date().toISOString().split('T')[0],
      installedBy,
      installationNotes,
      status: 'installation-completed',
    });

    // Send Telegram notifications
    const sheetId = session.user.sheetId;
    if (sheetId) {
      try {
        const chatIdsData = await redis.get(`sheet:${sheetId}:installation_notify`);
const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];
        
        const message = `
✅ *Installation Completed*

📋 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry.customerName}
📍 *Location:* ${enquiry.area}
⚡ *Capacity:* ${enquiry.capacity} kW

👷 *Installed By:* ${installedBy}
${installationNotes ? `📝 *Notes:* ${installationNotes}` : ''}

⏭️ *Next:* Awaiting government inspection
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
    console.error('Error completing installation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
