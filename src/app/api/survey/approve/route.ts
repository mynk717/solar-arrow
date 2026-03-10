// src/app/api/survey/approve/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateSurvey, updateEnquiry, fetchEnquiryById, fetchSurveyByEnquiryId, updateLead } from '@/lib/googleSheets';
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
await updateSurvey(
  session.user.organizationId!,
  session.user.email,
  enquiryId,
  {
    surveyApproved: approved,
    surveyNotes: approved ? `Approved by ${session.user.email}` : `Rejected: ${rejectionReason || 'No reason provided'}`,
  }
);


    // ✅ Replace with
const enquiry = await fetchEnquiryById(enquiryId);
if (!enquiry) throw new Error('Enquiry not found');

await updateEnquiry({
  ...enquiry,
  surveyApproved: approved,
  status: approved ? 'survey-approved' : 'survey-rejected',
  ...((!approved) && { surveyRejectedReason: rejectionReason || '' }),
  updatedAt: new Date(),
});

        if (enquiry) {
          // ✅ Backpropagate status to parent lead if linked
          if (enquiry.leadId) {
            const orgId = (session.user as any).organizationId || 'default-org';
            await updateLead(orgId, enquiry.leadId, approved ? 'Survey Approved' : 'Survey Rejected');
            // Invalidate leads cache so list reflects new status
            await redis.del(`org:${orgId}:leads`);
            console.log(`✅ Lead ${enquiry.leadId} status synced → ${approved ? 'Survey Approved' : 'Survey Rejected'}`);
          }
    
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
