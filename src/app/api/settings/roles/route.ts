import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orgId = session.user.organizationId;

    // Get role permissions from Redis
    const [adminPerms, editorPerms, viewerPerms] = await Promise.all([
      redis.get(`role:admin:permissions`),
      redis.get(`role:editor:permissions`),
      redis.get(`role:viewer:permissions`),
    ]);

    // Get user counts per role
    const userEmails = await redis.smembers(`org:${orgId}:users`) as string[];
    const users = await Promise.all(
      userEmails.map(email => redis.get(`user:${email}:info`))
    );

    // ✅ Fix: Proper typing for reduce
    const roleCounts = users.reduce<Record<string, number>>((acc, user: any) => {
      if (user?.role) {
        acc[user.role] = (acc[user.role] || 0) + 1;
      }
      return acc;
    }, {});

    const roles = [
      {
        name: 'owner',
        permissions: adminPerms || defaultAdminPermissions(),
        userCount: roleCounts.owner || 0,
      },
      {
        name: 'admin',
        permissions: adminPerms || defaultAdminPermissions(),
        userCount: roleCounts.admin || 0,
      },
      {
        name: 'editor',
        permissions: editorPerms || defaultEditorPermissions(),
        userCount: roleCounts.editor || 0,
      },
      {
        name: 'viewer',
        permissions: viewerPerms || defaultViewerPermissions(),
        userCount: roleCounts.viewer || 0,
      },
    ];

    return NextResponse.json({ roles });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function defaultAdminPermissions() {
  return {
    enquiries: { view: true, create: true, edit: true, delete: true },
    surveys: { view: true, create: true, edit: true, delete: true },
    payments: { view: true, create: true, edit: true, delete: true },
    installation: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
  };
}

function defaultEditorPermissions() {
  return {
    enquiries: { view: true, create: true, edit: true, delete: false },
    surveys: { view: true, create: true, edit: true, delete: false },
    payments: { view: true, create: false, edit: false, delete: false },
    installation: { view: true, create: true, edit: true, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
  };
}

function defaultViewerPermissions() {
  return {
    enquiries: { view: true, create: false, edit: false, delete: false },
    surveys: { view: true, create: false, edit: false, delete: false },
    payments: { view: true, create: false, edit: false, delete: false },
    installation: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
  };
}
