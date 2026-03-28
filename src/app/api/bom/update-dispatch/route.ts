// src/app/api/bom/update-dispatch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification, notifyNextStageUsers } from '@/lib/telegram';

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

    // Fetch entire BOM row to preserve all data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AB1000',
    });

    const rows = response.data.values || [];
    let updatedCount = 0;

    // Find and update ALL rows with matching enquiryId
    const updatedRows = rows.map((row: any[], index: number) => {
      if (row[1] === enquiryId) { // Column B = enquiryId
        updatedCount++;
        
        // CORRECTED: Preserve all columns and only update dispatch fields
        const updatedRow = [...row]; // Clone existing row
        
        // Update ONLY dispatch-related columns (H-O)
        updatedRow[7] = dispatchStatus;                              // H: dispatchStatus
        updatedRow[8] = new Date().toISOString().split('T')[0];     // I: dispatchDate
        updatedRow[9] = session.user.email;                          // J: dispatchedBy
        updatedRow[10] = trackingNumber || '';                       // K: trackingNumber
        updatedRow[11] = vehicleNumber || '';                        // L: vehicleNumber
        updatedRow[12] = driverName || '';                           // M: driverName
        updatedRow[13] = driverContact || '';                        // N: driverContact
        updatedRow[14] = expectedDeliveryDate || '';                 // O: expectedDeliveryDate
        updatedRow[27] = new Date().toISOString();                   // AB: updatedAt
        
        return updatedRow;
      }
      return row;
    });

    if (updatedCount === 0) {
      return NextResponse.json({ error: 'No BOM found for this enquiry' }, { status: 404 });
    }

    // Write back ALL rows
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AB1000',
      valueInputOption: 'RAW',
      requestBody: {
        values: updatedRows,
      },
    });

    // Invalidate cache - FORCE CLEAR
    const cacheKey = `org:${orgId}:boms`;
    await redis.del(cacheKey);
    console.log('✅ Cache cleared for:', cacheKey);

    // ALSO clear any variation of the cache key
    await redis.del(`boms:${orgId}`);
    await redis.del(`org:${orgId}:enquiries`);

    // Send Telegram notification
    try {
      const message = `🚚 *MATERIALS DISPATCHED*

*Enquiry:* ${enquiryId}
*Items:* ${updatedCount} line items

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
    await notifyNextStageUsers(
      orgId,
      '/installation',
      `🔔 *Action Required: Installation*\n\n📋 *Enquiry:* ${enquiryId}\n📦 *Items:* ${updatedCount} line items dispatched\n${expectedDeliveryDate ? `📅 *Expected Delivery:* ${new Date(expectedDeliveryDate).toLocaleDateString('en-IN')}` : ''}\n\n_Materials dispatched. Please proceed with installation._`
    );
    return NextResponse.json({
      success: true,
      message: 'Dispatch updated successfully',
      updatedItems: updatedCount,
    });
  } catch (error: any) {
    console.error('Error updating dispatch:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update dispatch' },
      { status: 500 }
    );
  }
}
