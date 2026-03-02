import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { appendSheetRow } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { getGoogleSheetsClient } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.sheetId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheetId = session.user.sheetId;
    const orgId = session.user.organizationId || 'default-org';
    
    // Cache first (5 min)
    const cacheKey = `org:${orgId}:followups`;
    const cached = await redis.get(cacheKey);  // Add: import { redis } from '@/lib/redis';
    if (cached) return NextResponse.json(typeof cached === 'string' ? JSON.parse(cached) : cached);

    // Fetch FOLLOWUPS (matches your CSV + appendSheetRow schema)
    const sheets = await getGoogleSheetsClient();  // Add: import { getGoogleSheetsClient } from '@/lib/googleSheets';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'FOLLOWUPS!A2:H1000',  // Matches your POST: timestamp,enquiryId,userId,followupType,followupNotes,outcome,nextFollowupDate,status
    });

    const rows = response.data.values || [];
    const followups = rows.map((row: string[]) => ({
      followupId: `FU-${row[0]?.slice(-13)}`,  // Generate from timestamp
      enquiryId: row[1],
      userId: row[2],
      followupDate: row[0]?.split('T')[0],
      followupType: row[3],
      followupNotes: row[4],
      outcome: row[5],
      nextFollowupDate: row[6],
      status: row[7],
    }));

    // Cache 5 min
    await redis.setex(cacheKey, 300, JSON.stringify(followups));
    return NextResponse.json(followups);
  } catch (error: any) {
    console.error('Followups GET error:', error);
    return NextResponse.json([], { status: 200 });  // Empty on error
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enquiryId, followupType, followupNotes, outcome, nextFollowupDate } = body;

    const userId = session.user.email;

    // Append to FOLLOWUPS tab
    await appendSheetRow('FOLLOWUPS', [
      new Date().toISOString(), // Timestamp
      enquiryId,
      userId,
      followupType,
      followupNotes,
      outcome || '',
      nextFollowupDate || '',
      'pending'
    ]);

    return NextResponse.json({ success: true, message: 'Follow-up added successfully' });
  } catch (error: any) {
    console.error('Error adding follow-up:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add follow-up' },
      { status: 500 }
    );
  }
}