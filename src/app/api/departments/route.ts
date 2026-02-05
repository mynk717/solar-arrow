// src/app/api/departments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { redis } from '@/lib/redis'; 
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const departments = await redis.get(`org:${session.user.organizationId}:departments`) || [];

    return NextResponse.json({ departments });
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description } = await request.json();

    const department = {
      id: `dept-${nanoid(12)}`,
      name,
      description,
      userCount: 0,
      createdAt: new Date().toISOString(),
    };

    const departments: any = await redis.get(`org:${session.user.organizationId}:departments`) || [];
    departments.push(department);

    await redis.set(`org:${session.user.organizationId}:departments`, departments);

    return NextResponse.json({ success: true, department });
  } catch (error: any) {
    console.error('Error adding department:', error);
    return NextResponse.json({ error: 'Failed to add department' }, { status: 500 });
  }
}
