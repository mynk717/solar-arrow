// src/app/api/bom/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

// GET - Fetch all BOMs
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

    // Try cache first
    const cacheKey = `org:${orgId}:boms`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      console.log('✅ Returning cached BOMs');
      return NextResponse.json(cached);
    }

    console.log('📊 Cache miss, fetching from sheets');
    const sheets = await getGoogleSheetsClient();

    // Fetch BOM tab
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AJ1000',
    });

    const rows = response.data.values || [];
    
    const boms = rows.map((row: any) => ({
      id: row[0] || '',
      enquiryId: row[1] || '',
      bomStatus: row[2] || 'draft',
      bomGeneratedDate: row[3] || '',
      bomGeneratedBy: row[4] || '',
      dispatchStatus: row[5] || 'pending',
      dispatchDate: row[6] || '',
      dispatchedBy: row[7] || '',
      trackingNumber: row[8] || '',
      vehicleNumber: row[9] || '',
      driverName: row[10] || '',
      driverContact: row[11] || '',
      expectedDeliveryDate: row[12] || '',
      actualDeliveryDate: row[13] || '',
      deliveredTo: row[14] || '',
      deliveryNotes: row[15] || '',
      installationStatus: row[16] || 'not_started',
      installationStartDate: row[17] || '',
      installationCompletedDate: row[18] || '',
      installedBy: row[19] || '',
      materialUtilizationStatus: row[20] || 'not_started',
      materialReturnStatus: row[21] || 'not_applicable',
      returnCollectedDate: row[22] || '',
      returnCollectedBy: row[23] || '',
      sno: parseInt(row[24]) || 0,
      section: row[25] || '',
      particular: row[26] || '',
      uom: row[27] || '',
      qty: parseFloat(row[28]) || 0,
      rem: row[29] || '',
      qtyDispatched: parseFloat(row[30]) || 0,
      qtyUtilized: parseFloat(row[31]) || 0,
      qtyReturned: parseFloat(row[32]) || 0,
      utilizationNotes: row[33] || '',
      createdAt: row[34] || new Date().toISOString(),
      updatedAt: row[35] || '',
    }));

    // Cache for 5 minutes
    await redis.set(cacheKey, boms, { ex: 300 });

    return NextResponse.json(boms);
  } catch (error: any) {
    console.error('Error fetching BOMs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch BOMs' },
      { status: 500 }
    );
  }
}
