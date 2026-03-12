// src/app/api/installation/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient, getLiaisonRow, createLiaisonRow, fetchEnquiryById  } from '@/lib/googleSheets';
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
    
    if (!updatedRow[82]) updatedRow[82] = new Date().toISOString().split('T')[0]; // CE: installationStartDate
    updatedRow[83] = installationCompletedDate || new Date().toISOString().split('T')[0]; // CF
    updatedRow[84] = installationTeam || '';
    updatedRow[85] = installationSupervisor || '';
    updatedRow[86] = installationNotes || '';
    updatedRow[87] = pvModuleSerialNumbers || '';
    updatedRow[88] = inverterSerialNumber || '';
    updatedRow[89] = meterNumber || '';
    updatedRow[90] = meterInstalledDate || new Date().toISOString().split('T')[0];
    updatedRow[91] = meterReadingInitial || '0';
    updatedRow[92] = earthingDone ? 'TRUE' : 'FALSE';
    updatedRow[93] = earthingResistance || '';
    updatedRow[94] = installationPhotos || '';
    
    // Update status to installation-completed
    updatedRow[7] = 'installation-completed';          // H: status
    updatedRow[9] = new Date().toISOString();          // J: updatedAt ✅ keep full ISO for time precision
    
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
  range: `ENQUIRIES!A${rowIndex + 2}:DR${rowIndex + 2}`, // ← only this row
  valueInputOption: 'USER_ENTERED',
  requestBody: { values: [updatedRows[rowIndex]] }, // ✅ FIX 1: was [updatedRow], scope was wrong
});


    // Clear cache
    await redis.del(`org:${orgId}:installations`);
    await redis.del(`org:${orgId}:enquiries`);

    // Inside POST, after cache clears:
try {
  const existingLiaison = await getLiaisonRow(enquiryId);
  if (!existingLiaison) {
    await createLiaisonRow({
      enquiryId,
      customerName,
      capacity: '', // fetched below if needed
      area: '',
      meterNumber: meterNumber || '',
      liaisonStage: 'pending',
    });
    console.log('✅ LIAISON row auto-created for', enquiryId);
  }
} catch (liaisonErr) {
  console.error('⚠️ LIAISON row creation failed (non-blocking):', liaisonErr);
}
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
