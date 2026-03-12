// src/app/api/enquiries/list/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchEnquiries } from '@/lib/googleSheets';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiries = await fetchEnquiries();

    enquiries.sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

    return NextResponse.json({
      success: true,
      enquiries: enquiries || [],
    });
  } catch (error: any) {
    console.error('❌ Error fetching enquiries list:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch enquiries' },
      { status: 500 }
    );
  }
}
