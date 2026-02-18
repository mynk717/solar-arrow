// src/app/api/subsidy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

const SHEET_NAME = 'ENQUIRIES';
const CACHE_KEY = 'subsidies:all';
const CACHE_TTL = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for force refresh
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Try cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = (await redis.get(CACHE_KEY)) as string | null;
      if (cached) {
        return NextResponse.json({ subsidies: JSON.parse(cached) });
      }
    }

    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: `${SHEET_NAME}!A:CZ`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json({ subsidies: [] });
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Column indices
    const idIndex = headers.indexOf('id');
    const customerNameIndex = headers.indexOf('customerName');
    const phoneIndex = headers.indexOf('phone');
    const addressIndex = headers.indexOf('address');
    const areaIndex = headers.indexOf('area');
    const capacityIndex = headers.indexOf('capacity');
    const statusIndex = headers.indexOf('status');
    const systemCapacityIndex = headers.indexOf('systemCapacity');
    
    // Inspection fields
    const inspectionApprovedIndex = headers.indexOf('inspectionApproved');
    const inspectionDateIndex = headers.indexOf('inspectionDate');
    
    // Subsidy fields
    const subsidyAmountIndex = headers.indexOf('subsidyAmount');
    const subsidyStatusIndex = headers.indexOf('subsidyStatus');
    const subsidyAppliedDateIndex = headers.indexOf('subsidyAppliedDate');
    const subsidyApprovedDateIndex = headers.indexOf('subsidyApprovedDate');
    const subsidyDisbursedDateIndex = headers.indexOf('subsidyDisbursedDate');
    const subsidyRejectedDateIndex = headers.indexOf('subsidyRejectedDate');
    const subsidyRejectionReasonIndex = headers.indexOf('subsidyRejectionReason');
    const subsidyBankAccountIndex = headers.indexOf('subsidyBankAccount');
    const subsidyUTRIndex = headers.indexOf('subsidyUTR');
    const subsidyDocumentPathIndex = headers.indexOf('subsidyDocumentPath');
    
    const createdAtIndex = headers.indexOf('createdAt');
    const updatedAtIndex = headers.indexOf('updatedAt');

    // Filter: Only show enquiries with inspection approved
    const subsidies = dataRows
      .filter((row) => {
        const inspectionApproved = row[inspectionApprovedIndex] || '';
        return inspectionApproved.toUpperCase() === 'TRUE';
      })
      .map((row) => ({
        enquiryId: row[idIndex] || '',
        customerName: row[customerNameIndex] || '',
        phone: row[phoneIndex] || '',
        address: row[addressIndex] || '',
        area: row[areaIndex] || '',
        capacity: row[capacityIndex] || '',
        status: row[statusIndex] || '',
        systemCapacity: row[systemCapacityIndex] || '',
        inspectionApproved: row[inspectionApprovedIndex] || '',
        inspectionDate: row[inspectionDateIndex] || '',
        subsidyAmount: row[subsidyAmountIndex] || '',
        subsidyStatus: row[subsidyStatusIndex] || 'pending',
        subsidyAppliedDate: row[subsidyAppliedDateIndex] || '',
        subsidyApprovedDate: row[subsidyApprovedDateIndex] || '',
        subsidyDisbursedDate: row[subsidyDisbursedDateIndex] || '',
        subsidyRejectedDate: row[subsidyRejectedDateIndex] || '',
        subsidyRejectionReason: row[subsidyRejectionReasonIndex] || '',
        subsidyBankAccount: row[subsidyBankAccountIndex] || '',
        subsidyUTR: row[subsidyUTRIndex] || '',
        subsidyDocumentPath: row[subsidyDocumentPathIndex] || '',
        createdAt: row[createdAtIndex] || '',
        updatedAt: row[updatedAtIndex] || '',
      }));

    // Cache the results
    await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(subsidies));

    return NextResponse.json({ subsidies });
  } catch (error: any) {
    console.error('Error fetching subsidies:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subsidies' },
      { status: 500 }
    );
  }
}
