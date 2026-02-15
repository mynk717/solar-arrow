// src/app/api/quotations/[quotationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchQuotation } from '@/lib/googleSheets';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ quotationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIX 1: Properly await params
    const params = await context.params;
    const quotationId = params.quotationId;

    // ✅ FIX 2: Get orgId from session (consistent with your auth setup)
    const orgId = (session.user as any).organizationId || 'hope-energy';

    console.log(`📄 Fetching quotation ${quotationId} for org: ${orgId}`);

    // ✅ FIX 3: Fetch quotation
    const quotation = await fetchQuotation(orgId, quotationId);

    // ✅ FIX 4: Proper null check
    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found or access denied' },
        { status: 404 }
      );
    }

    // ✅ FIX 5: Return quotation
    return NextResponse.json({
      success: true,
      quotation,
    });
  } catch (error: any) {
    console.error('❌ Error fetching quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quotation' },
      { status: 500 }
    );
  }
}
