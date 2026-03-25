// src/app/api/settings/telegram/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  getTelegramGroupChatId,
  saveTelegramGroupChatId,
  removeTelegramGroupChatId,
  getUserTelegramChatId,
  removeUserTelegramChatId,
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

    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    if (!groupChatId) {
      return NextResponse.json({ error: 'Group chat ID required' }, { status: 400 });
    }
    if (!groupChatId.toString().startsWith('-')) {
      return NextResponse.json({ 
        error: 'Invalid Chat ID. Group chat IDs must start with a minus sign (e.g., -5142278285)' 
      }, { status: 400 });
    }
    if (!/^-\d+$/.test(groupChatId.toString().trim())) {
      return NextResponse.json({ 
        error: 'Invalid Chat ID format. Only numbers allowed after the minus sign.' 
      }, { status: 400 });
    }
    await saveTelegramGroupChatId(orgId, groupChatId);

    console.log(`✅ Group chat ID saved for org ${orgId}: ${groupChatId}`);
    return NextResponse.json({ success: true, message: 'Group chat ID saved successfully' });
  } catch (error: any) {
    console.error('❌ Error saving Telegram settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove telegram connection (group or personal)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json(); // type: 'group' | 'personal'
    const orgId = session.user.organizationId;
    const userEmail = session.user.email;

    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    if (type === 'group') {
      // Only admin/owner can remove group
      const userRole = session.user.role;
      if (!['owner', 'admin'].includes(userRole || '')) {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      }
      await removeTelegramGroupChatId(orgId);
      console.log(`✅ Group chat ID removed for org ${orgId}`);
      return NextResponse.json({ success: true, message: 'Group disconnected successfully' });

    } else if (type === 'personal') {
      await removeUserTelegramChatId(userEmail);
      console.log(`✅ Personal Telegram removed for user ${userEmail}`);
      return NextResponse.json({ success: true, message: 'Personal Telegram disconnected successfully' });

    } else {
      return NextResponse.json({ error: 'Invalid type. Use "group" or "personal"' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Error removing Telegram settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
