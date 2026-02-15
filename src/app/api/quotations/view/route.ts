// src/app/api/quotations/view/route.ts
import { NextResponse } from 'next/server';
import { fetchQuotation, updateQuotation } from '@/lib/googleSheets';
import { validateQuotationToken, isQuotationExpired } from '@/lib/quotations';

export async function POST(request: Request) {
  try {
    const { orgId, quotationId, token } = await request.json();

    if (!orgId || !quotationId || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log(`👁️ Public view request: ${orgId}/${quotationId}`);

    // Fetch quotation
    const quotation = await fetchQuotation(orgId, quotationId);

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Validate token
    if (!validateQuotationToken(quotation, token)) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 403 }
      );
    }

    // Check if expired
    if (isQuotationExpired(quotation.validUntilDate)) {
      return NextResponse.json(
        { error: 'Quotation has expired' },
        { status: 410 }
      );
    }

    // Track view
    const now = new Date().toISOString();
    const updates: any = {
      viewCount: quotation.viewCount + 1,
      lastViewedDate: now,
    };

    // Set first viewed date if this is the first view
    if (quotation.viewCount === 0) {
      updates.firstViewedDate = now;
      updates.status = 'Viewed';
    }

    await updateQuotation(orgId, quotationId, updates);

    console.log(`✅ Quotation viewed: ${quotationId} (Total views: ${updates.viewCount})`);

    return NextResponse.json({
      success: true,
      quotation,
    });
  } catch (error: any) {
    console.error('❌ Error viewing quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load quotation' },
      { status: 500 }
    );
  }
}