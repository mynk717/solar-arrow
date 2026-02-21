// src/lib/googleSheets.ts
import { google } from 'googleapis';
import { Enquiry, EnquiryStatus, PanelTag, PaymentType, SubsidyStatus, BOMLineItem } from './types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getValidAccessToken } from './tokenRefresh';
import { telegramBot } from './telegram'; 
import { redis } from './redis';
import type { Survey } from './types';
import { Quotation, QuotationStatus } from './quotations';
import { 
  cacheSheetData,
  getCachedSheetData,
  invalidateSheetCache,
  getCachedEnquiries,
  getCachedLeads,
  invalidateEnquiriesCache,
  invalidateLeadsCache
} from './redis';
import { notifyLeadCreated } from './telegram';



// ============================================
// AUTHENTICATION
// ============================================

/** Get authenticated Google Sheets client */
async function getAuthClient() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.organizationId) {
    throw new Error('Not authenticated');
  }

  // ✅ FIX: Get ANY admin's token from organization (not user's token)
  const orgAdmins = await redis.smembers(`org:${session.user.organizationId}:admins`);
  
  let accessToken = null;
  for (const adminEmail of orgAdmins) {
    const tokens = await redis.get(`org:${session.user.organizationId}:oauth:${adminEmail}`) as any;
    if (tokens?.accessToken) {
      console.log('✅ Using admin token from:', adminEmail);
      accessToken = tokens.accessToken;
      break;
    }
  }
  
  if (!accessToken) {
    throw new Error('No valid admin token found. Please ensure at least one admin has connected their Google account.');
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  return auth;
}



/** Get Google Sheets API instance */
async function getSheets() {
  const auth = await getAuthClient();
  return google.sheets({ version: 'v4', auth });
}
/** Get Google Sheets API instance (alias for backward compatibility) */
export async function getGoogleSheetsClient() {
  return await getSheets();
}

/** Get Sheet ID from Redis (not from session) */
async function getSheetId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    throw new Error('Not authenticated');
  }

  // ✅ ALWAYS fetch fresh from Redis, not from session token
  const org = await redis.get(`org:${session.user.organizationId}:info`) as any;
  
  if (!org?.sheetId) {
    throw new Error('No sheet ID configured. Please connect your Google Sheet in Settings.');
  }

  return org.sheetId;
}


/** Get organization ID from session (works for both admin and users) */
async function getOrgId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    throw new Error('No organization found');
  }
  return session.user.organizationId;
}

// ============================================
// DATA CONVERSION HELPERS
// ============================================

