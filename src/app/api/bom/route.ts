// src/app/api/bom/route.ts
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

    // Fetch enquiries with BOM-relevant data
    const enquiries = await fetchEnquiries();
    
    // Filter for enquiries that have reached payment/installation stage
    const bomsData = enquiries
      .filter((enq: any) => 
        enq.registrationId && 
        (enq.paymentDate || enq.installationDate || enq.status === 'installation')
      )
      .map((enq: any) => ({
        id: enq.id,
        customerName: enq.customerName,
        capacity: enq.capacity,
        registrationId: enq.registrationId || enq.consumerRegistrationNumber,
        
        // Calculate materials based on capacity
        materials: calculateMaterialsBOM(parseFloat(enq.capacity) || 0),
        
        totalCost: enq.estimatedCost || calculateTotalCost(parseFloat(enq.capacity) || 0),
        status: determineBOMStatus(enq),
        createdAt: enq.paymentDate || enq.registrationDate || enq.createdAt,
        
        // Additional fields from sheet
        sanctionLoad: enq.sanctionLoad,
        proposedPVCapacity: enq.proposedPVCapacity,
        installedPVModuleCapacity: enq.installedPVModuleCapacity,
        pvModuleMake: enq.pvModuleMake,
        moduleCapacity: enq.moduleCapacity,
        moduleQuantity: enq.moduleQuantity,
        inverterCapacity: enq.inverterCapacity,
        inverterMake: enq.inverterMake,
      }));

    return NextResponse.json({ boms: bomsData });
  } catch (error: any) {
    console.error('Error fetching BOMs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch BOMs' },
      { status: 500 }
    );
  }
}

// Helper function to calculate materials based on capacity
function calculateMaterialsBOM(capacityKW: number) {
  const panelWattage = 580; // Waaree 580W panels
  const numPanels = Math.ceil((capacityKW * 1000) / panelWattage);
  
  return [
    {
      item: `Solar Panels ${panelWattage}W`,
      quantity: numPanels,
      unit: 'units',
      unitPrice: 8500,
      total: numPanels * 8500,
    },
    {
      item: `Inverter ${capacityKW}kW`,
      quantity: 1,
      unit: 'unit',
      unitPrice: capacityKW <= 3 ? 28000 : capacityKW * 9000,
      total: capacityKW <= 3 ? 28000 : capacityKW * 9000,
    },
    {
      item: 'Mounting Structure',
      quantity: 1,
      unit: 'set',
      unitPrice: capacityKW * 7000,
      total: capacityKW * 7000,
    },
    {
      item: 'AC/DC Cables',
      quantity: 1,
      unit: 'set',
      unitPrice: capacityKW * 2500,
      total: capacityKW * 2500,
    },
    {
      item: 'Junction Box',
      quantity: 1,
      unit: 'unit',
      unitPrice: 3000,
      total: 3000,
    },
    {
      item: 'Earthing Kit',
      quantity: 1,
      unit: 'set',
      unitPrice: 5000,
      total: 5000,
    },
    {
      item: 'Installation Labor',
      quantity: 1,
      unit: 'set',
      unitPrice: capacityKW * 2800,
      total: capacityKW * 2800,
    },
  ];
}

function calculateTotalCost(capacityKW: number): number {
  const materials = calculateMaterialsBOM(capacityKW);
  return materials.reduce((sum, mat) => sum + mat.total, 0);
}

function determineBOMStatus(enq: any): string {
  if (enq.installationCompletedDate || enq.installationDate) return 'approved';
  if (enq.paymentDate) return 'approved';
  return 'pending';
}
