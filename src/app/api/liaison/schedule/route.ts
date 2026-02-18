import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateEnquiryInSheet, fetchEnquiryById } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIX: Get sheetId and orgId from session
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

    // Get enquiry details
    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    // Update enquiry with inspection schedule
    await updateEnquiryInSheet(enquiryId, {
      inspectionScheduledDate,
      inspectionOfficer: inspectionOfficer || '',
      liaisonStage: 'inspection-scheduled',
      updatedAt: new Date().toISOString(),
    });

    // Send Telegram notification
    try {
      const message = `🔍 *INSPECTION SCHEDULED*\n\n*Enquiry:* ${enquiryId}\n*Customer:* ${enquiry.customerName}\n*Phone:* ${enquiry.phone}\n*Location:* ${enquiry.area || 'N/A'}\n*Capacity:* ${enquiry.capacity} kW\n\n*Inspection Details:*\n📅 *Date:* ${new Date(inspectionScheduledDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
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
