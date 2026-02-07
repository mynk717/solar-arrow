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
    
    // Filter enquiries that are ready for registration or already registered
    const registrations = enquiries
      .filter(e => e.quotationStatus === 'approved' || e.consumerRegistrationNumber)
      .map(e => ({
        id: e.id,
        customerName: e.customerName,
        phone: e.phone,
        email: e.email,
        capacity: e.capacity,
        area: e.area,
        address: e.address,
        consumerRegistrationNumber: e.consumerRegistrationNumber,
        applicationNumber: e.applicationNumber,
        registrationId: e.registrationId,
        registrationDate: e.registrationDate,
        vendorName: e.vendorName,
        vendorAgreementNumber: e.vendorAgreementNumber,
        status: e.status,
        registrationStage: e.registrationStage || 'not_started',
        documents: [], // TODO: Fetch from storage
        approvalDate: e.feasibilityApprovalDate,
        feasibilityApprovalDate: e.feasibilityApprovalDate,
        discomCircle: e.discomCircle,
        discomDivision: e.discomDivision,
        discomSubDivision: e.discomSubDivision,
      }));

    return NextResponse.json(registrations);
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
