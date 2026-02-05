import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getValidAccessToken } from '@/lib/tokenRefresh';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.organizationId || !session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        status: 'expired' 
      }, { status: 401 });
    }

    const accessToken = await getValidAccessToken(
      session.user.organizationId,
      session.user.email
    );
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'No valid token found. Please re-authenticate.',
        status: 'expired' 
      }, { status: 401 });
    }

    const tokenInfo = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
    );
    
    if (!tokenInfo.ok) {
      return NextResponse.json({ 
        error: 'Invalid token',
        status: 'expired' 
      }, { status: 401 });
    }

    const info = await tokenInfo.json();
    
    return NextResponse.json({ 
      status: 'valid',
      message: 'Connected to Google',
      scopes: info.scope,
      hasSheets: info.scope?.includes('spreadsheets'),
      hasDrive: info.scope?.includes('drive'),
      email: info.email
    });

  } catch (error: any) {
    console.error('Test token error:', error);
    return NextResponse.json({ 
      error: error.message,
      status: 'unknown'
    }, { status: 500 });
  }
}
