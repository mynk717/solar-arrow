// src/app/api/survey/list/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchSurveys } from '@/lib/googleSheets';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const surveys = await fetchSurveys();

    return NextResponse.json({
      success: true,
      surveys,
      count: surveys.length,
    });
  } catch (error: any) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}
