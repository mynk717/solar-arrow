import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/lib/redis';
import { nanoid } from 'nanoid';

// GET - List departments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.user.organizationId;
    
    // Get all departments for this org
    const deptIds = await redis.smembers(`org:${orgId}:departments`) as string[];
    
    const departments = await Promise.all(
      deptIds.map(async (id) => {
        const dept = await redis.get(`department:${id}:info`) as any;
        
        // Count users in this department
        const userEmails = await redis.smembers(`org:${orgId}:users`) as string[];
        const users = await Promise.all(
          userEmails.map(email => redis.get(`user:${email}:info`))
        );
        const userCount = users.filter((u: any) => u?.department === dept?.name).length;
        
        return dept ? { ...dept, userCount } : null;
      })
    );

    return NextResponse.json({
      departments: departments.filter(Boolean),
    });
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create department
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const orgId = session.user.organizationId;
    const deptId = `dept_${nanoid(12)}`;

    // Create department
    await redis.set(`department:${deptId}:info`, {
      id: deptId,
      name,
      description: description || '',
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    });

    // Add to org departments
    await redis.sadd(`org:${orgId}:departments`, deptId);

    return NextResponse.json({ success: true, departmentId: deptId });
  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove department
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { departmentId } = await request.json();

    if (!departmentId) {
      return NextResponse.json({ error: 'Department ID required' }, { status: 400 });
    }

    const orgId = session.user.organizationId;

    // Remove from org
    await redis.srem(`org:${orgId}:departments`, departmentId);
    
    // Delete department info
    await redis.del(`department:${departmentId}:info`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
