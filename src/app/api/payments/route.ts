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
        range: 'QUOTATIONS!A2:CE500',
      });
      const quoteRows = quotesRes.data.values || [];
      
      quoteRows.forEach((row: any) => {
        const quotationId  = row[0]?.toString() || '';
        // col[4] holds enquiryId ONLY when it starts with ENQ-, otherwise it's quotationType
        const col4         = row[4]?.toString() || '';
        const enquiryId    = col4.startsWith('ENQ-') ? col4 : '';
        // correct indices confirmed from actual sheet data
        const totalCost    = parseFloat(row[42]?.toString() ?? '0'); // col 42 = totalCost ✅
        const finalAmount  = parseFloat(row[44]?.toString() ?? '0'); // col 44 = finalAmount (for reference only)
        const amount       = totalCost || finalAmount; // totalCost is vendor's receivable        
        if (amount > 0) {
          if (quotationId) quotationsMap[quotationId] = amount;
          if (enquiryId)   quotationsMap[enquiryId]   = amount;
        }
      });         
    } catch (quoteError: any) {
      console.log('QUOTATIONS tab unavailable, using ENQUIRIES only:', quoteError.message);
    }

    const payments = enquiryRows
    .filter((row: any) => {
      const enquiryId = row[0]?.toString();
      if (!enquiryId) return false;
      const quotationAmount = parseFloat(row[66]?.toString() ?? '0');
      const estimatedCost   = parseFloat(row[54]?.toString() ?? '0');
      const hasAmount = quotationAmount > 0 || estimatedCost > 0;
      return hasAmount;
    })
    .map((row: any) => {
      // ── Correct column indices from googleSheets.ts destructure ──
      // Payment section: indices 22-31
      const estimatedCost     = parseFloat(row[54]?.toString() ?? '0');
      const initialPayment    = parseFloat(row[55]?.toString() ?? '0');
      const paymentDate       = row[56]?.toString() || '';
      const paymentMethod     = row[57]?.toString() || '';
      const paymentType       = row[58]?.toString() || '';
      const paymentStatus     = row[59]?.toString()?.toLowerCase() || '';
      const paymentVerifiedBy = row[61]?.toString() || '';
      const paymentVerificationDate = row[62]?.toString() || '';
      const paymentUTR        = row[63]?.toString() || '';
  
      // Quotation section: indices 32-38
      const quotationId       = row[64]?.toString() || '';
      const quotationAmount =
  quotationsMap[quotationId] ||          // from QUOTATIONS tab by quotationId ✅
  quotationsMap[row[0]?.toString()] ||   // from QUOTATIONS tab by enquiryId ✅
  parseFloat(row[34]?.toString() ?? '0') || // ENQUIRIES col 34 copy
  estimatedCost;                         // last resort

  
      // Installation: index 51
      const installationStatus = row[7]?.toString() || '';
  
      // Tracking: index 84-85
      const lastEditedBy      = row[116]?.toString() || '';
      const lastEditedAt      = row[117]?.toString() || '';
  
      // ── Payment 1 (70%) and Payment 2 (30%) derived from paymentStatus ──
      const isVerified  = paymentStatus.includes('verified') || paymentStatus.includes('complete');
      const isComplete  = paymentStatus.includes('complete') || paymentStatus === 'payment-complete';
      const isPartial   = paymentStatus.includes('partial') || paymentStatus === 'payment-partial';
  
      const payment1Amount = Math.round(quotationAmount * 0.7);
      const payment2Amount = quotationAmount - payment1Amount;
  
      const payment1Status = isVerified || isComplete || isPartial ? 'verified' : 'pending';
      const payment2Status = isComplete ? 'verified' : 'pending';
  
      const payment1Date    = isPartial || isComplete ? paymentDate : '';
      const payment2Date    = isComplete ? paymentVerificationDate : '';
  
      const totalPaid =
        (payment1Status === 'verified' ? payment1Amount : 0) +
        (payment2Status === 'verified' ? payment2Amount : 0);
      const balanceAmount = Math.max(quotationAmount - totalPaid, 0);
  
      let uiStatus: 'unpaid' | 'partial' | 'full';
      if (totalPaid === 0)               uiStatus = 'unpaid';
      else if (totalPaid < quotationAmount) uiStatus = 'partial';
      else                               uiStatus = 'full';
  
      return {
        enquiryId:            row[0]?.toString() || '',
        customerName:         row[1]?.toString() || '',
        phone:                row[2]?.toString() || '',
        capacity:             row[6]?.toString() || '',
        quotationId,
        quotationAmount,
        payment1Amount,
        payment1Status,
        payment1Date,
        payment1Method:       payment1Status === 'verified' ? paymentMethod : '',
        payment1Reference:    payment1Status === 'verified' ? paymentUTR : '',
        payment1VerifiedBy:   payment1Status === 'verified' ? paymentVerifiedBy : '',
        payment2Amount,
        payment2Status,
        payment2Date,
        payment2Method:       payment2Status === 'verified' ? paymentMethod : '',
        payment2Reference:    payment2Status === 'verified' ? paymentUTR : '',
        payment2VerifiedBy:   payment2Status === 'verified' ? paymentVerifiedBy : '',
        totalPaid,
        balanceAmount,
        paymentStatus:        uiStatus,
        paymentDate,
        paymentMethod,
        paymentVerifiedBy,
        paymentUTR,
        installationStatus,
        lastEditedAt,
      };
    });  

    console.log(`Payments API: ${payments.length} found (QUOTES: ${Object.keys(quotationsMap).length})`);
    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Payments API error:', error);
    return NextResponse.json({ error: error.message, payments: [] }, { status: 500 });
  }
}


