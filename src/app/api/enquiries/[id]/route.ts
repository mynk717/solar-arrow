import { NextResponse } from 'next/server';
import { updateEnquiry, deleteEnquiry, fetchEnquiries } from '@/lib/googleSheets';

// GET single enquiry
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const enquiries = await fetchEnquiries();
    const enquiry = enquiries.find(e => e.id === params.id);
    
    if (!enquiry) {
      return NextResponse.json(
        { error: 'Enquiry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(enquiry);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch enquiry' },
      { status: 500 }
    );
  }
}

// PUT update enquiry
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedEnquiry = {
      ...body,
      id: params.id,
      updatedAt: new Date(),
    };
    
    await updateEnquiry(updatedEnquiry);
    
    return NextResponse.json(updatedEnquiry);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}

// DELETE enquiry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteEnquiry(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete enquiry' },
      { status: 500 }
    );
  }
}