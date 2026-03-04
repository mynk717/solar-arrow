import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin' && session.user.role !== 'owner')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { orgLogoUrl } = await req.json();
  if (!orgLogoUrl) return NextResponse.json({ error: 'Missing orgLogoUrl' }, { status: 400 });

  const orgId = session.user.organizationId;
  const existingOrg: any = await redis.get(`org:${orgId}:info`);
  if (!existingOrg) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

  await redis.set(`org:${orgId}:info`, { ...existingOrg, orgLogoUrl, updatedAt: new Date().toISOString() });

  return NextResponse.json({ success: true, orgLogoUrl });
}
