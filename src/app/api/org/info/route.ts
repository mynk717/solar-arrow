import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ 
        id: null, 
        name: 'Not configured',
        usersCount: 0,
        leadNotifyGroups: []
      });
    }

    const orgData = await redis.get(`org:${orgId}:info`) as any;
    const usersCount = await redis.scard(`org:${orgId}:users`);

    // Read lead notify groups from their actual Redis key
const leadGroupsRaw = await redis.get(`org:${orgId}:lead_assign_groups`);
const leadNotifyGroups = leadGroupsRaw
  ? JSON.parse(leadGroupsRaw as string)
  : (orgData?.leadNotifyGroups ?? []);
  const telegramGroupChatId = await redis.get(`org:${orgId}:telegram:group_chat_id`) as string | null;


return NextResponse.json({
  id: orgId,
  name: orgData?.name || 'Unnamed Organization',
  sheetId: session.user.sheetId,
  createdAt: orgData?.createdAt,
  leadNotifyGroups,
  telegramGroupChatId: telegramGroupChatId || null,
});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.accountType !== 'admin' && session.user.accountType !== 'owner') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const orgId = session.user.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    const existingOrg = await redis.get(`org:${orgId}:info`) as any;
    await redis.set(`org:${orgId}:info`, {
      ...existingOrg,
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, name: name.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
