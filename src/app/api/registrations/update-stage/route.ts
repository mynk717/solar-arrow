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

    const { enquiryId, stage } = await request.json();

    if (!enquiryId || !stage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const updateData: any = {
      registrationStage: stage,
    };

    // Update specific fields based on stage
    if (stage === 'feasibility_approved') {
      updateData.feasibilityApprovalDate = new Date().toISOString().split('T')[0];
    }

    await updateEnquiryInSheet(enquiryId, updateData);

    // Send Telegram notification
    const sheetId = session.user.sheetId;
    if (sheetId) {
      try {
        const chatIdsData = await redis.get(`sheet:${sheetId}:registration_notify`);
        const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];
        
        const stageLabels: any = {
          consumer_registered: 'Consumer Registered',
          application_submitted: 'Application Submitted',
          feasibility_approved: 'Feasibility Approved',
          vendor_selected: 'Vendor Selected',
          project_inspection: 'Project Inspection',
          work_started: 'Work Started',
          project_commissioned: 'Project Commissioned',
        };
        
        const message = `
🏛️ *CSPDCL Registration Update*

📋 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry.customerName}
⚡ *Capacity:* ${enquiry.capacity} kW

🔄 *Stage:* ${stageLabels[stage] || stage}

Registration journey updated successfully.
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
    console.error('Error updating stage:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
