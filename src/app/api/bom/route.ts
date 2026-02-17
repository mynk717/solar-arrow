// src/app/api/bom/route.ts
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
    const cacheKey = `org:${orgId}:boms`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      console.log('✅ Returning cached BOMs');
      return NextResponse.json({ 
        boms: typeof cached === 'string' ? JSON.parse(cached) : cached,
        cached: true 
      });
    }

    console.log('📊 Cache miss, fetching from Google Sheets');
    const sheets = await getGoogleSheetsClient();

    // Fetch BOM tab - CORRECTED COLUMN MAPPING
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AB1000',
    });

    const rows = response.data.values || [];
    
    // Map rows to BOM objects with CORRECT indices
    const boms = rows
      .filter((row: any) => row && row.length > 0 && row[0]) // Filter empty rows
      .map((row: any) => {
        // Safely parse materials JSON
        let materialsJSON = '{"items":[]}';
        try {
          if (row[21] && typeof row[21] === 'string') {
            JSON.parse(row[21]); // Validate
            materialsJSON = row[21];
          }
        } catch (e) {
          console.error('Invalid materials JSON for BOM:', row[0], e);
        }

        // CORRECTED MAPPING - Check your sheet structure
        return {
          bomId: row[0] || '',                    // A
          enquiryId: row[1] || '',                // B
          customerName: row[2] || '',             // C
          systemCapacity: row[3] || '',           // D
          bomStatus: row[4] || 'draft',           // E
          bomGeneratedDate: row[5] || '',         // F
          bomGeneratedBy: row[6] || '',           // G
          dispatchStatus: row[7] || 'pending',    // H ← THIS IS THE KEY!
          dispatchDate: row[8] || '',             // I
          dispatchedBy: row[9] || '',             // J
          trackingNumber: row[10] || '',          // K
          vehicleNumber: row[11] || '',           // L
          driverName: row[12] || '',              // M
          driverContact: row[13] || '',           // N
          expectedDeliveryDate: row[14] || '',    // O
          actualDeliveryDate: row[15] || '',      // P
          deliveredTo: row[16] || '',             // Q
          deliveryNotes: row[17] || '',           // R
          installationStatus: row[18] || 'not_started', // S
          installationDate: row[19] || '',        // T
          installedBy: row[20] || '',             // U
          materialsJSON: materialsJSON,           // V (index 21)
          materialUtilizationStatus: row[22] || 'not_started', // W
          materialReturnStatus: row[23] || 'not_applicable',   // X
          returnCollectedDate: row[24] || '',     // Y
          utilizationNotes: row[25] || '',        // Z
          createdAt: row[26] || new Date().toISOString(), // AA
          updatedAt: row[27] || '',               // AB
        };
      });

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(boms));

    console.log(`✅ Fetched ${boms.length} BOMs from Google Sheets`);
    
    // DEBUG: Log first BOM to verify structure
    if (boms.length > 0) {
      console.log('Sample BOM:', JSON.stringify(boms[0], null, 2));
    }

    return NextResponse.json({ 
      boms, 
      cached: false,
      count: boms.length 
    });
  } catch (error: any) {
    console.error('❌ Error fetching BOMs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch BOMs' },
      { status: 500 }
    );
  }
}
