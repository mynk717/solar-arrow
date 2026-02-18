// src/app/api/subsidy/apply/route.ts
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
      subsidyAppliedDate,
      subsidyAmount,
      subsidyBankAccount,
      subsidyDocumentPath,
    } = body;

    if (!enquiryId || !subsidyAppliedDate || !subsidyAmount || !subsidyBankAccount) {
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

    const actualRowIndex = rowIndex + 2; // +1 for header, +1 for 0-indexing

    // Update columns
    const subsidyStatusIndex = headers.indexOf('subsidyStatus');
    const subsidyAppliedDateIndex = headers.indexOf('subsidyAppliedDate');
    const subsidyAmountIndex = headers.indexOf('subsidyAmount');
    const subsidyBankAccountIndex = headers.indexOf('subsidyBankAccount');
    const subsidyDocumentPathIndex = headers.indexOf('subsidyDocumentPath');
    const updatedAtIndex = headers.indexOf('updatedAt');

    const updates = [
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyStatusIndex)}${actualRowIndex}`,
        values: [['applied']],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyAppliedDateIndex)}${actualRowIndex}`,
        values: [[subsidyAppliedDate]],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyAmountIndex)}${actualRowIndex}`,
        values: [[subsidyAmount]],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyBankAccountIndex)}${actualRowIndex}`,
        values: [[subsidyBankAccount]],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + subsidyDocumentPathIndex)}${actualRowIndex}`,
        values: [[subsidyDocumentPath || '']],
      },
      {
        range: `${SHEET_NAME}!${String.fromCharCode(65 + updatedAtIndex)}${actualRowIndex}`,
        values: [[new Date().toISOString()]],
      },
    ];

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
      
      const message = `💰 *Subsidy Application Submitted*\n\n` +
        `📋 Enquiry: ${enquiryId}\n` +
        `👤 Customer: ${customerName}\n` +
        `⚡ Capacity: ${capacity}\n` +
        `💵 Amount: ₹${parseFloat(subsidyAmount).toLocaleString('en-IN')}\n` +
        `📅 Applied: ${new Date(subsidyAppliedDate).toLocaleDateString('en-IN')}\n` +
        `🏦 Account: ${subsidyBankAccount}\n\n` +
        `🔗 [View Details](${process.env.NEXT_PUBLIC_BASE_URL}/subsidy)`;

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
      message: 'Subsidy application submitted successfully',
    });
  } catch (error: any) {
    console.error('Error applying for subsidy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply for subsidy' },
      { status: 500 }
    );
  }
}
