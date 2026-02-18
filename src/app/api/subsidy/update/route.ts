// src/app/api/subsidy/update/route.ts
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
      subsidyStatus,
      subsidyApprovedDate,
      subsidyDisbursedDate,
      subsidyUTR,
    } = body;

    if (!enquiryId || !subsidyStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate: If disbursed, must have disbursedDate and UTR
    if (subsidyStatus === 'disbursed' && (!subsidyDisbursedDate || !subsidyUTR)) {
      return NextResponse.json(
        { error: 'Disbursed status requires date and UTR' },
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
    const subsidyStatusIndex = headers.indexOf('subsidyStatus');
    const subsidyApprovedDateIndex = headers.indexOf('subsidyApprovedDate');
    const subsidyDisbursedDateIndex = headers.indexOf('subsidyDisbursedDate');
    const subsidyUTRIndex = headers.indexOf('subsidyUTR');
    const statusIndex = headers.indexOf('status');
    const updatedAtIndex = headers.indexOf('updatedAt');

    const updates = [
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyStatusIndex)}${actualRowIndex}`,
        values: [[subsidyStatus]],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + updatedAtIndex)}${actualRowIndex}`,
        values: [[new Date().toISOString()]],
      },
    ];

    // Add optional fields
    if (subsidyApprovedDate) {
      updates.push({
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyApprovedDateIndex)}${actualRowIndex}`,
        values: [[subsidyApprovedDate]],
      });
    }

    if (subsidyDisbursedDate) {
      updates.push({
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyDisbursedDateIndex)}${actualRowIndex}`,
        values: [[subsidyDisbursedDate]],
      });
    }

    if (subsidyUTR) {
      updates.push({
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyUTRIndex)}${actualRowIndex}`,
        values: [[subsidyUTR]],
      });
    }

    // ✅ AUTO-TRIGGER: If disbursed, set status = "active"
    if (subsidyStatus === 'disbursed') {
      updates.push({
        range: `${SHEET_NAME}!${String.fromCharCode(65 + statusIndex)}${actualRowIndex}`,
        values: [['active']],
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
    await redis.del('subsidies:all');

    // Send Telegram notification
    try {
      const customerName = dataRows[rowIndex][headers.indexOf('customerName')];
      const capacity = dataRows[rowIndex][headers.indexOf('capacity')];
      const subsidyAmount = dataRows[rowIndex][headers.indexOf('subsidyAmount')];
      
      let message = '';
      
      if (subsidyStatus === 'approved') {
        message = `✅ *Subsidy Approved*\n\n` +
          `📋 Enquiry: ${enquiryId}\n` +
          `👤 Customer: ${customerName}\n` +
          `⚡ Capacity: ${capacity}\n` +
          `💵 Amount: ₹${parseFloat(subsidyAmount || '0').toLocaleString('en-IN')}\n` +
          `📅 Approved: ${new Date(subsidyApprovedDate || '').toLocaleDateString('en-IN')}\n\n` +
          `⏳ Waiting for disbursement\n\n` +
          `🔗 [View Details](${process.env.NEXT_PUBLIC_BASE_URL}/subsidy)`;
      } else if (subsidyStatus === 'disbursed') {
        message = `🎉 *Subsidy Disbursed*\n\n` +
          `📋 Enquiry: ${enquiryId}\n` +
          `👤 Customer: ${customerName}\n` +
          `⚡ Capacity: ${capacity}\n` +
          `💵 Amount: ₹${parseFloat(subsidyAmount || '0').toLocaleString('en-IN')}\n` +
          `📅 Disbursed: ${new Date(subsidyDisbursedDate).toLocaleDateString('en-IN')}\n` +
          `🔢 UTR: ${subsidyUTR}\n\n` +
          `✨ Project Status: ACTIVE\n\n` +
          `🔗 [View Dashboard](${process.env.NEXT_PUBLIC_BASE_URL}/dashboard)`;
      }

      if (message) {
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
      }
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: subsidyStatus === 'disbursed' 
        ? 'Subsidy disbursed and project marked as active' 
        : 'Subsidy status updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating subsidy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subsidy' },
      { status: 500 }
    );
  }
}
