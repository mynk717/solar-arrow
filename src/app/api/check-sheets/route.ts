import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const email = session.user.email;
    const accessToken = session.accessToken;
    const userId = session.userId || session.user?.id;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    // Try multiple Redis key patterns to find sheet ID
    let sheetId = null;
    const keysToTry = [
      `user:${userId}:activeSheet`,
      `user:${email}:sheetId`,
      `sheet:${userId}`,
      `sheet:${email}`,
      `${userId}:sheetId`,
      `${email}:sheetId`,
    ];

    for (const key of keysToTry) {
      const value = await redis.get(key);
      if (value) {
        sheetId = value as string;
        break;
      }
    }

    // If not in Redis, check all user keys to find which one belongs to this email
    if (!sheetId) {
      const allUserKeys = await redis.keys('user:user_*:info');
      for (const key of allUserKeys) {
        const userInfo = await redis.get(key) as any;
        if (userInfo?.email === email) {
          const extractedUserId = key.split(':')[1]; // Extract user_xxx from user:user_xxx:info
          sheetId = await redis.get(`user:${extractedUserId}:activeSheet`) as string;
          if (sheetId) break;
        }
      }
    }

    if (!sheetId) {
      return NextResponse.json({ 
        error: 'No sheet configured',
        debug: { userId, email, keysChecked: keysToTry }
      }, { status: 400 });
    }

    // Fetch sheet metadata
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch sheet',
        details: await response.text()
      }, { status: response.status });
    }

    const data = await response.json();
    const tabNames = data.sheets?.map((s: any) => s.properties?.title) || [];
    const requiredTabs = ['LEADS', 'USERS', 'BRANCHES'];

    return NextResponse.json({
      success: true,
      sheetName: data.properties?.title,
      sheetId: sheetId,
      tabs: data.sheets?.map((s: any) => ({
        name: s.properties?.title,
        sheetId: s.properties?.sheetId,
        rows: s.properties?.gridProperties?.rowCount,
        columns: s.properties?.gridProperties?.columnCount,
      })),
      requiredTabs: {
        LEADS: tabNames.includes('LEADS'),
        USERS: tabNames.includes('USERS'),
        BRANCHES: tabNames.includes('BRANCHES'),
      },
      allTabs: tabNames,
      missingTabs: requiredTabs.filter(tab => !tabNames.includes(tab)),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
