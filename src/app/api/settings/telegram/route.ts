// src/app/api/settings/telegram/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  getTelegramGroupChatId,
  saveTelegramGroupChatId,
  getUserTelegramChatId,
} from '@/lib/redis';

// GET - Fetch current settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.user.organizationId;
    const userEmail = session.user.email;

    // ✅ Add null check
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const [groupChatId, userChatId] = await Promise.all([
      getTelegramGroupChatId(orgId),
      getUserTelegramChatId(userEmail),
    ]);

    return NextResponse.json({
      groupChatId,
      userChatId,
      isConnected: !!userChatId,
    });
  } catch (error: any) {
    console.error('❌ Error fetching Telegram settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Save group chat ID
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (!['owner', 'admin'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const { groupChatId } = await request.json();
    const orgId = session.user.organizationId;

    // ✅ Add null check
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    if (!groupChatId) {
      return NextResponse.json({ error: 'Group chat ID required' }, { status: 400 });
    }

    await saveTelegramGroupChatId(orgId, groupChatId);

    console.log(`✅ Group chat ID saved for org ${orgId}: ${groupChatId}`);
    return NextResponse.json({ success: true, message: 'Group chat ID saved successfully' });
  } catch (error: any) {
    console.error('❌ Error saving Telegram settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
