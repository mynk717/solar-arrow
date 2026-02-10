import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getValidAccessToken } from '@/lib/tokenRefresh';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.userId || !session?.googleSheetId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const accessToken = await getValidAccessToken(
      session.userId,
      session.refreshToken || ''
    );
    const sheetId = session.googleSheetId;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch sheet metadata: ${errorText}`);
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
    console.error('Error checking sheets:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
