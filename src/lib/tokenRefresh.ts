// src/lib/tokenRefresh.ts
import { redis } from './redis';
import { google } from 'googleapis';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  updatedAt: string;
  updatedBy: string;
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
 * Refresh OAuth token for an organization
 */
export async function refreshOrganizationToken(
  organizationId: string
): Promise<string | null> {
  try {
    // Get current tokens from Redis
    const tokenData = await redis.get(`org:${organizationId}:tokens`) as TokenData;

    if (!tokenData || !tokenData.refreshToken) {
      console.error('No refresh token found');
      return null;
    }

    // Check if refresh needed
    if (!isTokenExpired(tokenData.expiresAt)) {
      return tokenData.accessToken; // Still valid
    }

    console.log(`Refreshing token for org: ${organizationId}`);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
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
      : now + 3600; // Default 1 hour

    // Save refreshed token to Redis
    const newTokenData: TokenData = {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || tokenData.refreshToken, // Keep old if not provided
      expiresAt,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system-refresh'
    };

    await redis.set(`org:${organizationId}:tokens`, newTokenData);

    console.log(`Token refreshed successfully for org: ${organizationId}`);
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
  organizationId: string
): Promise<string | null> {
  try {
    const tokenData = await redis.get(`org:${organizationId}:tokens`) as TokenData;

    if (!tokenData) {
      return null;
    }

    // Check if expired
    if (isTokenExpired(tokenData.expiresAt)) {
      return await refreshOrganizationToken(organizationId);
    }

    return tokenData.accessToken;
  } catch (error) {
    console.error('Error getting valid token:', error);
    return null;
  }
}