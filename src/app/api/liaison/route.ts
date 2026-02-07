import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchEnquiries } from '@/lib/googleSheets';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiries = await fetchEnquiries();
    
    // Filter only liaisons (enquiries with installation completed)
    const liaisons = enquiries.filter(e => 
      e.installationDate && 
      (e.status === 'installation-completed' || 
       e.status === 'inspection-approved' || 
       e.status === 'active')
    );

    return NextResponse.json(liaisons);
  } catch (error: any) {
    console.error('Error fetching liaisons:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
