// src/app/api/telegram/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis'; 

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // User sent /start to bot
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;

      // Store chat ID for user (you'll need to map this to your users)
      await redis.set(`telegram:chatid:${userId}`, chatId);

      // Send welcome message
      // Implementation here
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
