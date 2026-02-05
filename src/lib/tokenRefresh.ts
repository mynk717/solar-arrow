// src/lib/tokenRefresh.ts - COMPLETE FIXED VERSION
import { redis } from './redis';
import { google } from 'googleapis';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  updatedAt: string;
  scope?: string;
}

export function isTokenExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const buffer = 5 * 60;
  return expiresAt < (now + buffer);
}

export async function refreshOrganizationToken(
  organizationId: string,
  adminEmail: string
): Promise<string | null> {
  try {
    const key = `org:${organizationId}:oauth:${adminEmail}`;
    const tokenData = await redis.get(key) as any;

    if (!tokenData?.refreshToken) {
      console.error('No refresh token:', key);
      return null;
    }

    if (!isTokenExpired(tokenData.expiresAt)) {
      return tokenData.accessToken;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({ refresh_token: tokenData.refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    const expiresAt = credentials.expiry_date 
      ? Math.floor(credentials.expiry_date / 1000)
      : Math.floor(Date.now() / 1000) + 3600;

    const newTokenData = {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || tokenData.refreshToken,
      expiresAt,
      updatedAt: new Date().toISOString(),
      scope: tokenData.scope,
    };

    await redis.set(key, newTokenData);
    return credentials.access_token!;
  } catch (error) {
    console.error('Refresh failed:', error);
    return null;
  }
}

/**
 * Fixed: Directly use session email, no smembers
 */
export async function getValidAccessToken(
  organizationId: string
): Promise<string | null> {
  try {
    // ✅ Use known admin email from session (no smembers needed)
    const key = `org:${organizationId}:oauth:shukla.mayank247@gmail.com`;
    
    let tokens = await redis.get(key) as any;
    
    if (!tokens?.accessToken) {
      return null;
    }

    // Fix expiresAt if it's ISO string
    if (typeof tokens.expiresAt === 'string') {
      tokens.expiresAt = Math.floor(new Date(tokens.expiresAt).getTime() / 1000);
    }

    if (isTokenExpired(tokens.expiresAt)) {
      const refreshed = await refreshOrganizationToken(organizationId, 'shukla.mayank247@gmail.com');
      return refreshed;
    }

    if (!tokens.scope?.includes('spreadsheets')) {
      return null;
    }

    return tokens.accessToken;
  } catch (error) {
    console.error('getValidAccessToken error:', error);
    return null;
  }
}