/** Convert row array to Enquiry object */
function rowToEnquiry(row: any[]): Enquiry | null {
  if (!row || row.length < 7) return null;

  const [
    id, customerName, phone, email, address, area, capacity, status,
    createdAt, updatedAt, panelTag,
    // Lead fields (7 fields) - NEW
    leadSource, leadNotes, leadQualified, leadQualifiedDate, leadConvertedDate, leadAssignedTo, leadStatus,
    // Survey (8 fields)
    surveyDate, surveyedBy, surveyNotes, surveyApproved, surveyScheduledDate, surveyCompletedDate, surveyRejectedReason, surveyPhotos,
    // Loan (14 fields)
    loanRequired, loanBank, loanBranch, loanAmount, loanApplicationDate, loanSanctionDate, loanRejectionDate, loanRejectionReason,
    loanFirstTrancheAmount, loanFirstTrancheDate, loanSecondTrancheAmount, loanSecondTrancheDate, loanStatus, loanAccountNumber,
    // Government Portal (9 fields)
    consumerRegistrationNumber, applicationNumber, discomCircle, discomDivision, discomSubDivision, feasibilityApprovalDate, feasibilityApprovalNumber, vendorAgreementDate, vendorAgreementNumber,
    // Vendor Agreement (5 fields)
    vendorName, vendorCompanyName, vendorAgreementAmount, vendorAgreementSignedDate, vendorAgreementDocumentPath,
    // Payment (10 fields)
    estimatedCost, initialPayment, paymentDate, paymentMethod, paymentType, paymentStatus, paymentAccountVerified, paymentVerifiedBy, paymentVerificationDate, paymentUTR,
    // Quotation (7 fields)
    quotationId, quotationDate, quotationAmount, quotationApprovedDate, quotationApprovedBy, quotationRejectedReason, quotationDocumentPath,
    // System Specifications (10 fields)
    systemCapacity, panelMake, panelWattage, panelQuantity, inverterMake, inverterCapacity, batteryRequired, batteryCapacity, batteryQuantity, structureType,
    // Installation (14 fields)
    installationScheduledDate, installationStartDate, installationCompletedDate, installationTeam, installationSupervisor, installationNotes, pvModuleSerialNumbers, inverterSerialNumber, meterNumber, meterInstalledDate, meterReadingInitial, earthingDone, earthingResistance, installationPhotos,
    // Inspection (7 fields)
    inspectionScheduledDate, inspectionDate, inspectionOfficer, inspectionStatus, inspectionApproved, inspectionRejectedReason, inspectionReportPath,
    // Subsidy (10 fields)
    subsidyAmount, subsidyStatus, subsidyAppliedDate, subsidyApprovedDate, subsidyDisbursedDate, subsidyRejectedDate, subsidyRejectionReason, subsidyBankAccount, subsidyUTR, subsidyDocumentPath,
    // Tracking (6 fields)
    allottedUser, priority, isBlocked, blockedReason, lastEditedBy, lastEditedAt,
    lastFollowupDate, nextActionDate,
    // NEW: Extra fields from your sheet
    tags, notes
  ] = row;

  return {
    id: id || '',
    customerName: customerName || '',
    phone: phone || '',
    email: email || '',
    address: address || '',
    area: area || '',
    capacity: parseFloat(capacity) || 3,
    status: (status || 'new') as EnquiryStatus,
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    panelTag: (panelTag || 'RTS') as PanelTag,

    // Survey
    surveyDate: surveyDate ? new Date(surveyDate) : undefined,
    surveyedBy: surveyedBy || undefined,
    surveyNotes: surveyNotes || undefined,
    surveyApproved: surveyApproved === 'TRUE',
    surveyScheduledDate: surveyScheduledDate ? new Date(surveyScheduledDate) : undefined,
    surveyCompletedDate: surveyCompletedDate ? new Date(surveyCompletedDate) : undefined,
    surveyRejectedReason: surveyRejectedReason || undefined,
    surveyPhotos: surveyPhotos || undefined,

    // Loan
    loanRequired: loanRequired === 'TRUE',
    loanBank: loanBank || undefined,
    loanBranch: loanBranch || undefined,
    loanAmount: loanAmount ? parseFloat(loanAmount) : undefined,
    loanApplicationDate: loanApplicationDate ? new Date(loanApplicationDate) : undefined,
    loanSanctionDate: loanSanctionDate ? new Date(loanSanctionDate) : undefined,
    loanRejectionDate: loanRejectionDate ? new Date(loanRejectionDate) : undefined,
    loanRejectionReason: loanRejectionReason || undefined,
    loanFirstTrancheAmount: loanFirstTrancheAmount ? parseFloat(loanFirstTrancheAmount) : undefined,
    loanFirstTrancheDate: loanFirstTrancheDate ? new Date(loanFirstTrancheDate) : undefined,
    loanSecondTrancheAmount: loanSecondTrancheAmount ? parseFloat(loanSecondTrancheAmount) : undefined,
    loanSecondTrancheDate: loanSecondTrancheDate ? new Date(loanSecondTrancheDate) : undefined,
    loanStatus: loanStatus || undefined,
    loanAccountNumber: loanAccountNumber || undefined,

    // Government Portal
    consumerRegistrationNumber: consumerRegistrationNumber || undefined,
    applicationNumber: applicationNumber || undefined,
    discomCircle: discomCircle || undefined,
    discomDivision: discomDivision || undefined,
    discomSubDivision: discomSubDivision || undefined,
    feasibilityApprovalDate: feasibilityApprovalDate ? new Date(feasibilityApprovalDate) : undefined,
    feasibilityApprovalNumber: feasibilityApprovalNumber || undefined,
    vendorAgreementDate: vendorAgreementDate ? new Date(vendorAgreementDate) : undefined,
    vendorAgreementNumber: vendorAgreementNumber || undefined,

    // Vendor
    vendorName: vendorName || undefined,
    vendorCompanyName: vendorCompanyName || undefined,
    vendorAgreementAmount: vendorAgreementAmount ? parseFloat(vendorAgreementAmount) : undefined,
    vendorAgreementSignedDate: vendorAgreementSignedDate ? new Date(vendorAgreementSignedDate) : undefined,
    vendorAgreementDocumentPath: vendorAgreementDocumentPath || undefined,

    // Payment
    estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
    initialPayment: initialPayment ? parseFloat(initialPayment) : undefined,
    paymentDate: paymentDate ? new Date(paymentDate) : undefined,
    paymentMethod: paymentMethod || undefined,
    paymentType: (paymentType || 'Direct') as PaymentType,
    paymentStatus: paymentStatus || undefined,
    paymentAccountVerified: paymentAccountVerified === 'TRUE',
    paymentVerifiedBy: paymentVerifiedBy || undefined,
    paymentVerificationDate: paymentVerificationDate ? new Date(paymentVerificationDate) : undefined,
    paymentUTR: paymentUTR || undefined,

    // Quotation
    quotationId: quotationId || undefined,
    quotationDate: quotationDate ? new Date(quotationDate) : undefined,
    quotationAmount: quotationAmount ? parseFloat(quotationAmount) : undefined,
    quotationApprovedDate: quotationApprovedDate ? new Date(quotationApprovedDate) : undefined,
    quotationApprovedBy: quotationApprovedBy || undefined,
    quotationRejectedReason: quotationRejectedReason || undefined,
    quotationDocumentPath: quotationDocumentPath || undefined,

    // System Specs
    systemCapacity: systemCapacity ? parseFloat(systemCapacity) : undefined,
    panelMake: panelMake || undefined,
    panelWattage: panelWattage ? parseFloat(panelWattage) : undefined,
    panelQuantity: panelQuantity ? parseInt(panelQuantity) : undefined,
    inverterMake: inverterMake || undefined,
    inverterCapacity: inverterCapacity ? parseFloat(inverterCapacity) : undefined,
    batteryRequired: batteryRequired === 'TRUE',
    batteryCapacity: batteryCapacity ? parseFloat(batteryCapacity) : undefined,
    batteryQuantity: batteryQuantity ? parseInt(batteryQuantity) : undefined,
    structureType: structureType || undefined,

    // Installation
    installationScheduledDate: installationScheduledDate ? new Date(installationScheduledDate) : undefined,
    installationStartDate: installationStartDate ? new Date(installationStartDate) : undefined,
    installationCompletedDate: installationCompletedDate ? new Date(installationCompletedDate) : undefined,
    installationTeam: installationTeam || undefined,
    installationSupervisor: installationSupervisor || undefined,
    installationNotes: installationNotes || undefined,
    pvModuleSerialNumbers: pvModuleSerialNumbers || undefined,
    inverterSerialNumber: inverterSerialNumber || undefined,
    meterNumber: meterNumber || undefined,
    meterInstalledDate: meterInstalledDate ? new Date(meterInstalledDate) : undefined,
    meterReadingInitial: meterReadingInitial ? parseFloat(meterReadingInitial) : undefined,
    earthingDone: earthingDone === 'TRUE',
    earthingResistance: earthingResistance ? parseFloat(earthingResistance) : undefined,
    installationPhotos: installationPhotos || undefined,

    // Inspection
    inspectionScheduledDate: inspectionScheduledDate ? new Date(inspectionScheduledDate) : undefined,
    inspectionDate: inspectionDate ? new Date(inspectionDate) : undefined,
    inspectionOfficer: inspectionOfficer || undefined,
    inspectionStatus: inspectionStatus || undefined,
    inspectionApproved: inspectionApproved === 'TRUE',
    inspectionRejectedReason: inspectionRejectedReason || undefined,
    inspectionReportPath: inspectionReportPath || undefined,

    // Subsidy
    subsidyAmount: subsidyAmount ? parseFloat(subsidyAmount) : undefined,
    subsidyStatus: (subsidyStatus || undefined) as SubsidyStatus | undefined,
    subsidyAppliedDate: subsidyAppliedDate ? new Date(subsidyAppliedDate) : undefined,
    subsidyApprovedDate: subsidyApprovedDate ? new Date(subsidyApprovedDate) : undefined,
    subsidyDisbursedDate: subsidyDisbursedDate ? new Date(subsidyDisbursedDate) : undefined,
    subsidyRejectedDate: subsidyRejectedDate ? new Date(subsidyRejectedDate) : undefined,
    subsidyRejectionReason: subsidyRejectionReason || undefined,
    subsidyBankAccount: subsidyBankAccount || undefined,
    subsidyUTR: subsidyUTR || undefined,
    subsidyDocumentPath: subsidyDocumentPath || undefined,

    // Tracking
    allottedUser: allottedUser || undefined,
    priority: (priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
    isBlocked: isBlocked === 'TRUE',
    blockedReason: blockedReason || undefined,
    lastEditedBy: lastEditedBy || undefined,
    lastEditedAt: lastEditedAt ? new Date(lastEditedAt) : undefined,
    lastFollowupDate: lastFollowupDate ? new Date(lastFollowupDate) : undefined,
    nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
  };
}


/** Convert Enquiry object to row array */
function enquiryToRow(enquiry: Enquiry): any[] {
  return [
    enquiry.id || '',
    enquiry.customerName || '',
    enquiry.phone || '',
    enquiry.email || '',
    enquiry.address || '',
    enquiry.area || '',
    enquiry.capacity || '',
    enquiry.status || '',
    enquiry.createdAt?.toISOString().split('T')[0] || '',
    enquiry.updatedAt?.toISOString().split('T')[0] || '',
    enquiry.panelTag || 'RTS',
    // Survey (8)
    enquiry.surveyDate?.toISOString().split('T')[0] || '',
    enquiry.surveyedBy || '',
    enquiry.surveyNotes || '',
    enquiry.surveyApproved ? 'TRUE' : 'FALSE',
    enquiry.surveyScheduledDate?.toISOString().split('T')[0] || '',
    enquiry.surveyCompletedDate?.toISOString().split('T')[0] || '',
    enquiry.surveyRejectedReason || '',
    enquiry.surveyPhotos || '',
    // Loan (14)
    enquiry.loanRequired ? 'TRUE' : 'FALSE',
    enquiry.loanBank || '',
    enquiry.loanBranch || '',
    enquiry.loanAmount || '',
    enquiry.loanApplicationDate?.toISOString().split('T')[0] || '',
    enquiry.loanSanctionDate?.toISOString().split('T')[0] || '',
    enquiry.loanRejectionDate?.toISOString().split('T')[0] || '',
    enquiry.loanRejectionReason || '',
    enquiry.loanFirstTrancheAmount || '',
    enquiry.loanFirstTrancheDate?.toISOString().split('T')[0] || '',
    enquiry.loanSecondTrancheAmount || '',
    enquiry.loanSecondTrancheDate?.toISOString().split('T')[0] || '',
    enquiry.loanStatus || '',
    enquiry.loanAccountNumber || '',
    // Government Portal (9)
    enquiry.consumerRegistrationNumber || '',
    enquiry.applicationNumber || '',
    enquiry.discomCircle || '',
    enquiry.discomDivision || '',
    enquiry.discomSubDivision || '',
    enquiry.feasibilityApprovalDate?.toISOString().split('T')[0] || '',
    enquiry.feasibilityApprovalNumber || '',
    enquiry.vendorAgreementDate?.toISOString().split('T')[0] || '',
    enquiry.vendorAgreementNumber || '',
    // Vendor (5)
    enquiry.vendorName || '',
    enquiry.vendorCompanyName || '',
    enquiry.vendorAgreementAmount || '',
    enquiry.vendorAgreementSignedDate?.toISOString().split('T')[0] || '',
    enquiry.vendorAgreementDocumentPath || '',
    // Payment (10)
    enquiry.estimatedCost || '',
    enquiry.initialPayment || '',
    enquiry.paymentDate?.toISOString().split('T')[0] || '',
    enquiry.paymentMethod || '',
    enquiry.paymentType || 'Direct',
    enquiry.paymentStatus || '',
    enquiry.paymentAccountVerified ? 'TRUE' : 'FALSE',
    enquiry.paymentVerifiedBy || '',
    enquiry.paymentVerificationDate?.toISOString().split('T')[0] || '',
    enquiry.paymentUTR || '',
    // Quotation (7)
    enquiry.quotationId || '',
    enquiry.quotationDate?.toISOString().split('T')[0] || '',
    enquiry.quotationAmount || '',
    enquiry.quotationApprovedDate?.toISOString().split('T')[0] || '',
    enquiry.quotationApprovedBy || '',
    enquiry.quotationRejectedReason || '',
    enquiry.quotationDocumentPath || '',
    // System Specs (10)
    enquiry.systemCapacity || '',
    enquiry.panelMake || '',
    enquiry.panelWattage || '',
    enquiry.panelQuantity || '',
    enquiry.inverterMake || '',
    enquiry.inverterCapacity || '',
    enquiry.batteryRequired ? 'TRUE' : 'FALSE',
    enquiry.batteryCapacity || '',
    enquiry.batteryQuantity || '',
    enquiry.structureType || '',
    // Installation (14)
    enquiry.installationScheduledDate?.toISOString().split('T')[0] || '',
    enquiry.installationStartDate?.toISOString().split('T')[0] || '',
    enquiry.installationCompletedDate?.toISOString().split('T')[0] || '',
    enquiry.installationTeam || '',
    enquiry.installationSupervisor || '',
    enquiry.installationNotes || '',
    enquiry.pvModuleSerialNumbers || '',
    enquiry.inverterSerialNumber || '',
    enquiry.meterNumber || '',
    enquiry.meterInstalledDate?.toISOString().split('T')[0] || '',
    enquiry.meterReadingInitial || '',
    enquiry.earthingDone ? 'TRUE' : 'FALSE',
    enquiry.earthingResistance || '',
    enquiry.installationPhotos || '',
    // Inspection (7)
    enquiry.inspectionScheduledDate?.toISOString().split('T')[0] || '',
    enquiry.inspectionDate?.toISOString().split('T')[0] || '',
    enquiry.inspectionOfficer || '',
    enquiry.inspectionStatus || '',
    enquiry.inspectionApproved ? 'TRUE' : 'FALSE',
    enquiry.inspectionRejectedReason || '',
    enquiry.inspectionReportPath || '',
    // Subsidy (10)
    enquiry.subsidyAmount || '',
    enquiry.subsidyStatus || '',
    enquiry.subsidyAppliedDate?.toISOString().split('T')[0] || '',
    enquiry.subsidyApprovedDate?.toISOString().split('T')[0] || '',
    enquiry.subsidyDisbursedDate?.toISOString().split('T')[0] || '',
    enquiry.subsidyRejectedDate?.toISOString().split('T')[0] || '',
    enquiry.subsidyRejectionReason || '',
    enquiry.subsidyBankAccount || '',
    enquiry.subsidyUTR || '',
    enquiry.subsidyDocumentPath || '',
    // Tracking (6)
    enquiry.allottedUser || '',
    enquiry.priority || 'medium',
    enquiry.isBlocked ? 'TRUE' : 'FALSE',
    enquiry.blockedReason || '',
    enquiry.lastEditedBy || '',
    enquiry.lastEditedAt?.toISOString() || '',
    enquiry.lastFollowupDate?.toISOString().split('T')[0] || '',
    enquiry.nextActionDate?.toISOString().split('T')[0] || '',
    // Legacy
    enquiry.registrationId || '',
    enquiry.registrationDate?.toISOString().split('T')[0] || '',
    enquiry.governmentPortalRef || '',
    enquiry.dispatchDate?.toISOString().split('T')[0] || '',
    enquiry.installedBy || '',
    enquiry.activationDate?.toISOString().split('T')[0] || '',
    enquiry.assignedTo || '',
  ];
}

// ============================================
// CRUD OPERATIONS
// ============================================




/** Fetch all enquiries from ENQUIRIES tab */
export async function fetchEnquiries(): Promise<Enquiry[]> {
  try {
    const orgId = await getOrgId(); // ✅ Get orgId (works for admin & users)

    // 1. Check cache first
    const cached = await getCachedEnquiries(orgId);
    if (cached && cached.data) {
      console.log('✅ Using cached enquiries for org:', orgId, `(${cached.data.length} rows)`);
      return cached.data;
    }

    // 2. Cache miss - fetch from Google Sheets
    console.log('⚠️ Cache miss - fetching enquiries from Google Sheets for org:', orgId);
    const sheets = await getSheets(); // This already handles token from ANY admin
    const sheetId = await getSheetId();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:DR', // 116 columns
    });
    
    const rows = response.data.values || [];
    const enquiries = rows
      .map(rowToEnquiry)
      .filter((enquiry): enquiry is Enquiry => enquiry !== null);

    // 3. Store in cache
    await cacheSheetData(orgId, 'enquiries', enquiries);

    return enquiries;
  } catch (error: any) {
    console.error('Error fetching enquiries:', error);
    return [];
  }
}


