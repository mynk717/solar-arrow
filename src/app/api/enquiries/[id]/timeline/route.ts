import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/lib/redis';
import { getGoogleSheetsClient } from '@/lib/googleSheets';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: enquiryId } = await params;
    const orgId = session.user.organizationId;

    // Always include current active sheet + any historical sheets
const historicalSheets = await redis.get(`org:${orgId}:sheetHistory`) as any[] || [];
const currentSheetId = session.user.sheetId;
const sheetHistory = [
  ...(currentSheetId ? [{ sheetId: currentSheetId }] : []),
  ...historicalSheets.filter((s: any) => s.sheetId !== currentSheetId),
];

    
    const allActivities = [];
    
    // Read ACTIVITY_LOG from each sheet
    for (const sheet of sheetHistory) {
      try {
        const sheets = await getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheet.sheetId,
          range: 'ACTIVITY_LOG!A2:H', // logId,enquiryId,userId,action,fieldName,oldValue,newValue,timestamp
        });
        
        const rows = response.data.values || [];
        const sheetActivities = rows
          .filter((row: string[]) => row[1] === enquiryId)
          .map((row: string[]) => ({
            timestamp: row[7],
            action: row[3],
            userId: row[2],
            details: row[4],
            sheetId: sheet.sheetId,
          }));
        
        allActivities.push(...sheetActivities);
      } catch (e) {
        console.log(`No ACTIVITY_LOG in old sheet ${sheet.sheetId}`);
      }
    }

    // Sort by time, newest first
    const timeline = allActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // last 50

    return NextResponse.json({ timeline });
  } catch (error: any) {
    console.error('Timeline error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}
