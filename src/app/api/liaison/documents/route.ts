// src/app/api/liaison/documents/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateLiaisonInSheet, getLiaisonRow, createLiaisonRow, fetchEnquiryById } from '@/lib/googleSheets';
import { invalidateEnquiriesCache, redis } from '@/lib/redis';

const DOC_FIELDS = [
  'docCoveringLetter', 'docEStamp300', 'docPpa', 'docEStamp50',
  'docVendorAgreement', 'docSolarAppAck', 'docFeasibility', 'docEToken',
  'docDcr', 'docWcr', 'docPlantPhotos', 'docKycDocuments',
  'docWitness1Aadhaar', 'docWitness2Aadhaar',
];

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enquiryId, ...docFields } = await request.json();

    if (!enquiryId) {
      return NextResponse.json({ error: 'enquiryId required' }, { status: 400 });
    }

    // Only allow whitelisted doc keys — camelCase keys map directly to LIAISON columns
    const updatePayload: Record<string, string> = {};
    Object.entries(docFields).forEach(([key, value]) => {
      if (DOC_FIELDS.includes(key)) {
        updatePayload[key] = value as string;
      }
    });

    // Auto-create LIAISON row if missing (handles enquiries created before this refactor)
    let existing = await getLiaisonRow(enquiryId);
    if (!existing) {
      const enquiry = await fetchEnquiryById(enquiryId);
      await createLiaisonRow({
        enquiryId,
        customerName: enquiry?.customerName || '',
        capacity: enquiry?.capacity ? String(enquiry.capacity) : '',
        area: enquiry?.area || '',
        meterNumber: enquiry?.meterNumber || '',
        liaisonStage: 'pending',
      });
      existing = await getLiaisonRow(enquiryId); // re-fetch after create ✅
    }
    
    // Now existing has the freshly created row — allSubmitted check is accurate
    const allSubmitted = DOC_FIELDS.every(
      (k) => (updatePayload[k] || existing?.[k] || '') === 'submitted'
    );
    

await updateLiaisonInSheet(enquiryId, {
  ...updatePayload,
  liaisonStage: allSubmitted ? 'docs-ready' : 'docs-in-progress',
});



    const orgId = (session.user as any).organizationId || 'default-org';

    // Invalidate LIAISON cache (primary) + ENQUIRIES cache (secondary, for any doc-status views)
    await redis.del(`org:${orgId}:liaisons:all`);
    await invalidateEnquiriesCache(orgId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error saving documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save documents' },
      { status: 500 }
    );
  }
}
