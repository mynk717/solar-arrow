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

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const {
      enquiryId,
      completionDate,
      workQuality,
      safetyCompliance,
      wcrNotes,
      photoUrls,
      customerSignature,
    } = await request.json();

    if (!enquiryId || !completionDate || !workQuality || !safetyCompliance || !wcrNotes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Verify installation is completed
    const installationStatus = row[15];
    if (installationStatus !== 'completed' && installationStatus !== 'installation-completed') {
      return NextResponse.json(
        { error: 'Installation must be completed before submitting WCR' },
        { status: 400 }
      );
    }

    // Update WCR columns (AE to AO)
    const updates = {
      range: `ENQUIRIES!AE${rowNumber}:AO${rowNumber}`,
      values: [[
        'submitted', // AE: wcrStatus
        new Date().toISOString().split('T')[0], // AF: wcrSubmittedDate
        session.user.email, // AG: wcrSubmittedBy
        '', // AH: wcrApprovedDate (empty for now)
        '', // AI: wcrApprovedBy (empty for now)
        '', // AJ: wcrRejectedReason (empty for now)
        wcrNotes, // AK: wcrNotes
        workQuality, // AL: workQuality
        safetyCompliance, // AM: safetyCompliance
        photoUrls || '', // AN: wcrPhotos (comma-separated URLs)
        customerSignature || '', // AO: customerSignature
      ]],
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: updates.range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: updates.values },
    });

    // Update enquiry status to wcr-submitted
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `ENQUIRIES!F${rowNumber}`, // Column F is status
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [['wcr-submitted']] },
    });

    // Invalidate cache
    await redis.del(`org:${orgId}:wcrs`);
    await redis.del(`org:${orgId}:enquiries`);

    // Send Telegram notification
    try {
      const customerName = row[1] || 'N/A';
      const capacity = row[4] || 'N/A';
      const installationDate = row[14] || 'N/A';

      const message = `
📝 **WORK COMPLETION REPORT SUBMITTED**

📋 **Enquiry:** ${enquiryId}
👤 **Customer:** ${customerName}
⚡ **Capacity:** ${capacity}
📅 **Installation Date:** ${new Date(installationDate).toLocaleDateString('en-IN')}

**WCR Details:**
👨‍🔧 **Submitted By:** ${session.user.email}
📅 **Submission Date:** ${new Date().toLocaleDateString('en-IN')}
⭐ **Work Quality:** ${workQuality}
🛡️ **Safety Compliance:** ${safetyCompliance}

📝 **Notes:** ${wcrNotes}

${photoUrls ? `📸 **Photos:** ${photoUrls.split(',').length} photo(s) attached` : ''}

⏳ **Status:** Awaiting approval from liaison team
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
      message: 'Work Completion Report submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting WCR:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit WCR' },
      { status: 500 }
    );
  }
}
