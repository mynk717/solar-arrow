// src/app/api/bom/update-utilization/route.ts
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
      utilizedItems, // Array of { bomId, qtyUtilized, qtyReturned, notes }
    } = await request.json();

    if (!enquiryId || !utilizedItems) {
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
    let totalUtilized = 0;
    let totalReturned = 0;

    // Create a map of utilizedItems by bomId
    const utilizationMap = new Map();
    utilizedItems.forEach((item: any) => {
      utilizationMap.set(item.bomId, item);
    });

    // Find rows and prepare updates
    rows.forEach((row: any, index: number) => {
      const bomId = row[0]; // Column A
      if (row[1] === enquiryId && utilizationMap.has(bomId)) {
        const rowNumber = index + 2;
        const utilData = utilizationMap.get(bomId);

        totalUtilized++;
        if (utilData.qtyReturned > 0) totalReturned++;

        updates.push({
          range: `BOM!Q${rowNumber}:AJ${rowNumber}`, // Installation and utilization columns
          values: [[
            'completed', // Q: installationStatus
            new Date().toISOString().split('T')[0], // R: installationStartDate (if empty)
            new Date().toISOString().split('T')[0], // S: installationCompletedDate
            session.user.email, // T: installedBy
            'completed', // U: materialUtilizationStatus
            utilData.qtyReturned > 0 ? 'pending' : 'not_applicable', // V: materialReturnStatus
            '', // W: returnCollectedDate (empty for now)
            '', // X: returnCollectedBy
            '', // Y-AD: skip sno, section, particular, uom, qty, rem (material details - don't update)
            '', '', '', '', '', '',
            utilData.qtyUtilized || 0, // AE: qtyDispatched (same as qty)
            utilData.qtyUtilized || 0, // AF: qtyUtilized
            utilData.qtyReturned || 0, // AG: qtyReturned
            utilData.notes || '', // AH: utilizationNotes
            '', // AI: createdAt (don't update)
            new Date().toISOString(), // AJ: updatedAt
          ]],
        });
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No matching BOM items found' }, { status: 404 });
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
      const returnSummary = totalReturned > 0 
        ? `\n\n⚠️ *Unused Materials:* ${totalReturned} items need to be collected` 
        : '\n\n✅ All materials fully utilized';

      const message = `🔧 *INSTALLATION COMPLETED & MATERIALS UPDATED*

*Enquiry:* ${enquiryId}
*Materials Used:* ${totalUtilized} items updated
${returnSummary}

*Updated By:* ${session.user.email}
*Date:* ${new Date().toLocaleDateString('en-IN')}

${totalReturned > 0 ? '_Action Required: Collect unused materials from site._' : '_Ready for liaison and meter installation._'}`;

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Material utilization updated successfully',
      itemsUpdated: updates.length,
      materialsReturned: totalReturned,
    });
  } catch (error: any) {
    console.error('Error updating utilization:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update utilization' },
      { status: 500 }
    );
  }
}
