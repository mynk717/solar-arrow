// src/app/api/survey/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { appendSheetRow, updateEnquiryInSheet, getGoogleSheetsClient } from '@/lib/googleSheets';
import { telegramBot } from '@/lib/telegram';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enquiryId, surveyData } = await request.json();

    if (!enquiryId || !surveyData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date();

    // 1. Save detailed survey data to SURVEY_DETAILS tab
    const surveyRow = [
      enquiryId,
      now.toISOString(),
      session.user.email,
      session.user.name,

      // Project Categorization
      surveyData.projectType,
      surveyData.consumerCategory,
      surveyData.installationSurface,
      surveyData.buildingFloor,
      surveyData.soilType,

      // Structural Engineering
      surveyData.structureStyle,
      surveyData.slopeDirection,
      surveyData.inclinationDegrees,
      surveyData.frontLegHeightMtr,
      surveyData.rearLegHeightMtr,
      surveyData.rafterCount,
      surveyData.purlineCount,
      surveyData.sectionSpecifications,

      // Electrical Infrastructure
      surveyData.sanctionedLoadKw,
      surveyData.bpNumber,
      surveyData.transformerCapacityKva,
      surveyData.substationDistanceMtr,

      // Cable Runs
      surveyData.panelToDcdbLengthMtr,
      surveyData.panelToDcdbSqMm,
      surveyData.dcdbToInverterLengthMtr,
      surveyData.dcdbToInverterSqMm,
      surveyData.inverterToAcdbLengthMtr,
      surveyData.inverterToAcdbSqMm,
      surveyData.acdbToMeterLengthMtr,
      surveyData.acdbToMeterSqMm,
      surveyData.meterToLtPanelLengthMtr,
      surveyData.meterToLtPanelSqMm,

      // Protection
      surveyData.existingEarthingCount,
      surveyData.newEarthingRequired,
      surveyData.lightningArrestorRequired,

      // Site Logistics
      JSON.stringify(surveyData.shadowSources || []),
      surveyData.shadowRemovable ? 'TRUE' : 'FALSE',
      surveyData.internetAvailability,
      surveyData.monitoringSystem,

      // Approval
      surveyData.surveyApproved ? 'TRUE' : 'FALSE',
      surveyData.surveyNotes,
      surveyData.surveyPhotos || '',
    ];

    await appendSheetRow('SURVEY_DETAILS', surveyRow);

    // 2. Update enquiry status
    const updateData: any = {
      surveyCompletedDate: now.toISOString(),
      surveyApproved: surveyData.surveyApproved,
      surveyNotes: surveyData.surveyNotes,
    };

    if (surveyData.surveyApproved) {
      // Approved - move to quotation stage
      updateData.status = 'quotation-pending';
    } else {
      // Rejected - mark as rejected
      updateData.status = 'survey-rejected';
    }

    await updateEnquiryInSheet(enquiryId, updateData);

    // 3. Send notifications based on approval and roles
    if (surveyData.surveyApproved) {
      // Get users with quotation/BOM permissions
      const orgId = session.user.organizationId;
      const orgUsers = await redis.smembers(`org:${orgId}:users`);

      let notificationRecipients: string[] = [];

      for (const userEmail of orgUsers) {
        const userInfo = await redis.get(`user:${userEmail}:info`) as any;
        if (userInfo && userInfo.role) {
          const permissions = await redis.get(`role:${userInfo.role}:permissions`) as any;

          // Notify users who can create quotations
          if (permissions?.quotations?.create) {
            notificationRecipients.push(userEmail);
          }
        }
      }

      // Send Telegram notifications to quotation team
      const message = `
🔍 *Survey Approved - Quotation Required*

📋 Enquiry: ${enquiryId}
✅ Status: Survey Approved
📅 Completed: ${now.toLocaleDateString()}
👤 Surveyed by: ${session.user.name}

*Next Action:* Create quotation and prepare BOM

Project Details:
• Type: ${surveyData.projectType}
• Category: ${surveyData.consumerCategory}
• Installation: ${surveyData.installationSurface}
• Sanctioned Load: ${surveyData.sanctionedLoadKw} kW

Notes: ${surveyData.surveyNotes}

🔗 Login to create quotation: [Your App URL]
      `.trim();

      // Send to quotation team chat
      const quotationTeamChatId = process.env.TELEGRAM_QUOTATION_TEAM_CHAT_ID;
      if (quotationTeamChatId) {
        await telegramBot.sendMessage(quotationTeamChatId, message, 'Markdown');
      }

      console.log(`✅ Survey approved notifications sent to ${notificationRecipients.length} users`);
    } else {
      // Survey rejected - notify admin
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (adminChatId) {
        const rejectMessage = `
❌ *Survey Rejected*

📋 Enquiry: ${enquiryId}
👤 Surveyed by: ${session.user.name}
📅 Date: ${now.toLocaleDateString()}

Reason: ${surveyData.surveyNotes}
        `.trim();

        await telegramBot.sendMessage(adminChatId, rejectMessage, 'Markdown');
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Survey submitted successfully',
      approved: surveyData.surveyApproved 
    });

  } catch (error: any) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit survey' },
      { status: 500 }
    );
  }
}