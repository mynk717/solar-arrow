// src/app/api/liaison/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

const SHEET_NAME = 'ENQUIRIES';
const CACHE_KEY = 'liaisons:all';
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
      const cached = await redis.get(cacheKey);
      if (cached) {
        // ✅ FIX: Redis already returns parsed object, don't parse again
        const liaisons = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json({ liaisons, cached: true });
      }
    }

    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A2:CZ1000`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return NextResponse.json({ liaisons: [] });
    }

    // Get headers from first row
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A1:CZ1`,
    });
    const headers = headerResponse.data.values?.[0] || [];

    // Column indices
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
    const panelTypeIndex = headers.indexOf('panelType');
    const panelMakeIndex = headers.indexOf('panelMake');
    const inverterMakeIndex = headers.indexOf('inverterMake');
    
    // Installation fields
    const installationCompletedDateIndex = headers.indexOf('installationCompletedDate');
    const installationTeamIndex = headers.indexOf('installationTeam');
    const installationNotesIndex = headers.indexOf('installationNotes');
    
    // Liaison/Inspection fields
    const inspectionScheduledDateIndex = headers.indexOf('inspectionScheduledDate');
    const inspectionDateIndex = headers.indexOf('inspectionDate');
    const inspectionOfficerIndex = headers.indexOf('inspectionOfficer');
    const inspectionStatusIndex = headers.indexOf('inspectionStatus');
    const inspectionApprovedIndex = headers.indexOf('inspectionApproved');
    const inspectionRejectedReasonIndex = headers.indexOf('inspectionRejectedReason');
    const inspectionReportPathIndex = headers.indexOf('inspectionReportPath');
    
    // Net metering fields
    const meterNumberIndex = headers.indexOf('meterNumber');
    const meterInstallationDateIndex = headers.indexOf('meterInstallationDate');
    const netMeteringAgreementIndex = headers.indexOf('netMeteringAgreement');
    
    // Grid sync fields
    const gridSyncDateIndex = headers.indexOf('gridSyncDate');
    const activationDateIndex = headers.indexOf('activationDate');
    const liaisonStageIndex = headers.indexOf('liaisonStage');
    
    // Registration fields
    const registrationIdIndex = headers.indexOf('registrationId');
    const consumerRegistrationNumberIndex = headers.indexOf('consumerRegistrationNumber');
    const applicationNumberIndex = headers.indexOf('applicationNumber');
    
    const createdAtIndex = headers.indexOf('createdAt');
    const updatedAtIndex = headers.indexOf('updatedAt');

    // Filter: Only show enquiries with installation completed
    const liaisons = rows
      .filter((row) => {
        const installationCompletedDate = row[installationCompletedDateIndex] || '';
        if (!installationCompletedDate || installationCompletedDate.trim() === '') return false;
        
        // Check if it's a valid date
        const date = new Date(installationCompletedDate);
        return !isNaN(date.getTime());
      })
      .map((row) => ({
        enquiryId: row[idIndex] || '',
        customerName: row[customerNameIndex] || '',
        phone: row[phoneIndex] || '',
        email: row[emailIndex] || '',
        address: row[addressIndex] || '',
        area: row[areaIndex] || '',
        capacity: row[capacityIndex] || '',
        status: row[statusIndex] || '',
        systemCapacity: row[systemCapacityIndex] || '',
        panelType: row[panelTypeIndex] || '',
        panelMake: row[panelMakeIndex] || '',
        inverterMake: row[inverterMakeIndex] || '',
        installationCompletedDate: row[installationCompletedDateIndex] || '',
        installationTeam: row[installationTeamIndex] || '',
        installationNotes: row[installationNotesIndex] || '',
        inspectionScheduledDate: row[inspectionScheduledDateIndex] || '',
        inspectionDate: row[inspectionDateIndex] || '',
        inspectionOfficer: row[inspectionOfficerIndex] || '',
        inspectionStatus: row[inspectionStatusIndex] || 'pending',
        inspectionApproved: row[inspectionApprovedIndex] || '',
        inspectionRejectedReason: row[inspectionRejectedReasonIndex] || '',
        inspectionReportPath: row[inspectionReportPathIndex] || '',
        meterNumber: row[meterNumberIndex] || '',
        meterInstallationDate: row[meterInstallationDateIndex] || '',
        netMeteringAgreement: row[netMeteringAgreementIndex] || '',
        gridSyncDate: row[gridSyncDateIndex] || '',
        activationDate: row[activationDateIndex] || '',
        liaisonStage: row[liaisonStageIndex] || 'inspection-pending',
        registrationId: row[registrationIdIndex] || '',
        consumerRegistrationNumber: row[consumerRegistrationNumberIndex] || '',
        applicationNumber: row[applicationNumberIndex] || '',
        createdAt: row[createdAtIndex] || '',
        updatedAt: row[updatedAtIndex] || '',
      }));

    // ✅ FIX: Cache as JSON string for consistency
    await redis.set(cacheKey, JSON.stringify(liaisons), { ex: CACHE_TTL });

    return NextResponse.json({ 
      liaisons, 
      cached: false,
      count: liaisons.length 
    });
  } catch (error: any) {
    console.error('Error fetching liaisons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch liaisons' },
      { status: 500 }
    );
  }
}
