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
    const leadNotifyGroups = await redis.get(`org:${orgId}:lead_assign_groups`);
    const usersCount = await redis.scard(`org:${orgId}:users`);

    return NextResponse.json({
      id: orgId,
      name: orgData?.name || 'Unnamed Organization',
      sheetId: session.user.sheetId,
      usersCount: usersCount || 0,
      leadNotifyGroups: leadNotifyGroups ? JSON.parse(leadNotifyGroups as string) : [],
      createdAt: orgData?.createdAt || new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