/** Create new enquiry */
export async function createEnquiry(enquiry: Enquiry): Promise<void> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    const row = enquiryToRow(enquiry);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A:DQ',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error: any) {
    console.error('Error creating enquiry:', error);
    throw new Error('Failed to create enquiry');
  }
}

/** Update existing enquiry */
export async function updateEnquiry(enquiry: Enquiry): Promise<void> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    // Find row index
    const allEnquiries = await fetchEnquiries();
    const rowIndex = allEnquiries.findIndex((e) => e.id === enquiry.id);

    if (rowIndex === -1) {
      throw new Error('Enquiry not found');
    }

    const sheetRowIndex = rowIndex + 2; // +2 for header row and 0-index
    const row = enquiryToRow(enquiry);

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `ENQUIRIES!A${sheetRowIndex}:DQ${sheetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error: any) {
    console.error('Error updating enquiry:', error);
    throw new Error('Failed to update enquiry');
  }
}

/** Delete enquiry */
export async function deleteEnquiry(id: string): Promise<void> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    const allEnquiries = await fetchEnquiries();
    const rowIndex = allEnquiries.findIndex((e) => e.id === id);

    if (rowIndex === -1) {
      throw new Error('Enquiry not found');
    }

    const sheetRowIndex = rowIndex + 1;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: sheetRowIndex,
                endIndex: sheetRowIndex + 1,
              },
            },
          },
        ],
      },
    });
  } catch (error: any) {
    console.error('Error deleting enquiry:', error);
    throw new Error('Failed to delete enquiry');
  }
}

// ============================================
// MULTI-TAB OPERATIONS
// ============================================

/** Append row to any tab */
export async function appendSheetRow(tabName: string, row: any[]): Promise<void> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tabName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error: any) {
    console.error(`Error appending to ${tabName}:`, error);
    throw new Error(`Failed to append to ${tabName}`);
  }
}

/** Fetch project stages */
export async function fetchProjectStages(): Promise<any[]> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'PROJECT_STAGES!A2:L',
    });

    return response.data.values || [];
  } catch (error: any) {
    console.error('Error fetching project stages:', error);
    return [];
  }
}

/** Fetch follow-ups for an enquiry */
export async function fetchFollowups(enquiryId: string): Promise<any[]> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'FOLLOWUPS!A2:K',
    });

    const rows = response.data.values || [];
    return rows.filter((row) => row[1] === enquiryId);
  } catch (error: any) {
    console.error('Error fetching follow-ups:', error);
    return [];
  }
}

// Add these functions to src/lib/googleSheets.ts

export async function fetchEnquiryById(enquiryId: string): Promise<any> {
  const enquiries = await fetchEnquiries();
  return enquiries.find((enq: any) => enq.id === enquiryId);
}

export async function updateEnquiryInSheet(
  enquiryId: string, 
  updateData: Record<string, any>
): Promise<void> {
  try {
    const sheets = await getSheets(); // Changed from getGoogleSheetsClient
    const sheetId = await getSheetId(); // Use your existing helper
    
    // Find row index for this enquiry
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A:A', // Match your sheet name
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: any[]) => row[0] === enquiryId); // Fixed type
    
    if (rowIndex === -1) {
      throw new Error('Enquiry not found');
    }
    
    // Map updateData to column letters (customize based on your sheet structure)
    const updates = Object.entries(updateData).map(([key, value]) => {
      const columnLetter = getColumnLetterForField(key);
      return {
        range: `ENQUIRIES!${columnLetter}${rowIndex + 2}`, // +2 for header row
        values: [[value]],
      };
    });
    
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        data: updates,
        valueInputOption: 'USER_ENTERED',
      },
    });
  } catch (error: any) {
    console.error('Error updating enquiry in sheet:', error);
    throw new Error('Failed to update enquiry');
  }
}

function getColumnLetterForField(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    'dispatchDate': 'AH',
    'trackingNumber': 'AI',
    'transportCompany': 'AJ',
    'deliveredDate': 'AK',
    'materialReturnDate': 'AL',
    'status': 'H',
'updatedAt': 'J',
'surveyedBy': 'T',
'surveyScheduledDate': 'W',

    // Add more mappings based on your sheet structure
  };
  
  return fieldMap[fieldName] || 'A';
}

// ============================================
// TELEGRAM NOTIFICATIONS
// ============================================

/**
 * Notify via Telegram when BOM is marked as delivered
 */
export async function notifyBOMMarkedAsDelivered(
  enquiryId: string,
  customerName: string,
  registrationId: string
): Promise<void> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    // Read chat IDs from BOM_NOTIFY sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM_NOTIFY!A:A',
    });

    const rows = response.data.values || [];
    const chatIds = rows.map((row: any[]) => row[0]); // Fixed type

    if (chatIds.length === 0) {
      console.log('No Telegram chat IDs configured for BOM notifications');
      return;
    }

    const message = `
🎉 *BOM Marked as Delivered*

📋 *Enquiry:* ${enquiryId}
👤 *Customer:* ${customerName}
🆔 *Registration:* ${registrationId}

✅ Bill of Materials has been marked as delivered.
    `.trim();

    // Send notification to all registered chat IDs
    for (const chatId of chatIds) {
      if (chatId && chatId.trim()) {
        try {
          await telegramBot.sendMessage(chatId.trim(), message, 'Markdown');
        } catch (error) {
          console.error(`Failed to send Telegram notification to ${chatId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error sending BOM delivery notification:', error);
    // Don't throw - notifications are non-critical
  }
}

export async function fetchLeads(): Promise<any[]> {
  try {
    const orgId = await getOrgId();

    // 1. Check cache first
    const cached = await getCachedLeads(orgId);
    if (cached && cached.data) {
      console.log('✅ Using cached leads for org:', orgId, `(${cached.data.length} rows)`);
      return cached.data;
    }

    // 2. Cache miss - fetch from Google Sheets
    console.log('⚠️ Cache miss - fetching leads from Google Sheets for org:', orgId);
    const sheets = await getSheets();
    const sheetId = await getSheetId();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'LEADS!A2:Z10000',
    });
    
    const rows = response.data.values || [];
    const leads = rows
      .map((row) => rowToLead(row))
      .filter((lead) => lead !== null);

    // 3. Store in cache
    await cacheSheetData(orgId, 'leads', leads);

    return leads;
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }
}


/**
 * Convert row array to Lead object (matches your Lead interface)
 */
