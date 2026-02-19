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
    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();

    // 1. ENQUIRIES - Main payment data
    const enquiriesRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:DR',
    });
    const enquiryRows = enquiriesRes.data.values || [];

    // 2. QUOTATIONS - Optional quotation lookup (by quotationId)
    let quotationsMap: Record<string, number> = {};
    try {
      const quotesRes = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'QUOTATIONS!A2:Z100',
      });
      const quoteRows = quotesRes.data.values || [];
      
      quoteRows.forEach((row: any) => {
        const quotationId = row[0]?.toString(); // quotationId col 0?
        const amount = parseFloat(row[12]?.toString() ?? '0'); // Adjust index
        if (quotationId && amount > 0) {
          quotationsMap[quotationId] = amount;
        }
      });
    } catch (quoteError: any) {
      console.log('QUOTATIONS tab unavailable, using ENQUIRIES only:', quoteError.message);
    }

    const payments = enquiryRows
      // Show enquiries with ANY payment activity OR quotation reference
      .filter((row: any) => {
        const paymentStatus = row[80]?.toString()?.toLowerCase();
        const quotationId = row[85]?.toString(); // quotationId from ENQUIRIES
        const hasQuotation = quotationsMap[quotationId || ''] > 0;
        return paymentStatus && paymentStatus !== 'none' || hasQuotation;
      })
      .map((row: any) => {
        const quotationId = row[85]?.toString() || '';
        const quotationAmount = quotationsMap[quotationId] || 
                               parseFloat(row[75]?.toString() ?? '0'); // Fallback to estimatedCost

        const paymentStatus = (row[80] as string)?.toLowerCase() || 'pending';
        const paymentDate = row[77]?.toString() || '';
        const paymentMethod = row[78]?.toString() || '';
        const paymentVerifiedBy = row[82]?.toString() || '';
        const paymentUTR = row[84]?.toString() || '';

        // 70%/30% split logic
        const payment1Amount = Math.round(quotationAmount * 0.7);
        const payment2Amount = Math.round(quotationAmount * 0.3);
        const payment1Status = paymentStatus.includes('verified') || paymentStatus.includes('complete') 
                               ? 'verified' : 'pending';
        const payment2Status = paymentStatus.includes('complete') ? 'verified' : 'pending';

        const totalPaid = (payment1Status === 'verified' ? payment1Amount : 0) +
                         (payment2Status === 'verified' ? payment2Amount : 0);
        const balanceAmount = Math.max(quotationAmount - totalPaid, 0);

        let uiStatus: 'unpaid' | 'partial' | 'full';
        if (totalPaid === 0) uiStatus = 'unpaid';
        else if (totalPaid < quotationAmount) uiStatus = 'partial';
        else uiStatus = 'full';

        return {
          enquiryId: row[0]?.toString() || '',
          customerName: row[1]?.toString() || '',
          phone: row[2]?.toString() || '',
          capacity: row[6]?.toString() || '',
          quotationId,
          quotationAmount,
          paymentStatus: uiStatus,
          paymentDate,
          paymentMethod,
          paymentVerifiedBy,
          paymentUTR,
          totalPaid,
          balanceAmount,
          installationStatus: row[51]?.toString() || '',
        };
      });

    console.log(`Payments API: ${payments.length} found (QUOTES: ${Object.keys(quotationsMap).length})`);
    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Payments API error:', error);
    return NextResponse.json({ error: error.message, payments: [] }, { status: 500 });
  }
}


