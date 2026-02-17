// src/app/api/bom/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

// Material templates by capacity
const MATERIAL_TEMPLATES = {
  '3': [
    // 3KW KIT
    { sno: 1, section: '3KW KIT', particular: 'PANEL DCR 580W', uom: 'nos', qty: 6 },
    { sno: 2, section: '3KW KIT', particular: 'INVERTER 3KW', uom: 'nos', qty: 1 },
    { sno: 3, section: '3KW KIT', particular: 'DCDB 1-6KW', uom: 'nos', qty: 1, rem: 'PENDING' },
    { sno: 4, section: '3KW KIT', particular: 'ACDB 1-6KW', uom: 'nos', qty: 1 },
    { sno: 5, section: '3KW KIT', particular: 'DC CABLE', uom: 'mtr', qty: 50 },
    { sno: 6, section: '3KW KIT', particular: '6 SQ MM 1C Cu CABLE', uom: 'mtr', qty: 1, rem: 'PENDING' },
    { sno: 7, section: '3KW KIT', particular: '2.5 SQMM 2C Cu CABLE', uom: 'mtr', qty: 1.5 },
    { sno: 8, section: '3KW KIT', particular: '10 SQMM 2C Al. un CABLE', uom: 'mtr', qty: 40 },
    { sno: 9, section: '3KW KIT', particular: 'RING LUG 6MM', uom: 'nos', qty: 6 },
    { sno: 10, section: '3KW KIT', particular: 'PIN LUG 6MM', uom: 'nos', qty: 16 },
    { sno: 11, section: '3KW KIT', particular: 'MC4 CONNECTOR', uom: 'nos', qty: 2 },
    { sno: 12, section: '3KW KIT', particular: 'EARTHING ROD', uom: 'nos', qty: 3 },
    { sno: 13, section: '3KW KIT', particular: 'EARTHING BALTI', uom: 'nos', qty: 3 },
    { sno: 14, section: '3KW KIT', particular: 'LIGHTENING ARRESTER', uom: 'nos', qty: 1 },
    { sno: 15, section: '3KW KIT', particular: 'EARTHING CHEMICAL(10KG)', uom: 'nos', qty: 2 },
    { sno: 16, section: '3KW KIT', particular: 'PVC PIPE 25MM', uom: 'nos', qty: 30 },
    { sno: 17, section: '3KW KIT', particular: 'FLEXIBLE PIPE 25MM', uom: 'mtr', qty: 2 },
    { sno: 18, section: '3KW KIT', particular: 'ELBOW 25MM', uom: 'nos', qty: 35 },
    { sno: 19, section: '3KW KIT', particular: 'TEE 25MM', uom: 'nos', qty: 10 },
    { sno: 20, section: '3KW KIT', particular: 'ELECTRICAL TAPE (RYBB)', uom: 'nos', qty: 4 },
    { sno: 21, section: '3KW KIT', particular: 'KAJU KHILA 25MM (100 pc)', uom: 'pkt', qty: 1 },
    { sno: 22, section: '3KW KIT', particular: 'KAJU KHILA 12MM (100 pc)', uom: 'pkt', qty: 1 },
    { sno: 23, section: '3KW KIT', particular: 'CABLE TIE 300MM', uom: 'pkt', qty: 1 },
    { sno: 24, section: '3KW KIT', particular: 'METER BOARD', uom: 'nos', qty: 1 },
    { sno: 25, section: '3KW KIT', particular: 'MCB', uom: 'nos', qty: 1 },
    // STRUCTURE
    { sno: 1, section: 'STRUCTURE', particular: 'P 3540', uom: 'nos', qty: 4, rem: '50/4' },
    { sno: 2, section: 'STRUCTURE', particular: 'R 3850', uom: 'nos', qty: 2, rem: '75/40' },
    { sno: 3, section: 'STRUCTURE', particular: 'L 1800', uom: 'nos', qty: 2, rem: '75/40' },
    { sno: 4, section: 'STRUCTURE', particular: 'L 2400', uom: 'nos', qty: 2, rem: '75/40' },
    { sno: 5, section: 'STRUCTURE', particular: 'B 2600', uom: 'nos', qty: 2, rem: '50/4' },
    { sno: 6, section: 'STRUCTURE', particular: 'M8', uom: 'nos', qty: 26 },
    { sno: 7, section: 'STRUCTURE', particular: 'M12', uom: 'nos', qty: 15 },
    { sno: 8, section: 'STRUCTURE', particular: 'FASTNER', uom: 'nos', qty: 16 },
  ],
  '5': [
    // Scale quantities for 5KW (multiply by 5/3)
    { sno: 1, section: '5KW KIT', particular: 'PANEL DCR 580W', uom: 'nos', qty: 10 },
    { sno: 2, section: '5KW KIT', particular: 'INVERTER 5KW', uom: 'nos', qty: 1 },
    // Add more scaled items...
  ],
  '7': [
    // Scale quantities for 7KW
    { sno: 1, section: '7KW KIT', particular: 'PANEL DCR 580W', uom: 'nos', qty: 14 },
    { sno: 2, section: '7KW KIT', particular: 'INVERTER 7KW', uom: 'nos', qty: 1 },
    // Add more scaled items...
  ],
  '10': [
    // Scale quantities for 10KW
    { sno: 1, section: '10KW KIT', particular: 'PANEL DCR 580W', uom: 'nos', qty: 18 },
    { sno: 2, section: '10KW KIT', particular: 'INVERTER 10KW', uom: 'nos', qty: 1 },
    // Add more scaled items...
  ],
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enquiryId, systemCapacity, customItems } = await request.json();

    if (!enquiryId || !systemCapacity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';
    const sheets = await getGoogleSheetsClient();

    // Get material template
    const template = MATERIAL_TEMPLATES[systemCapacity as keyof typeof MATERIAL_TEMPLATES] || MATERIAL_TEMPLATES['3'];
    const materials = customItems || template;

    // Fetch enquiry details
    const enqResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:H1000',
    });
    const enqRows = enqResponse.data.values || [];
    const enquiry = enqRows.find((row: any) => row[0] === enquiryId);

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    const customerName = enquiry[1] || 'Unknown';
    const now = new Date().toISOString();
    const bomDate = now.split('T')[0];

    // Prepare BOM rows
    const bomRows = materials.map((item: any, index: number) => [
      `BOM-${enquiryId}-${String(index + 1).padStart(3, '0')}`, // id
      enquiryId, // enquiryId
      'generated', // bomStatus
      bomDate, // bomGeneratedDate
      session.user.email, // bomGeneratedBy
      'pending', // dispatchStatus
      '', // dispatchDate
      '', // dispatchedBy
      '', // trackingNumber
      '', // vehicleNumber
      '', // driverName
      '', // driverContact
      '', // expectedDeliveryDate
      '', // actualDeliveryDate
      '', // deliveredTo
      '', // deliveryNotes
      'not_started', // installationStatus
      '', // installationStartDate
      '', // installationCompletedDate
      '', // installedBy
      'not_started', // materialUtilizationStatus
      'not_applicable', // materialReturnStatus
      '', // returnCollectedDate
      '', // returnCollectedBy
      item.sno, // sno
      item.section, // section
      item.particular, // particular
      item.uom, // uom
      item.qty, // qty
      item.rem || '', // rem
      0, // qtyDispatched
      0, // qtyUtilized
      0, // qtyReturned
      '', // utilizationNotes
      now, // createdAt
      '', // updatedAt
    ]);

    // Append to BOM sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'BOM!A:AJ',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: bomRows,
      },
    });

    // Invalidate cache
    await redis.del(`org:${orgId}:boms`);

    // Send Telegram notification
    try {
      const message = `📋 *BOM GENERATED*

*Enquiry:* ${enquiryId}
*Customer:* ${customerName}
*System:* ${systemCapacity} kW
*Total Items:* ${materials.length}

*Status:* Ready for dispatch
*Generated By:* ${session.user.email}

_Action Required: Review BOM and mark for dispatch._`;

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'BOM created successfully',
      enquiryId,
      itemsCreated: bomRows.length,
    });
  } catch (error: any) {
    console.error('Error creating BOM:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create BOM' },
      { status: 500 }
    );
  }
}
