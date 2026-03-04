// src/app/api/quotations/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createQuotation, getNextQuotationId } from '@/lib/googleSheets';
import {
  generatePublicToken,
  generatePublicUrl,
  calculateValidityDate,
  calculateGST,
} from '@/lib/quotations';
import type { Quotation } from '@/lib/quotations';
import { redis } from '@/lib/redis';

// ✅ Send Telegram notification for new quotation
async function sendTelegramNotification(quotation: Quotation) {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!telegramBotToken) {
    console.warn('⚠️ Telegram bot token not configured');
    return;
  }

  try {
    // Get quotation team chat ID from Redis
    const chatId = await redis.get(`org:${quotation.organizationId}:telegram:quotationteam`);
    
    if (!chatId) {
      console.warn('⚠️ No quotation team chat ID configured');
      return;
    }

    const message = `
🆕 *NEW QUOTATION CREATED*

*Quotation ID:* ${quotation.quotationId}
*Reference:* ${quotation.referenceNumber}

*Customer Details:*
👤 Name: ${quotation.customerName}
📱 Phone: ${quotation.customerPhone}
📧 Email: ${quotation.customerEmail || 'N/A'}
📍 Location: ${quotation.location}

*System Details:*
⚡ Capacity: ${quotation.systemCapacity} kW
🔌 Type: ${quotation.systemType}
☀️ Panel: ${quotation.panelMake} (${quotation.panelWattage}Wp × ${quotation.panelQuantity})

*Pricing:*
💰 Base Cost: ₹${quotation.baseCost.toLocaleString('en-IN')}
📊 GST (${quotation.gstPercentage}%): ₹${quotation.gstAmount.toLocaleString('en-IN')}
💵 Final Amount: *₹${quotation.finalAmount.toLocaleString('en-IN')}*

*Status:* Draft
*Created By:* ${quotation.createdBy}
*Valid Until:* ${new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}

📋 *Action Required:* Review and mark as ready to share with customer.
`.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Telegram API error');
    }

    console.log('✅ Telegram notification sent for quotation', quotation.quotationId);
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error);
    // Don't throw - notification failure shouldn't block quotation creation
  }
}

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

    const orgId = (session.user as any).organizationId || 'default-org';
    const orgName = (session.user as any).organizationName || 'Solar Arrow';
    const sheetId = (session.user as any).sheetId;

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const quotationId = await getNextQuotationId(orgId);
const counter = parseInt(quotationId.replace('QT-', ''), 10);


    // Generate security token
    const publicToken = generatePublicToken();

    // Calculate GST
    const baseCost = parseFloat(body.baseCost);
    const gstPercentage = parseFloat(body.gstPercentage || 18);
    const gstAmount = calculateGST(baseCost, gstPercentage);
    const totalCost = baseCost + gstAmount;
    const subsidyAmount = parseFloat(body.subsidyAmount || 0);
    const finalAmount = totalCost - subsidyAmount;

    // Create quotation object
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
      customerEmail: body.customerEmail,
      customerAddress: body.customerAddress,
      location: body.location,
      premisesType: body.premisesType || 'Residence',

      // System
      systemCapacity: parseFloat(body.systemCapacity),
      systemType: body.systemType || 'On-Grid',
      panelType: body.panelType || 'RTS DCR',

      // Components
      panelMake: body.panelMake,
      panelModel: body.panelModel || '',
      panelWattage: parseFloat(body.panelWattage),
      panelQuantity: parseInt(body.panelQuantity),
      panelWarranty: body.panelWarranty,

      inverterMake: body.inverterMake,
      inverterModel: body.inverterModel,
      inverterCapacity: parseFloat(body.inverterCapacity),
      inverterQuantity: parseInt(body.inverterQuantity),
      inverterWarranty: body.inverterWarranty,

      structureType: body.structureType,
      structureMake: body.structureMake,
      structureWarranty: body.structureWarranty,

      bosItems: body.bosItems,
      bosWarranty: body.bosWarranty,

      cableMake: body.cableMake,
      cableWarranty: body.cableWarranty,

      earthingType: body.earthingType,
      earthingQuantity: parseInt(body.earthingQuantity),
      earthingWarranty: body.earthingWarranty,

      lightningArrestorType: body.lightningArrestorType,
      lightningArrestorQuantity: parseInt(body.lightningArrestorQuantity),
      lightningArrestorWarranty: body.lightningArrestorWarranty,

      // Services
      maintenanceYears: parseInt(body.maintenanceYears || 5),
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
      advancePercentage: parseFloat(body.advancePercentage || 70),
      preDispatchPercentage: parseFloat(body.preDispatchPercentage || 20),
      preGridPercentage: parseFloat(body.preGridPercentage || 10),
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
      termsAndConditions: body.termsAndConditions || 'Standard T&C as per company policy',
      loanAvailable: body.loanAvailable !== false,
      loanInterestRate: body.loanInterestRate ? parseFloat(body.loanInterestRate) : 6.0,

      // Company Details (from session or body)
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

    // ✅ Send Telegram notification (non-blocking)
    sendTelegramNotification(quotation).catch(err => 
      console.error('Telegram notification failed:', err)
    );

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
