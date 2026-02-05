// src/lib/tokenRefresh.ts
import { redis } from './redis';
import { google } from 'googleapis';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  updatedAt: string;
  scope?: string;
}

/**
 * Check if token is expired or will expire in next 5 minutes
 */
export function isTokenExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const buffer = 5 * 60; // 5 minutes buffer
  return expiresAt < (now + buffer);
}

/**
 * Get any admin's token from organization (handles multi-user orgs)
 */
async function getOrganizationTokens(organizationId: string): Promise<TokenData | null> {
  // Get all admins in this org
  const admins = await redis.smembers(`org:${organizationId}:admins`) as string[];
  
  // Try each admin's tokens
  for (const adminEmail of admins) {
    const tokens = await redis.get(`org:${organizationId}:oauth:${adminEmail}`) as TokenData;
    if (tokens?.accessToken) {
      return tokens;
    }
  }
  
  return null;
}

/**
 * Refresh OAuth token for an organization
 */
export async function refreshOrganizationToken(
  organizationId: string,
  adminEmail: string
): Promise<string | null> {
  try {
    // Get current tokens from Redis
    const tokenData = await redis.get(`org:${organizationId}:oauth:${adminEmail}`) as TokenData;

    if (!tokenData || !tokenData.refreshToken) {
      console.error('No refresh token found for:', adminEmail);
      return null;
    }

    // Check if refresh needed
    if (!isTokenExpired(tokenData.expiresAt)) {
      return tokenData.accessToken;
    }

    console.log(`Refreshing token for org: ${organizationId}, admin: ${adminEmail}`);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: tokenData.refreshToken
    });

    // Refresh the token
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Calculate new expiry
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = credentials.expiry_date 
      ? Math.floor(credentials.expiry_date / 1000)
      : now + 3600;

    // Save refreshed token to Redis
    const newTokenData: TokenData = {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || tokenData.refreshToken,
      expiresAt,
      updatedAt: new Date().toISOString(),
      scope: tokenData.scope, // Preserve original scopes
    };

    await redis.set(`org:${organizationId}:oauth:${adminEmail}`, newTokenData);

    console.log(`✅ Token refreshed for org: ${organizationId}`);
    return credentials.access_token!;

  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

/**
 * Get valid access token (refreshes if needed)
 */
export async function getValidAccessToken(
  organizationId: string,
  adminEmail?: string  // Optional: specify which admin's token to use
): Promise<string | null> {
  try {
    let tokens: TokenData | null = null;

    // If specific admin email provided, use that
    if (adminEmail) {
      tokens = await redis.get(`org:${organizationId}:oauth:${adminEmail}`) as TokenData;
    } else {
      // Otherwise get any admin's token
      tokens = await getOrganizationTokens(organizationId);
    }

    if (!tokens?.accessToken) {
      console.log('❌ No tokens found');
      return null;
    }

    // Check if expired
    if (isTokenExpired(tokens.expiresAt)) {
      // Try to refresh (use first admin if multiple)
      const firstAdmin = await redis.smembers(`org:${organizationId}:admins`);
      return await refreshOrganizationToken(organizationId, firstAdmin[0]);
    }

    // Validate scopes (Sheets required)
    if (!tokens.scope?.includes('spreadsheets')) {
      console.log('❌ Token missing spreadsheets scope');
      return null;
    }

    return tokens.accessToken;
  } catch (error) {
    console.error('Error getting valid token:', error);
    return null;
  }
}
