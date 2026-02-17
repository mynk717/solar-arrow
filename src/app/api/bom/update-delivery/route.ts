// src/app/api/bom/update-delivery/route.ts
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
      deliveredTo,
      deliveryNotes,
    } = await request.json();

    if (!enquiryId) {
      return NextResponse.json({ error: 'Missing enquiry ID' }, { status: 400 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';
    const sheets = await getGoogleSheetsClient();

    // Fetch entire BOM rows to preserve all data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AB1000',
    });

    const rows = response.data.values || [];
    let updatedCount = 0;
    let customerName = '';

    // Find and update ALL rows with matching enquiryId
    const updatedRows = rows.map((row: any[]) => {
      if (row[1] === enquiryId) { // Column B = enquiryId
        updatedCount++;
        if (!customerName) customerName = row[2]; // Get customer name
        
        // CORRECTED: Preserve all columns and only update delivery fields
        const updatedRow = [...row]; // Clone existing row
        
        // Update dispatch status to 'delivered' and delivery fields
        updatedRow[7] = 'delivered';                           // H: dispatchStatus
        updatedRow[15] = new Date().toISOString().split('T')[0]; // P: actualDeliveryDate
        updatedRow[16] = deliveredTo || '';                    // Q: deliveredTo
        updatedRow[17] = deliveryNotes || '';                  // R: deliveryNotes
        updatedRow[27] = new Date().toISOString();             // AB: updatedAt
        
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

    // Invalidate cache
    const cacheKey = `org:${orgId}:boms`;
    await redis.del(cacheKey);
    console.log('✅ Cache cleared for delivery:', cacheKey);

    // Send Telegram notification
    try {
      const message = `✅ *MATERIALS DELIVERED*

*Enquiry:* ${enquiryId}
*Customer:* ${customerName}
*Items Delivered:* ${updatedCount} line items

*Delivery Details:*
*Delivered To:* ${deliveredTo || 'Site'}
*Delivered On:* ${new Date().toLocaleDateString('en-IN')}
${deliveryNotes ? `*Notes:* ${deliveryNotes}` : ''}

*Recorded By:* ${session.user.email}

_Installation team can now start the installation work._`;

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Delivery updated successfully',
      itemsUpdated: updatedCount,
    });
  } catch (error: any) {
    console.error('Error updating delivery:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update delivery' },
      { status: 500 }
    );
  }
}
