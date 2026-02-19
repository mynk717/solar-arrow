import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';

    if (!sheetId) {
      return NextResponse.json({ 
        error: 'Sheet not configured for this user',
        debug: { user: session.user.email }
      }, { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:AZ1000',
    });

    // ✅ FIX: Handle empty/undefined values
    const rows = response.data.values || [];

    if (rows.length === 0) {
      console.log(`No data in ENQUIRIES sheet: ${sheetId}`);
      return NextResponse.json({ payments: [] });
    }

    const payments = rows
      .filter((row: any) => {
        // ✅ FIX: Safe column access
        const quotationAmount = parseFloat(row[19]?.toString() ?? '0');
        return quotationAmount > 0;
      })
      .map((row: any) => {
        const quotationAmount = parseFloat(row[19]?.toString() ?? '0') || 0;

        // ✅ FIX: Safe parsing for all columns
        const payment1Amount = Math.round(quotationAmount * 0.7);
        const payment2Amount = Math.round(quotationAmount * 0.3);

        const payment1Status = (row[20] as string)?.toLowerCase() || 'pending';
        const payment1Date = row[21]?.toString() || '';
        const payment1Method = row[22]?.toString() || '';
        const payment1Reference = row[23]?.toString() || '';
        const payment1VerifiedBy = row[24]?.toString() || '';

        const payment2Status = (row[25] as string)?.toLowerCase() || 'pending';
        const payment2Date = row[26]?.toString() || '';
        const payment2Method = row[27]?.toString() || '';
        const payment2Reference = row[28]?.toString() || '';
        const payment2VerifiedBy = row[29]?.toString() || '';

        const totalPaid =
          (payment1Status === 'verified' ? payment1Amount : 0) +
          (payment2Status === 'verified' ? payment2Amount : 0);

        const balanceAmount = Math.max(quotationAmount - totalPaid, 0);

        let paymentStatus: 'unpaid' | 'partial' | 'full';
        if (totalPaid === 0) paymentStatus = 'unpaid';
        else if (totalPaid < quotationAmount) paymentStatus = 'partial';
        else paymentStatus = 'full';

        return {
          enquiryId: row[0]?.toString() || '',
          customerName: row[1]?.toString() || '',
          phone: row[2]?.toString() || '',
          capacity: row[4]?.toString() || '',
          quotationAmount,

          payment1Amount,
          payment1Status,
          payment1Date,
          payment1Method,
          payment1Reference,
          payment1VerifiedBy,

          payment2Amount,
          payment2Status,
          payment2Date,
          payment2Method,
          payment2Reference,
          payment2VerifiedBy,

          totalPaid,
          balanceAmount,
          paymentStatus,
          installationStatus: row[15]?.toString() || '',
        };
      });

    // ✅ DEBUG LOG
    console.log(`Payments API: ${payments.length} payments found in sheet ${sheetId.slice(-6)}`);

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to fetch payments',
        debug: {
          sheetId: (await getServerSession(authOptions))?.user?.sheetId,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

