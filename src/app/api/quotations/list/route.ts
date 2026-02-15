// src/app/api/quotations/list/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchQuotations } from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = (session.user as any).organizationId || 'default-org';
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const leadId = searchParams.get('leadId');

    console.log(`📋 Fetching quotations for org: ${orgId}`);

    // Fetch all quotations for this organization
    let quotations = await fetchQuotations(orgId);

    // Apply filters
    if (status) {
      quotations = quotations.filter(q => q.status === status);
    }

    if (leadId) {
      quotations = quotations.filter(q => q.leadId === leadId);
    }

    // Sort by created date (newest first)
    quotations.sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime();
      const dateB = new Date(b.createdDate).getTime();
      return dateB - dateA;
    });

    console.log(`✅ Found ${quotations.length} quotations`);

    return NextResponse.json({
      success: true,
      count: quotations.length,
      quotations,
    });
  } catch (error: any) {
    console.error('❌ Error fetching quotations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}