import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getValidAccessToken } from '@/lib/tokenRefresh';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.organizationId || !session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated', 
        status: 'expired' 
      }, { status: 401 });
    }

    // ✅ Check if org has a sheet configured
    const orgInfo = await redis.get(`org:${session.user.organizationId}:info`) as any;
    
    if (!orgInfo?.sheetId) {
      return NextResponse.json({ 
        error: 'No sheet configured for this organization', 
        status: 'unknown' 
      }, { status: 400 });
    }

    // ✅ For REGULAR USERS (non-admin): Just check if ANY admin has valid tokens
    if (session.user.accountType === 'user') {
      // Get all admins in the organization
      const adminEmails = await redis.smembers(`org:${session.user.organizationId}:admins`) as string[];
      
      if (adminEmails.length === 0) {
        return NextResponse.json({ 
          error: 'No admin configured for this organization', 
          status: 'expired' 
        }, { status: 400 });
      }

      // Check if ANY admin has valid tokens
      let hasValidAdminToken = false;
      for (const adminEmail of adminEmails) {
        const token = await getValidAccessToken(session.user.organizationId, adminEmail);
        if (token) {
          hasValidAdminToken = true;
          break;
        }
      }

      if (!hasValidAdminToken) {
        return NextResponse.json({ 
          error: 'Organization admin needs to re-authenticate', 
          status: 'expired' 
        }, { status: 401 });
      }

      // ✅ User is good - admin has valid tokens
      return NextResponse.json({
        status: 'valid',
        message: 'Connected via organization admin',
        email: session.user.email,
        accountType: 'user'
      });
    }

    // ✅ For ADMINS: Check their own token
    const accessToken = await getValidAccessToken(
      session.user.organizationId, 
      session.user.email
    );
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Invalid token. Please re-authenticate.', 
        status: 'expired' 
      }, { status: 401 });
    }

    // Validate token with Google
    const tokenInfo = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    
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
