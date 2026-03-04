// src/app/api/quotations/view/route.ts
import { NextResponse } from 'next/server';
import { fetchQuotation, updateQuotation } from '@/lib/googleSheets';
import { validateQuotationToken, isQuotationExpired } from '@/lib/quotations';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const { orgId, quotationId, token } = await request.json();

    if (!orgId || !quotationId || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters (orgId, quotationId, token)' },
        { status: 400 }
      );
    }

    console.log(`👁️ Public view request: ${orgId}/${quotationId}`);

    // ✅ Fetch quotation FIRST, null check immediately
    const quotation = await fetchQuotation(orgId, quotationId);

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // ✅ Validate token
    if (!validateQuotationToken(quotation, token)) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 403 });
    }

    // ✅ Check expiry
    if (isQuotationExpired(quotation.validUntilDate)) {
      return NextResponse.json({ error: 'Quotation has expired' }, { status: 410 });
    }

    // ✅ Enrich with org logo from Redis AFTER all validations pass
    const orgInfo: any = await redis.get(`org:${orgId}:info`);
    const enrichedQuotation = {
      ...quotation,
      orgLogoUrl: orgInfo?.orgLogoUrl || null,
    };

    // ✅ Track view (fire and forget — don't await to keep response fast)
    const now = new Date().toISOString();
    const isFirstView = (quotation.viewCount || 0) === 0;
    const updates: Record<string, any> = {
      viewCount: (quotation.viewCount || 0) + 1,
      lastViewedDate: now,
    };
    if (isFirstView) {
      updates.firstViewedDate = now;
      updates.status = 'Viewed';
    }
    // Non-blocking — client doesn't need to wait for sheet write
    updateQuotation(orgId, quotationId, updates).catch((err) =>
      console.error('⚠️ Failed to update view count:', err)
    );

    console.log(`✅ Quotation viewed: ${quotationId} (Total views: ${updates.viewCount})`);

    // ✅ Return 'quotation' key — matches what public page reads (data.quotation)
    return NextResponse.json({
      success: true,
      quotation: enrichedQuotation,
    });

  } catch (error: any) {
    console.error('❌ Error viewing quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load quotation' },
      { status: 500 }
    );
  }
}
