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

    // Await params (Next.js 15+ requirement)
    const { quotationId } = await context.params;
    const orgId = (session.user as any).organizationId || 'default-org';

    console.log(`📄 Fetching quotation ${quotationId} for ${orgId}`);

    const quotation = await fetchQuotation(orgId, quotationId);

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

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