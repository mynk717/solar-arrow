// src/app/api/installation/schedule/route.ts
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
      installationScheduledDate,
      installationTeam,
      installationSupervisor,
    } = await request.json();

    if (!enquiryId || !installationScheduledDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';
    const sheets = await getGoogleSheetsClient();

    // Fetch entire ENQUIRIES rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:CZ1000',
    });

    const rows = response.data.values || [];
    let rowIndex = -1;
    let customerName = '';
    let capacity = '';

    // Find and update the row
    const updatedRows = rows.map((row: any[], index: number) => {
      if (row[0] === enquiryId) { // Column A = id
        rowIndex = index;
        customerName = row[1];
        capacity = row[6] || row[72]; // G: capacity or BS: systemCapacity
        
        const updatedRow = [...row]; // Clone row
        
        // Update installation schedule fields (columns 82-86)
        updatedRow[82] = installationScheduledDate;    // CC: installationScheduledDate
        updatedRow[85] = installationTeam || '';       // CF: installationTeam
        updatedRow[86] = installationSupervisor || ''; // CG: installationSupervisor
        
        // Update status if not already installation-related
        if (!updatedRow[7].includes('installation')) {
          updatedRow[7] = 'installation-scheduled';    // H: status
        }
        
        updatedRow[9] = new Date().toISOString();      // J: updatedAt
        
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
      const message = `📅 *INSTALLATION SCHEDULED*

*Enquiry:* ${enquiryId}
*Customer:* ${customerName}
*Capacity:* ${capacity}

*Installation Details:*
*Date:* ${new Date(installationScheduledDate).toLocaleDateString('en-IN')}
*Team:* ${installationTeam}
*Supervisor:* ${installationSupervisor}

*Scheduled By:* ${session.user.email}

_Team has been notified. Materials are ready for installation._`;

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Installation scheduled successfully',
    });
  } catch (error: any) {
    console.error('Error scheduling installation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule installation' },
      { status: 500 }
    );
  }
}
