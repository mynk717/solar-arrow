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

    // ✅ For non-owners: use org owner token
// Only accountType 'owner' has their own OAuth token in Redis
if (session.user.accountType !== 'owner') {
  const adminEmails = await redis.smembers(`org:${session.user.organizationId}:admins`) as string[];

  for (const adminEmail of adminEmails) {
    const token = await getValidAccessToken(session.user.organizationId, adminEmail);
    if (token) {
      return NextResponse.json({
        status: 'valid',
        message: 'Connected via organization admin',
        email: session.user.email,
        accountType: session.user.accountType
      });
    }
  }

  return NextResponse.json({
    error: 'Organization admin needs to re-authenticate',
    status: 'expired'
  }, { status: 401 });
}

// ✅ For OWNER only: check their own OAuth token
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
