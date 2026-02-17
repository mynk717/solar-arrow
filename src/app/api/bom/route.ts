// src/app/api/bom/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

/**
 * GET - Fetch all BOMs from Google Sheet
 * New Structure: 1 BOM = 1 Row with materials as JSON in column V
 */
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

    // Fetch BOM tab - NEW STRUCTURE (A-AB = 28 columns)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AB1000',
    });

    const rows = response.data.values || [];
    
    // Map rows to BOMLineItem objects
    const boms = rows
      .filter((row: any) => row && row.length > 0 && row[0]) // Filter empty rows
      .map((row: any) => {
        // Parse materials JSON safely
        let materialsJSON = '{"items":[]}';
        try {
          if (row[21] && typeof row[21] === 'string') {
            // Validate JSON
            JSON.parse(row[21]);
            materialsJSON = row[21];
          }
        } catch (e) {
          console.error('Invalid materials JSON for BOM:', row[0], e);
        }

        return {
          bomId: row[0] || '',
          enquiryId: row[1] || '',
          customerName: row[2] || '',
          systemCapacity: row[3] || '',
          bomStatus: row[4] || 'draft',
          bomGeneratedDate: row[5] || '',
          bomGeneratedBy: row[6] || '',
          dispatchStatus: row[7] || 'pending',
          dispatchDate: row[8] || '',
          dispatchedBy: row[9] || '',
          trackingNumber: row[10] || '',
          vehicleNumber: row[11] || '',
          driverName: row[12] || '',
          driverContact: row[13] || '',
          expectedDeliveryDate: row[14] || '',
          actualDeliveryDate: row[15] || '',
          deliveredTo: row[16] || '',
          deliveryNotes: row[17] || '',
          installationStatus: row[18] || 'not_started',
          installationDate: row[19] || '',
          installedBy: row[20] || '',
          materialsJSON: materialsJSON, // Column V (index 21)
          materialUtilizationStatus: row[22] || 'not_started',
          materialReturnStatus: row[23] || 'not_applicable',
          returnCollectedDate: row[24] || '',
          utilizationNotes: row[25] || '',
          createdAt: row[26] || new Date().toISOString(),
          updatedAt: row[27] || '',
        };
      });

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(boms));

    console.log(`✅ Fetched ${boms.length} BOMs from Google Sheets`);

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
