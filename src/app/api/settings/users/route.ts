import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/lib/redis';
import bcrypt from 'bcryptjs';
import { telegramBot } from '@/lib/telegram';

// GET - List all users in organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins/owners can list users
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orgId = session.user.organizationId;
    
    // Get all user emails in this org
    const userEmails = await redis.smembers(`org:${orgId}:users`) as string[];
    
    // Fetch user details
    const users = await Promise.all(
      userEmails.map(async (email) => {
        const userInfo = await redis.get(`user:${email}:info`) as any;
        return userInfo ? {
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role,
          department: userInfo.department,
          isActive: userInfo.isActive,
          createdAt: userInfo.createdAt,
          lastLogin: userInfo.lastLogin,
        } : null;
      })
    );

    return NextResponse.json({
      users: users.filter(Boolean),
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role, department } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orgId = session.user.organizationId;

    // Check if user already exists
    const existingUser = await redis.get(`user:${email}:info`);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await redis.set(`user:${email}:info`, {
      email,
      name,
      passwordHash,
      role,
      department,
      organizationId: orgId,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    // Add to org users set
    await redis.sadd(`org:${orgId}:users`, email);

    // Send Telegram notification
    try {
      const chatIdsData = await redis.get(`sheet:${session.user.sheetId}:user_notify`);
      const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];
      
      const message = `
👤 *New User Added*

📧 *Email:* ${email}
👤 *Name:* ${name}
🔑 *Role:* ${role}
🏢 *Department:* ${department || 'N/A'}

Added by: ${session.user.email}
      `.trim();

      for (const chatId of chatIds) {
        if (chatId) {
          await telegramBot.sendMessage(chatId, message, 'Markdown');
        }
      }
    } catch (error) {
      console.error('Telegram notification failed:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update user
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, name, role, department, isActive } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const userInfo = await redis.get(`user:${email}:info`) as any;
    if (!userInfo) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user
    await redis.set(`user:${email}:info`, {
      ...userInfo,
      name: name || userInfo.name,
      role: role || userInfo.role,
      department: department !== undefined ? department : userInfo.department,
      isActive: isActive !== undefined ? isActive : userInfo.isActive,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const userInfo = await redis.get(`user:${email}:info`) as any;
    if (!userInfo) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cannot delete owner
    if (userInfo.role === 'owner') {
      return NextResponse.json({ error: 'Cannot delete owner' }, { status: 403 });
    }

    const orgId = session.user.organizationId;

    // Remove from org
    await redis.srem(`org:${orgId}:users`, email);
    
    // Delete user info
    await redis.del(`user:${email}:info`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
