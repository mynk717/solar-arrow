import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { appendSheetRow } from '@/lib/googleSheets';

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