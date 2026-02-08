import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';

// Activity type definition
interface Activity {
  timestamp: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  details: string;
  metadata: Record<string, any>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leadId } = await params;

    // Fetch activities from ACTIVITY_LOG tab for this lead
    const sheetId = session.user.sheetId;

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet ID not found' }, { status: 400 });
    }

    // Get Google Sheets client
    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ACTIVITY_LOG!A2:G10000', // timestamp, entityType, entityId, action, performedBy, details, metadata
    });

    const rows = response.data.values || [];

    // Filter activities for this lead and map to typed objects
    const activities: Activity[] = rows
      .filter((row: string[]) => row[1] === 'lead' && row[2] === leadId)
      .map((row: string[]) => ({
        timestamp: row[0] || '',
        entityType: row[1] || '',
        entityId: row[2] || '',
        action: row[3] || '',
        performedBy: row[4] || '',
        details: row[5] || '',
        metadata: row[6] ? JSON.parse(row[6]) : {},
      }))
      .sort((a: Activity, b: Activity) => {
        // Most recent first
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

    return NextResponse.json(activities);
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}