// src/app/api/bom/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { telegramBot } from '@/lib/telegram';


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bomId, customerName, capacity, materials, totalCost } = body;

    if (!bomId || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format materials list
    const materialsText = materials
      .map((mat: any) => `  • ${mat.item}: ${mat.quantity} ${mat.unit}`)
      .join('\n');

    const message = `
🔔 *BOM Ready for Dispatch*

📋 *BOM ID:* ${bomId}
👤 *Customer:* ${customerName}
⚡ *Capacity:* ${capacity}

📦 *Materials Required:*
${materialsText}

💰 *Total Cost:* ₹${totalCost.toLocaleString()}

Please prepare materials for dispatch.
    `.trim();

    // Send to store manager (configure chat ID in env)
    const storeManagerChatId = process.env.TELEGRAM_STORE_MANAGER_CHAT_ID;
    
    if (!storeManagerChatId) {
      console.warn('Store manager chat ID not configured');
      return NextResponse.json(
        { success: true, warning: 'Notification not sent - chat ID not configured' }
      );
    }

    await telegramBot.sendMessage(storeManagerChatId, message);

    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent to store manager' 
    });
  } catch (error: any) {
    console.error('Error sending BOM notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}
