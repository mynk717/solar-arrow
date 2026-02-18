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

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'hope-energy';

    if (!sheetId) {
      return NextResponse.json(
        { error: 'Sheet not configured' },
        { status: 400 }
      );
    }

    const { 
      enquiryId, 
      inspectionDate, 
      inspectionOfficer,
      inspectionApproved,
      inspectionReportPath,
      inspectionNotes 
    } = await request.json();

    // ✅ FIX: More flexible validation - only enquiryId is required
    if (!enquiryId) {
      return NextResponse.json(
        { error: 'Missing required fields: enquiryId is required' },
        { status: 400 }
      );
    }

    // Get enquiry details
    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    // Update enquiry with inspection completion
    const updates: any = {
      inspectionDate: inspectionDate || new Date().toISOString().split('T')[0],
      inspectionOfficer: inspectionOfficer || session.user.email,
      inspectionApproved: inspectionApproved !== undefined ? inspectionApproved : true,
      liaisonStage: inspectionApproved === false ? 'inspection-rejected' : 'inspection-completed',
      updatedAt: new Date().toISOString(),
    };

    if (inspectionReportPath) {
      updates.inspectionReportPath = inspectionReportPath;
    }

    if (inspectionNotes) {
      updates.inspectionNotes = inspectionNotes;
    }

    if (inspectionApproved === false && inspectionNotes) {
      updates.inspectionRejectedReason = inspectionNotes;
    }

    await updateEnquiryInSheet(enquiryId, updates);

    // Send Telegram notification
    try {
      const statusText = inspectionApproved === false ? '❌ REJECTED' : '✅ APPROVED';
      const message = `🔍 *INSPECTION COMPLETED* ${statusText}\n\n*Enquiry:* ${enquiryId}\n*Customer:* ${enquiry.customerName}\n*Phone:* ${enquiry.phone}\n*Location:* ${enquiry.area || 'N/A'}\n*Capacity:* ${enquiry.capacity} kW\n\n*Inspection Details:*\n📅 *Date:* ${new Date(inspectionDate || Date.now()).toLocaleDateString('en-IN')}\n👮 *Officer:* ${inspectionOfficer || session.user.email}\n${inspectionNotes ? `📝 *Notes:* ${inspectionNotes}` : ''}\n\n${inspectionApproved === false ? '*Status:* Requires rectification' : '*Status:* Approved - Ready for net meter installation'}`;

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
      message: 'Inspection completed successfully',
    });
  } catch (error: any) {
    console.error('Error completing inspection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete inspection' },
      { status: 500 }
    );
  }
}
