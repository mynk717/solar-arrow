// src/app/api/installation/complete/route.ts
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

    const {
      enquiryId,
      installationCompletedDate,
      installationTeam,
      installationSupervisor,
      installationNotes,
      pvModuleSerialNumbers,
      inverterSerialNumber,
      meterNumber,
      meterInstalledDate,
      meterReadingInitial,
      earthingDone,
      earthingResistance,
      installationPhotos,
    } = await request.json();

    if (!enquiryId) {
      return NextResponse.json({ error: 'Missing enquiry ID' }, { status: 400 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';
    const sheets = await getGoogleSheetsClient();

    // Fetch entire ENQUIRIES row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:CZ1000',
    });

    const rows = response.data.values || [];
    let rowIndex = -1;
    let customerName = '';

    // Find the row with matching enquiryId
    const updatedRows = rows.map((row: any[], index: number) => {
      if (row[0] === enquiryId) { // Column A = id
        rowIndex = index;
        customerName = row[1];
        
        const updatedRow = [...row]; // Clone row
        
        // Update installation fields (columns 82-95)
        if (!updatedRow[83]) updatedRow[83] = new Date().toISOString().split('T')[0]; // CD: installationStartDate
        updatedRow[84] = installationCompletedDate || new Date().toISOString().split('T')[0]; // CE: installationCompletedDate
        updatedRow[85] = installationTeam || '';           // CF: installationTeam
        updatedRow[86] = installationSupervisor || '';     // CG: installationSupervisor
        updatedRow[87] = installationNotes || '';          // CH: installationNotes
        updatedRow[88] = pvModuleSerialNumbers || '';      // CI: pvModuleSerialNumbers
        updatedRow[89] = inverterSerialNumber || '';       // CJ: inverterSerialNumber
        updatedRow[90] = meterNumber || '';                // CK: meterNumber
        updatedRow[91] = meterInstalledDate || new Date().toISOString().split('T')[0]; // CL: meterInstalledDate
        updatedRow[92] = meterReadingInitial || '0';       // CM: meterReadingInitial
        updatedRow[93] = earthingDone ? 'TRUE' : 'FALSE';  // CN: earthingDone
        updatedRow[94] = earthingResistance || '';         // CO: earthingResistance
        updatedRow[95] = installationPhotos || '';         // CP: installationPhotos
        
        // Update status to installation-completed
        updatedRow[7] = 'installation-completed';          // H: status
        updatedRow[9] = new Date().toISOString();          // J: updatedAt
        
        return updatedRow;
      }
      return row;
    });

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    // Write back to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:CZ1000',
      valueInputOption: 'RAW',
      requestBody: {
        values: updatedRows,
      },
    });

    // Clear cache
    await redis.del(`org:${orgId}:installations`);
    await redis.del(`org:${orgId}:enquiries`);

    // Send Telegram notification
    try {
      const message = `✅ *INSTALLATION COMPLETED*

*Enquiry:* ${enquiryId}
*Customer:* ${customerName}

*Installation Details:*
Team: ${installationTeam || 'N/A'}
Supervisor: ${installationSupervisor || 'N/A'}
Meter: ${meterNumber || 'N/A'}
${earthingDone ? '✅ Earthing Done' : '⚠️ Earthing Pending'}

*Completed By:* ${session.user.email}

_Ready for inspection and WCR submission._`;

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Installation marked as completed',
    });
  } catch (error: any) {
    console.error('Error completing installation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete installation' },
      { status: 500 }
    );
  }
}
