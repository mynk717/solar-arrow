import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

const SHEET_NAME = 'ENQUIRIES';

// Proper multi-char column letter helper
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

    // ── Fix 3: use session.sheetId not process.env ──
    const sheetId = (session.user as any).sheetId;
    const orgId   = (session.user as any).organizationId || 'default-org';

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const { enquiryId, subsidyStatus, subsidyApprovedDate, subsidyDisbursedDate, subsidyUTR } =
      await request.json();

    if (!enquiryId || !subsidyStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (subsidyStatus === 'disbursed' && (!subsidyDisbursedDate || !subsidyUTR)) {
      return NextResponse.json(
        { error: 'Disbursed status requires date and UTR' },
        { status: 400 }
      );
    }

    const sheets = await getGoogleSheetsClient();

    // ── Fix 1: range covers all 122 cols ──
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A:DR`,
    });

    const rows = response.data.values || [];
    const headers = rows[0];
    const dataRows = rows.slice(1);

    const idIndex       = headers.indexOf('id');
    const rowIndex      = dataRows.findIndex((row) => row[idIndex] === enquiryId);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const rowNumber = rowIndex + 2;

    // ── Fix 2: use colLetter() not String.fromCharCode ──
    const col = (field: string) => colLetter(headers.indexOf(field));

    const updates: any[] = [
      { range: `${SHEET_NAME}!${col('subsidyStatus')}${rowNumber}`,  values: [[subsidyStatus]] },
      { range: `${SHEET_NAME}!${col('updatedAt')}${rowNumber}`,      values: [[new Date().toISOString()]] },
    ];

    if (subsidyApprovedDate) {
      updates.push({ range: `${SHEET_NAME}!${col('subsidyApprovedDate')}${rowNumber}`, values: [[subsidyApprovedDate]] });
    }
    if (subsidyDisbursedDate) {
      updates.push({ range: `${SHEET_NAME}!${col('subsidyDisbursedDate')}${rowNumber}`, values: [[subsidyDisbursedDate]] });
    }
    if (subsidyUTR) {
      updates.push({ range: `${SHEET_NAME}!${col('subsidyUTR')}${rowNumber}`, values: [[subsidyUTR]] });
    }
    if (subsidyStatus === 'disbursed') {
      updates.push({ range: `${SHEET_NAME}!${col('status')}${rowNumber}`, values: [['active']] });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { data: updates, valueInputOption: 'USER_ENTERED' },
    });

    // ── Fix 4: org-scoped cache key ──
    await redis.del(`org:${orgId}:subsidies:all`);

    // ── Fix 5: org-scoped Telegram ──
    try {
      const row        = dataRows[rowIndex];
      const customerName  = row[headers.indexOf('customerName')] || 'N/A';
      const capacity      = row[headers.indexOf('capacity')] || '';
      const subsidyAmount = parseFloat(row[headers.indexOf('subsidyAmount')] || '0');

      const message =
        subsidyStatus === 'approved'
          ? `✅ *Subsidy Approved*\n\n📋 Enquiry: ${enquiryId}\n👤 Customer: ${customerName}\n⚡ Capacity: ${capacity} kW\n💵 Amount: ₹${subsidyAmount.toLocaleString('en-IN')}\n📅 Approved: ${new Date(subsidyApprovedDate).toLocaleDateString('en-IN')}\n\n⏳ Awaiting disbursement`
          : subsidyStatus === 'disbursed'
          ? `🎉 *Subsidy Disbursed*\n\n📋 Enquiry: ${enquiryId}\n👤 Customer: ${customerName}\n⚡ Capacity: ${capacity} kW\n💵 Amount: ₹${subsidyAmount.toLocaleString('en-IN')}\n📅 Disbursed: ${new Date(subsidyDisbursedDate).toLocaleDateString('en-IN')}\n🔢 UTR: ${subsidyUTR}\n\n✨ Project Status: ACTIVE`
          : '';

      if (message) {
        await sendOrgGroupNotification(orgId, { text: message, parseMode: 'Markdown' });
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
    return NextResponse.json({ error: error.message || 'Failed to update subsidy' }, { status: 500 });
  }
}
