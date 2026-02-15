// src/app/api/quotations/approve/route.ts
import { NextResponse } from 'next/server';
import { fetchQuotation, updateQuotation, updateLead } from '@/lib/googleSheets';
import { validateQuotationToken } from '@/lib/quotations';
import { invalidateLeadsCache } from '@/lib/redis';

/**
 * Send Telegram notification for approval
 */
async function sendTelegramNotification(quotation: any) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramBotToken || !telegramChatId) {
    console.warn('⚠️ Telegram credentials not configured');
    return;
  }

  const message = `✅ *QUOTATION APPROVED!*

🎉 Customer has approved the quotation!

📋 *Quotation ID:* ${quotation.quotationId}
👤 *Customer:* ${quotation.customerName}
📞 *Phone:* ${quotation.customerPhone}
📧 *Email:* ${quotation.customerEmail}
⚡ *Capacity:* ${quotation.systemCapacity} kW
💰 *Final Amount:* ₹${quotation.finalAmount.toLocaleString('en-IN')}

${quotation.leadId ? `🔗 *Lead ID:* ${quotation.leadId}` : ''}
🏢 *Organization:* ${quotation.organizationName}

⏰ *Approved:* ${new Date().toLocaleString('en-IN')}

🚀 *Action Required:* Contact customer to proceed with installation!`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      throw new Error('Telegram API error');
    }

    console.log('✅ Telegram notification sent for approval');
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error);
  }
}

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

    // Send Telegram notification
    await sendTelegramNotification(quotation);

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