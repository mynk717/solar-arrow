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

    const accessToken = session.accessToken;
    const googleId = session.userId || session.user?.id;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    // Get internal userId from Google ID
    const internalUserId = await redis.get(`googleId:${googleId}`) as string;
    
    if (!internalUserId) {
      return NextResponse.json({ 
        error: 'User mapping not found',
        debug: { googleId, checkedKey: `googleId:${googleId}` }
      }, { status: 400 });
    }

    // Get sheet ID using internal user ID
    const sheetId = await redis.get(`user:${internalUserId}:activeSheet`) as string;

    if (!sheetId) {
      return NextResponse.json({ 
        error: 'No sheet configured',
        debug: { 
          googleId,
          internalUserId,
          checkedKey: `user:${internalUserId}:activeSheet`
        }
      }, { status: 400 });
    }

    // Fetch sheet metadata
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: 'Failed to fetch sheet data',
        details: errorText
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
