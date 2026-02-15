// src/app/api/quotations/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createQuotation, fetchAllQuotations } from '@/lib/googleSheets';
import QRCode from 'qrcode';
import { 
  generatePublicToken, 
  generatePublicUrl, 
  calculateValidityDate, 
  calculateGST 
} from '@/lib/quotations';
// ✅ FIX: Import type separately to avoid circular dependency
import type { Quotation } from '@/lib/quotations';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin, owner, sales can create quotations
    const userRole = (session.user as any).role || 'user';
    if (!['admin', 'owner', 'sales'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    
    // ✅ FIX: Validate required fields BEFORE any other operations
    const requiredFields = ['customerName', 'customerPhone', 'systemCapacity', 'baseCost'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const orgId = (session.user as any).organizationId || 'hope-energy';
    const orgName = (session.user as any).organizationName || 'Solar Arrow';
    const sheetId = (session.user as any).sheetId;

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    // ✅ FIX: Get current quotation count safely
    let counter = 1;
    try {
      const existingQuotations = await fetchAllQuotations(orgId);
      counter = existingQuotations.length + 1;
    } catch (error) {
      console.warn('⚠️ Could not fetch existing quotations, using counter 1');
    }

    const quotationId = `QT-${String(counter).padStart(3, '0')}`;

    // Generate security token
    const publicToken = generatePublicToken();

    // Calculate GST
    const baseCost = parseFloat(body.baseCost);
    const gstPercentage = parseFloat(body.gstPercentage || '8.9');
    const gstAmount = calculateGST(baseCost, gstPercentage);
    const totalCost = baseCost + gstAmount;
    const subsidyAmount = parseFloat(body.subsidyAmount || '0');
    const finalAmount = totalCost - subsidyAmount;

    // ✅ FIX: Create quotation object WITHOUT circular references
    const quotation: Quotation = {
      // Multi-tenant
      organizationId: orgId,
      organizationName: orgName,
      sheetId: sheetId,

      // Basic
      quotationId: quotationId,
      referenceNumber: body.referenceNumber || `${orgId.toUpperCase()}-${body.location}-${String(counter).padStart(3, '0')}`,
      leadId: body.leadId || undefined,
      enquiryId: body.enquiryId || undefined,
      quotationType: body.quotationType || 'Initial',

      // Customer
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || '',
      customerAddress: body.customerAddress || '',
      location: body.location || '',
      premisesType: body.premisesType || 'Residence',

      // System
      systemCapacity: parseFloat(body.systemCapacity),
      systemType: body.systemType || 'On-Grid',
      panelType: body.panelType || 'RTS DCR',

      // Components
      panelMake: body.panelMake || '',
      panelModel: body.panelModel || '',
      panelWattage: parseFloat(body.panelWattage || '0'),
      panelQuantity: parseInt(body.panelQuantity || '0'),
      panelWarranty: body.panelWarranty || '',
      inverterMake: body.inverterMake || '',
      inverterModel: body.inverterModel || '',
      inverterCapacity: parseFloat(body.inverterCapacity || '0'),
      inverterQuantity: parseInt(body.inverterQuantity || '1'),
      inverterWarranty: body.inverterWarranty || '',
      structureType: body.structureType || '',
      structureMake: body.structureMake || '',
      structureWarranty: body.structureWarranty || '',
      bosItems: body.bosItems || '',
      bosWarranty: body.bosWarranty || '',
      cableMake: body.cableMake || '',
      cableWarranty: body.cableWarranty || '',
      earthingType: body.earthingType || '',
      earthingQuantity: parseInt(body.earthingQuantity || '0'),
      earthingWarranty: body.earthingWarranty || '',
      lightningArrestorType: body.lightningArrestorType || '',
      lightningArrestorQuantity: parseInt(body.lightningArrestorQuantity || '0'),
      lightningArrestorWarranty: body.lightningArrestorWarranty || '',

      // Services
      maintenanceYears: parseInt(body.maintenanceYears || '5'),
      gridConnectivityIncluded: body.gridConnectivityIncluded !== false,
      netMeteringIncluded: body.netMeteringIncluded !== false,

      // Pricing
      baseCost: baseCost,
      gstPercentage: gstPercentage,
      gstAmount: gstAmount,
      totalCost: totalCost,
      subsidyAmount: subsidyAmount,
      finalAmount: finalAmount,

      // Payment Terms
      advancePercentage: parseFloat(body.advancePercentage || '70'),
      preDispatchPercentage: parseFloat(body.preDispatchPercentage || '20'),
      preGridPercentage: parseFloat(body.preGridPercentage || '10'),
      paymentTerms: body.paymentTerms || '70% Advance with PO, 20% before Despatch, 10% before Grid synchronization',

      // Tracking
      status: 'Draft',
      createdBy: session.user.email,
      createdDate: new Date().toISOString(),
      viewCount: 0,
      validUntilDate: calculateValidityDate(30).toISOString(),

      // Security & URLs
      publicToken: publicToken,
      publicUrl: generatePublicUrl(orgId, quotationId, publicToken),

      // Additional
      notes: body.notes || '',
      termsAndConditions: body.termsAndConditions || 'Standard TC as per company policy',
      loanAvailable: body.loanAvailable !== false,
      loanInterestRate: body.loanInterestRate ? parseFloat(body.loanInterestRate) : 6.0,

      // Company Details
      companyName: body.companyName || orgName,
      companyGst: body.companyGst || '',
      companyUdyam: body.companyUdyam || '',
      companyCspdclReg: body.companyCspdclReg || '',
      companyBankName: body.companyBankName || '',
      companyAccountNumber: body.companyAccountNumber || '',
      companyIfsc: body.companyIfsc || '',
      companyAddress: body.companyAddress || '',
      companyPhone: body.companyPhone || '',
      companyEmail: body.companyEmail || session.user.email,
    };

    // Save to Google Sheets
    await createQuotation(quotation);

    console.log(`✅ Created quotation ${quotationId} for ${orgName}`);

    
    return NextResponse.json({
      success: true,
      quotation: {
        quotationId: quotation.quotationId,
        publicUrl: quotation.publicUrl,
        referenceNumber: quotation.referenceNumber,
      },
    });
  } catch (error: any) {
    console.error('❌ Error creating quotation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create quotation' },
      { status: 500 }
    );
  }
}