function rowToLead(row: any[]): any | null {
  if (!row || row.length < 7) return null;

  const [
    id,                    // A
    customerName,          // B
    phone,                 // C
    email,                 // D
    address,               // E
    area,                  // F
    capacity,              // G
    status,                // H
    source,                // I
    providerId,            // J
    providerName,          // K
    assignedTo,            // L
    assignedToName,        // M
    assignedDate,          // N
    firstContactDate,      // O
    lastContactDate,       // P
    contactAttempts,       // Q
    qualified,             // R
    qualifiedDate,         // S
    qualifiedBy,           // T
    converted,             // U
    convertedDate,         // V
    convertedBy,           // W
    enquiryId,             // X
    estimatedBudget,       // Y
    urgency,               // Z
    timeline,              // AA
    lostReason,            // AB
    lostDate,              // AC
    nextFollowUpDate,      // AD
    callbackScheduled,     // AE
    priority,              // AF
    tags,                  // AG
    notes,                 // AH
    createdAt,             // AI
    updatedAt,             // AJ
    createdBy,             // AK
    lastActivityBy,        // AL
    lastActivityDate,      // AM
  ] = row;

  return {
    id: id || '',
    customerName: customerName || '',
    phone: phone || '',
    email: email || '',
    address: address || '',
    area: area || '',
    capacity: capacity || '',
    status: status || 'new',
    source: source || '',
    providerId: providerId || '',
    providerName: providerName || '',
    assignedTo: assignedTo || '',
    assignedToName: assignedToName || '',
    assignedDate: assignedDate ? new Date(assignedDate) : undefined,
    firstContactDate: firstContactDate ? new Date(firstContactDate) : undefined,
    lastContactDate: lastContactDate ? new Date(lastContactDate) : undefined,
    contactAttempts: parseInt(contactAttempts) || 0,
    qualified: qualified === 'TRUE',
    qualifiedDate: qualifiedDate ? new Date(qualifiedDate) : undefined,
    qualifiedBy: qualifiedBy || '',
    converted: converted === 'TRUE',
    convertedDate: convertedDate ? new Date(convertedDate) : undefined,
    convertedBy: convertedBy || '',
    enquiryId: enquiryId || '',
    estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
    urgency: urgency || 'medium',
    timeline: timeline || '',
    lostReason: lostReason || '',
    lostDate: lostDate ? new Date(lostDate) : undefined,
    nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
    callbackScheduled: callbackScheduled === 'TRUE',
    priority: priority || 'medium',
    tags: tags ? tags.split(',') : [],
    notes: notes || '',
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    createdBy: createdBy || '',
    lastActivityBy: lastActivityBy || '',
    lastActivityDate: lastActivityDate ? new Date(lastActivityDate) : undefined,
  };
}


/**
 * Convert Lead object to row array
 */
// Convert Lead object to row array (39 columns)
function leadToRow(lead: any): any[] {
  return [
    lead.id || '', // A
    lead.customerName || '', // B
    lead.phone || '', // C
    lead.email || '', // D
    lead.address || '', // E
    lead.area || '', // F
    lead.capacity || '', // G
    lead.status || 'new', // H
    lead.source || '', // I
    lead.providerId || '', // J
    lead.providerName || '', // K
    lead.assignedTo || '', // L
    lead.assignedToName || '', // M
    lead.assignedDate?.toISOString?.()?.split('T')[0] || '', // N
    lead.firstContactDate?.toISOString?.()?.split('T')[0] || '', // O
    lead.lastContactDate?.toISOString?.()?.split('T')[0] || '', // P
    lead.contactAttempts || 0, // Q
    lead.qualified ? 'TRUE' : 'FALSE', // R
    lead.qualifiedDate?.toISOString?.()?.split('T')[0] || '', // S
    lead.qualifiedBy || '', // T
    lead.converted ? 'TRUE' : 'FALSE', // U
    lead.convertedDate?.toISOString?.()?.split('T')[0] || '', // V
    lead.convertedBy || '', // W
    lead.enquiryId || '', // X
    lead.estimatedBudget || '', // Y
    lead.urgency || 'medium', // Z
    lead.timeline || '', // AA
    lead.lostReason || '', // AB
    lead.lostDate?.toISOString?.()?.split('T')[0] || '', // AC
    lead.nextFollowUpDate?.toISOString?.()?.split('T')[0] || '', // AD
    lead.callbackScheduled ? 'TRUE' : 'FALSE', // AE
    lead.priority || 'medium', // AF
    Array.isArray(lead.tags) ? lead.tags.join(',') : (lead.tags || ''), // AG
    lead.notes || '', // AH
    lead.createdAt?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0], // AI
    lead.updatedAt?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0], // AJ
    lead.createdBy || '', // AK
    lead.lastActivityBy || '', // AL
    lead.lastActivityDate?.toISOString?.()?.split('T')[0] || '', // AM
  ];
}


/**
 * Create a new lead in LEADS tab
 */
export async function createLead(leadData: any, createdBy: string): Promise<any> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();
    const session = await getServerSession(authOptions);
    const orgId = session?.user?.organizationId;

    // Generate lead ID
    const timestamp = Date.now();
    const leadId = `LEAD-${timestamp.toString().slice(-6)}`;

    const newLead = {
      id: leadId,
      customerName: leadData.customerName || '',
      phone: leadData.phone || '',
      email: leadData.email || '',
      address: leadData.address || '',
      area: leadData.area || '',
      capacity: leadData.capacity || '',
      status: leadData.status || 'new',
      source: leadData.source || leadData.leadSource || 'website',
      providerId: leadData.providerId || '',
      providerName: leadData.providerName || '',
      assignedTo: leadData.assignedTo || '',
      assignedToName: leadData.assignedToName || '',
      assignedDate: leadData.assignedDate || null,
      firstContactDate: null,
      lastContactDate: null,
      contactAttempts: 0,
      qualified: false,
      qualifiedDate: null,
      qualifiedBy: '',
      converted: false,
      convertedDate: null,
      convertedBy: '',
      enquiryId: '',
      estimatedBudget: leadData.estimatedBudget || null,
      urgency: leadData.urgency || 'medium',
      timeline: leadData.timeline || '',
      lostReason: '',
      lostDate: null,
      nextFollowUpDate: leadData.nextFollowUpDate || null,
      callbackScheduled: false,
      priority: leadData.priority || 'medium',
      tags: Array.isArray(leadData.tags) ? leadData.tags : [],
      notes: leadData.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: createdBy,
      lastActivityBy: createdBy,
      lastActivityDate: new Date(),
    };

    const row = leadToRow(newLead);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'LEADS!A:AM', // 39 columns (A to AM)
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    // Log activity
    await logActivity({
      entityType: 'lead',
      entityId: leadId,
      action: 'created',
      performedBy: createdBy,
      details: `Lead created: ${leadData.customerName}`,
    });

    // ✅ Send Telegram notification to ORG GROUP
    if (orgId) {
      try {
        await notifyLeadCreated(orgId, {
          id: leadId,
          customerName: leadData.customerName || 'Unknown',
          phone: leadData.phone || 'N/A',
          area: leadData.area,
          capacity: leadData.capacity,
          source: leadData.source || leadData.leadSource || 'website',
          priority: leadData.priority || 'medium',
          createdBy: createdBy,
        });
        console.log('✅ Lead creation notification sent to Telegram group');
      } catch (telegramError) {
        console.error('⚠️ Telegram notification failed (non-blocking):', telegramError);
        // Don't fail the lead creation if Telegram fails
      }
    }

    // ✅ Invalidate leads cache
    if (orgId) {
      await invalidateLeadsCache(orgId);
    }

    return newLead;
  } catch (error: any) {
    console.error('Error creating lead:', error);
    throw new Error(`Failed to create lead: ${error.message}`);
  }
}



/**
 * Update an existing lead in LEADS tab
 */
export async function updateLead(
  leadId: string,
  updates: any,
  updatedBy: string
): Promise<any> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    // Find lead row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'LEADS!A2:AM10000', // ✅ Changed to AM (39 columns)
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === leadId);

    if (rowIndex === -1) {
      throw new Error('Lead not found');
    }

    // Get existing lead
    const existingLead = rowToLead(rows[rowIndex]);

    // Merge updates
    const updatedLead = {
      ...existingLead,
      ...updates,
      updatedAt: new Date(),
      lastActivityBy: updatedBy,
      lastActivityDate: new Date(),
    };

    const updatedRow = leadToRow(updatedLead);

    // Update the row (rowIndex + 2 because: 1 for header, 1 for 0-based index)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `LEADS!A${rowIndex + 2}:AM${rowIndex + 2}`, // ✅ Changed to AM
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    // Log activity
    await logActivity({
      entityType: 'lead',
      entityId: leadId,
      action: 'updated',
      performedBy: updatedBy,
      details: `Lead updated: ${Object.keys(updates).join(', ')}`,
    });

    return updatedLead;
  } catch (error: any) {
    console.error('Error updating lead:', error);
    throw new Error(`Failed to update lead: ${error.message}`);
  }
}


/**
 * Convert lead to enquiry (move from LEADS to ENQUIRIES tab)
 */
