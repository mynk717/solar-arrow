// src/app/api/bom/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { fetchEnquiryById } from '@/lib/googleSheets';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Fetch enquiry data
    const enquiry = await fetchEnquiryById(id);
    
    if (!enquiry) {
      return NextResponse.json({ error: 'BOM not found' }, { status: 404 });
    }

    // Generate HTML content for PDF
    const htmlContent = generateBOMHTML(enquiry);

    // For now, return HTML that can be printed as PDF
    // In production, use a library like puppeteer or @react-pdf/renderer
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="BOM-${id}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating BOM PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateBOMHTML(enquiry: any): string {
  const materials = calculateMaterialsBOM(parseFloat(enquiry.capacity) || 0);
  const totalCost = materials.reduce((sum: number, mat: any) => sum + mat.total, 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Bill of Materials - ${enquiry.id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f3f4f6; font-weight: 600; }
    .total { font-weight: bold; background-color: #dbeafe; }
    .header-info { margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Bill of Materials</h1>
  
  <div class="header-info">
    <p><strong>BOM ID:</strong> ${enquiry.id}</p>
    <p><strong>Customer Name:</strong> ${enquiry.customerName}</p>
    <p><strong>Registration ID:</strong> ${enquiry.registrationId || 'N/A'}</p>
    <p><strong>Capacity:</strong> ${enquiry.capacity}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>S.No.</th>
        <th>Item Description</th>
        <th>Quantity</th>
        <th>Unit</th>
        <th>Unit Price (₹)</th>
        <th>Total (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${materials.map((mat: any, idx: number) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${mat.item}</td>
          <td>${mat.quantity}</td>
          <td>${mat.unit}</td>
          <td>${mat.unitPrice.toLocaleString()}</td>
          <td>${mat.total.toLocaleString()}</td>
        </tr>
      `).join('')}
      <tr class="total">
        <td colspan="5" style="text-align: right;">Grand Total</td>
        <td>₹${totalCost.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 40px;">
    <p><strong>Prepared By:</strong> ${enquiry.allottedUser || 'Hope Energy'}</p>
    <p><strong>Organization:</strong> Hope Energy</p>
  </div>
</body>
</html>
  `.trim();
}

function calculateMaterialsBOM(capacityKW: number) {
  const panelWattage = 580;
  const numPanels = Math.ceil((capacityKW * 1000) / panelWattage);
  
  return [
    {
      item: `Solar Panels ${panelWattage}W (Waaree)`,
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
      item: 'AC/DC Cables & Accessories',
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
      item: 'Installation Labor & Supervision',
      quantity: 1,
      unit: 'set',
      unitPrice: capacityKW * 2800,
      total: capacityKW * 2800,
    },
  ];
}
