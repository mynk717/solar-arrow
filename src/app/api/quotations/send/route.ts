// src/app/api/quotations/send/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateQuotation, fetchQuotation } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'user';
    if (!['admin', 'owner', 'sales'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { quotationId } = await request.json();
    const orgId = (session.user as any).organizationId || 'default-org';

    if (!quotationId) {
      return NextResponse.json({ error: 'Quotation ID required' }, { status: 400 });
    }

    console.log(`📤 Marking quotation ${quotationId} as Ready for ${orgId}`);

    // Fetch quotation to verify it exists
    const quotation = await fetchQuotation(orgId, quotationId);

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // ✅ Change status to "Ready" instead of "Sent"
    await updateQuotation(orgId, quotationId, {
      status: 'Ready',
      sentBy: session.user.email,
      sentDate: new Date().toISOString(),
    });

    console.log(`✅ Quotation ${quotationId} marked as Ready`);

    return NextResponse.json({
      success: true,
      message: 'Quotation is ready to share',
      publicUrl: quotation.publicUrl,
      quotationId: quotation.quotationId,
    });
  } catch (error: any) {
    console.error('❌ Error marking quotation as ready:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update quotation' },
      { status: 500 }
    );
  }
}
