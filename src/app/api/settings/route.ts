import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import {redis} from '@/lib/redis';

// ✅ GET - Fetch org's sheet configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get org info from Redis
    const orgInfo = await redis.get(`org:${session.user.organizationId}:info`) as any;
    
    if (!orgInfo) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({
      sheetId: orgInfo.sheetId || null,
      sheetName: orgInfo.sheetName || 'Sheet1',
      updatedAt: orgInfo.updatedAt,
      organizationName: orgInfo.name
    });
  } catch (error: any) {
    console.error('GET /api/settings Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Save sheet ID to organization in Redis (already exists, keep as-is)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.organizationId || !session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { sheetId, sheetName } = await request.json();
    
    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet ID is required' }, { status: 400 });
    }

    console.log('[POST /api/settings] Saving sheet ID:', {
      orgId: session.user.organizationId,
      sheetId: sheetId,
      sheetName: sheetName,
      email: session.user.email
    });

    // Get existing org
    const existingOrg = await redis.get(`org:${session.user.organizationId}:info`) as any;
    
    if (!existingOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Update org with new sheet ID and name
    await redis.set(`org:${session.user.organizationId}:info`, {
      ...existingOrg,
      sheetId: sheetId,
      sheetName: sheetName || 'Sheet1', // ✅ Store sheet name
      updatedAt: new Date().toISOString()
    });

    console.log('[POST /api/settings] Sheet ID saved to Redis');

    return NextResponse.json({ 
      success: true, 
      message: 'Configuration saved. Please sign out and sign in again to refresh your session.' 
    });
  } catch (error: any) {
    console.error('POST /api/settings Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
