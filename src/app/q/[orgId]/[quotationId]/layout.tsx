// This is a server component - no 'use client'
import { redis } from '@/lib/redis';
import { fetchQuotation } from '@/lib/googleSheets';

export async function generateMetadata({ params }: { params: { orgId: string; quotationId: string } }) {
  try {
    const quotation: any = await fetchQuotation(params.orgId, params.quotationId);
    const orgInfo: any = await redis.get(`org:${params.orgId}:info`);
    if (!quotation) return {};
    
    const title = `Solar Quotation - ${quotation.customerName} | ${quotation.systemCapacity}kWp`;
    const description = `₹${quotation.finalAmount?.toLocaleString('en-IN')} · ${quotation.systemCapacity}kWp ${quotation.systemType} · Valid until ${new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: orgInfo?.orgLogoUrl ? [{ url: orgInfo.orgLogoUrl, width: 400, height: 200 }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch {
    return {};
  }
}

export default function QuotationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
