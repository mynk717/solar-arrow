import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    
    // Only admin and liaison can approve WCRs
    if (userRole !== 'admin' && userRole !== 'liaison') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const {
      enquiryId,
      approved,
      rejectionReason,
      approvalNotes,
    } = await request.json();

    if (!enquiryId || approved === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!approved && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting WCR' },
        { status: 400 }
      );
    }

    const sheets = await getGoogleSheetsClient();

    // Find the enquiry row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:BZ1000',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: any) => row[0] === enquiryId);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const row = rows[rowIndex];
    const rowNumber = rowIndex + 2;

    // Verify WCR is submitted
    const wcrStatus = row[30]; // Column AE
    if (wcrStatus !== 'submitted') {
      return NextResponse.json(
        { error: 'WCR must be submitted before approval/rejection' },
        { status: 400 }
      );
    }

    const approvalDate = new Date().toISOString().split('T')[0];

    // Update WCR approval columns
    if (approved) {
      // Update columns AE, AH, AI (status, approved date, approved by)
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `ENQUIRIES!AE${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['approved']] },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `ENQUIRIES!AH${rowNumber}:AI${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            approvalDate, // AH: wcrApprovedDate
            session.user.email, // AI: wcrApprovedBy
          ]],
        },
      });

      // Update enquiry status to wcr-approved (ready for inspection scheduling)
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `ENQUIRIES!F${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['wcr-approved']] },
      });
    } else {
      // Rejection
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `ENQUIRIES!AE${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['rejected']] },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `ENQUIRIES!AH${rowNumber}:AJ${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            approvalDate, // AH: rejection date (reusing approval date column)
            session.user.email, // AI: rejected by
            rejectionReason, // AJ: rejection reason
          ]],
        },
      });

      // Update enquiry status to wcr-rejected (installation team needs to resubmit)
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `ENQUIRIES!F${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['wcr-rejected']] },
      });
    }

    // Invalidate cache
    await redis.del(`org:${orgId}:wcrs`);
    await redis.del(`org:${orgId}:enquiries`);
    await redis.del(`org:${orgId}:liaisons:all`);

    // Send Telegram notification
    try {
      const customerName = row[1] || 'N/A';
      const capacity = row[4] || 'N/A';
      const wcrSubmittedBy = row[32] || 'N/A';
      const statusText = approved ? '✅ APPROVED' : '❌ REJECTED';

      const message = `
📝 **WORK COMPLETION REPORT ${statusText}**

📋 **Enquiry:** ${enquiryId}
👤 **Customer:** ${customerName}
⚡ **Capacity:** ${capacity}

**WCR Details:**
👨‍🔧 **Submitted By:** ${wcrSubmittedBy}
👨‍💼 **${approved ? 'Approved' : 'Rejected'} By:** ${session.user.email}
📅 **Date:** ${new Date(approvalDate).toLocaleDateString('en-IN')}

${approved 
  ? `✅ **Status:** WCR Approved - Ready for liaison inspection scheduling\n🔄 **Next Step:** Schedule inspection with DISCOM` 
  : `❌ **Rejection Reason:** ${rejectionReason}\n🔄 **Action Required:** Installation team to rectify and resubmit WCR`
}

${approvalNotes ? `📝 **Notes:** ${approvalNotes}` : ''}
      `.trim();

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: approved ? 'WCR approved successfully' : 'WCR rejected',
      approved,
    });
  } catch (error: any) {
    console.error('Error processing WCR approval:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process WCR approval' },
      { status: 500 }
    );
  }
}
