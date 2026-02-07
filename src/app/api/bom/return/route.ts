// src/app/api/bom/return/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateEnquiryInSheet } from '@/lib/googleSheets';
import { telegramBot } from '@/lib/telegram';


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bomId, returnedItems, reason, returnedBy } = body;

    if (!bomId || !returnedItems || !Array.isArray(returnedItems)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the enquiry with return information
    const updateData = {
      materialReturnDate: new Date().toISOString(),
      materialReturnReason: reason || 'Material returned',
      materialReturnedBy: returnedBy || session.user.email,
      returnedItems: JSON.stringify(returnedItems),
    };

    await updateEnquiryInSheet(bomId, updateData);

    // Send notification
    const itemsList = returnedItems
      .map((item: any) => `  • ${item.name} (Qty: ${item.quantity})`)
      .join('\n');

    const message = `
⚠️ *Materials Returned*

📋 *BOM ID:* ${bomId}
👤 *Returned By:* ${returnedBy || session.user.email}
📅 *Date:* ${new Date().toLocaleString('en-IN')}

📦 *Returned Items:*
${itemsList}

${reason ? `💬 *Reason:* ${reason}` : ''}
    `.trim();

    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (adminChatId) {
      await telegramBot.sendMessage(adminChatId, message);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Materials marked as returned' 
    });
  } catch (error: any) {
    console.error('Error marking materials as returned:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark materials as returned' },
      { status: 500 }
    );
  }
}
