// src/app/api/survey/submit/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createSurvey, updateSurvey, fetchSurveyByEnquiryId, updateEnquiryInSheet } from '@/lib/googleSheets';
import type { Survey } from '@/lib/types';
import { redis } from '@/lib/redis';

async function sendTelegramNotification(survey: Survey, enquiry: any) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!telegramBotToken) return;

  try {
    const orgId = enquiry.organizationId || 'default-org';
    const chatId = await redis.get(`org:${orgId}:telegram:surveyteam`);
    
    if (!chatId) return;

    const message = `
✅ *SURVEY COMPLETED*

*Enquiry ID:* ${survey.enquiryId}
*Customer:* ${enquiry.customerName}
*Surveyor:* ${survey.surveyorName}

*Technical Details:*
⚡ Sanctioned Load: ${survey.sanctionedLoad} kW
🏗️ Installation: ${survey.installationSurface} (${survey.projectType})
📏 Structure: ${survey.structureStyle}
🧭 Direction: ${survey.slopeDirection} (${survey.inclinationDegrees}°)
🔌 Transformer: ${survey.transformerCapacity} kVA
📡 Monitoring: ${survey.monitoringSystem}

*Notes:* ${survey.surveyNotes || 'None'}

*Action Required:* Review and approve survey to proceed with quotation.
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

    if (!session?.user?.email || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const surveyData = await request.json();

    if (!surveyData.enquiryId) {
      return NextResponse.json({ error: 'Enquiry ID required' }, { status: 400 });
    }

    // Prepare survey object
    const survey: Survey = {
      enquiryId: surveyData.enquiryId,
      surveyDate: new Date().toISOString(),
      surveyorEmail: session.user.email,
      surveyorName: surveyData.surveyorName || session.user.name || session.user.email,
      projectType: surveyData.projectType || 'ONGRID',
      consumerCategory: surveyData.consumerCategory || 'DOMESTIC',
      installationSurface: surveyData.installationSurface || 'ROOFTOP',
      buildingFloor: parseInt(surveyData.buildingFloor) || 0,
      soilType: surveyData.soilType || 'CLAY',
      structureStyle: surveyData.structureStyle || 'STANDARD',
      slopeDirection: surveyData.slopeDirection || 'SOUTH',
      inclinationDegrees: parseFloat(surveyData.inclinationDegrees) || 15,
      frontLegHeight: parseFloat(surveyData.frontLegHeight) || 1.5,
      rearLegHeight: parseFloat(surveyData.rearLegHeight) || 2.5,
      rafterCount: parseInt(surveyData.rafterCount) || 4,
      purlineCount: parseInt(surveyData.purlineCount) || 8,
      sectionSpecifications: surveyData.sectionSpecifications || 'C_CHANNEL',
      sanctionedLoad: parseFloat(surveyData.sanctionedLoad) || 0,
      bpNumber: surveyData.bpNumber || '',
      transformerCapacity: parseFloat(surveyData.transformerCapacity) || 0,
      substationDistance: parseFloat(surveyData.substationDistance) || 0,
      panelToDcdbLength: parseFloat(surveyData.panelToDcdbLength) || 0,
      panelToDcdbSize: parseFloat(surveyData.panelToDcdbSize) || 0,
      dcdbToInverterLength: parseFloat(surveyData.dcdbToInverterLength) || 0,
      dcdbToInverterSize: parseFloat(surveyData.dcdbToInverterSize) || 0,
      inverterToAcdbLength: parseFloat(surveyData.inverterToAcdbLength) || 0,
      inverterToAcdbSize: parseFloat(surveyData.inverterToAcdbSize) || 0,
      acdbToMeterLength: parseFloat(surveyData.acdbToMeterLength) || 0,
      acdbToMeterSize: parseFloat(surveyData.acdbToMeterSize) || 0,
      meterToLtPanelLength: parseFloat(surveyData.meterToLtPanelLength) || 0,
      meterToLtPanelSize: parseFloat(surveyData.meterToLtPanelSize) || 0,
      existingEarthingCount: parseInt(surveyData.existingEarthingCount) || 0,
      newEarthingRequired: parseInt(surveyData.newEarthingRequired) || 0,
      lightningArrestorRequired: parseInt(surveyData.lightningArrestorRequired) || 0,
      shadowSources: surveyData.shadowSources || [],
      shadowRemovable: surveyData.shadowRemovable || false,
      internetAvailability: surveyData.internetAvailability || 'WIFI',
      monitoringSystem: surveyData.monitoringSystem || 'RMS',
      surveyApproved: false,
      surveyNotes: surveyData.surveyNotes || '',
      surveyPhotos: surveyData.surveyPhotos || '',
    };

    // ✅ Check if survey exists (using existing function signature)
    const existing = await fetchSurveyByEnquiryId(
      session.user.organizationId,
      session.user.email,
      surveyData.enquiryId
    );

    if (existing) {
      await updateSurvey(
        session.user.organizationId,
        session.user.email,
        surveyData.enquiryId,
        survey
      );
    } else {
      await createSurvey(
        session.user.organizationId,
        session.user.email,
        survey
      );
    }

    // ✅ Update enquiry status (using existing function signature - 2 params)
    await updateEnquiryInSheet(surveyData.enquiryId, {
      surveyCompletedDate: new Date().toISOString(),
      status: 'survey-completed',
    });

    // ✅ Get enquiry for notification (using existing function signature - 1 param)
    const { fetchEnquiryById } = await import('@/lib/googleSheets');
    const enquiry = await fetchEnquiryById(surveyData.enquiryId);

    if (enquiry) {
      await sendTelegramNotification(survey, enquiry);
    }

    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit survey' },
      { status: 500 }
    );
  }
}


