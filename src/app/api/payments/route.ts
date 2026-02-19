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
      // ✅ EXACT: estimatedCost (your quotationAmount) is index 75
      const quotationAmount = parseFloat(row[75]?.toString() ?? '0');
      return quotationAmount > 0;
    })
    .map((row: any) => {
      const quotationAmount = parseFloat(row[75]?.toString() ?? '0') || 0; // estimatedCost
  
      const payment1Amount = Math.round(quotationAmount * 0.7);
      const payment2Amount = Math.round(quotationAmount * 0.3);
  
      // ✅ EXACT INDICES from rowToEnquiry:
      const paymentStatus = (row[80] as string)?.toLowerCase() || 'pending'; // paymentStatus
      const paymentDate = row[77]?.toString() || ''; // paymentDate  
      const paymentMethod = row[78]?.toString() || ''; // paymentMethod
      const paymentVerifiedBy = row[82]?.toString() || ''; // paymentVerifiedBy
      const paymentUTR = row[84]?.toString() || ''; // paymentUTR
  
      // Split single paymentStatus into 70%/30% logic for UI
      const payment1Status = paymentStatus.includes('verified') || 
                            paymentStatus.includes('complete') ? 'verified' : 'pending';
      const payment2Status = paymentStatus.includes('complete') ? 'verified' : 'pending';
  
      const totalPaid =
        (payment1Status === 'verified' ? payment1Amount : 0) +
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
        quotationAmount,
      
        // 70% Payment 1
        payment1Amount,
        payment1Status,
        payment1Date: paymentDate,
        payment1Method: paymentMethod,
        payment1Reference: paymentUTR,
        payment1VerifiedBy: paymentVerifiedBy,  // ✅ Fixed
      
        // 30% Payment 2  
        payment2Amount,
        payment2Status,
        payment2Date: '',
        payment2Method: paymentMethod,
        payment2Reference: '',
        payment2VerifiedBy: paymentVerifiedBy,  // ✅ Fixed
      
        totalPaid,
        balanceAmount,
        paymentStatus: uiStatus,
        installationStatus: row[51]?.toString() || '',
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

