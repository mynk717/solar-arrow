import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

// POST - Save sheet ID to organization in Redis
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.organizationId || !session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { sheetId } = await request.json();

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet ID is required' }, { status: 400 });
    }

    console.log('📝 [POST /api/settings] Saving sheet ID:', {
      orgId: session.user.organizationId,
      sheetId: sheetId,
      email: session.user.email
    });

    // Get existing org
    const existingOrg = await redis.get(`org:${session.user.organizationId}:info`) as any;
    
    if (!existingOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Update org with new sheet ID
    await redis.set(`org:${session.user.organizationId}:info`, {
      ...existingOrg,
      sheetId: sheetId,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ [POST /api/settings] Sheet ID saved to Redis');

    return NextResponse.json({ 
      success: true,
      message: 'Configuration saved. Please sign out and sign in again to refresh your session.'
    });
  } catch (error: any) {
    console.error('❌ [POST /api/settings] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
