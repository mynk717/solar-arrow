// src/app/api/telegram/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveUserTelegramChatId } from '@/lib/redis';
import { redis } from '@/lib/redis';


export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // Handle /start command with deep link: /start connect_{email}
    if (update.message?.text?.startsWith('/start connect_')) {
      const chatId = update.message.chat.id.toString();
      const userEmail = update.message.text.split('connect_')[1];
      const firstName = update.message.from.first_name;
      const lastName = update.message.from.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();

      // Save user's chat ID
      await saveUserTelegramChatId(userEmail, chatId, fullName);

      // Send confirmation message
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ *Connected Successfully!*\n\nYou will now receive notifications for:\n• New lead assignments\n• Status updates\n• Important alerts\n\nAccount: ${userEmail}`,
          parse_mode: 'Markdown',
        }),
      });

      console.log(`✅ Telegram connected for ${userEmail} (chatId: ${chatId})`);
      return NextResponse.json({ ok: true });
    }

    // Handle verification code (6-digit number)
if (update.message?.text && /^\d{6}$/.test(update.message.text)) {
  const code = update.message.text;
  const chatId = update.message.chat.id.toString();
  const firstName = update.message.from.first_name;
  const lastName = update.message.from.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  // Check if code exists in Redis
  const userEmail = await redis.get(`telegram:verify:${code}`) as string | null;

  if (userEmail) {
    // Save user's chat ID
    await saveUserTelegramChatId(userEmail, chatId, fullName);
    
    // Delete the verification code
    await redis.del(`telegram:verify:${code}`);

    // Send confirmation message
    const botToken = process.env.TELEGRAM_BOT_TOKEN!;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ *Connected Successfully!*\n\nHello ${fullName}!\n\nYour Telegram is now connected to your Solar Arrow account.\n\n*Account:* ${userEmail}\n\nYou will receive notifications for:\n• New lead assignments\n• Status updates\n• Important alerts`,
        parse_mode: 'Markdown',
      }),
    });

    console.log(`✅ Telegram connected for ${userEmail} via verification code (chatId: ${chatId})`);
    return NextResponse.json({ ok: true });
  } else {
    // Invalid or expired code
    const botToken = process.env.TELEGRAM_BOT_TOKEN!;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `❌ *Invalid or Expired Code*\n\nThe verification code you entered is either invalid or has expired.\n\nPlease:\n1. Go back to Solar Arrow dashboard\n2. Click "Generate New Code"\n3. Copy and send the new code here\n\n_Codes expire after 10 minutes._`,
        parse_mode: 'Markdown',
      }),
    });

    return NextResponse.json({ ok: true });
  }
}

    // Handle regular /start command
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id.toString();
      const firstName = update.message.from.first_name;

      // Send welcome message
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `👋 *Welcome to Solar Arrow Bot!*\n\nHello ${firstName}!\n\nTo connect your account, please use the connection link from your Solar Arrow dashboard settings.\n\nSettings → Telegram → Connect Telegram`,
          parse_mode: 'Markdown',
        }),
      });

      return NextResponse.json({ ok: true });
    }

    // Handle group chat detection
    if (update.message?.chat?.type === 'group' || update.message?.chat?.type === 'supergroup') {
      const groupChatId = update.message.chat.id.toString();
      const groupTitle = update.message.chat.title;
      console.log(`📱 Group detected: ${groupTitle} (ID: ${groupChatId})`);
      
      // Send info message to group
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupChatId,
          text: `✅ Bot added to group!\n\nGroup Chat ID: \`${groupChatId}\`\n\nCopy this ID and paste it in your Solar Arrow dashboard:\nSettings → Telegram → Group Chat ID`,
          parse_mode: 'Markdown',
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
