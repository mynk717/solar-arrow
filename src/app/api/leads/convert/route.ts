// src/app/api/leads/convert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { convertLeadToEnquiry } from '@/lib/googleSheets';
import { telegramBot } from '@/lib/telegram';
import {redis} from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, enquiryData } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // Convert lead to enquiry
    const enquiry = await convertLeadToEnquiry(leadId, enquiryData, session.user.email);

    // Send Telegram notification
    const sheetId = session.user.sheetId;
    if (sheetId) {
      try {
        const chatIdsData = await redis.get(`sheet:${sheetId}:leadnotify`);
        const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];

        const message = `🎯 *Lead Converted to Enquiry!*

Lead ID: ${leadId}
Enquiry ID: ${enquiry.id}
Customer: ${enquiry.customerName}
Capacity: ${enquiry.capacity}kW
Source: ${enquiry.leadSource || 'N/A'}
Converted by: ${session.user.email}

Status: Ready for survey scheduling`;

        for (const chatId of chatIds) {
          if (chatId) {
            await telegramBot.sendMessage(chatId, message, 'Markdown');
          }
        }
      } catch (error) {
        console.error('Telegram notification failed:', error);
      }
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    console.error('Error converting lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert lead' },
      { status: 500 }
    );
  }
}