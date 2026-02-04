// src/app/api/test-token/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getValidAccessToken } from '@/lib/tokenRefresh';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Try to get valid token (will refresh if needed)
    const accessToken = await getValidAccessToken(session.user.organizationId);

    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Token expired',
        status: 'expired' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      status: 'valid',
      message: 'Token is valid' 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Token check failed',
      status: 'unknown' 
    }, { status: 500 });
  }
}