import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchEnquiryById } from '@/lib/googleSheets';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quotationId } = await request.json();

    if (!quotationId) {
      return NextResponse.json({ error: 'Missing quotation ID' }, { status: 400 });
    }

    // Extract enquiry ID from quotation ID (QUOT-001 -> ENQ-001)
    const enquiryId = quotationId.replace('QUOT-', 'ENQ-');
    const enquiry = await fetchEnquiryById(enquiryId);

    if (!enquiry) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Company Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Solar Arrow', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Solar Solutions', pageWidth / 2, 27, { align: 'center' });
    doc.text('Contact: +91-XXXXXXXXXX | Email: info@solararrow.com', pageWidth / 2, 32, { align: 'center' });

    // Quotation Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLAR INSTALLATION QUOTATION', pageWidth / 2, 45, { align: 'center' });

    // Quotation Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quotation No: ${quotationId}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Valid Till: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, 20, 65);

    // Customer Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details:', 20, 78);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${enquiry.customerName}`, 20, 85);
    doc.text(`Address: ${enquiry.address}`, 20, 90);
    doc.text(`Phone: ${enquiry.phone}`, 20, 95);
    doc.text(`Email: ${enquiry.email || 'N/A'}`, 20, 100);

    // System Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('System Details:', 20, 113);

    const systemDetails = [
      ['Description', 'Specification', 'Quantity', 'Unit Price', 'Amount'],
      [
        'Solar Panels (330W)',
        enquiry.panelType || 'Monocrystalline',
        `${Math.ceil(enquiry.capacity * 3)}`,
        `₹${Math.round((enquiry.systemCost || 0) * 0.4 / Math.ceil(enquiry.capacity * 3))}`,
        `₹${Math.round((enquiry.systemCost || 0) * 0.4).toLocaleString()}`
      ],
      [
        'Solar Inverter',
        `${enquiry.capacity} kW`,
        '1',
        `₹${Math.round((enquiry.systemCost || 0) * 0.3)}`,
        `₹${Math.round((enquiry.systemCost || 0) * 0.3).toLocaleString()}`
      ],
      [
        'Mounting Structure',
        'Galvanized Steel',
        '1 Set',
        `₹${Math.round((enquiry.systemCost || 0) * 0.15)}`,
        `₹${Math.round((enquiry.systemCost || 0) * 0.15).toLocaleString()}`
      ],
      [
        'Installation & Wiring',
        'Complete Setup',
        '1',
        `₹${Math.round((enquiry.systemCost || 0) * 0.15)}`,
        `₹${Math.round((enquiry.systemCost || 0) * 0.15).toLocaleString()}`
      ],
    ];

    (doc as any).autoTable({
      startY: 118,
      head: [systemDetails[0]],
      body: systemDetails.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });

    // Cost Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total System Cost:`, pageWidth - 80, finalY);
    doc.text(`₹${(enquiry.systemCost || 0).toLocaleString()}`, pageWidth - 20, finalY, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 150, 0);
    doc.text(`Government Subsidy:`, pageWidth - 80, finalY + 7);
    doc.text(`- ₹${(enquiry.subsidyAmount || 0).toLocaleString()}`, pageWidth - 20, finalY + 7, { align: 'right' });

    doc.setDrawColor(0);
    doc.line(pageWidth - 80, finalY + 10, pageWidth - 15, finalY + 10);

    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text(`Final Amount Payable:`, pageWidth - 80, finalY + 17);
    doc.text(`₹${(enquiry.finalCost || 0).toLocaleString()}`, pageWidth - 20, finalY + 17, { align: 'right' });

    // Terms & Conditions
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Terms & Conditions:', 20, finalY + 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const terms = [
      '1. Quotation valid for 30 days from the date of issue',
      '2. Subsidy amount subject to government approval',
      '3. Installation to be completed within 15 days of payment',
      '4. 25-year warranty on solar panels, 5-year warranty on inverter',
      '5. Free maintenance for first year',
      '6. Payment terms: 50% advance, 50% on completion',
    ];

    let termY = finalY + 37;
    terms.forEach(term => {
      doc.text(term, 20, termY);
      termY += 5;
    });

    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for choosing Solar Arrow!', pageWidth / 2, 280, { align: 'center' });
    doc.text('For queries, contact us at info@solararrow.com', pageWidth / 2, 285, { align: 'center' });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${quotationId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
