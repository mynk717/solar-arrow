import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchProjectStages, appendSheetRow } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enquiryId, stage, status, notes } = await request.json();

    const stages = await fetchProjectStages();
    const existing = stages.find((s: any) => s.enquiryId === enquiryId && s.stage === stage);

    if (existing) {
      // Update existing stage
      // TODO: Implement update logic
    } else {
      // Create new stage entry
      const userId = session.user.email;

      await appendSheetRow('PROJECT_STAGES', [
        enquiryId,
        stage,
        status,
        new Date().toISOString(),
        notes || '',
        userId
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update stage' },
      { status: 500 }
    );
  }
}