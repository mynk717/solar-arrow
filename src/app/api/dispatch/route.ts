// src/app/api/dispatch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { fetchEnquiries } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiries = await fetchEnquiries();
    
    // Filter enquiries ready for dispatch (payment done, not yet dispatched)
    const dispatchData = enquiries
      .filter((enq: any) => 
        enq.paymentDate && enq.registrationId
      )
      .map((enq: any) => ({
        id: enq.id,
        customerName: enq.customerName,
        capacity: enq.capacity,
        address: formatAddress(enq),
        registrationId: enq.registrationId || enq.consumerRegistrationNumber,
        
        // Determine dispatch status
        status: determineDispatchStatus(enq),
        
        // Materials summary
        materials: generateMaterialsSummary(parseFloat(enq.capacity) || 0),
        
        // Dispatch tracking
        dispatchDate: enq.dispatchDate || enq.solarPlantInstallationDate,
        trackingNumber: enq.trackingNumber,
        transportCompany: enq.transportCompany,
        expectedDelivery: calculateExpectedDelivery(enq.dispatchDate),
        deliveredDate: enq.installationCompletedDate || enq.deliveredDate,
        
        // Additional fields
        consumerNumber: enq.consumerNumber,
        phone: enq.phone,
        applicationNumber: enq.applicationNumber,
      }));

    return NextResponse.json({ dispatches: dispatchData });
  } catch (error: any) {
    console.error('Error fetching dispatch data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dispatch data' },
      { status: 500 }
    );
  }
}

function formatAddress(enq: any): string {
  return enq.address || enq.consumerAddress || `${enq.area || ''}, ${enq.city || 'Raipur'}`.trim();
}

function determineDispatchStatus(enq: any): string {
  if (enq.installationCompletedDate || enq.deliveredDate) return 'delivered';
  if (enq.dispatchDate || enq.solarPlantInstallationDate) return 'dispatched';
  if (enq.paymentDate) return 'ready-for-dispatch';
  return 'pending';
}

function generateMaterialsSummary(capacityKW: number): string[] {
  const numPanels = Math.ceil((capacityKW * 1000) / 580);
  return [
    `${numPanels}x Solar Panels`,
    '1x Inverter',
    'Mounting Structure',
    'Cables & Accessories',
  ];
}

function calculateExpectedDelivery(dispatchDate: any): Date | null {
  if (!dispatchDate) return null;
  const dispatch = new Date(dispatchDate);
  dispatch.setDate(dispatch.getDate() + 3); // Add 3 days for delivery
  return dispatch;
}
