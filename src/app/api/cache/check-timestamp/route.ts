import { NextRequest, NextResponse } from 'next/server';
import { getCacheTimestamp } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
    }

    const timestamp = await getCacheTimestamp(orgId);

    return NextResponse.json({ 
      timestamp,
      hasCache: timestamp !== null 
    });
  } catch (error: any) {
    console.error('Error checking cache timestamp:', error);
    return NextResponse.json({ error: 'Failed to check cache' }, { status: 500 });
  }
}
