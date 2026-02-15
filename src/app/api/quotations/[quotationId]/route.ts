// src/app/api/quotations/[quotationId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchQuotation } from '@/lib/googleSheets';

export async function GET(
  request: Request,
  { params }: { params: { quotationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = (session.user as any).organizationId || 'default-org';
    const { quotationId } = params;

    console.log(`🔍 Fetching quotation ${quotationId} for ${orgId}`);

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