// src/app/api/quotations/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchQuotation, updateQuotation } from '@/lib/googleSheets';
import { sendOrgGroupNotification } from '@/lib/telegram';
import {redis} from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quotationId } = await request.json();
    const orgId = (session.user as any).organizationId;

    if (!orgId || !quotationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch quotation
    const quotation = await fetchQuotation(orgId, quotationId);

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    if (quotation.status !== 'Draft') {
      return NextResponse.json(
        { error: 'Quotation already sent' },
        { status: 400 }
      );
    }

    // Update quotation status
    const now = new Date().toISOString();
    await updateQuotation(orgId, quotationId, {
      status: 'Sent',
      sentBy: session.user.email,
      sentDate: now,
    });

    // ✅ Send Telegram notification
    try {
      const message = `
📤 *Quotation Sent to Customer*

*Quotation ID:* ${quotation.quotationId}
*Customer:* ${quotation.customerName}
*Phone:* ${quotation.customerPhone}

*Amount:* ₹${quotation.finalAmount.toLocaleString('en-IN')}
*Valid Until:* ${new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}

🔗 *Public Link:*
${quotation.publicUrl}

*Sent By:* ${session.user.email}

_Next Action: Follow up with customer_
      `.trim();

      // Send to group
      await sendOrgGroupNotification(orgId, {
        text: message,
        parseMode: 'Markdown',
      });
    } catch (error) {
      console.error('Telegram notification failed:', error);
      // Don't fail the entire operation
    }

    return NextResponse.json({
      success: true,
      message: 'Quotation sent successfully',
      publicUrl: quotation.publicUrl,
    });
  } catch (error: any) {
    console.error('❌ Error sending quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send quotation' },
      { status: 500 }
    );
  }
}
