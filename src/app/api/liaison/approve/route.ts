import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const { enquiryId, approved, rejectionReason, approvalNotes } = await request.json();

    if (!enquiryId || approved === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: enquiryId and approved status' },
        { status: 400 }
      );
    }

    // Validate rejection reason if rejected
    if (!approved && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting inspection' },
        { status: 400 }
      );
    }

    // Get enquiry details
    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    // Update enquiry with approval status
    const updates: any = {
      inspectionApproved: approved ? 'TRUE' : 'FALSE',
      inspectionApprovalDate: new Date().toISOString().split('T')[0],
      inspectionApprovedBy: session.user.email,
      liaisonStage: approved ? 'inspection-approved' : 'inspection-rejected',
      updatedAt: new Date().toISOString(),
    };

    if (!approved) {
      updates.inspectionRejectedReason = rejectionReason;
      updates.status = 'installation-rework-required'; // Send back to installation
    } else {
      updates.status = 'meter-installation-pending';
    }

    if (approvalNotes) {
      updates.inspectionApprovalNotes = approvalNotes;
    }

    await updateEnquiryInSheet(enquiryId, updates);

    // Send Telegram notification
    try {
      const statusText = approved ? '✅ APPROVED' : '❌ REJECTED';
      const message = `
🔍 **INSPECTION ${statusText}**

📋 **Enquiry:** ${enquiryId}
👤 **Customer:** ${enquiry.customerName}
📍 **Location:** ${enquiry.area || 'N/A'}
⚡ **Capacity:** ${enquiry.capacity} kW

**Approval Details:**
👨‍💼 Approved By: ${session.user.email}
📅 Date: ${new Date().toLocaleDateString('en-IN')}
${approvalNotes ? `📝 Notes: ${approvalNotes}` : ''}

${approved 
  ? '✅ **Status:** Ready for net meter installation\n🔄 **Next Step:** Schedule meter installation' 
  : `⚠️ **Rejection Reason:** ${rejectionReason}\n🔄 **Action Required:** Installation team to rectify and re-schedule inspection`
}
      `.trim();

      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed:', notifError);
      // Don't fail the approval if notification fails
    }

    // Invalidate cache
    await redis.del(`org:${orgId}:liaisons:all`);
    await redis.del(`org:${orgId}:enquiries`);

    return NextResponse.json({
      success: true,
      message: approved ? 'Inspection approved successfully' : 'Inspection rejected',
      approved,
    });
  } catch (error: any) {
    console.error('Error approving inspection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process approval' },
      { status: 500 }
    );
  }
}
