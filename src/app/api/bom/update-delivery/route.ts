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

    // Fetch BOM rows for this enquiry
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AJ1000',
    });

    const rows = response.data.values || [];
    const updates: any[] = [];
    let customerName = '';
    let itemCount = 0;

    // Find all rows for this enquiry and update delivery fields
    rows.forEach((row: any, index: number) => {
      if (row[1] === enquiryId) { // enquiryId in column B
        const rowNumber = index + 2;
        itemCount++;
        
        updates.push({
          range: `BOM!F${rowNumber}`, // dispatchStatus column
          values: [['delivered']],
        });
        
        updates.push({
          range: `BOM!N${rowNumber}:P${rowNumber}`, // Columns N-P (delivery fields)
          values: [[
            new Date().toISOString().split('T')[0], // N: actualDeliveryDate
            deliveredTo || '', // O: deliveredTo
            deliveryNotes || '', // P: deliveryNotes
          ]],
        });

        updates.push({
          range: `BOM!AJ${rowNumber}`, // updatedAt column
          values: [[new Date().toISOString()]],
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
      const message = `✅ *MATERIALS DELIVERED*

*Enquiry:* ${enquiryId}
*Items Delivered:* ${itemCount} line items

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
      itemsUpdated: itemCount,
    });
  } catch (error: any) {
    console.error('Error updating delivery:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update delivery' },
      { status: 500 }
    );
  }
}