export async function convertLeadToEnquiry(
  leadId: string,
  enquiryData: any,
  convertedBy: string
): Promise<any> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    // 1. Get lead data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'LEADS!A2:AM10000', // ✅ Changed to AM (39 columns)
    });

    const rows = response.data.values || [];
    const leadRow = rows.find((row) => row[0] === leadId);

    if (!leadRow) {
      throw new Error('Lead not found');
    }

    const lead = rowToLead(leadRow);

    // 2. Create enquiry with lead data + additional enquiry data
    const timestamp = Date.now();
    const enquiryId = `ENQ-${timestamp.toString().slice(-6)}`;

    const newEnquiry = {
      id: enquiryId,
      customerName: lead.customerName,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      area: lead.area,
      capacity: parseFloat(lead.capacity) || 3,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
      panelTag: enquiryData.panelTag || 'RTS',
      leadSource: lead.source,
      leadNotes: lead.notes,
      leadAssignedTo: lead.assignedTo,
      leadStatus: 'converted',
      leadConvertedDate: new Date().toISOString().split('T')[0],
      paymentType: enquiryData.paymentType || 'Direct',
      lastEditedBy: convertedBy,
      ...enquiryData,
    };

    // 3. Add to ENQUIRIES tab (keep this as ENQUIRIES has 117 columns)
    const enquiryRow = enquiryToRow(newEnquiry);

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A:DR', // ✅ Keep as is (117 columns for ENQUIRIES)
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [enquiryRow],
      },
    });

    // 4. Update lead status to 'converted' in LEADS tab
    await updateLead(
      leadId,
      {
        status: 'converted',
        converted: true,
        convertedDate: new Date(),
        convertedBy: convertedBy,
        enquiryId: enquiryId,
      },
      convertedBy
    );

    // 5. Log activity
    await logActivity({
      entityType: 'lead',
      entityId: leadId,
      action: 'converted',
      performedBy: convertedBy,
      details: `Lead converted to enquiry ${enquiryId}`,
    });

    return newEnquiry;
  } catch (error: any) {
    console.error('Error converting lead:', error);
    throw new Error(`Failed to convert lead: ${error.message}`);
  }
}


/**
 * Log lead activity to ACTIVITY_LOG tab
 */
export async function logLeadActivity(leadId: string, activity: any): Promise<void> {
  try {
    await logActivity({
      entityType: 'lead',
      entityId: leadId,
      action: activity.activityType,
      performedBy: activity.performedBy,
      details: activity.notes || '',
      metadata: JSON.stringify({
        outcome: activity.outcome,
        timestamp: activity.timestamp,
      }),
    });
  } catch (error) {
    console.error('Error logging lead activity:', error);
    // Don't throw - activity logging should not block main operations
  }
}

/**
 * Generic activity logger for ACTIVITY_LOG tab
 */
async function logActivity(activity: {
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  details: string;
  metadata?: string;
}): Promise<void> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    const row = [
      new Date().toISOString(),
      activity.entityType,
      activity.entityId,
      activity.action,
      activity.performedBy,
      activity.details,
      activity.metadata || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'ACTIVITY_LOG!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Silent fail - don't block main operation
  }
}

export async function fetchUsers(accessToken: string, sheetId: string) {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/USERS!A2:M1000`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    const rows = data.values || [];

    return rows.map((row: string[]) => ({
      id: row[0] || '',
      email: row[1] || '',
      name: row[2] || '',
      role: row[3] || 'sales',
      accountType: row[4] || 'user',
      organizationId: row[5] || '',
      branchId: row[6] || null,
      branchName: row[7] || null,
      canView: row[8] ? row[8].split(',') : [],
      canEdit: row[9] ? row[9].split(',') : [],
      canDelete: row[10] === 'true',
      isActive: row[11] !== 'false',
      createdAt: row[12] || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Fetch all branches from BRANCHES tab
export async function fetchBranches(accessToken: string, sheetId: string) {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/BRANCHES!A2:F1000`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch branches');
    }

    const data = await response.json();
    const rows = data.values || [];

    return rows.map((row: string[]) => ({
      id: row[0] || '',
      name: row[1] || '',
      city: row[2] || '',
      state: row[3] || '',
      address: row[4] || '',
      isActive: row[5] !== 'false',
    }));
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

// Filter enquiries by branch (if branchId is provided)
export function filterEnquiriesByBranch(enquiries: Enquiry[], branchId?: string) {
  if (!branchId) {
    return enquiries; // No branch filter
  }
  return enquiries.filter(e => e.branchId === branchId);
}

// ============================================
// CACHED FETCH FUNCTIONS FOR ALL TABS
// ============================================

/** Fetch users from USERS tab (cached) */
export async function fetchUsersFromSheet(): Promise<any[]> {
  try {
    const orgId = await getOrgId();
    const cached = await getCachedSheetData(orgId, 'users');
    
    if (cached && cached.data) {
      console.log('✅ Using cached users');
      return cached.data;
    }

    console.log('⚠️ Fetching users from sheet');
    const sheets = await getSheets();
    const sheetId = await getSheetId();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'USERS!A2:M1000',
    });

    const rows = response.data.values || [];
    const users = rows.map((row: any[]) => ({
      id: row[0] || '',
      email: row[1] || '',
      name: row[2] || '',
      role: row[3] || 'sales',
      accountType: row[4] || 'user',
      organizationId: row[5] || '',
      branchId: row[6] || null,
      branchName: row[7] || null,
      canView: row[8] ? row[8].split(',') : [],
      canEdit: row[9] ? row[9].split(',') : [],
      canDelete: row[10] === 'true',
      isActive: row[11] !== 'false',
      createdAt: row[12] || new Date().toISOString(),
    }));

    await cacheSheetData(orgId, 'users', users);
    return users;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/** Fetch branches from BRANCHES tab (cached) */
export async function fetchBranchesFromSheet(): Promise<any[]> {
  try {
    const orgId = await getOrgId();
    const cached = await getCachedSheetData(orgId, 'branches');
    
    if (cached && cached.data) {
      console.log('✅ Using cached branches');
      return cached.data;
    }

    console.log('⚠️ Fetching branches from sheet');
    const sheets = await getSheets();
    const sheetId = await getSheetId();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BRANCHES!A2:F1000',
    });

    const rows = response.data.values || [];
    const branches = rows.map((row: any[]) => ({
      id: row[0] || '',
      name: row[1] || '',
      city: row[2] || '',
      state: row[3] || '',
      address: row[4] || '',
      isActive: row[5] !== 'false',
    }));

    await cacheSheetData(orgId, 'branches', branches);
    return branches;
  } catch (error: any) {
    console.error('Error fetching branches:', error);
    return [];
  }
}

/** Fetch followups from FOLLOWUPS tab (cached) */
export async function fetchFollowupsFromSheet(enquiryId?: string): Promise<any[]> {
  try {
    const orgId = await getOrgId();
    const cached = await getCachedSheetData(orgId, 'followups');
    
    let followups: any[] = [];
    
    if (cached && cached.data) {
      console.log('✅ Using cached followups');
      followups = cached.data;
    } else {
      console.log('⚠️ Fetching followups from sheet');
      const sheets = await getSheets();
      const sheetId = await getSheetId();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'FOLLOWUPS!A2:K1000',
      });

      followups = response.data.values || [];
      await cacheSheetData(orgId, 'followups', followups);
    }

    // Filter by enquiryId if provided
    if (enquiryId) {
      return followups.filter((row: any[]) => row[1] === enquiryId);
    }

    return followups;
  } catch (error: any) {
    console.error('Error fetching followups:', error);
    return [];
  }
}

/** Fetch activity log from ACTIVITY_LOG tab (cached) */
export async function fetchActivityLog(): Promise<any[]> {
  try {
    const orgId = await getOrgId();
    const cached = await getCachedSheetData(orgId, 'activity_log');
    
    if (cached && cached.data) {
      console.log('✅ Using cached activity log');
      return cached.data;
    }

    console.log('⚠️ Fetching activity log from sheet');
    const sheets = await getSheets();
    const sheetId = await getSheetId();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ACTIVITY_LOG!A2:G1000',
    });

    const rows = response.data.values || [];
    await cacheSheetData(orgId, 'activity_log', rows);
    return rows;
  } catch (error: any) {
    console.error('Error fetching activity log:', error);
    return [];
  }
}

/** Fetch project stages from PROJECT_STAGES tab (cached) */
export async function fetchProjectStagesFromSheet(): Promise<any[]> {
  try {
    const orgId = await getOrgId();
    const cached = await getCachedSheetData(orgId, 'project_stages');
    
    if (cached && cached.data) {
      console.log('✅ Using cached project stages');
      return cached.data;
    }

    console.log('⚠️ Fetching project stages from sheet');
    const sheets = await getSheets();
    const sheetId = await getSheetId();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'PROJECT_STAGES!A2:L1000',
    });

    const rows = response.data.values || [];
    await cacheSheetData(orgId, 'project_stages', rows);
    return rows;
  } catch (error: any) {
    console.error('Error fetching project stages:', error);
    return [];
  }
}

// ============================================
// QUOTATION FUNCTIONS
// Add these functions to src/lib/googleSheets.ts
// ============================================

/**
 * Fetch all quotations for an organization
 */
export async function fetchAllQuotations(orgId: string): Promise<Quotation[]> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'QUOTATIONS!A2:CB10000',
    });

    const rows = response.data.values || [];

    // ✅ FIX: Use simple rowToQuotation without extra params
    const quotations = rows
      .map((row) => rowToQuotation(row))
      .filter((q): q is Quotation => 
        q !== null && q.organizationId === orgId
      );

    console.log(`✅ Loaded ${quotations.length} quotations for ${orgId}`);
    return quotations;
  } catch (error: any) {
    console.error('❌ Error fetching quotations:', error);
    throw new Error('Failed to fetch quotations: ' + error.message);
  }
}

/**
 * Fetch single quotation by ID
 */
export async function fetchQuotation(
  orgId: string,
  quotationId: string
): Promise<Quotation | null> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'QUOTATIONS!A2:CB10000',
    });

    const rows = response.data.values || [];

    // ✅ FIX: Simple filtering
    for (const row of rows) {
      const quotation = rowToQuotation(row);
      if (
        quotation && 
        quotation.quotationId === quotationId &&
        quotation.organizationId === orgId
      ) {
        return quotation;
      }
    }

    return null;
  } catch (error: any) {
    console.error('❌ Error fetching quotation:', error);
    return null;
  }
}

