import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateLiaisonInSheet, getLiaisonRow } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'hope-energy';

    if (!sheetId) {
      return NextResponse.json(
        { error: 'Sheet not configured. Please configure in settings.' },
        { status: 400 }
      );
    }

    const { enquiryId, inspectionScheduledDate, inspectionOfficer } = await request.json();

    if (!enquiryId || !inspectionScheduledDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: enquiryId, inspectionScheduledDate' },
        { status: 400 }
      );
    }

    // Get LIAISON row (replaces fetchEnquiryById)
    const liaison = await getLiaisonRow(enquiryId);
    if (!liaison) {
      return NextResponse.json({ error: 'LIAISON row not found for this enquiry' }, { status: 404 });
    }

    // Write to LIAISON sheet
    await updateLiaisonInSheet(enquiryId, {
      inspectionScheduledDate,
      inspectionOfficer: inspectionOfficer || '',
      liaisonStage: 'inspection-scheduled',
    });

    // Send Telegram notification (same rich message as before)
    try {
      const message = `🔍 *INSPECTION SCHEDULED*\n\n*Enquiry:* ${enquiryId}\n*Customer:* ${liaison.customerName}\n*Location:* ${liaison.area || 'N/A'}\n*Capacity:* ${liaison.capacity || 'N/A'} kW\n\n*Inspection Details:*\n📅 *Date:* ${new Date(inspectionScheduledDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}\n👮 *Officer:* ${inspectionOfficer || 'TBD'}\n\n*Action Required:* Complete on-site inspection and submit report.`;

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
    }

    // Invalidate cache
    await redis.del(`org:${orgId}:liaisons:all`);

    return NextResponse.json({
      success: true,
      message: 'Inspection scheduled successfully',
    });
  } catch (error: any) {
    console.error('Error scheduling inspection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule inspection' },
      { status: 500 }
    );
  }
}
