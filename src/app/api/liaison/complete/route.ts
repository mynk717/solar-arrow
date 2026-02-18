// src/app/api/liaison/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

const SHEET_NAME = 'ENQUIRIES';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      enquiryId,
      inspectionDate,
      inspectionOfficer,
      inspectionApproved,
      inspectionRejectedReason,
      inspectionReportPath,
    } = body;

    if (!enquiryId || !inspectionDate || !inspectionOfficer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sheets = await getGoogleSheetsClient();

    // Get current data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: `${SHEET_NAME}!A:CZ`,
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Find the row
    const idIndex = headers.indexOf('id');
    const rowIndex = dataRows.findIndex((row) => row[idIndex] === enquiryId);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const actualRowIndex = rowIndex + 2;

    // Update columns
    const inspectionDateIndex = headers.indexOf('inspectionDate');
    const inspectionOfficerIndex = headers.indexOf('inspectionOfficer');
    const inspectionStatusIndex = headers.indexOf('inspectionStatus');
    const inspectionApprovedIndex = headers.indexOf('inspectionApproved');
    const inspectionRejectedReasonIndex = headers.indexOf('inspectionRejectedReason');
    const inspectionReportPathIndex = headers.indexOf('inspectionReportPath');
    const subsidyStatusIndex = headers.indexOf('subsidyStatus');
    const updatedAtIndex = headers.indexOf('updatedAt');

    const updates = [
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + inspectionDateIndex)}${actualRowIndex}`,
        values: [[inspectionDate]],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + inspectionOfficerIndex)}${actualRowIndex}`,
        values: [[inspectionOfficer]],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + inspectionStatusIndex)}${actualRowIndex}`,
        values: [[inspectionApproved ? 'approved' : 'rejected']],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + inspectionApprovedIndex)}${actualRowIndex}`,
        values: [[inspectionApproved ? 'TRUE' : 'FALSE']],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + inspectionRejectedReasonIndex)}${actualRowIndex}`,
        values: [[inspectionRejectedReason || '']],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + inspectionReportPathIndex)}${actualRowIndex}`,
        values: [[inspectionReportPath || '']],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + updatedAtIndex)}${actualRowIndex}`,
        values: [[new Date().toISOString()]],
      },
    ];

    // ✅ AUTO-TRIGGER: If approved, set subsidyStatus = "pending"
    if (inspectionApproved) {
      updates.push({
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyStatusIndex)}${actualRowIndex}`,
        values: [['pending']],
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      requestBody: {
        data: updates,
        valueInputOption: 'RAW',
      },
    });

    // Invalidate cache
    await redis.del('liaisons:all');
    await redis.del('subsidies:all'); // Also invalidate subsidy cache

    // Send Telegram notification
    try {
      const customerName = dataRows[rowIndex][headers.indexOf('customerName')];
      const capacity = dataRows[rowIndex][headers.indexOf('capacity')];
      
      const message = inspectionApproved
        ? `✅ *Inspection Approved*\n\n` +
          `📋 Enquiry: ${enquiryId}\n` +
          `👤 Customer: ${customerName}\n` +
          `⚡ Capacity: ${capacity}\n` +
          `📅 Date: ${new Date(inspectionDate).toLocaleDateString('en-IN')}\n` +
          `👨‍💼 Officer: ${inspectionOfficer}\n\n` +
          `🎯 Next Step: Subsidy application auto-triggered\n\n` +
          `🔗 [View Subsidy](${process.env.NEXT_PUBLIC_BASE_URL}/subsidy)`
        : `❌ *Inspection Rejected*\n\n` +
          `📋 Enquiry: ${enquiryId}\n` +
          `👤 Customer: ${customerName}\n` +
          `⚡ Capacity: ${capacity}\n` +
          `📅 Date: ${new Date(inspectionDate).toLocaleDateString('en-IN')}\n` +
          `👨‍💼 Officer: ${inspectionOfficer}\n` +
          `📝 Reason: ${inspectionRejectedReason || 'Not specified'}\n\n` +
          `🔗 [View Details](${process.env.NEXT_PUBLIC_BASE_URL}/liaison)`;

      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
          }),
        }
      );
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: inspectionApproved
        ? 'Inspection approved and subsidy auto-triggered'
        : 'Inspection rejected',
    });
  } catch (error: any) {
    console.error('Error completing inspection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete inspection' },
      { status: 500 }
    );
  }
}
