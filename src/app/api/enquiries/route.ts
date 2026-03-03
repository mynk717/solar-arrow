import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchEnquiries, createEnquiry } from '@/lib/googleSheets';
import { sendOrgGroupNotification } from '@/lib/telegram';
import { invalidateEnquiriesCache } from '@/lib/redis';


// GET all enquiries
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] /api/enquiries called');
    const session = await getServerSession(authOptions);
    
    console.log('👤 [API] Session:', {
      email: session?.user?.email,
      sheetId: session?.user?.sheetId,
      organizationId: session?.user?.organizationId
    });

    if (!session?.user?.email) {
      console.error('❌ [API] No session/email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // if (!session?.user?.sheetId) {
    //   console.error('❌ [API] No sheetId configured');
    //   return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    // }

    console.log('📊 [API] Fetching from Google Sheets...');
    const enquiries = await fetchEnquiries();
    console.log('✅ [API] Fetched enquiries:', enquiries.length);
    
    if (enquiries.length > 0) {
      console.log('📋 [API] Sample enquiry:', enquiries[0]);
    }

    return NextResponse.json(enquiries, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error: any) {
    console.error('💥 [API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    const existing = await fetchEnquiries();
    const newEnquiry = {
      ...body,
      id: `ENQ-${(existing.length + 1).toString().padStart(6, '0')}`,  // inline, no separate variable
  status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy: session.user.email,
    };

    await createEnquiry(newEnquiry);
    await invalidateEnquiriesCache(session.user.organizationId ?? 'default-org');
    // Telegram
try {
  const orgId = session.user.organizationId ?? 'default-org';
  await sendOrgGroupNotification(orgId, {
    text: `🆕 *New Enquiry Created*\nID: ${newEnquiry.id}\nCustomer: ${newEnquiry.customerName}\nPhone: ${newEnquiry.phone}\nArea: ${newEnquiry.area}\nCapacity: ${newEnquiry.capacity} kW\nCreated by: ${session.user.email}`,
  });
} catch (e) {
  console.error('Telegram notification failed', e);
}
    
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
