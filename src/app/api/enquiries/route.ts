// src/app/api/enquiries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { google } from 'googleapis';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiryId = params.id;
    const updates = await request.json();

    // TODO: Update in Google Sheets
    // You'll need to implement the logic to find the row by ID and update it

    console.log(`Updating enquiry ${enquiryId}:`, updates);

    return NextResponse.json({ 
      success: true, 
      message: 'Enquiry updated successfully',
      enquiryId,
      updates
    });

  } catch (error: any) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update enquiry' },
      { status: 500 }
    );
  }
}
