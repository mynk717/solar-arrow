// src/app/api/survey/approve/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateSurvey, updateEnquiryInSheet, fetchEnquiryById, fetchSurveyByEnquiryId } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

async function sendTelegramNotification(enquiry: any, approved: boolean, reason?: string) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!telegramBotToken) return;

  try {
    const orgId = enquiry.organizationId || 'default-org';
    const chatId = await redis.get(`org:${orgId}:telegram:surveyteam`);
    
    if (!chatId) return;

    const message = approved
      ? `
✅ *SURVEY APPROVED*

*Enquiry ID:* ${enquiry.id}
*Customer:* ${enquiry.customerName}

Survey has been approved and quotation can now be generated.

*Next Step:* Create quotation with surveyed system specifications.
`.trim()
      : `
❌ *SURVEY REJECTED*

*Enquiry ID:* ${enquiry.id}
*Customer:* ${enquiry.customerName}

*Reason:* ${reason || 'Not specified'}

*Action Required:* Re-survey the site and submit updated details.
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

    const userRole = (session.user as any).role || 'user';
    if (!['admin', 'owner'].includes(userRole)) {
      return NextResponse.json({ error: 'Only admin/owner can approve surveys' }, { status: 403 });
    }

    const { enquiryId, approved, rejectionReason } = await request.json();

    if (!enquiryId || approved === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update survey
    await updateSurvey(enquiryId, {
      surveyApproved: approved,
      surveyNotes: approved 
        ? `Approved by ${session.user.email}` 
        : `Rejected: ${rejectionReason || 'No reason provided'}`,
    });

    // Update enquiry
    if (approved) {
      await updateEnquiryInSheet(enquiryId, {
        surveyApproved: true,
        status: 'survey-approved',
      });
    } else {
      await updateEnquiryInSheet(enquiryId, {
        surveyApproved: false,
        status: 'survey-rejected',
        surveyRejectedReason: rejectionReason || '',
      });
    }

    // Get enquiry for notification
    const enquiry = await fetchEnquiryById(enquiryId);

    if (enquiry) {
      await sendTelegramNotification(enquiry, approved, rejectionReason);
    }

    return NextResponse.json({
      success: true,
      message: approved ? 'Survey approved' : 'Survey rejected',
    });
  } catch (error: any) {
    console.error('Error approving survey:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update survey' },
      { status: 500 }
    );
  }
}
