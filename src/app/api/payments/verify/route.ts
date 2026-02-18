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
      range: 'ENQUIRIES!A2:AZ1000',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: any) => row[0] === enquiryId);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const row = rows[rowIndex];
    const rowNumber = rowIndex + 2; // +2 because of header and 0-indexing

    // Determine which columns to update based on payment type
    let updates: any;
    
    if (paymentType === 'payment1') {
      // Update Payment 1 columns (U, V, W, X, Y)
      updates = {
        range: `ENQUIRIES!U${rowNumber}:Y${rowNumber}`,
        values: [[
          'verified', // U: payment1Status
          paymentDate, // V: payment1Date
          paymentMethod, // W: payment1Method
          referenceNumber, // X: payment1Reference
          session.user.email, // Y: payment1VerifiedBy
        ]],
      };
    } else {
      // Update Payment 2 columns (Z, AA, AB, AC, AD)
      updates = {
        range: `ENQUIRIES!Z${rowNumber}:AD${rowNumber}`,
        values: [[
          'verified', // Z: payment2Status
          paymentDate, // AA: payment2Date
          paymentMethod, // AB: payment2Method
          referenceNumber, // AC: payment2Reference
          session.user.email, // AD: payment2VerifiedBy
        ]],
      };
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: updates.range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: updates.values },
    });

    // Check if both payments are verified, update overall status
    const payment1Status = paymentType === 'payment1' ? 'verified' : (row[20] || 'pending');
    const payment2Status = paymentType === 'payment2' ? 'verified' : (row[25] || 'pending');

    if (payment1Status === 'verified' && payment2Status === 'verified') {
      // Update enquiry status to payment-complete
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `ENQUIRIES!F${rowNumber}`, // Column F is status
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['payment-complete']] },
      });
    } else if (payment1Status === 'verified' && paymentType === 'payment1') {
      // First payment done, update to awaiting installation completion
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `ENQUIRIES!F${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['payment-partial']] },
      });
    }

    // Invalidate cache
    await redis.del(`org:${orgId}:payments`);
    await redis.del(`org:${orgId}:enquiries`);

    // Send Telegram notification
    try {
      const customerName = row[1] || 'N/A';
      const quotationAmount = parseFloat(row[19] || '0');
      const paymentLabel = paymentType === 'payment1' ? 'Payment 1 (70%)' : 'Payment 2 (30%)';

      const message = `
💰 **PAYMENT VERIFIED**

📋 **Enquiry:** ${enquiryId}
👤 **Customer:** ${customerName}
💵 **Quotation:** ₹${quotationAmount.toLocaleString('en-IN')}

**${paymentLabel} Details:**
✅ **Amount:** ₹${amount.toLocaleString('en-IN')}
📅 **Date:** ${new Date(paymentDate).toLocaleDateString('en-IN')}
💳 **Method:** ${paymentMethod}
🔢 **Reference:** ${referenceNumber}
👨‍💼 **Verified By:** ${session.user.email}
${notes ? `📝 **Notes:** ${notes}` : ''}

${payment1Status === 'verified' && payment2Status === 'verified' 
  ? '✅ **Status:** Payment Complete - Both installments received!' 
  : paymentType === 'payment1' 
    ? '⏳ **Status:** Awaiting 30% payment after installation' 
    : '🎉 **Status:** Final payment received!'}
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
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
