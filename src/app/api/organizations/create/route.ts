// src/app/api/organizations/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { organizationName } = await request.json();

  // Create organization ID from name
  const orgId = organizationName.toLowerCase().replace(/\s+/g, '-');

  // Check if organization already exists
  const existingOrg = await redis.get(`org:${orgId}:info`);
  if (existingOrg) {
    return NextResponse.json({ error: 'Organization already exists' }, { status: 400 });
  }

  // Create organization
  await redis.set(`org:${orgId}:info`, {
    id: orgId,
    name: organizationName,
    googleEmail: session.user.email, // Admin's Google email
    sheetId: '', // Will be set in /setup
    createdAt: new Date().toISOString(),
    createdBy: session.user.email
  });

  return NextResponse.json({
    success: true,
    organizationId: orgId,
    message: 'Organization created successfully'
  });
}
