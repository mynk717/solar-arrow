// src/app/api/installation/route.ts
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

    // Try cache first (5 minute TTL)
    const cacheKey = `org:${orgId}:installations`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      console.log('✅ Returning cached installations');
      return NextResponse.json({ 
        installations: typeof cached === 'string' ? JSON.parse(cached) : cached,
        cached: true 
      });
    }

    console.log('📊 Cache miss, fetching from Google Sheets');
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
        
        // ONLY include if BOM is delivered
        return deliveredEnquiries.has(enquiryId);
      })
      .map((row: any) => {
        return {
          // Basic Info
          enquiryId: row[0] || '',                    // A: id
          customerName: row[1] || '',                 // B: customerName
          phone: row[2] || '',                        // C: phone
          email: row[3] || '',                        // D: email
          address: row[4] || '',                      // E: address
          area: row[5] || '',                         // F: area
          capacity: row[6] || '',                     // G: capacity
          status: row[7] || '',                       // H: status
          
          // System Details (from columns 73-85)
          systemCapacity: row[72] || '',              // BS: systemCapacity
          panelMake: row[73] || '',                   // BT: panelMake
          panelWattage: row[74] || '',                // BU: panelWattage
          panelQuantity: row[75] || '',               // BV: panelQuantity
          inverterMake: row[76] || '',                // BW: inverterMake
          inverterCapacity: row[77] || '',            // BX: inverterCapacity
          structureType: row[81] || '',               // CB: structureType
          
          // Installation Details (columns 82-96)
          installationScheduledDate: row[82] || '',   // CC: installationScheduledDate
          installationStartDate: row[83] || '',       // CD: installationStartDate
          installationCompletedDate: row[84] || '',   // CE: installationCompletedDate
          installationTeam: row[85] || '',            // CF: installationTeam
          installationSupervisor: row[86] || '',      // CG: installationSupervisor
          installationNotes: row[87] || '',           // CH: installationNotes
          pvModuleSerialNumbers: row[88] || '',       // CI: pvModuleSerialNumbers
          inverterSerialNumber: row[89] || '',        // CJ: inverterSerialNumber
          meterNumber: row[90] || '',                 // CK: meterNumber
          meterInstalledDate: row[91] || '',          // CL: meterInstalledDate
          meterReadingInitial: row[92] || '',         // CM: meterReadingInitial
          earthingDone: row[93] || 'FALSE',           // CN: earthingDone
          earthingResistance: row[94] || '',          // CO: earthingResistance
          installationPhotos: row[95] || '',          // CP: installationPhotos
          
          // Inspection Details (columns 96-102)
          inspectionScheduledDate: row[96] || '',     // CQ: inspectionScheduledDate
          inspectionDate: row[97] || '',              // CR: inspectionDate
          inspectionOfficer: row[98] || '',           // CS: inspectionOfficer
          inspectionStatus: row[99] || '',            // CT: inspectionStatus
          inspectionApproved: row[100] || 'FALSE',    // CU: inspectionApproved
          inspectionRejectedReason: row[101] || '',   // CV: inspectionRejectedReason
          inspectionReportPath: row[102] || '',       // CW: inspectionReportPath
          
          // Metadata
          createdAt: row[8] || '',                    // I: createdAt
          updatedAt: row[9] || '',                    // J: updatedAt
        };
      });

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(installations));

    console.log(`✅ Fetched ${installations.length} installations (with delivered BOM) from Google Sheets`);

    return NextResponse.json({ 
      installations, 
      cached: false,
      count: installations.length 
    });
  } catch (error: any) {
    console.error('❌ Error fetching installations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch installations' },
      { status: 500 }
    );
  }
}
