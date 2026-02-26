import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import {redis} from '@/lib/redis';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?.sheetId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheetId = session.user.sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';

    // Cache 2 minutes
    const cacheKey = `org:${orgId}:activities`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(typeof cached === 'string' ? JSON.parse(cached) : cached);
    }

    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      // Columns: logId, enquiryId, userId, action, fieldName, oldValue, newValue, timestamp
      range: 'ACTIVITY_LOG!A2:H1000',
    });

    const rows = response.data.values || [];

    const activities = rows
      .filter((row: string[]) => row[0] && row[7]) // must have logId and timestamp
      .map((row: string[]) => ({
        logId:      row[0] || '',
        enquiryId:  row[1] || '',
        userId:     row[2] || '',
        action:     row[3] || '',
        fieldName:  row[4] || '',
        oldValue:   row[5] || '',
        newValue:   row[6] || '',
        timestamp:  row[7] || '',
      }))
      .sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 100); // last 100 entries max

    await redis.setex(cacheKey, 120, JSON.stringify(activities));

    return NextResponse.json(activities);
  } catch (error: any) {
    console.error('[/api/activities] Error:', error);
    // Return empty array — never crash dashboard over activity log
    return NextResponse.json([]);
  }
}
