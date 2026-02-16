import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { nanoid } from 'nanoid';
import { sendOrgGroupNotification } from '@/lib/telegram';

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
    const {
      enquiryId,
      applicationNumber,
      consumerNumber,
      discomCircle,
      discomDivision,
      discomSubDivision,
      submittedDate,
      notes,
    } = body;

    if (!enquiryId || !discomCircle || !discomDivision || !discomSubDivision) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Prepare row: Only enquiryId + registration-specific fields
    // Prepare row: Match exact column order A-R
const rowData = [
  regId,                              // A: id
  enquiryId,                          // B: enquiryId
  '',                                 // C: registrationId (empty until approved)
  applicationNumber || '',            // D: applicationNumber
  consumerNumber || '',               // E: consumerNumber
  discomCircle,                       // F: discomCircle
  discomDivision,                     // G: discomDivision
  discomSubDivision,                  // H: discomSubDivision
  'submitted',                        // I: registrationStatus
  submittedDate || now.split('T')[0], // J: submittedDate
  '',                                 // K: approvedDate
  '',                                 // L: rejectedDate
  '',                                 // M: feasibilityApprovalNumber
  notes || '',                        // N: notes
  '',                                 // O: rejectionReason
  session.user.email,                 // P: submittedBy
  now,                                // Q: createdAt
  now,                                // R: updatedAt
];


    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'REGISTRATION!A:R',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    // Fetch enquiry for notification
    const enqResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:G1000',
    });

    const enqRows = enqResponse.data.values || [];
    const enquiry = enqRows.find((row: any) => row[0] === enquiryId);

    // Send notification
    try {
      const message = `📋 *REGISTRATION SUBMITTED TO DISCOM*

🆔 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry?.[1] || 'N/A'}
📞 *Phone:* ${enquiry?.[2] || 'N/A'}
⚡ *Capacity:* ${enquiry?.[6]} kW

🏢 *DISCOM Details:*
📍 Circle: ${discomCircle}
📍 Division: ${discomDivision}
📍 Sub-Division: ${discomSubDivision}
${applicationNumber ? `📝 Application: ${applicationNumber}` : ''}

📅 *Submitted Date:* ${submittedDate || new Date().toLocaleDateString('en-IN')}
👤 *Submitted By:* ${session.user.email}

⏳ *Status:* Awaiting DISCOM approval`;

      await sendOrgGroupNotification(
        (session.user as any).organizationId!,
        { text: message, parseMode: 'Markdown' }
      );
    } catch (notificationError) {
      console.error('Telegram notification failed:', notificationError);
    }

    return NextResponse.json({
      success: true,
      registration: { id: regId, enquiryId, registrationStatus: 'submitted' },
    });
  } catch (error: any) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create registration' },
      { status: 500 }
    );
  }
}
