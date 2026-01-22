import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchEnquiries, createEnquiry } from '@/lib/googleSheets';

// GET all enquiries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiries = await fetchEnquiries();
    
    return NextResponse.json(enquiries);
  } catch (error: any) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}

// POST create new enquiry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const newEnquiry = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createEnquiry(newEnquiry);
    
    return NextResponse.json(
      { success: true, message: 'Enquiry created successfully', enquiry: newEnquiry },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating enquiry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create enquiry' },
      { status: 500 }
    );
  }
}
