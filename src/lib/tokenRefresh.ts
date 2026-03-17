import { redis } from './redis';
import { google } from 'googleapis';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | string;
  updatedAt: string;
  scope?: string;
}

export function isTokenExpired(expiresAt: number | string): boolean {
  let expiryTimestamp: number;
  
  if (typeof expiresAt === 'string') {
    expiryTimestamp = Math.floor(new Date(expiresAt).getTime() / 1000);
  } else {
    expiryTimestamp = expiresAt;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const buffer = 5 * 60;
  return expiryTimestamp < (now + buffer);
}

export async function refreshOrganizationToken(
  organizationId: string,
  adminEmail: string
): Promise<string | null> {
  const key = `org:${organizationId}:oauth:${adminEmail}`;
  const lockKey = `${key}:refresh_lock`;

  // Distributed lock — only one refresh at a time per org
  const locked = await redis.set(lockKey, '1', { nx: true, ex: 30 });
  if (!locked) {
    // Another request is already refreshing — wait and return fresh token
    await new Promise(r => setTimeout(r, 1200));
    const fresh = await redis.get(key) as TokenData;
    return fresh?.accessToken || null;
  }

  try {
    const tokenData = await redis.get(key) as TokenData;

    if (!tokenData?.refreshToken) {
      console.error('No refresh token stored for:', key);
      return null;
    }

    // Re-check after acquiring lock — another request may have refreshed
    if (!isTokenExpired(tokenData.expiresAt)) {
      return tokenData.accessToken;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({ refresh_token: tokenData.refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Safe null check instead of non-null assertion
    if (!credentials.access_token) {
      console.error('Google returned null access_token for:', organizationId);
      return null;
    }

    const expiresAt = credentials.expiry_date
      ? Math.floor(credentials.expiry_date / 1000)
      : Math.floor(Date.now() / 1000) + 3600;

    await redis.set(key, {
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || tokenData.refreshToken,
      expiresAt,
      updatedAt: new Date().toISOString(),
      scope: tokenData.scope,
    });

    return credentials.access_token;
  } catch (error) {
    console.error('Token refresh failed for org:', organizationId, error);
    return null;
  } finally {
    // Always release lock
    await redis.del(lockKey);
  }
}


export async function getValidAccessToken(
  organizationId: string,
  adminEmail: string
): Promise<string | null> {
  try {
    const key = `org:${organizationId}:oauth:${adminEmail}`;
    const tokens = await redis.get(key) as TokenData;
    
    if (!tokens?.accessToken) {
      console.error('No token found for:', key);
      return null;
    }

    if (isTokenExpired(tokens.expiresAt)) {
      return await refreshOrganizationToken(organizationId, adminEmail);
    }

    return tokens.accessToken;
  } catch (error) {
    console.error('getValidAccessToken error:', error);
    return null;
  }
}
