// src/app/api/pokes/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { redis } from '@/lib/redis';
import { nanoid } from 'nanoid';

const KEY = (orgId: string) => `org:${orgId}:pokes`;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json([], { status: 401 });
  const pokes = await redis.lrange(KEY(session.user.organizationId), 0, 49);
  return NextResponse.json(pokes.map(p => (typeof p === 'string' ? JSON.parse(p) : p)).reverse());
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { to, enquiryId, customerName, message } = await request.json();
  const poke = {
    id: nanoid(8),
    from: session.user.email,
    fromName: session.user.name,
    to,
    enquiryId,
    customerName,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };
  await redis.lpush(KEY(session.user.organizationId!), JSON.stringify(poke));
  await redis.ltrim(KEY(session.user.organizationId!), 0, 99); // keep last 100
  return NextResponse.json({ success: true });
}

export async function PATCH() {
  // Mark all pokes as read for current user
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const raw = await redis.lrange(KEY(session.user.organizationId!), 0, 99);
  const updated = raw.map(p => {
    const poke = typeof p === 'string' ? JSON.parse(p) : p;
    if (poke.to === session.user!.email) poke.read = true;
    return JSON.stringify(poke);
  });
  await redis.del(KEY(session.user.organizationId!));
  if (updated.length) await redis.rpush(KEY(session.user.organizationId!), ...updated);
  return NextResponse.json({ success: true });
}
