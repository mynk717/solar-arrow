// src/app/api/organization/telegram-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatType, chatId } = await request.json();

    if (!chatType || !chatId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    // Save chat ID to Redis under organization
    const key = `org:${orgId}:telegram:${chatType}`;
    await redis.set(key, chatId);

    console.log(`✅ Saved Telegram ${chatType} chat ID for org ${orgId}: ${chatId}`);

    return NextResponse.json({ 
      success: true, 
      message: `${chatType} chat ID saved successfully` 
    });

  } catch (error: any) {
    console.error('Error saving Telegram config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    // Retrieve all telegram config for organization
    const quotationTeamChatId = await redis.get(`org:${orgId}:telegram:quotation_team`);
    const adminChatId = await redis.get(`org:${orgId}:telegram:admin`);
    const surveyChatId = await redis.get(`org:${orgId}:telegram:survey_team`);
    const installationChatId = await redis.get(`org:${orgId}:telegram:installation_team`);

    return NextResponse.json({
      quotation_team: quotationTeamChatId || null,
      admin: adminChatId || null,
      survey_team: surveyChatId || null,
      installation_team: installationChatId || null,
    });

  } catch (error: any) {
    console.error('Error retrieving Telegram config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve configuration' },
      { status: 500 }
    );
  }
}