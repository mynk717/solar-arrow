// src/app/api/quotations/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchAllQuotations } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIX 1: Get query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const leadId = searchParams.get('leadId');

    // ✅ FIX 2: Get organizationId from session with fallback
    const orgId = (session.user as any).organizationId || 'hope-energy';

    console.log(`📋 Fetching quotations for orgId: ${orgId}, status: ${status}, leadId: ${leadId}`);

    // ✅ FIX 3: Fetch from QUOTATIONS sheet (not ENQUIRIES)
    let quotations = await fetchAllQuotations(orgId);

    // ✅ FIX 4: Apply filters if provided
    if (status) {
      quotations = quotations.filter((q: any) => 
        q.status?.toLowerCase() === status.toLowerCase()
      );
    }

    if (leadId) {
      quotations = quotations.filter((q: any) => q.leadId === leadId);
    }

    console.log(`✅ Found ${quotations.length} quotations`);

    return NextResponse.json({
      success: true,
      quotations,
      count: quotations.length,
    });
  } catch (error: any) {
    console.error('❌ Error fetching quotations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}
