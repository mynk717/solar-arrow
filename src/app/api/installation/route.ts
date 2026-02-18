// src/app/api/installation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

export const revalidate = 0; // ✅ Disable Next.js cache

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

    // ✅ Check if force refresh is requested (from mutations)
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    // Try cache first (only if not forced refresh)
    const cacheKey = `org:${orgId}:installations`;
    
    if (!forceRefresh) {
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        console.log('✅ Returning cached installations');
        return NextResponse.json({ 
          installations: typeof cached === 'string' ? JSON.parse(cached) : cached,
          cached: true 
        });
      }
    }

    console.log('📊 Fetching fresh data from Google Sheets');
    const sheets = await getGoogleSheetsClient();

    // STEP 1: Fetch BOM tab to check delivery status
    const bomResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AB1000',
    });

    const bomRows = bomResponse.data.values || [];
    
    // Create a map of enquiryId -> dispatchStatus
    const deliveredEnquiries = new Set<string>();
    bomRows.forEach((row: any) => {
      const enquiryId = row[1]; // Column B: enquiryId
      const dispatchStatus = row[7]; // Column H: dispatchStatus
      
      if (dispatchStatus === 'delivered') {
        deliveredEnquiries.add(enquiryId);
      }
    });

    console.log(`✅ Found ${deliveredEnquiries.size} enquiries with delivered materials`);

    // STEP 2: Fetch ENQUIRIES tab
    const enqResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:CZ1000',
    });

    const rows = enqResponse.data.values || [];
    
    // Map to installation objects - ONLY show enquiries with delivered BOM
    const installations = rows
      .filter((row: any) => {
        const enquiryId = row[0] || ''; // Column A: id
        return deliveredEnquiries.has(enquiryId);
      })
      .map((row: any) => {
        return {
          // Basic Info
          enquiryId: row[0] || '',
          customerName: row[1] || '',
          phone: row[2] || '',
          email: row[3] || '',
          address: row[4] || '',
          area: row[5] || '',
          capacity: row[6] || '',
          status: row[7] || '',
          
          // System Details
          systemCapacity: row[72] || '',
          panelMake: row[73] || '',
          panelWattage: row[74] || '',
          panelQuantity: row[75] || '',
          inverterMake: row[76] || '',
          inverterCapacity: row[77] || '',
          structureType: row[81] || '',
          
          // Installation Details
          installationScheduledDate: row[82] || '',
          installationStartDate: row[83] || '',
          installationCompletedDate: row[84] || '',
          installationTeam: row[85] || '',
          installationSupervisor: row[86] || '',
          installationNotes: row[87] || '',
          pvModuleSerialNumbers: row[88] || '',
          inverterSerialNumber: row[89] || '',
          meterNumber: row[90] || '',
          meterInstalledDate: row[91] || '',
          meterReadingInitial: row[92] || '',
          earthingDone: row[93] || 'FALSE',
          earthingResistance: row[94] || '',
          installationPhotos: row[95] || '',
          
          // Inspection Details
          inspectionScheduledDate: row[96] || '',
          inspectionDate: row[97] || '',
          inspectionOfficer: row[98] || '',
          inspectionStatus: row[99] || '',
          inspectionApproved: row[100] || 'FALSE',
          inspectionRejectedReason: row[101] || '',
          inspectionReportPath: row[102] || '',
          
          // Metadata
          createdAt: row[8] || '',
          updatedAt: row[9] || '',
        };
      });

    // ✅ Cache for 2 minutes (shorter TTL, will be invalidated on updates)
    await redis.setex(cacheKey, 120, JSON.stringify(installations));

    console.log(`✅ Fetched ${installations.length} installations from Google Sheets`);

    return NextResponse.json({ 
      installations, 
      cached: false,
      count: installations.length 
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching installations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch installations' },
      { status: 500 }
    );
  }
}
