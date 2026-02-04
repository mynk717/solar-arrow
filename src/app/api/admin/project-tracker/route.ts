import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchEnquiries } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all enquiries
    const enquiries = await fetchEnquiries();

    // Transform to project tracker format
    const projects = enquiries.map((enquiry) => ({
      id: enquiry.id || '',
      customerName: enquiry.customerName || '',
      capacity: enquiry.capacity || 0,
      status: enquiry.status,
      currentStage: getCurrentStage(enquiry),
      daysInStage: calculateDaysInStage(enquiry),
      lastFollowupDate: enquiry.lastFollowupDate,
      nextActionDate: enquiry.nextActionDate,
      allottedUser: enquiry.allottedUser || '',
      priority: enquiry.priority || 'medium',
      isBlocked: enquiry.isBlocked || false,
      blockedReason: enquiry.blockedReason,
      // Government portal fields
      consumerRegistrationNumber: enquiry.consumerRegistrationNumber,
      applicationNumber: enquiry.applicationNumber,
      // Stage dates for tracking
      surveyDate: enquiry.surveyDate,
      registrationDate: enquiry.registrationDate,
      paymentDate: enquiry.paymentDate,
      quotationDate: enquiry.quotationDate,
      installationCompletedDate: enquiry.installationCompletedDate,
      inspectionDate: enquiry.inspectionDate,
      subsidyDisbursedDate: enquiry.subsidyDisbursedDate,
    }));

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching project tracker data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

function getCurrentStage(enquiry: any): string {
  if (enquiry.subsidyDisbursedDate) return 'Subsidy';
  if (enquiry.inspectionDate) return 'Inspection';
  if (enquiry.installationCompletedDate) return 'Installation';
  if (enquiry.quotationDate) return 'Quotation';
  if (enquiry.paymentDate) return 'Payment';
  if (enquiry.registrationDate) return 'Registration';
  if (enquiry.surveyDate) return 'Survey';
  return 'Survey';
}

function calculateDaysInStage(enquiry: any): number {
  const now = new Date();
  let stageStartDate: Date | undefined;

  // Find the most recent stage completion date
  if (enquiry.inspectionDate) {
    stageStartDate = new Date(enquiry.inspectionDate);
  } else if (enquiry.installationCompletedDate) {
    stageStartDate = new Date(enquiry.installationCompletedDate);
  } else if (enquiry.quotationDate) {
    stageStartDate = new Date(enquiry.quotationDate);
  } else if (enquiry.paymentDate) {
    stageStartDate = new Date(enquiry.paymentDate);
  } else if (enquiry.registrationDate) {
    stageStartDate = new Date(enquiry.registrationDate);
  } else if (enquiry.surveyDate) {
    stageStartDate = new Date(enquiry.surveyDate);
  } else {
    stageStartDate = enquiry.createdAt ? new Date(enquiry.createdAt) : new Date();
  }

  const diffTime = Math.abs(now.getTime() - stageStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}