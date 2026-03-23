import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { notifyEnquiryActivity } from '@/lib/notificationHelpers';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';

    const { id, amount, date, method, reference, notes } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing installment id' }, { status: 400 });

    const sheets = await getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'PAYMENTS!A2:O5000',
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((r: any) => r[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Installment not found' }, { status: 404 });
    }

    const rowNumber = rowIndex + 2;
    const now = new Date().toISOString();

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `PAYMENTS!E${rowNumber}:M${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          amount,          // E: amount
          rows[rowIndex][5], // F: expectedAmount unchanged
          'verified',     // G: status
          date,           // H: date
          method,         // I: method
          reference,      // J: reference
          session.user.email, // K: verifiedBy
          now,            // L: verifiedAt
          notes || '',    // M: notes
        ]],
      },
    });

    await redis.del(`org:${orgId}:payments:installments`);
    await redis.del(`org:${orgId}:enquiries`);
    try {
      const enquiryId = rows[rowIndex][1] || '';
      const customerName = rows[rowIndex][2] || enquiryId;
      await notifyEnquiryActivity(
        orgId,
        enquiryId,
        customerName,
        'payment',
        {
          installmentId: id,
          amount,
          paymentMethod: method,
          paymentDate: date,
          paymentReference: reference || '',
          paymentStatus: 'verified',
          verifiedBy: session.user.email,
        },
        session.user.email!,
        notes || 'Installment payment verified'
      );
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
