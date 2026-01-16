import { NextRequest, NextResponse } from 'next/server';
import { updateEnquiry, deleteEnquiry, fetchEnquiries } from '@/lib/googleSheets';

// GET single enquiry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ← AWAIT params
    const enquiries = await fetchEnquiries();
    const enquiry = enquiries.find(e => e.id === id);
    
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ← AWAIT params
    const body = await request.json();
    const updatedEnquiry = {
      ...body,
      id: id,
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ← AWAIT params
    await deleteEnquiry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete enquiry' },
      { status: 500 }
    );
  }
}