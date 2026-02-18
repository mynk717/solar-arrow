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
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    // Check cache
    const cacheKey = `org:${orgId}:payments`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ payments: JSON.parse(cached as string), cached: true });
    }

    const sheets = await getGoogleSheetsClient();

    // Fetch enquiries with payment and quotation data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:AZ1000', // Adjust range as needed
    });

    const rows = response.data.values || [];

    const payments = rows
      .filter((row: any) => {
        // Only include enquiries with quotations
        const quotationAmount = parseFloat(row[19] || '0'); // Column T (quotationAmount)
        return quotationAmount > 0;
      })
      .map((row: any) => {
        const quotationAmount = parseFloat(row[19] || '0'); // Column T
        
        // Calculate 70/30 split
        const payment1Amount = Math.round(quotationAmount * 0.70);
        const payment2Amount = Math.round(quotationAmount * 0.30);

        // Payment 1 fields (columns could be U, V, W, X, Y)
        const payment1Status = row[20] || 'pending'; // Column U
        const payment1Date = row[21] || ''; // Column V
        const payment1Method = row[22] || ''; // Column W
        const payment1Reference = row[23] || ''; // Column X
        const payment1VerifiedBy = row[24] || ''; // Column Y

        // Payment 2 fields (columns Z, AA, AB, AC, AD)
        const payment2Status = row[25] || 'pending'; // Column Z
        const payment2Date = row[26] || ''; // Column AA
        const payment2Method = row[27] || ''; // Column AB
        const payment2Reference = row[28] || ''; // Column AC
        const payment2VerifiedBy = row[29] || ''; // Column AD

        // Calculate totals
        const totalPaid =
          (payment1Status === 'verified' ? payment1Amount : 0) +
          (payment2Status === 'verified' ? payment2Amount : 0);

        const balanceAmount = quotationAmount - totalPaid;

        // Determine overall payment status
        let paymentStatus: 'unpaid' | 'partial' | 'full';
        if (totalPaid === 0) {
          paymentStatus = 'unpaid';
        } else if (totalPaid < quotationAmount) {
          paymentStatus = 'partial';
        } else {
          paymentStatus = 'full';
        }

        return {
          enquiryId: row[0],
          customerName: row[1],
          phone: row[2],
          capacity: row[4] || 'N/A',
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
          installationStatus: row[15] || '', // Column P (installation status)
        };
      });

    // Cache for 2 minutes
    await redis.setex(cacheKey, 120, JSON.stringify(payments));

    return NextResponse.json({ payments, cached: false });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
