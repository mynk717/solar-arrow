// src/app/api/liaison/documents/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateEnquiryInSheet } from '@/lib/googleSheets';
import { invalidateEnquiriesCache } from '@/lib/redis';

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

    // Map camelCase keys to sheet column names
    const updatePayload: Record<string, string> = {};
    Object.entries(docFields).forEach(([key, value]) => {
      // Convert docCoveringLetter → doc_covering_letter for sheet column
      updatePayload[key] = value as string;
    });

    await updateEnquiryInSheet(enquiryId, updatePayload);

    const orgId = (session.user as any).organizationId || 'default-org';
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
