import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateEnquiry, deleteEnquiry, fetchEnquiries } from '@/lib/googleSheets';

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
      updatedAt: new Date(),
    };

    await updateEnquiry(updatedEnquiry);

    console.log(`Updated enquiry ${enquiryId}:`, updates);

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
