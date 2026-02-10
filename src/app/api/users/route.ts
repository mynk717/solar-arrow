// src/app/api/users/route.ts - UPDATED VERSION
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { redis, saveUser, getOrganizationUsers } from '@/lib/redis';
import { authOptions } from '../auth/[...nextauth]/route';
import { nanoid } from 'nanoid';
import type { AccountType } from '@/lib/permissions';

// Helper function to check if user is admin
function isAdminOrOwner(accountType?: string, role?: string): boolean {
  return accountType === 'admin' || accountType === 'owner' || role === 'admin' || role === 'owner';
}

// Create user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ✅ UPDATED: Use helper function
  if (!isAdminOrOwner(session.user.accountType, session.user.role)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { email, name, password, role, branchId, branchName } = await request.json();
  
  // Check if user exists
  const existing = await redis.get(`user:${email}:info`);
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // ✅ UPDATED: Include branch information
  const userData = {
    id: `user-${nanoid(12)}`,
    email,
    name,
    passwordHash,
    role,
    accountType: 'user' as AccountType, // New users are regular users by default
    department: null,
    organizationId: session.user.organizationId!,
    branchId: branchId || null,  // ✅ NEW
    branchName: branchName || null,  // ✅ NEW
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: session.user.email!
  };

  await saveUser(email, userData);

  return NextResponse.json({
    success: true,
    user: { email, name, role, branchId, branchName }
  });
}

// List users
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role || !session.user.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ✅ UPDATED: Use helper function and include owner
  if (!isAdminOrOwner(session.user.accountType, session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await getOrganizationUsers(session.user.organizationId);

  return NextResponse.json(users);
}

// Update user
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ✅ UPDATED: Use helper function
  if (!isAdminOrOwner(session.user.accountType, session.user.role)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { email, role, isActive, branchId, branchName } = await request.json();

  const user = await redis.get(`user:${email}:info`) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // ✅ UPDATED: Include branch information
  await redis.set(`user:${email}:info`, {
    ...user,
    role,
    isActive,
    branchId: branchId !== undefined ? branchId : user.branchId,  // ✅ NEW
    branchName: branchName !== undefined ? branchName : user.branchName,  // ✅ NEW
    updatedAt: new Date().toISOString()
  });

  return NextResponse.json({ success: true });
}

// Delete user
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ✅ UPDATED: Use helper function
  if (!isAdminOrOwner(session.user.accountType, session.user.role)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { email } = await request.json();

  const user = await redis.get(`user:${email}:info`) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

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
