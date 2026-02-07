import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchEnquiries } from '@/lib/googleSheets';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiries = await fetchEnquiries();
    
    // Filter enquiries that have quotations (survey completed with costs)
    const quotations = enquiries
      .filter(e => e.surveyDate && e.systemCost && e.finalCost)
      .map(e => ({
        id: `QUOT-${e.id.split('-')[1]}`,
        enquiryId: e.id,
        customerName: e.customerName,
        customerEmail: e.email,
        customerPhone: e.phone,
        capacity: e.capacity,
        panelType: e.panelType || 'Monocrystalline',
        systemCost: e.systemCost || 0,
        subsidyAmount: e.subsidyAmount || 0,
        finalCost: e.finalCost || 0,
        validTill: e.quotationValidTill || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        status: e.quotationStatus || 'draft',
        createdAt: e.surveyDate || e.createdAt,
        address: e.address,
        area: e.area,
      }));

    return NextResponse.json(quotations);
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
