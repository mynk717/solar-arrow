import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const { orgId, chatIds } = await request.json();

    if (!orgId || !Array.isArray(chatIds)) {
      return NextResponse.json({ error: 'Missing orgId or chatIds array' }, { status: 400 });
    }

    await redis.set(
      `org:${orgId}:lead_assign_groups`,
      JSON.stringify(chatIds)
    );
    const existingOrg = await redis.get(`org:${orgId}:info`) as any;
    if (existingOrg) {
      await redis.set(`org:${orgId}:info`, {
        ...existingOrg,
        leadNotifyGroups: chatIds,
        updatedAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({ 
      success: true, 
      message: `Set ${chatIds.length} chat IDs for lead assignment notifications`,
      orgId,
      chatIds
    });

  } catch (error: any) {
    console.error('Set lead notify error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
