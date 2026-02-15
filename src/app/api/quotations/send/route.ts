// src/app/api/quotations/send/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateQuotation, fetchQuotation, updateLead } from '@/lib/googleSheets';
import { invalidateLeadsCache } from '@/lib/redis';

// Send Telegram notification
async function sendTelegramNotification(quotation: any, action: string) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramBotToken || !telegramChatId) {
    console.warn('⚠️ Telegram credentials not configured');
    return;
  }

  let message = '';

  if (action === 'sent') {
    message = `
🎉 *New Quotation Sent*

*Quotation ID:* ${quotation.quotationId}
*Customer:* ${quotation.customerName}
*Phone:* ${quotation.customerPhone}
*Capacity:* ${quotation.systemCapacity} kW
*Final Amount:* ₹${quotation.finalAmount.toLocaleString('en-IN')}

🔗 *Public Link:* ${quotation.publicUrl}

*Valid Until:* ${new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}

*Organization:* ${quotation.organizationName}
    `.trim();
  }

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

    console.log('✅ Telegram notification sent');
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error);
  }
}

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
    const orgId = (session.user as any).organizationId || 'hope-energy';

    if (!quotationId) {
      return NextResponse.json({ error: 'Quotation ID required' }, { status: 400 });
    }

    console.log(`📤 Sending quotation ${quotationId} for ${orgId}`);

    // ✅ FIX: Fetch quotation to verify it exists
    const quotation = await fetchQuotation(orgId, quotationId);

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // ✅ FIX: Update quotation status to "Sent"
    await updateQuotation(orgId, quotationId, {
      status: 'Sent',
      sentBy: session.user.email,
      sentDate: new Date().toISOString(),
    });

    // ✅ If linked to a lead, update lead status to "quotation-sent"
    if (quotation.leadId) {
      try {
        await updateLead(
          quotation.leadId,
          {
            status: 'quotation-sent',
            lastActivityBy: session.user.email,
            lastActivityDate: new Date(),
          },
          session.user.email
        );

        // Invalidate leads cache
        await invalidateLeadsCache(orgId);
        console.log(`✅ Updated lead ${quotation.leadId} status to "quotation-sent"`);
      } catch (error) {
        console.error('❌ Failed to update lead status:', error);
        // Don't fail the quotation send if lead update fails
      }
    }

    // Send Telegram notification
    await sendTelegramNotification(quotation, 'sent');

    console.log(`✅ Quotation ${quotationId} sent successfully`);

    return NextResponse.json({
      success: true,
      message: 'Quotation sent successfully',
      publicUrl: quotation.publicUrl,
      quotationId: quotation.quotationId,
    });
  } catch (error: any) {
    console.error('❌ Error sending quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send quotation' },
      { status: 500 }
    );
  }
}
