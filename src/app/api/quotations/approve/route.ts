// src/app/api/quotations/approve/route.ts
import { NextResponse } from 'next/server';
import { fetchQuotation, updateQuotation, updateLead } from '@/lib/googleSheets';
import { validateQuotationToken } from '@/lib/quotations';
import { invalidateLeadsCache } from '@/lib/redis';
import { sendOrgGroupNotification } from '@/lib/telegram';

/**
 * Send Telegram notification for approval
 */


export async function POST(request: Request) {
  try {
    const { orgId, quotationId, token, customerName } = await request.json();

    if (!orgId || !quotationId || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log(`✅ Approval request: ${orgId}/${quotationId}`);

    // Fetch quotation
    const quotation = await fetchQuotation(orgId, quotationId);

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Validate token
    if (!validateQuotationToken(quotation, token)) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 403 });
    }

    // Update quotation to approved
    await updateQuotation(orgId, quotationId, {
      status: 'Approved',
      approvedBy: customerName || quotation.customerName,
      approvedDate: new Date().toISOString(),
    });

    // If linked to a lead, update lead status to "qualified"
    if (quotation.leadId) {
      try {
        await updateLead(
          quotation.leadId,
          {
            status: 'qualified',
            qualified: true,
            qualifiedDate: new Date(),
            estimatedBudget: quotation.finalAmount,
            notes: `Quotation ${quotationId} approved by customer on ${new Date().toLocaleDateString('en-IN')}`,
            lastActivityBy: 'customer',
            lastActivityDate: new Date(),
          },
          'system'
        );

        // Invalidate leads cache
        await invalidateLeadsCache(orgId);
        console.log(`✅ Lead ${quotation.leadId} marked as qualified`);
      } catch (error) {
        console.error(`⚠️ Failed to update lead:`, error);
      }
    }

    try {
      await sendOrgGroupNotification(orgId, {
        text: `✅ *QUOTATION APPROVED BY CUSTOMER*\n\n📋 *Quotation:* ${quotationId}\n👤 *Customer:* ${quotation.customerName}\n📞 ${quotation.customerPhone}\n⚡ ${quotation.systemCapacity} kW\n💰 ₹${quotation.finalAmount?.toLocaleString('en-IN')}\n\n🚀 *Action Required:* Contact customer to proceed with registration!`,
        parseMode: 'Markdown',
      });
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }

    console.log(`✅ Quotation ${quotationId} approved`);

    return NextResponse.json({
      success: true,
      message: 'Quotation approved successfully! Our team will contact you shortly.',
    });
  } catch (error: any) {
    console.error('❌ Error approving quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve quotation' },
      { status: 500 }
    );
  }
}