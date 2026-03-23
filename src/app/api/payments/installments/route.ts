import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { notifyEnquiryActivity } from '@/lib/notificationHelpers';

// GET — fetch all installments for an enquiryId
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';
    const enquiryId = request.nextUrl.searchParams.get('enquiryId');

    const cacheKey = `org:${orgId}:payments:installments`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      const all = JSON.parse(cached as string);
      const result = enquiryId ? all.filter((r: any) => r.enquiryId === enquiryId) : all;
      return NextResponse.json({ success: true, installments: result });
    }

    const sheets = await getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'PAYMENTS!A2:O5000',
    });

    const rows = res.data.values || [];
    const installments = rows.map((row: any) => ({
      id: row[0] || '',
      enquiryId: row[1] || '',
      customerName: row[2] || '',
      installmentNumber: parseInt(row[3] || '1'),
      amount: parseFloat(row[4] || '0'),
      expectedAmount: parseFloat(row[5] || '0'),
      status: row[6] || 'pending',
      date: row[7] || '',
      method: row[8] || '',
      reference: row[9] || '',
      verifiedBy: row[10] || '',
      verifiedAt: row[11] || '',
      notes: row[12] || '',
      createdAt: row[13] || '',
      createdBy: row[14] || '',
    }));

    await redis.set(cacheKey, JSON.stringify(installments), { ex: 300 });

    const result = enquiryId
      ? installments.filter((r: any) => r.enquiryId === enquiryId)
      : installments;

    return NextResponse.json({ success: true, installments: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — add a new installment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';

    const {
      enquiryId, customerName,
      installmentNumber, amount, expectedAmount,
      date, method, reference, notes,
    } = await request.json();

    if (!enquiryId || !amount || !date || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = `PAY-${enquiryId}-${installmentNumber}-${Date.now()}`;
    const now = new Date().toISOString();

    const sheets = await getGoogleSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'PAYMENTS!A:O',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          id, enquiryId, customerName || '',
          installmentNumber, amount, expectedAmount || amount,
          'pending', date, method, reference || '',
          '', '', notes || '',
          now, session.user.email,
        ]],
      },
    });

    await redis.del(`org:${orgId}:payments:installments`);
    try {
      await notifyEnquiryActivity(
        orgId,
        enquiryId,
        customerName || enquiryId,
        'payment',
        {
          installmentNumber,
          amount,
          expectedAmount: expectedAmount || amount,
          paymentMethod: method,
          paymentDate: date,
          paymentReference: reference || '',
          paymentStatus: 'pending',
        },
        session.user.email!,
        notes || 'New installment recorded'
      );
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
