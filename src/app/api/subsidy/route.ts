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

    const orgId = (session.user as any).organizationId || 'default-org';
    const sheetId = (session.user as any).sheetId;

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    // Check for force refresh
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Try cache first (unless force refresh)
    const cacheKey = `org:${orgId}:${CACHE_KEY}`;
    if (!forceRefresh) {
      const cached = await redis.get(cacheKey) as string | null;
      if (cached) {
        return NextResponse.json({ subsidies: JSON.parse(cached), cached: true });
      }
    }

    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A2:CZ1000`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json({ subsidies: [] });
    }

    // Get headers
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A1:CZ1`,
    });
    const headers = headerResponse.data.values?.[0] || [];

    // Column indices - Match your ENQUIRIES tab
    const idIndex = headers.indexOf('id');
    const customerNameIndex = headers.indexOf('customerName');
    const phoneIndex = headers.indexOf('phone');
    const emailIndex = headers.indexOf('email');
    const addressIndex = headers.indexOf('address');
    const areaIndex = headers.indexOf('area');
    const capacityIndex = headers.indexOf('capacity');
    const statusIndex = headers.indexOf('status');
    
    // System details
    const systemCapacityIndex = headers.indexOf('systemCapacity');
    const systemCostIndex = headers.indexOf('systemCost');
    
    // Inspection fields (required before subsidy)
    const inspectionApprovedIndex = headers.indexOf('inspectionApproved');
    const inspectionDateIndex = headers.indexOf('inspectionDate');
    
    // Registration fields
    const registrationIdIndex = headers.indexOf('registrationId');
    const consumerRegistrationNumberIndex = headers.indexOf('consumerRegistrationNumber');
    const applicationNumberIndex = headers.indexOf('applicationNumber');
    
    // Subsidy fields
    const subsidyAmountIndex = headers.indexOf('subsidyAmount');
    const subsidyStatusIndex = headers.indexOf('subsidyStatus');
    const subsidyAppliedDateIndex = headers.indexOf('subsidyAppliedDate');
    const subsidyApprovedDateIndex = headers.indexOf('subsidyApprovedDate');
    const subsidyDisbursedDateIndex = headers.indexOf('subsidyDisbursedDate');
    const subsidyRejectedDateIndex = headers.indexOf('subsidyRejectedDate');
    const subsidyRejectionReasonIndex = headers.indexOf('subsidyRejectionReason');
    const subsidyBankAccountIndex = headers.indexOf('subsidyBankAccount');
    const subsidyBankIFSCIndex = headers.indexOf('subsidyBankIFSC');
    const subsidyUTRIndex = headers.indexOf('subsidyUTR');
    const subsidyDocumentPathIndex = headers.indexOf('subsidyDocumentPath');
    const subsidyNotesIndex = headers.indexOf('subsidyNotes');
    
    // Grid sync
    const gridSyncDateIndex = headers.indexOf('gridSyncDate');
    const activationDateIndex = headers.indexOf('activationDate');
    
    const createdAtIndex = headers.indexOf('createdAt');
    const updatedAtIndex = headers.indexOf('updatedAt');

    // Filter: Only show enquiries with inspection approved (eligible for subsidy)
    const subsidies = rows
      .filter((row) => {
        const inspectionApproved = row[inspectionApprovedIndex] || '';
        return inspectionApproved.toUpperCase() === 'TRUE';
      })
      .map((row) => ({
        // Basic info
        enquiryId: row[idIndex] || '',
        customerName: row[customerNameIndex] || '',
        phone: row[phoneIndex] || '',
        email: row[emailIndex] || '',
        address: row[addressIndex] || '',
        area: row[areaIndex] || '',
        capacity: row[capacityIndex] || '',
        status: row[statusIndex] || '',
        
        // System details
        systemCapacity: row[systemCapacityIndex] || '',
        systemCost: row[systemCostIndex] || '',
        
        // Inspection
        inspectionApproved: row[inspectionApprovedIndex] || '',
        inspectionDate: row[inspectionDateIndex] || '',
        
        // Registration
        registrationId: row[registrationIdIndex] || '',
        consumerRegistrationNumber: row[consumerRegistrationNumberIndex] || '',
        applicationNumber: row[applicationNumberIndex] || '',
        
        // Subsidy details
        subsidyAmount: row[subsidyAmountIndex] || '',
        subsidyStatus: row[subsidyStatusIndex] || 'pending',
        subsidyAppliedDate: row[subsidyAppliedDateIndex] || '',
        subsidyApprovedDate: row[subsidyApprovedDateIndex] || '',
        subsidyDisbursedDate: row[subsidyDisbursedDateIndex] || '',
        subsidyRejectedDate: row[subsidyRejectedDateIndex] || '',
        subsidyRejectionReason: row[subsidyRejectionReasonIndex] || '',
        subsidyBankAccount: row[subsidyBankAccountIndex] || '',
        subsidyBankIFSC: row[subsidyBankIFSCIndex] || '',
        subsidyUTR: row[subsidyUTRIndex] || '',
        subsidyDocumentPath: row[subsidyDocumentPathIndex] || '',
        subsidyNotes: row[subsidyNotesIndex] || '',
        
        // Grid sync
        gridSyncDate: row[gridSyncDateIndex] || '',
        activationDate: row[activationDateIndex] || '',
        
        createdAt: row[createdAtIndex] || '',
        updatedAt: row[updatedAtIndex] || '',
      }));

    // Cache the results
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(subsidies));

    return NextResponse.json({ 
      subsidies, 
      cached: false,
      count: subsidies.length 
    });
  } catch (error: any) {
    console.error('Error fetching subsidies:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subsidies' },
      { status: 500 }
    );
  }
}
