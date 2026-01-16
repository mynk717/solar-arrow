import { NextResponse } from 'next/server';
import { fetchEnquiries, addEnquiry, getNextEnquiryId } from '@/lib/googleSheets';

// GET all enquiries
export async function GET() {
  try {
    const enquiries = await fetchEnquiries();
    return NextResponse.json(enquiries);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}

// POST new enquiry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nextId = await getNextEnquiryId();
    
    const newEnquiry = {
      ...body,
      id: nextId,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await addEnquiry(newEnquiry);
    
    return NextResponse.json(newEnquiry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create enquiry' },
      { status: 500 }
    );
  }
}