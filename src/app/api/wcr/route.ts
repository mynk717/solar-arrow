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
    
    // Filter enquiries that have completed installation
    const wcrs = enquiries
      .filter(e => e.installationCompletedDate || (e.installationDate && e.status === 'installation-completed'))
      .map(e => ({
        id: e.id,
        customerName: e.customerName,
        capacity: e.capacity,
        registrationId: e.registrationId,
        installationDate: e.installationDate,
        installationCompletedDate: e.installationCompletedDate,
        installedBy: e.installedBy,
        installationTeam: e.installationTeam,
        wcrStatus: e.wcrStatus || 'pending',
        wcrSubmittedDate: e.wcrSubmittedDate,
        wcrApprovedDate: e.wcrApprovedDate,
        photos: [], // TODO: Fetch from storage
        checklist: {
          panelsInstalled: e.panelsInstalled || false,
          inverterInstalled: e.inverterInstalled || false,
          wiringComplete: e.wiringComplete || false,
          earthingDone: e.earthingDone || false,
          safetyMeasures: e.safetyMeasures || false,
          systemTested: e.systemTested || false,
          customerBriefed: e.customerBriefed || false,
        },
        pvModuleSerialNumbers: e.pvModuleSerialNumbers,
        inverterSerialNumber: e.inverterSerialNumber,
        meterNumber: e.meterNumber,
        installationNotes: e.installationNotes,
      }));

    return NextResponse.json(wcrs);
  } catch (error: any) {
    console.error('Error fetching WCRs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
