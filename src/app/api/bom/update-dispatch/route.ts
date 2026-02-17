// src/app/api/bom/update-dispatch/route.ts
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
      dispatchStatus,
      trackingNumber,
      vehicleNumber,
      driverName,
      driverContact,
      expectedDeliveryDate,
    } = await request.json();

    if (!enquiryId || !dispatchStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Find all rows for this enquiry
    rows.forEach((row: any, index: number) => {
      if (row[1] === enquiryId) { // enquiryId in column B
        const rowNumber = index + 2;
        updates.push({
          range: `BOM!F${rowNumber}:M${rowNumber}`, // Columns F-M (dispatch fields)
          values: [[
            dispatchStatus, // F: dispatchStatus
            new Date().toISOString().split('T')[0], // G: dispatchDate
            session.user.email, // H: dispatchedBy
            trackingNumber || '', // I: trackingNumber
            vehicleNumber || '', // J: vehicleNumber
            driverName || '', // K: driverName
            driverContact || '', // L: driverContact
            expectedDeliveryDate || '', // M: expectedDeliveryDate
          ]],
        });
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No BOM found for this enquiry' }, { status: 404 });
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
      const message = `🚚 *MATERIALS DISPATCHED*

*Enquiry:* ${enquiryId}
*Items:* ${updates.length} line items

*Tracking Details:*
${trackingNumber ? `Tracking: ${trackingNumber}` : ''}
${vehicleNumber ? `Vehicle: ${vehicleNumber}` : ''}
${driverName ? `Driver: ${driverName} (${driverContact})` : ''}
${expectedDeliveryDate ? `Expected: ${new Date(expectedDeliveryDate).toLocaleDateString('en-IN')}` : ''}

*Dispatched By:* ${session.user.email}

_Installation team will be notified upon delivery._`;

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Dispatch updated successfully',
      updatedItems: updates.length,
    });
  } catch (error: any) {
    console.error('Error updating dispatch:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update dispatch' },
      { status: 500 }
    );
  }
}
