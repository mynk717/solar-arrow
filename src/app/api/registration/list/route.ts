import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import {redis} from '@/lib/redis';


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
    const cacheKey = `org:${orgId}:registrations`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log('✅ Returning cached registrations');
      return NextResponse.json(JSON.parse(cached as string));
    }

    console.log('❌ Cache miss, fetching from sheets');

    const sheets = await getGoogleSheetsClient();

    // Fetch REGISTRATION tab
    const regResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'REGISTRATION!A2:R1000',
    });

    const regRows = regResponse.data.values || [];
    
    console.log('Raw registration rows:', regRows.length);

    // Fetch ENQUIRIES for joining
    const enqResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:H1000',
    });

    const enqRows = enqResponse.data.values || [];

    // Map enquiries by ID
    const enquiriesMap: any = {};
    enqRows.forEach((row: any) => {
      if (row[0]) {
        enquiriesMap[row[0]] = {
          id: row[0],
          customerName: row[1],
          phone: row[2],
          email: row[3],
          address: row[4],
          area: row[5],
          capacity: row[6],
          status: row[7],
        };
      }
    });

    // Map registrations with CORRECT column mapping
    const registrations = regRows
      .filter((row: any) => row[0]) // Has ID
      .map((row: any) => {
        const enquiry = enquiriesMap[row[1]] || {};
        
        return {
          // Column A-R mapping (0-17 index)
          id: row[0],                           // A
          enquiryId: row[1],                    // B
          registrationId: row[2] || null,       // C
          applicationNumber: row[3] || null,    // D
          consumerNumber: row[4] || null,       // E
          discomCircle: row[5] || null,         // F
          discomDivision: row[6] || null,       // G
          discomSubDivision: row[7] || null,    // H
          registrationStatus: row[8] || 'pending', // I
          submittedDate: row[9] || null,        // J
          approvedDate: row[10] || null,        // K
          rejectedDate: row[11] || null,        // L
          feasibilityApprovalNumber: row[12] || null, // M
          notes: row[13] || null,               // N
          rejectionReason: row[14] || null,     // O
          submittedBy: row[15] || null,         // P
          createdAt: row[16] || null,           // Q
          updatedAt: row[17] || null,           // R
          
          // Joined enquiry data
          customerName: enquiry.customerName,
          phone: enquiry.phone,
          email: enquiry.email,
          address: enquiry.address,
          area: enquiry.area,
          capacity: enquiry.capacity,
          enquiryStatus: enquiry.status,
        };
      });

    console.log('Processed registrations:', registrations.length);

    const result = {
      success: true,
      registrations,
      count: registrations.length,
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    console.log('✅ Registrations cached');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

