import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheetId = (session.user as any).sheetId;
    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();

    // Fetch REGISTRATION tab
    const regResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'REGISTRATION!A2:R1000',
    });

    const regRows = regResponse.data.values || [];
    
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

    // Map registrations with enquiry data
    const registrations = regRows.map((row: any) => {
      const enquiry = enquiriesMap[row[1]] || {};
      
      return {
        id: row[0],
        enquiryId: row[1],
        registrationId: row[2] || null,
        applicationNumber: row[3] || null,
        consumerNumber: row[4] || null,
        discomCircle: row[5] || null,
        discomDivision: row[6] || null,
        discomSubDivision: row[7] || null,
        registrationStatus: row[8] || 'pending',
        submittedDate: row[9] || null,
        approvedDate: row[10] || null,
        rejectedDate: row[11] || null,
        feasibilityApprovalNumber: row[12] || null,
        notes: row[13] || null,
        rejectionReason: row[14] || null,
        submittedBy: row[15] || null,
        createdAt: row[16] || null,
        updatedAt: row[17] || null,
        
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

    return NextResponse.json({
      success: true,
      registrations,
      count: registrations.length,
    });
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
