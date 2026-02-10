import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated. Please login first.',
        debug: 'No session found'
      }, { status: 401 });
    }

    // Get access token from Redis
    const accessToken = await redis.get(`token:${session.user.email}:access`);
    const sheetId = session.googleSheetId || await redis.get(`user:${session.user.email}:sheetId`);

    if (!accessToken) {
      return NextResponse.json({ 
        error: 'No access token found. Please re-login.',
        debug: 'Token missing in Redis'
      }, { status: 401 });
    }

    if (!sheetId) {
      return NextResponse.json({ 
        error: 'No Google Sheet configured. Please complete onboarding.',
        debug: 'Sheet ID missing'
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
        debug: errorText
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