/**
 * Create new quotation
 */
export async function createQuotation(quotation: Quotation): Promise<void> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    // ✅ Row data matching YOUR exact column order
    const row = [
      quotation.quotationId,              // A
      quotation.organizationId,           // B
      quotation.referenceNumber,          // C
      quotation.leadId || '',             // D
      quotation.enquiryId || '',          // E
      quotation.quotationType,            // F
      quotation.customerName,             // G
      quotation.customerPhone,            // H
      quotation.customerEmail,            // I
      quotation.customerAddress,          // J
      quotation.location,                 // K
      quotation.premisesType,             // L
      quotation.systemCapacity,           // M
      quotation.systemType,               // N
      quotation.panelType,                // O
      quotation.panelMake,                // P
      quotation.panelModel || '',         // Q
      quotation.panelWattage,             // R
      quotation.panelQuantity,            // S
      quotation.panelWarranty,            // T
      quotation.inverterMake,             // U
      quotation.inverterModel,            // V
      quotation.inverterCapacity,         // W
      quotation.inverterQuantity,         // X
      quotation.inverterWarranty,         // Y
      quotation.structureType,            // Z
      quotation.structureMake,            // AA
      quotation.structureWarranty,        // AB
      quotation.bosItems,                 // AC
      quotation.bosWarranty,              // AD
      quotation.cableMake,                // AE
      quotation.cableWarranty,            // AF
      quotation.earthingType,             // AG
      quotation.earthingQuantity,         // AH
      quotation.earthingWarranty,         // AI
      quotation.lightningArrestorType,    // AJ
      quotation.lightningArrestorQuantity,// AK
      quotation.lightningArrestorWarranty,// AL
      quotation.maintenanceYears,         // AM
      quotation.gridConnectivityIncluded ? 'TRUE' : 'FALSE', // AN
      quotation.netMeteringIncluded ? 'TRUE' : 'FALSE',      // AO
      quotation.baseCost,                 // AP
      quotation.gstPercentage,            // AQ
      quotation.gstAmount,                // AR
      quotation.totalCost,                // AS
      quotation.subsidyAmount,            // AT
      quotation.finalAmount,              // AU
      quotation.advancePercentage,        // AV
      quotation.preDispatchPercentage,    // AW
      quotation.preGridPercentage,        // AX
      quotation.paymentTerms,             // AY
      quotation.status,                   // AZ
      quotation.createdBy,                // BA
      quotation.createdDate,              // BB
      quotation.sentBy || '',             // BC
      quotation.sentDate || '',           // BD
      quotation.viewCount || 0,           // BE
      quotation.firstViewedDate || '',    // BF
      quotation.lastViewedDate || '',     // BG
      quotation.approvedBy || '',         // BH
      quotation.approvedDate || '',       // BI
      quotation.rejectedReason || '',     // BJ
      quotation.validUntilDate,           // BK
      quotation.publicUrl,                // BL
      quotation.pdfUrl || '',             // BM
      quotation.qrCodeUrl || '',          // BN
      quotation.notes || '',              // BO
      quotation.termsAndConditions,       // BP
      quotation.loanAvailable ? 'TRUE' : 'FALSE', // BQ
      quotation.loanInterestRate || 0,    // BR
      quotation.companyName,              // BS
      quotation.companyGst,               // BT
      quotation.companyUdyam,             // BU
      quotation.companyCspdclReg,         // BV
      quotation.companyBankName,          // BW
      quotation.companyAccountNumber,     // BX
      quotation.companyIfsc,              // BY
      quotation.companyAddress,           // BZ
      quotation.companyPhone,             // CA
      quotation.companyEmail,             // CB
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'QUOTATIONS!A:CB',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log(`✅ Created quotation ${quotation.quotationId}`);
  } catch (error) {
    console.error('❌ Error creating quotation:', error);
    throw error;
  }
}

/**
 * Update quotation
 */
export async function updateQuotation(
  orgId: string,
  quotationId: string,
  updates: Partial<Quotation>
): Promise<void> {
  try {
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    // Get all rows to find the quotation
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'QUOTATIONS!A2:CB10000',
    });

    const rows = response.data.values || [];

    // ✅ FIX: Find the row index
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const rowQuotationId = rows[i][0]; // Column A
      const rowOrgId = rows[i][1];       // Column B

      if (rowQuotationId === quotationId && rowOrgId === orgId) {
        rowIndex = i + 2; // +2 for header row and 0-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Quotation not found');
    }

    // ✅ FIX: Update specific fields based on column mapping
    const updateRequests: any[] = [];

    // Map field names to column letters
    const fieldToColumn: Record<string, string> = {
      status: 'AZ',
      sentBy: 'BC',
      sentDate: 'BD',
      viewCount: 'BE',
      firstViewedDate: 'BF',
      lastViewedDate: 'BG',
      approvedBy: 'BH',
      approvedDate: 'BI',
      rejectedReason: 'BJ',
    };

    Object.entries(updates).forEach(([key, value]) => {
      const column = fieldToColumn[key];
      if (column) {
        updateRequests.push({
          range: `QUOTATIONS!${column}${rowIndex}`,
          values: [[value]]
        });
      }
    });

    if (updateRequests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          data: updateRequests,
          valueInputOption: 'RAW',
        },
      });
    }

    console.log(`✅ Updated quotation: ${quotationId}`);
  } catch (error: any) {
    console.error('❌ Error updating quotation:', error);
    throw new Error(`Failed to update quotation: ${error.message}`);
  }
}

/**
 * Helper: Convert row array to Quotation object
 */
