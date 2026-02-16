import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { nanoid } from 'nanoid';

// Create manual registration entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role || 'user';
    if (!['admin', 'owner'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { enquiryId, applicationNumber, notes } = body;

    if (!enquiryId) {
      return NextResponse.json({ error: 'Enquiry ID required' }, { status: 400 });
    }

    const sheetId = (session.user as any).sheetId;
    const sheets = await getGoogleSheetsClient();

    // Check if already exists
    const checkResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'REGISTRATION!A2:B1000',
    });

    const existingRows = checkResponse.data.values || [];
    const exists = existingRows.find((row: any) => row[1] === enquiryId);

    if (exists) {
      return NextResponse.json(
        { error: 'Registration entry already exists for this enquiry' },
        { status: 400 }
      );
    }

    const regId = `REG-${nanoid(6).toUpperCase()}`;
    const now = new Date().toISOString();

    const rowData = [
      regId,
      enquiryId,
      '', // registrationId
      applicationNumber || '',
      '', // consumerNumber
      '', // discomCircle
      '', // discomDivision
      '', // discomSubDivision
      'pending',
      '', // submittedDate
      '', // approvedDate
      '', // rejectedDate
      '', // feasibilityApprovalNumber
      notes || '',
      '', // rejectionReason
      session.user.email,
      now,
      now,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'REGISTRATION!A:R',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({
      success: true,
      registration: { id: regId, enquiryId, registrationStatus: 'pending' },
    });
  } catch (error: any) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create registration' },
      { status: 500 }
    );
  }
}
