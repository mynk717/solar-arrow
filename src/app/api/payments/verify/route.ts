import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const {
      enquiryId,
      paymentType, // 'payment1' or 'payment2'
      paymentDate,
      paymentMethod,
      referenceNumber,
      amount,
      notes,
    } = await request.json();

    if (!enquiryId || !paymentType || !paymentDate || !paymentMethod || !referenceNumber || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();

    // Find the enquiry row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:DR1000',          // ← DR covers all 122 cols
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: any) => row[0] === enquiryId);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const row = rows[rowIndex];
    const rowNumber = rowIndex + 2;

    const newStatus = paymentType === 'payment2' ? 'payment-complete' : 'payment-partial';

    // ── 1. Write payment fields BE:BL (cols 56-63) ──────────────────
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `ENQUIRIES!BE${rowNumber}:BL${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          paymentDate,                                      // BE (56): paymentDate
          paymentMethod,                                    // BF (57): paymentMethod
          paymentType,                                      // BG (58): paymentType
          newStatus,                                        // BH (59): paymentStatus
          'TRUE',                                           // BI (60): paymentAccountVerified
          session.user.email,                               // BJ (61): paymentVerifiedBy
          new Date().toISOString().split('T')[0],           // BK (62): paymentVerificationDate
          referenceNumber,                                  // BL (63): paymentUTR
        ]],
      },
    });

    // ── 2. Update enquiry status H (col 7) ──────────────────────────
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `ENQUIRIES!H${rowNumber}`,                    // H (7): status
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[newStatus]] },
    });

    // ── 3. Invalidate cache ──────────────────────────────────────────
    await redis.del(`org:${orgId}:payments`);
    await redis.del(`org:${orgId}:enquiries`);

    // ── 4. Telegram notification ─────────────────────────────────────
    try {
      const customerName    = row[1]  || 'N/A';
      const quotationAmount = parseFloat(row[66]?.toString() || '0'); // BO (66): quotationAmount
      const paymentLabel    = paymentType === 'payment1' ? 'Payment 1 (70%)' : 'Payment 2 (30%)';

      const message = `
💰 **PAYMENT VERIFIED**

📋 **Enquiry:** ${enquiryId}
👤 **Customer:** ${customerName}
💵 **Quotation:** ₹${quotationAmount.toLocaleString('en-IN')}

**${paymentLabel} Details:**
✅ **Amount:** ₹${Number(amount).toLocaleString('en-IN')}
📅 **Date:** ${new Date(paymentDate).toLocaleDateString('en-IN')}
💳 **Method:** ${paymentMethod}
🔢 **Reference:** ${referenceNumber}
👨‍💼 **Verified By:** ${session.user.email}
${notes ? `📝 **Notes:** ${notes}` : ''}

${newStatus === 'payment-complete'
  ? '✅ **Status:** Payment Complete - Both installments received!'
  : '⏳ **Status:** Awaiting 30% payment after installation'}
      `.trim();

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentType,
      newStatus,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