function rowToQuotation(row: any[]): Quotation | null {
  if (!row || row.length < 10) return null;

  const [
    quotationId,              // Column 0 (A)
    organizationId,           // Column 1 (B)
    referenceNumber,          // Column 2 (C)
    leadId,                   // Column 3 (D)
    enquiryId,                // Column 4 (E)
    quotationType,            // Column 5 (F)
    customerName,             // Column 6 (G)
    customerPhone,            // Column 7 (H)
    customerEmail,            // Column 8 (I)
    customerAddress,          // Column 9 (J)
    location,                 // Column 10 (K)
    premisesType,             // Column 11 (L)
    systemCapacity,           // Column 12 (M)
    systemType,               // Column 13 (N)
    panelType,                // Column 14 (O)
    panelMake,                // Column 15 (P)
    panelModel,               // Column 16 (Q)
    panelWattage,             // Column 17 (R)
    panelQuantity,            // Column 18 (S)
    panelWarranty,            // Column 19 (T)
    inverterMake,             // Column 20 (U)
    inverterModel,            // Column 21 (V)
    inverterCapacity,         // Column 22 (W)
    inverterQuantity,         // Column 23 (X)
    inverterWarranty,         // Column 24 (Y)
    structureType,            // Column 25 (Z)
    structureMake,            // Column 26 (AA)
    structureWarranty,        // Column 27 (AB)
    bosItems,                 // Column 28 (AC)
    bosWarranty,              // Column 29 (AD)
    cableMake,                // Column 30 (AE)
    cableWarranty,            // Column 31 (AF)
    earthingType,             // Column 32 (AG)
    earthingQuantity,         // Column 33 (AH)
    earthingWarranty,         // Column 34 (AI)
    lightningArrestorType,    // Column 35 (AJ)
    lightningArrestorQuantity,// Column 36 (AK)
    lightningArrestorWarranty,// Column 37 (AL)
    maintenanceYears,         // Column 38 (AM)
    gridConnectivityIncluded, // Column 39 (AN)
    netMeteringIncluded,      // Column 40 (AO)
    baseCost,                 // Column 41 (AP)
    gstPercentage,            // Column 42 (AQ)
    gstAmount,                // Column 43 (AR)
    totalCost,                // Column 44 (AS)
    subsidyAmount,            // Column 45 (AT)
    finalAmount,              // Column 46 (AU)
    advancePercentage,        // Column 47 (AV)
    preDispatchPercentage,    // Column 48 (AW)
    preGridPercentage,        // Column 49 (AX)
    paymentTerms,             // Column 50 (AY)
    status,                   // Column 51 (AZ)
    createdBy,                // Column 52 (BA)
    createdDate,              // Column 53 (BB)
    sentBy,                   // Column 54 (BC)
    sentDate,                 // Column 55 (BD)
    viewCount,                // Column 56 (BE)
    firstViewedDate,          // Column 57 (BF)
    lastViewedDate,           // Column 58 (BG)
    approvedBy,               // Column 59 (BH)
    approvedDate,             // Column 60 (BI)
    rejectedReason,           // Column 61 (BJ)
    validUntilDate,           // Column 62 (BK)
    publicUrl,                // Column 63 (BL)
    pdfUrl,                   // Column 64 (BM)
    qrCodeUrl,                // Column 65 (BN)
    notes,                    // Column 66 (BO)
    termsAndConditions,       // Column 67 (BP)
    loanAvailable,            // Column 68 (BQ)
    loanInterestRate,         // Column 69 (BR)
    companyName,              // Column 70 (BS)
    companyGst,               // Column 71 (BT)
    companyUdyam,             // Column 72 (BU)
    companyCspdclReg,         // Column 73 (BV)
    companyBankName,          // Column 74 (BW)
    companyAccountNumber,     // Column 75 (BX)
    companyIfsc,              // Column 76 (BY)
    companyAddress,           // Column 77 (BZ)
    companyPhone,             // Column 78 (CA)
    companyEmail,             // Column 79 (CB)
  ] = row;

  return {
    // Multi-tenant
    organizationId: organizationId || '',
    organizationName: companyName || '',
    sheetId: '',

    // Basic
    quotationId: quotationId || '',
    referenceNumber: referenceNumber || '',
    leadId: leadId || undefined,
    enquiryId: enquiryId || undefined,
    quotationType: (quotationType || 'Initial') as 'Initial' | 'Revised' | 'Final',

    // Customer
    customerName: customerName || '',
    customerPhone: customerPhone || '',
    customerEmail: customerEmail || '',
    customerAddress: customerAddress || '',
    location: location || '',
    premisesType: (premisesType || 'Residence') as 'Residence' | 'Commercial' | 'Industrial',

    // System
    systemCapacity: parseFloat(systemCapacity) || 0,
    systemType: (systemType || 'On-Grid') as 'On-Grid' | 'Hybrid' | 'Off-Grid',
    panelType: panelType || '',

    // Components
    panelMake: panelMake || '',
    panelModel: panelModel || '',
    panelWattage: parseFloat(panelWattage) || 0,
    panelQuantity: parseInt(panelQuantity) || 0,
    panelWarranty: panelWarranty || '',
    
    inverterMake: inverterMake || '',
    inverterModel: inverterModel || '',
    inverterCapacity: parseFloat(inverterCapacity) || 0,
    inverterQuantity: parseInt(inverterQuantity) || 1,
    inverterWarranty: inverterWarranty || '',
    
    structureType: structureType || '',
    structureMake: structureMake || '',
    structureWarranty: structureWarranty || '',
    
    bosItems: bosItems || '',
    bosWarranty: bosWarranty || '',
    
    cableMake: cableMake || '',
    cableWarranty: cableWarranty || '',
    
    earthingType: earthingType || '',
    earthingQuantity: parseInt(earthingQuantity) || 0,
    earthingWarranty: earthingWarranty || '',
    
    lightningArrestorType: lightningArrestorType || '',
    lightningArrestorQuantity: parseInt(lightningArrestorQuantity) || 0,
    lightningArrestorWarranty: lightningArrestorWarranty || '',

    // Services
    maintenanceYears: parseInt(maintenanceYears) || 5,
    gridConnectivityIncluded: gridConnectivityIncluded === 'TRUE',
    netMeteringIncluded: netMeteringIncluded === 'TRUE',

    // Pricing
    baseCost: parseFloat(baseCost) || 0,
    gstPercentage: parseFloat(gstPercentage) || 0,
    gstAmount: parseFloat(gstAmount) || 0,
    totalCost: parseFloat(totalCost) || 0,
    subsidyAmount: parseFloat(subsidyAmount) || 0,
    finalAmount: parseFloat(finalAmount) || 0,

    // Payment Terms
    advancePercentage: parseFloat(advancePercentage) || 70,
    preDispatchPercentage: parseFloat(preDispatchPercentage) || 20,
    preGridPercentage: parseFloat(preGridPercentage) || 10,
    paymentTerms: paymentTerms || '',

    // Tracking
    status: (() => {
      const rawStatus = status || 'Draft';
      if (rawStatus === 'Sent') return 'Ready';
      return rawStatus as QuotationStatus;
    })(),    
    createdBy: createdBy || '',
    createdDate: createdDate || new Date().toISOString(),
    sentBy: sentBy || undefined,
    sentDate: sentDate || undefined,
    viewCount: parseInt(viewCount) || 0,
    firstViewedDate: firstViewedDate || undefined,
    lastViewedDate: lastViewedDate || undefined,
    approvedBy: approvedBy || undefined,
    approvedDate: approvedDate || undefined,
    rejectedReason: rejectedReason || undefined,
    validUntilDate: validUntilDate || new Date().toISOString(),

    // Security & URLs
    publicToken: publicUrl ? publicUrl.split('token=')[1] || '' : '',
    publicUrl: publicUrl || '',
    pdfUrl: pdfUrl || undefined,
    qrCodeUrl: qrCodeUrl || undefined,

    // Additional
    notes: notes || '',
    termsAndConditions: termsAndConditions || '',
    loanAvailable: loanAvailable === 'TRUE',
    loanInterestRate: parseFloat(loanInterestRate) || 0,

    // Company
    companyName: companyName || '',
    companyGst: companyGst || '',
    companyUdyam: companyUdyam || '',
    companyCspdclReg: companyCspdclReg || '',
    companyBankName: companyBankName || '',
    companyAccountNumber: companyAccountNumber || '',
    companyIfsc: companyIfsc || '',
    companyAddress: companyAddress || '',
    companyPhone: companyPhone || '',
    companyEmail: companyEmail || '',
  };
}



// Convert row to Survey object
function rowToSurvey(row: any[]): Survey | null {
  if (!row || row.length < 10) return null;

  const [
    enquiryId,
    surveyDate,
    surveyorEmail,
    surveyorName,
    projectType,
    consumerCategory,
    installationSurface,
    buildingFloor,
    soilType,
    structureStyle,
    slopeDirection,
    inclinationDegrees,
    frontLegHeight,
    rearLegHeight,
    rafterCount,
    purlineCount,
    sectionSpecifications,
    sanctionedLoad,
    bpNumber,
    transformerCapacity,
    substationDistance,
    panelToDcdbLength,
    panelToDcdbSize,
    dcdbToInverterLength,
    dcdbToInverterSize,
    inverterToAcdbLength,
    inverterToAcdbSize,
    acdbToMeterLength,
    acdbToMeterSize,
    meterToLtPanelLength,
    meterToLtPanelSize,
    existingEarthingCount,
    newEarthingRequired,
    lightningArrestorRequired,
    shadowSourcesCount,           // ✅ Changed: it's a count, not array
    shadowRemovable,
    internetAvailabilityCode,      // ✅ Changed: it's a code
    shadowSourcesList,             // ✅ Changed: this is the actual array
    surveyApproved,
    internetAvailability,          // ✅ Changed: actual value (WIFI/GSM)
    monitoringSystem,              // ✅ Changed: actual value (RMS/SCADA)
  ] = row;

  return {
    enquiryId: enquiryId || '',
    surveyDate: surveyDate || '',
    surveyorEmail: surveyorEmail || '',
    surveyorName: surveyorName || '',
    projectType: (projectType || 'ONGRID') as 'ONGRID' | 'OFFGRID' | 'HYBRID',
    consumerCategory: (consumerCategory || 'DOMESTIC') as 'DOMESTIC' | 'COMMERCIAL' | 'INDUSTRIAL',
    installationSurface: (installationSurface || 'ROOFTOP') as 'ROOFTOP' | 'GROUND' | 'TERRACE',
    buildingFloor: parseInt(buildingFloor) || 0,
    soilType: (soilType || 'CLAY') as 'CLAY' | 'SANDY' | 'ROCKY' | 'MIXED',
    structureStyle: (structureStyle || 'STANDARD') as 'STANDARD' | 'ELEVATED' | 'BALLAST' | 'FLAT_ROOF',
    slopeDirection: (slopeDirection || 'SOUTH') as 'SOUTH' | 'SOUTH_EAST' | 'SOUTH_WEST' | 'EAST' | 'WEST' | 'NORTH',
    inclinationDegrees: parseFloat(inclinationDegrees) || 15,
    frontLegHeight: parseFloat(frontLegHeight) || 1.5,
    rearLegHeight: parseFloat(rearLegHeight) || 2.5,
    rafterCount: parseInt(rafterCount) || 4,
    purlineCount: parseInt(purlineCount) || 8,
    sectionSpecifications: sectionSpecifications || '',
    sanctionedLoad: parseFloat(sanctionedLoad) || 0,
    bpNumber: bpNumber || '',
    transformerCapacity: parseFloat(transformerCapacity) || 0,
    substationDistance: parseFloat(substationDistance) || 0,
    panelToDcdbLength: parseFloat(panelToDcdbLength) || 0,
    panelToDcdbSize: parseFloat(panelToDcdbSize) || 0,
    dcdbToInverterLength: parseFloat(dcdbToInverterLength) || 0,
    dcdbToInverterSize: parseFloat(dcdbToInverterSize) || 0,
    inverterToAcdbLength: parseFloat(inverterToAcdbLength) || 0,
    inverterToAcdbSize: parseFloat(inverterToAcdbSize) || 0,
    acdbToMeterLength: parseFloat(acdbToMeterLength) || 0,
    acdbToMeterSize: parseFloat(acdbToMeterSize) || 0,
    meterToLtPanelLength: parseFloat(meterToLtPanelLength) || 0,
    meterToLtPanelSize: parseFloat(meterToLtPanelSize) || 0,
    existingEarthingCount: parseInt(existingEarthingCount) || 0,
    newEarthingRequired: parseInt(newEarthingRequired) || 0,
    lightningArrestorRequired: parseInt(lightningArrestorRequired) || 0,
    shadowSources: shadowSourcesList ? JSON.parse(shadowSourcesList) : [],  // ✅ Parse the actual list
    shadowRemovable: shadowRemovable === 'TRUE',
    internetAvailability: (internetAvailability || 'WIFI') as 'WIFI' | 'GSM' | 'LAN' | 'NONE',  // ✅ Use correct column
    monitoringSystem: (monitoringSystem || 'RMS') as 'RMS' | 'SCADA' | 'NONE',  // ✅ Use correct column
    surveyApproved: surveyApproved === 'TRUE',
    surveyNotes: '',  // ✅ Not in current data
    surveyPhotos: '',  // ✅ Not in current data
  };
}


