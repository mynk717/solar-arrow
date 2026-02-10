import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated. Please login first.'
      }, { status: 401 });
    }

    const email = session.user.email;

    // Get access token from session
    const accessToken = session.accessToken;
    
    // Get user info to find userId
    const userInfo = await redis.get(`user:${email}:info`) as any;
    
    if (!userInfo || !userInfo.id) {
      return NextResponse.json({ 
        error: 'User info not found in Redis',
        debug: { email, checkedKey: `user:${email}:info` }
      }, { status: 400 });
    }

    const userId = userInfo.id;
    
    // Get sheet ID from Redis using the correct key pattern
    const sheetId = await redis.get(`user:${userId}:activeSheet`) as string;

    if (!accessToken) {
      return NextResponse.json({ 
        error: 'No access token in session. Please re-login.'
      }, { status: 401 });
    }

    if (!sheetId) {
      return NextResponse.json({ 
        error: 'No Google Sheet configured. Please complete onboarding.',
        debug: {
          email,
          userId,
          checkedKey: `user:${userId}:activeSheet`
        }
      }, { status: 400 });
    }

    // Fetch sheet metadata
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: 'Failed to fetch sheet data',
        details: errorText,
        hint: 'Token might be expired. Try re-login.'
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
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
