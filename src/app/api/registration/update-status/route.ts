import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { sendOrgGroupNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin/owner can update
    const userRole = (session.user as any)?.role || 'user';
    if (!['admin', 'owner'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      registrationStatus,
      registrationId,
      applicationNumber,
      feasibilityApprovalNumber,
      approvedDate,
      rejectedDate,
      rejectionReason,
      notes,
    } = body;

    if (!id || !registrationStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sheetId = (session.user as any).sheetId;
    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const sheets = await getGoogleSheetsClient();

    // Find row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'REGISTRATION!A2:R1000',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: any) => row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const actualRowIndex = rowIndex + 2;
    const row = rows[rowIndex];
    const enquiryId = row[1];

    // Prepare updates
    const now = new Date().toISOString();
    const updates: any = {
      I: registrationStatus,
      R: now, // updatedAt
    };

    if (registrationId) updates.C = registrationId;
    if (applicationNumber) updates.D = applicationNumber;
    if (feasibilityApprovalNumber) updates.M = feasibilityApprovalNumber;
    if (approvedDate) updates.K = approvedDate;
    if (rejectedDate) updates.L = rejectedDate;
    if (rejectionReason) updates.O = rejectionReason;
    if (notes) updates.N = notes;

    // Batch update
    const updateRequests = Object.entries(updates).map(([col, value]) => ({
      range: `REGISTRATION!${col}${actualRowIndex}`,
      values: [[value]],
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: updateRequests,
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
      let message = '';

      if (registrationStatus === 'approved') {
        message = `✅ *REGISTRATION APPROVED BY DISCOM*

📋 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry?.[1] || 'N/A'}
⚡ *Capacity:* ${enquiry?.[6]} kW

🆔 *Registration ID:* ${registrationId || 'N/A'}
📝 *Application No:* ${applicationNumber || 'N/A'}
📄 *Feasibility No:* ${feasibilityApprovalNumber || 'N/A'}
📅 *Approved Date:* ${approvedDate || new Date().toLocaleDateString('en-IN')}

✅ *Next Step:* Proceed with installation`;
      } else if (registrationStatus === 'rejected') {
        message = `❌ *REGISTRATION REJECTED BY DISCOM*

📋 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry?.[1] || 'N/A'}
⚡ *Capacity:* ${enquiry?.[6]} kW

📝 *Application No:* ${applicationNumber || 'N/A'}
📅 *Rejected Date:* ${rejectedDate || new Date().toLocaleDateString('en-IN')}
❌ *Reason:* ${rejectionReason || 'Not specified'}

⚠️ *Action Required:* Review and resubmit application`;
      } else {
        message = `🔄 *REGISTRATION STATUS UPDATED*

📋 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry?.[1] || 'N/A'}
⚡ *Capacity:* ${enquiry?.[6]} kW

📊 *Status:* ${registrationStatus.toUpperCase()}
📅 *Updated:* ${new Date().toLocaleDateString('en-IN')}`;
      }

      await sendOrgGroupNotification(
        (session.user as any).organizationId!,
        { text: message, parseMode: 'Markdown' }
      );
    } catch (notificationError) {
      console.error('Telegram notification failed:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: `Registration status updated to ${registrationStatus}`,
    });
  } catch (error: any) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update registration' },
      { status: 500 }
    );
  }
}
