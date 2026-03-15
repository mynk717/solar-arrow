// src/app/api/subsidy/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

const SHEET_NAME = 'ENQUIRIES';

function colLetter(n: number): string {
  let result = '';
  while (n >= 0) {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Fix 3: session.sheetId not process.env ──
    const sheetId = (session.user as any).sheetId;
    const orgId   = (session.user as any).organizationId || 'default-org';

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const { enquiryId, subsidyAppliedDate, subsidyAmount, subsidyBankAccount, subsidyDocumentPath } =
      await request.json();

    if (!enquiryId || !subsidyAppliedDate || !subsidyAmount || !subsidyBankAccount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();

    // ── Fix 1: range covers all 122 cols ──
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A:DR`,
    });

    const rows      = response.data.values || [];
    const headers   = rows[0];
    const dataRows  = rows.slice(1);

    const rowIndex = dataRows.findIndex((row) => row[headers.indexOf('id')] === enquiryId);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const rowNumber = rowIndex + 2;

    // ── Fix 2: use colLetter() not String.fromCharCode ──
    const col = (field: string) => colLetter(headers.indexOf(field));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: `${SHEET_NAME}!${col('subsidyAmount')}${rowNumber}`,       values: [[subsidyAmount]] },
          { range: `${SHEET_NAME}!${col('subsidyStatus')}${rowNumber}`,       values: [['applied']] },
          { range: `${SHEET_NAME}!${col('subsidyAppliedDate')}${rowNumber}`,  values: [[subsidyAppliedDate]] },
          { range: `${SHEET_NAME}!${col('subsidyBankAccount')}${rowNumber}`,  values: [[subsidyBankAccount]] },
          { range: `${SHEET_NAME}!${col('subsidyDocumentPath')}${rowNumber}`, values: [[subsidyDocumentPath || '']] },
          { range: `${SHEET_NAME}!${col('updatedAt')}${rowNumber}`,           values: [[new Date().toISOString()]] },
        ],
      },
    });

    // ── Fix 4: org-scoped cache key ──
    await redis.del(`org:${orgId}:subsidies:all`);

    // ── Fix 5: org-scoped Telegram ──
    try {
      const row          = dataRows[rowIndex];
      const customerName = row[headers.indexOf('customerName')] || 'N/A';
      const capacity     = row[headers.indexOf('capacity')] || '';

      await sendOrgGroupNotification(orgId, {
        text: `💰 *Subsidy Application Submitted*\n\n📋 Enquiry: ${enquiryId}\n👤 Customer: ${customerName}\n⚡ Capacity: ${capacity} kW\n💵 Amount: ₹${parseFloat(subsidyAmount).toLocaleString('en-IN')}\n📅 Applied: ${new Date(subsidyAppliedDate).toLocaleDateString('en-IN')}\n🏦 Account: ${subsidyBankAccount}`,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({ success: true, message: 'Subsidy application submitted successfully' });
  } catch (error: any) {
    console.error('Error applying for subsidy:', error);
    return NextResponse.json({ error: error.message || 'Failed to apply for subsidy' }, { status: 500 });
  }
}