// Convert Survey to row
function surveyToRow(survey: Survey): any[] {
  return [
    survey.enquiryId,
    survey.surveyDate,
    survey.surveyorEmail,
    survey.surveyorName,
    survey.projectType,
    survey.consumerCategory,
    survey.installationSurface,
    survey.buildingFloor,
    survey.soilType,
    survey.structureStyle,
    survey.slopeDirection,
    survey.inclinationDegrees,
    survey.frontLegHeight,
    survey.rearLegHeight,
    survey.rafterCount,
    survey.purlineCount,
    survey.sectionSpecifications,
    survey.sanctionedLoad,
    survey.bpNumber,
    survey.transformerCapacity,
    survey.substationDistance,
    survey.panelToDcdbLength,
    survey.panelToDcdbSize,
    survey.dcdbToInverterLength,
    survey.dcdbToInverterSize,
    survey.inverterToAcdbLength,
    survey.inverterToAcdbSize,
    survey.acdbToMeterLength,
    survey.acdbToMeterSize,
    survey.meterToLtPanelLength,
    survey.meterToLtPanelSize,
    survey.existingEarthingCount,
    survey.newEarthingRequired,
    survey.lightningArrestorRequired,
    JSON.stringify(survey.shadowSources),
    survey.shadowRemovable ? 'TRUE' : 'FALSE',
    survey.internetAvailability,
    survey.monitoringSystem,
    survey.surveyApproved ? 'TRUE' : 'FALSE',
    survey.surveyNotes,
    survey.surveyPhotos,
  ];
}

// Fetch all surveys
export async function fetchSurveys(orgId: string, userEmail: string): Promise<Survey[]> {
  try {
    // Get org info to find sheet ID
    const orgInfo = await redis.get(`org:${orgId}:info`) as any;
    if (!orgInfo?.sheetId) {
      throw new Error("No sheet configured for organization");
    }
    
    const sheetId = orgInfo.sheetId;
    
    // Get valid access token (from admin if user is regular user)
    const accessToken = await getValidAccessToken(orgId, userEmail);
    if (!accessToken) {
      throw new Error("No valid access token available");
    }

    // Create authenticated Google Sheets client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch from Survey tab (columns A to AO)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'SURVEY!A2:AO10000',
    });

    const rows = response.data.values || [];
    return rows.map(rowToSurvey).filter((s): s is Survey => s !== null);
  } catch (error: any) {
    console.error('Error fetching surveys:', error);
    return [];
  }
}

// Fetch survey by enquiry ID
export async function fetchSurveyByEnquiryId(
  orgId: string,
  userEmail: string,
  enquiryId: string
): Promise<Survey | null> {
  const surveys = await fetchSurveys(orgId, userEmail);
  return surveys.find(s => s.enquiryId === enquiryId) || null;
}

// Create survey
export async function createSurvey(
  orgId: string,
  userEmail: string,
  survey: Survey
): Promise<void> {
  try {
    const orgInfo = await redis.get(`org:${orgId}:info`) as any;
    if (!orgInfo?.sheetId) {
      throw new Error("No sheet configured");
    }
    
    const accessToken = await getValidAccessToken(orgId, userEmail);
    if (!accessToken) {
      throw new Error("No valid access token");
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    const row = surveyToRow(survey);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: orgInfo.sheetId,
      range: 'SURVEY!A:AO',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    console.log('✅ Survey created for enquiry:', survey.enquiryId);
  } catch (error: any) {
    console.error('Error creating survey:', error);
    throw new Error('Failed to create survey');
  }
}

// Update survey
export async function updateSurvey(
  orgId: string,
  userEmail: string,
  enquiryId: string,
  updates: Partial<Survey>
): Promise<void> {
  try {
    const orgInfo = await redis.get(`org:${orgId}:info`) as any;
    if (!orgInfo?.sheetId) {
      throw new Error("No sheet configured");
    }
    
    const accessToken = await getValidAccessToken(orgId, userEmail);
    if (!accessToken) {
      throw new Error("No valid access token");
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: orgInfo.sheetId,
      range: 'SURVEY!A2:AO10000',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === enquiryId);

    if (rowIndex === -1) {
      throw new Error('Survey not found');
    }

    const existingSurvey = rowToSurvey(rows[rowIndex]);
    if (!existingSurvey) throw new Error('Invalid survey data');

    const updatedSurvey = { ...existingSurvey, ...updates };
    const updatedRow = surveyToRow(updatedSurvey);

    await sheets.spreadsheets.values.update({
      spreadsheetId: orgInfo.sheetId,
      range: `Survey!A${rowIndex + 2}:AO${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] },
    });

    console.log('✅ Survey updated for enquiry:', enquiryId);
  } catch (error: any) {
    console.error('Error updating survey:', error);
    throw new Error('Failed to update survey');
  }
}

// ============================================
// BOM OPERATIONS
// ============================================

/**
 * Convert row array to BOMItem object
 */
/**
 * Convert row array to BOMLineItem object
 */
function rowToBOMLineItem(row: any): BOMLineItem | null {
  if (!row || row.length < 10) return null;

  // Parse materials JSON (column index 21 = V)
  let materialsJSON = '{"items":[]}';
  try {
    if (row[21]) {
      materialsJSON = row[21];
    }
  } catch (e) {
    console.error('Failed to parse materials JSON:', e);
  }

  return {
    bomId: row[0] || '',
    enquiryId: row[1] || '',
    customerName: row[2] || '',
    systemCapacity: row[3] || '',
    bomStatus: row[4] || 'draft',
    bomGeneratedDate: row[5] || '',
    bomGeneratedBy: row[6] || '',
    dispatchStatus: row[7] || 'pending',
    dispatchDate: row[8] || '',
    dispatchedBy: row[9] || '',
    trackingNumber: row[10] || '',
    vehicleNumber: row[11] || '',
    driverName: row[12] || '',
    driverContact: row[13] || '',
    expectedDeliveryDate: row[14] || '',
    actualDeliveryDate: row[15] || '',
    deliveredTo: row[16] || '',
    deliveryNotes: row[17] || '',
    installationStatus: row[18] || 'not_started',
    installationDate: row[19] || '',
    installedBy: row[20] || '',
    materialsJSON: materialsJSON,
    materialUtilizationStatus: row[22] || 'not_started',
    materialReturnStatus: row[23] || 'not_applicable',
    returnCollectedDate: row[24] || '',
    utilizationNotes: row[25] || '',
    createdAt: row[26] || new Date().toISOString(),
    updatedAt: row[27] || '',
  };
}

/**
 * Fetch all BOMs from Google Sheet
 */
export async function fetchBOMs(): Promise<BOMLineItem[]> {
  try {
    const sheets = await getGoogleSheetsClient();
    const sheetId = await getSheetId(); // Your existing function

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AB1000',
    });

    const rows = response.data.values || [];
    
    return rows
      .map(rowToBOMLineItem)
      .filter((bom): bom is BOMLineItem => bom !== null);
  } catch (error: any) {
    console.error('Error fetching BOMs:', error);
    return [];
  }
}

/**
 * Update BOM row in Google Sheet
 */
export async function updateBOMInSheet(
  bomId: string,
  updates: Partial<BOMLineItem>
): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsClient();
    const sheetId = await getSheetId();

    // Find the row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'BOM!A2:AB1000',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: any) => row[0] === bomId);

    if (rowIndex === -1) {
      console.error('BOM not found:', bomId);
      return false;
    }

    const existingRow = rows[rowIndex];
    const existingBOM = rowToBOMLineItem(existingRow);

    if (!existingBOM) return false;

    // Merge updates
    const updatedBOM = { ...existingBOM, ...updates, updatedAt: new Date().toISOString() };

    // Convert back to row array
    const updatedRow = [
      updatedBOM.bomId,
      updatedBOM.enquiryId,
      updatedBOM.customerName,
      updatedBOM.systemCapacity,
      updatedBOM.bomStatus,
      updatedBOM.bomGeneratedDate,
      updatedBOM.bomGeneratedBy,
      updatedBOM.dispatchStatus,
      updatedBOM.dispatchDate || '',
      updatedBOM.dispatchedBy || '',
      updatedBOM.trackingNumber || '',
      updatedBOM.vehicleNumber || '',
      updatedBOM.driverName || '',
      updatedBOM.driverContact || '',
      updatedBOM.expectedDeliveryDate || '',
      updatedBOM.actualDeliveryDate || '',
      updatedBOM.deliveredTo || '',
      updatedBOM.deliveryNotes || '',
      updatedBOM.installationStatus,
      updatedBOM.installationDate || '',
      updatedBOM.installedBy || '',
      updatedBOM.materialsJSON,
      updatedBOM.materialUtilizationStatus,
      updatedBOM.materialReturnStatus,
      updatedBOM.returnCollectedDate || '',
      updatedBOM.utilizationNotes || '',
      updatedBOM.createdAt,
      updatedBOM.updatedAt || '',
    ];

    // Update the row (rowIndex + 2 because of header row and 1-indexing)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `BOM!A${rowIndex + 2}:AB${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    return true;
  } catch (error: any) {
    console.error('Error updating BOM:', error);
    return false;
  }
}

/**
 * Fetch BOMs for a specific enquiry
 */
export async function fetchBOMsByEnquiryId(enquiryId: string): Promise<BOMLineItem[]> {
  const allBOMs = await fetchBOMs();
  return allBOMs.filter(bom => bom.enquiryId === enquiryId);
}
