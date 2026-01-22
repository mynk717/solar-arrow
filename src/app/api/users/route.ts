// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { redis, saveUser, getOrganizationUsers } from '@/lib/redis';
import { authOptions } from '../auth/[...nextauth]/route';

// Create user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // ✅ Add null check
  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { email, name, password, role } = await request.json();
  
  // Check if user exists
  const existing = await redis.get(`user:${email}:info`);
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Save user
  const userData = {
    email,
    name,
    passwordHash,
    role,
    organizationId: session.user.organizationId!, // ✅ Non-null assertion
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: session.user.email!
  };

  await saveUser(email, userData);

  return NextResponse.json({
    success: true,
    user: { email, name, role }
  });
}

// List users
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // ✅ Add null check
  if (!session?.user?.role || !session.user.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (!['admin', 'manager'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await getOrganizationUsers(session.user.organizationId);

  return NextResponse.json(users);
}

// Update user
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  // ✅ Add null check
  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { email, role, isActive } = await request.json();

  const user = await redis.get(`user:${email}:info`) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // ✅ Check if user belongs to same organization
  if (user.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Update user
  await redis.set(`user:${email}:info`, {
    ...user,
    role,
    isActive,
    updatedAt: new Date().toISOString()
  });

  return NextResponse.json({ success: true });
}

// Delete user
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  // ✅ Add null check
  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { email } = await request.json();

  const user = await redis.get(`user:${email}:info`) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // ✅ Check if user belongs to same organization
  if (user.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Soft delete
  await redis.set(`user:${email}:info`, {
    ...user,
    isActive: false,
    deletedAt: new Date().toISOString()
  });

  return NextResponse.json({ success: true });
}
