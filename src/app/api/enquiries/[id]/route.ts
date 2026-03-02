import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateEnquiry, deleteEnquiry, fetchEnquiries } from '@/lib/googleSheets';
import { notifyEnquiryActivity } from '@/lib/notificationHelpers';
import { validateStatusTransition, getRequiredFieldsForStatus, validateRequiredFields } from '@/lib/statusValidation';
import { redis } from '@/lib/redis';


// GET single enquiry
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const enquiries = await fetchEnquiries();
    const enquiry = enquiries.find(e => e.id === id);
    
    if (!enquiry) {
      return NextResponse.json(
        { error: 'Enquiry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(enquiry);
  } catch (error: any) {
    console.error('Error fetching enquiry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enquiry' },
      { status: 500 }
    );
  }
}

// PATCH - partial update enquiry (for kanban drag & drop)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: enquiryId } = await context.params;
    const updates = await request.json();
    const orgId = session.user.organizationId || 'default-org';

    // Fetch current enquiry
    const enquiries = await fetchEnquiries();
    const currentEnquiry = enquiries.find(e => e.id === enquiryId);
    
    if (!currentEnquiry) {
      return NextResponse.json(
        { error: 'Enquiry not found' },
        { status: 404 }
      );
    }

    // Merge updates with current enquiry
    const updatedEnquiry = {
      ...currentEnquiry,
      ...updates,
      id: enquiryId,
      createdAt: currentEnquiry.createdAt ? new Date(currentEnquiry.createdAt) : new Date(),
      updatedAt: new Date(),
    };

    await updateEnquiry(updatedEnquiry);
    await redis.del(`org:${orgId}:cache:enquiries`);

    // 🚀 NEW: Send Telegram notification for the update
    try {
      
      // Determine activity type based on what was updated
      let activityType: 'status' | 'payment' | 'survey' | 'installation' | 'registration' | 'general' = 'general';
      
      if (updates.status) {
        activityType = 'status';
      } else if (updates.paymentDate || updates.paymentStatus || updates.paymentMethod) {
        activityType = 'payment';
      } else if (updates.surveyDate || updates.surveyApproved || updates.surveyedBy) {
        activityType = 'survey';
      } else if (updates.installationDate || updates.installedBy) {
        activityType = 'installation';
      } else if (updates.registrationId || updates.registrationDate) {
        activityType = 'registration';
      }
      
      // Format updates for display (exclude meta fields)
      const displayUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'updatedAt' && value !== undefined) {
          displayUpdates[key] = value;
        }
      }
      
      // Only send notification if there are actual updates to display
      if (Object.keys(displayUpdates).length > 0) {
        await notifyEnquiryActivity(
          orgId,
          enquiryId,
          currentEnquiry.customerName || 'Unknown Customer',
          activityType,
          displayUpdates,
          session.user.name || session.user.email || 'System',
          updates.notes
        );
      }
    } catch (notificationError) {
      console.error('⚠️ Notification error (non-blocking):', notificationError);
      // Don't fail the update if notification fails
    }

    console.log(`✅ Updated enquiry ${enquiryId}:`, updates);

    return NextResponse.json({ 
      success: true, 
      message: 'Enquiry updated successfully',
      enquiry: updatedEnquiry
    });

  } catch (error: any) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}

// PUT - full update enquiry
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const updatedEnquiry = {
      ...body,
      id: id,
      updatedAt: new Date(),
    };
    
    await updateEnquiry(updatedEnquiry);
    
    return NextResponse.json({
      success: true,
      message: 'Enquiry updated successfully',
      enquiry: updatedEnquiry
    });
  } catch (error: any) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json(
      { error: 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}

// DELETE enquiry
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await deleteEnquiry(id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting enquiry:', error);
    return NextResponse.json(
      { error: 'Failed to delete enquiry' },
      { status: 500 }
    );
  }
}
