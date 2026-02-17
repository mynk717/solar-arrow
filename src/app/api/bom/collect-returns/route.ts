// src/app/api/bom/collect-returns/route.ts
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

    const { enquiryId } = await request.json();

    if (!enquiryId) {
      return NextResponse.json({ error: 'Missing enquiry ID' }, { status: 400 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';
    const sheets = await getGoogleSheetsClient();

    // Fetch BOM rows for this enquiry
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AJ1000',
    });

    const rows = response.data.values || [];
    const updates: any[] = [];
    let returnedItemCount = 0;

    // Find rows with returned materials
    rows.forEach((row: any, index: number) => {
      if (row[1] === enquiryId && parseFloat(row[32]) > 0) { // Column AG: qtyReturned
        const rowNumber = index + 2;
        returnedItemCount++;

        updates.push({
          range: `BOM!V${rowNumber}:X${rowNumber}`, // Return status columns
          values: [[
            'collected', // V: materialReturnStatus
            new Date().toISOString().split('T')[0], // W: returnCollectedDate
            session.user.email, // X: returnCollectedBy
          ]],
        });

        updates.push({
          range: `BOM!AJ${rowNumber}`, // updatedAt
          values: [[new Date().toISOString()]],
        });
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No materials to collect for this enquiry' }, { status: 404 });
    }

    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        data: updates,
        valueInputOption: 'USER_ENTERED',
      },
    });

    // Invalidate cache
    await redis.del(`org:${orgId}:boms`);

    // Send Telegram notification
    try {
      const message = `📦 *UNUSED MATERIALS COLLECTED*

*Enquiry:* ${enquiryId}
*Items Collected:* ${returnedItemCount} items returned to warehouse

*Collected By:* ${session.user.email}
*Date:* ${new Date().toLocaleDateString('en-IN')}

_Materials have been returned to inventory._`;

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Returns collected successfully',
      itemsCollected: returnedItemCount,
    });
  } catch (error: any) {
    console.error('Error collecting returns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to collect returns' },
      { status: 500 }
    );
  }
}
