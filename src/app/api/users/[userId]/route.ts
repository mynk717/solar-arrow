// src/app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { redis } from '@/lib/redis'; 


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();

    // Find user by ID
    const userEmails = await redis.smembers(`org:${session.user.organizationId}:users`) || [];
    let targetEmail = null;

    for (const email of userEmails) {
      const user: any = await redis.get(`user:${email}:info`);
      if (user?.id === userId) {
        targetEmail = email;
        break;
      }
    }

    if (!targetEmail) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current user data
    const currentUser: any = await redis.get(`user:${targetEmail}:info`);
    
    // Update user
    const updatedUser = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await redis.set(`user:${targetEmail}:info`, updatedUser);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find and remove user
    const userEmails = await redis.smembers(`org:${session.user.organizationId}:users`) || [];
    let targetEmail = null;

    for (const email of userEmails) {
      const user: any = await redis.get(`user:${email}:info`);
      if (user?.id === userId) {
        targetEmail = email;
        break;
      }
    }

    if (!targetEmail) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove user
    await redis.del(`user:${targetEmail}:info`);
    await redis.srem(`org:${session.user.organizationId}:users`, targetEmail);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
