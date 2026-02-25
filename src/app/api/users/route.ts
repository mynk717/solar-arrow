// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { redis, saveUser, getOrganizationUsers } from '@/lib/redis';
import { authOptions } from '../auth/[...nextauth]/route';
import { nanoid } from 'nanoid';
import type { AccountType } from '@/lib/permissions';

// Helper function to check if user is admin/owner
function isAdminOrOwner(accountType?: string, role?: string): boolean {
  return accountType === 'admin' || accountType === 'owner' || role === 'admin' || role === 'owner';
}

// ── CREATE USER ────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdminOrOwner(session.user.accountType, session.user.role)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { email, name, password, role, branchId, branchName } = await request.json();

  if (!email || !name || !password || !role) {
    return NextResponse.json({ error: 'email, name, password and role are required' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  // Check if user already exists
  const existing = await redis.get(`user:${email}:info`);
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userData = {
    id: `user-${nanoid(12)}`,
    email,
    name,
    passwordHash,
    role,
    accountType: 'user' as AccountType,
    department: null,
    organizationId: session.user.organizationId!,
    branchId: branchId || null,
    branchName: branchName || null,
    permissions: {
      canView: [],
      canEdit: [],
      canDelete: [],
      canExport: false,
      canAssign: false,
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: session.user.email!,
  };

  await saveUser(email, userData);

  // Add to org users set
  await redis.sadd(`org:${session.user.organizationId}:users`, email);

  return NextResponse.json({
    success: true,
    user: { email, name, role, branchId, branchName, isActive: true },
  });
}

// ── LIST USERS ─────────────────────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !session.user.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdminOrOwner(session.user.accountType, session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await getOrganizationUsers(session.user.organizationId);

  // Strip passwordHash before returning
  const safeUsers = (Array.isArray(users) ? users : []).map((u: any) => {
    const { passwordHash, ...safe } = u;
    return safe;
  });

  return NextResponse.json(safeUsers);
}

// ── UPDATE USER ────────────────────────────────────────────────────────────────
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdminOrOwner(session.user.accountType, session.user.role)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await request.json();
  const { email, role, isActive, branchId, branchName, newPassword, permissions, name } = body;

  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  const user = await redis.get(`user:${email}:info`) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Ensure user belongs to same org
  if (user.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Prevent demoting/modifying owner unless you are owner
  if (user.role === 'owner' && session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Only owner can modify another owner' }, { status: 403 });
  }

  // Build partial update — only update fields that were sent
  const updates: Record<string, any> = {
    updatedAt: new Date().toISOString(),
    updatedBy: session.user.email,
  };

  if (name      !== undefined) updates.name      = name;
  if (role      !== undefined) updates.role      = role;
  if (isActive  !== undefined) updates.isActive  = isActive;
  if (branchId  !== undefined) updates.branchId  = branchId;
  if (branchName !== undefined) updates.branchName = branchName;
  if (permissions !== undefined) updates.permissions = permissions;

  // Password reset
  if (newPassword !== undefined) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    updates.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await redis.set(`user:${email}:info`, { ...user, ...updates });

  return NextResponse.json({ success: true });
}

// ── DELETE USER (soft delete) ──────────────────────────────────────────────────
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdminOrOwner(session.user.accountType, session.user.role)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  const user = await redis.get(`user:${email}:info`) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Prevent deleting owner
  if (user.role === 'owner') {
    return NextResponse.json({ error: 'Cannot delete owner account' }, { status: 403 });
  }

  // Soft delete — keeps data, blocks login (isActive: false)
  await redis.set(`user:${email}:info`, {
    ...user,
    isActive: false,
    deletedAt: new Date().toISOString(),
    deletedBy: session.user.email,
  });

  // Remove from org set so they don't appear in lists
  await redis.srem(`org:${user.organizationId}:users`, email);

  return NextResponse.json({ success: true });
}
