// src/app/api/survey/schedule/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateEnquiryInSheet, fetchEnquiryById } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

async function sendTelegramNotification(enquiry: any, surveyDate: string, assignedTo: string) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!telegramBotToken) return;

  try {
    const orgId = enquiry.organizationId || 'default-org';
    const chatId = await redis.get(`org:${orgId}:telegram:surveyteam`);
    
    if (!chatId) return;

    const message = `
📋 *SURVEY SCHEDULED*

*Enquiry ID:* ${enquiry.id}
*Customer:* ${enquiry.customerName}
📱 *Phone:* ${enquiry.phone}
📍 *Location:* ${enquiry.area || 'N/A'}
⚡ *Capacity:* ${enquiry.capacity} kW

*Survey Details:*
📅 *Date:* ${new Date(surveyDate).toLocaleDateString('en-IN', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
👤 *Assigned To:* ${assignedTo}

*Action Required:* Complete site survey and submit details in the app.
`.trim();

    await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error('Telegram notification failed:', error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enquiryId, surveyDate, assignedTo, assignedToName } = await request.json();

    if (!enquiryId || !surveyDate || !assignedTo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get enquiry
    const enquiry = await fetchEnquiryById(enquiryId);
    
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    // Update enquiry with survey schedule
    await updateEnquiryInSheet(enquiryId, {
      surveyScheduledDate: surveyDate,
      surveyedBy: assignedTo,
      status: 'survey-scheduled',
    });

    // Send notification
    await sendTelegramNotification(enquiry, surveyDate, assignedToName || assignedTo);

    return NextResponse.json({ 
      success: true,
      message: 'Survey scheduled successfully'
    });
  } catch (error: any) {
    console.error('Error scheduling survey:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule survey' },
      { status: 500 }
    );
  }
}
