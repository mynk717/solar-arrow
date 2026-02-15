// src/lib/googleSheets.ts
import { google } from 'googleapis';
import { Enquiry, EnquiryStatus, PanelTag, PaymentType, SubsidyStatus } from './types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getValidAccessToken } from './tokenRefresh';
import { telegramBot } from './telegram'; 
import { redis } from './redis';
import { Quotation } from './quotations';
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
 * Uses Google Sheets API v4 (same pattern as fetchLeads)
 */
export async function fetchAllQuotations(orgId: string): Promise<Quotation[]> {
  try {
    // 1. Check cache first (optional - add if you want caching)
    // const cached = await getCachedQuotations(orgId);
    // if (cached && cached.data) {
    //   console.log('✅ Using cached quotations for org:', orgId);
    //   return cached.data;
    // }

    // 2. Fetch from Google Sheets
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'QUOTATIONS!A2:CZ10000',
    });

    const rows = response.data.values || [];

    // Get header row to map columns
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'QUOTATIONS!A1:CZ1',
    });

    const headers = headerResponse.data.values?.[0] || [];

    const quotations = rows
      .map((row) => rowToQuotation(row, headers, orgId))
      .filter((q) => q !== null);

    console.log(`✅ Loaded ${quotations.length} quotations for ${orgId}`);

    // 3. Store in cache (optional)
    // await cacheSheetData(orgId, 'quotations', quotations);

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
      range: 'QUOTATIONS!A2:CZ10000',
    });

    const rows = response.data.values || [];

    // Get header row
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'QUOTATIONS!A1:CZ1',
    });

    const headers = headerResponse.data.values?.[0] || [];

    // Find the quotation
    for (const row of rows) {
      const quotation = rowToQuotation(row, headers, orgId);
      if (quotation && quotation.quotationId === quotationId) {
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

    const row = [
      quotation.quotationId,
      quotation.organizationId || 'hope-energy',
      quotation.referenceNumber,
      quotation.leadId || '',
      quotation.enquiryId || '',
      quotation.quotationType,
      quotation.customerName,
      quotation.customerPhone,
      quotation.customerEmail || '',
      quotation.customerAddress || '',
      quotation.location,
      quotation.premisesType,
      quotation.systemCapacity,
      quotation.systemType,
      quotation.panelType,
      quotation.panelMake,
      quotation.panelModel || '',
      quotation.panelWattage,
      quotation.panelQuantity,
      quotation.panelWarranty,
      quotation.inverterMake,
      quotation.inverterModel,
      quotation.inverterCapacity,
      quotation.inverterQuantity,
      quotation.inverterWarranty,
      quotation.structureType,
      quotation.structureMake,
      quotation.structureWarranty,
      quotation.bosItems,
      quotation.bosWarranty,
      quotation.cableMake,
      quotation.cableWarranty,
      quotation.earthingType,
      quotation.earthingQuantity,
      quotation.earthingWarranty,
      quotation.lightningArrestorType,
      quotation.lightningArrestorQuantity,
      quotation.lightningArrestorWarranty,
      quotation.maintenanceYears,
      quotation.gridConnectivityIncluded ? 'TRUE' : 'FALSE',
      quotation.netMeteringIncluded ? 'TRUE' : 'FALSE',
      quotation.baseCost,
      quotation.gstPercentage,
      quotation.gstAmount,
      quotation.totalCost,
      quotation.subsidyAmount,
      quotation.finalAmount,
      quotation.advancePercentage,
      quotation.preDispatchPercentage,
      quotation.preGridPercentage,
      quotation.paymentTerms,
      quotation.status,
      quotation.createdBy,
      quotation.createdDate,
      quotation.sentBy || '',
      quotation.sentDate || '',
      quotation.viewCount || 0,
      quotation.firstViewedDate || '',
      quotation.lastViewedDate || '',
      quotation.approvedBy || '',
      quotation.approvedDate || '',
      quotation.rejectedReason || '',
      quotation.validUntilDate,
      quotation.publicUrl || '',
      quotation.pdfUrl || '',
      quotation.qrCodeUrl || '',
      quotation.notes || '',
      quotation.termsAndConditions,
      quotation.loanAvailable ? 'TRUE' : 'FALSE',
      quotation.loanInterestRate || 0,
      quotation.companyName,
      quotation.companyGst,
      quotation.companyUdyam,
      quotation.companyCspdclReg,
      quotation.companyBankName,
      quotation.companyAccountNumber,
      quotation.companyIfsc,
      quotation.companyAddress,
      quotation.companyPhone,
      quotation.companyEmail,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'QUOTATIONS!A:CZ',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log(`✅ Created quotation: ${quotation.quotationId}`);
  } catch (error: any) {
    console.error('❌ Error creating quotation:', error);
    throw new Error(`Failed to create quotation: ${error.message}`);
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
      range: 'QUOTATIONS!A2:CZ10000',
    });

    const rows = response.data.values || [];

    // Get headers
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'QUOTATIONS!A1:CZ1',
    });

    const headers = headerResponse.data.values?.[0] || [];

    // Find the row index (add 2 because: 1 for header, 1 for 0-indexed)
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const rowQuotationId = rows[i][0]; // quotationId is first column
      const rowOrgId = rows[i][headers.indexOf('organizationId')] || 
                      (rows[i][headers.indexOf('companyName')] === 'HOPE ENERGY' ? 'hope-energy' : 'default-org');

      if (rowQuotationId === quotationId && rowOrgId.toLowerCase() === orgId.toLowerCase()) {
        rowIndex = i + 2; // +2 for header row and 0-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Quotation not found');
    }

    // Update specific columns
    const updatePromises = Object.entries(updates).map(([key, value]) => {
      const colIndex = headers.indexOf(key);
      if (colIndex === -1) return null;

      const colLetter = columnToLetter(colIndex);
      const range = `QUOTATIONS!${colLetter}${rowIndex}`;

      return sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[value]] },
      });
    }).filter(p => p !== null);

    await Promise.all(updatePromises);

    console.log(`✅ Updated quotation: ${quotationId}`);
  } catch (error: any) {
    console.error('❌ Error updating quotation:', error);
    throw new Error(`Failed to update quotation: ${error.message}`);
  }
}

/**
 * Helper: Convert row array to Quotation object
 */
function rowToQuotation(row: any[], headers: string[], filterOrgId: string): Quotation | null {
  if (!row || row.length === 0) return null;

  const get = (key: string) => {
    const index = headers.indexOf(key);
    return index >= 0 ? row[index] : '';
  };

  // Check organizationId filter
  const rowOrgId = get('organizationId') || 
                  (get('companyName') === 'HOPE ENERGY' ? 'hope-energy' : 'default-org');

  if (rowOrgId.toLowerCase() !== filterOrgId.toLowerCase()) {
    return null;
  }

  return {
    quotationId: get('quotationId') || '',
    organizationId: rowOrgId,
    organizationName: get('companyName') || 'HOPE ENERGY',
    sheetId: get('sheetId') || '',
    referenceNumber: get('referenceNumber') || '',
    leadId: get('leadId') || '',
    enquiryId: get('enquiryId') || '',
    quotationType: get('quotationType') || 'Initial',

    // Customer details
    customerName: get('customerName') || '',
    customerPhone: get('customerPhone') || '',
    customerEmail: get('customerEmail') || '',
    customerAddress: get('customerAddress') || '',
    location: get('location') || '',
    premisesType: get('premisesType') || 'Residence',

    // System details
    systemCapacity: parseFloat(get('systemCapacity')) || 0,
    systemType: get('systemType') || 'On-Grid',
    panelType: get('panelType') || 'RTS DCR',

    // Panel details
    panelMake: get('panelMake') || '',
    panelModel: get('panelModel') || '',
    panelWattage: parseInt(get('panelWattage')) || 0,
    panelQuantity: parseInt(get('panelQuantity')) || 0,
    panelWarranty: get('panelWarranty') || '',

    // Inverter details
    inverterMake: get('inverterMake') || '',
    inverterModel: get('inverterModel') || '',
    inverterCapacity: parseFloat(get('inverterCapacity')) || 0,
    inverterQuantity: parseInt(get('inverterQuantity')) || 1,
    inverterWarranty: get('inverterWarranty') || '',

    // Other components
    structureType: get('structureType') || '',
    structureMake: get('structureMake') || '',
    structureWarranty: get('structureWarranty') || '',
    bosItems: get('bosItems') || '',
    bosWarranty: get('bosWarranty') || '',
    cableMake: get('cableMake') || '',
    cableWarranty: get('cableWarranty') || '',
    earthingType: get('earthingType') || '',
    earthingQuantity: parseInt(get('earthingQuantity')) || 0,
    earthingWarranty: get('earthingWarranty') || '',
    lightningArrestorType: get('lightningArrestorType') || '',
    lightningArrestorQuantity: parseInt(get('lightningArrestorQuantity')) || 0,
    lightningArrestorWarranty: get('lightningArrestorWarranty') || '',
    maintenanceYears: parseInt(get('maintenanceYears')) || 5,
    gridConnectivityIncluded: get('gridConnectivityIncluded') === 'TRUE',
    netMeteringIncluded: get('netMeteringIncluded') === 'TRUE',

    // Pricing
    baseCost: parseFloat(get('baseCost')) || 0,
    gstPercentage: parseFloat(get('gstPercentage')) || 0,
    gstAmount: parseFloat(get('gstAmount')) || 0,
    totalCost: parseFloat(get('totalCost')) || 0,
    subsidyAmount: parseFloat(get('subsidyAmount')) || 0,
    finalAmount: parseFloat(get('finalAmount')) || 0,

    // Payment terms
    advancePercentage: parseInt(get('advancePercentage')) || 70,
    preDispatchPercentage: parseInt(get('preDispatchPercentage')) || 20,
    preGridPercentage: parseInt(get('preGridPercentage')) || 10,
    paymentTerms: get('paymentTerms') || '',

    // Status tracking
    status: get('status') || 'Draft',
    createdBy: get('createdBy') || '',
    createdDate: get('createdDate') || new Date().toISOString(),
    sentBy: get('sentBy') || '',
    sentDate: get('sentDate') || '',
    viewCount: parseInt(get('viewCount')) || 0,
    firstViewedDate: get('firstViewedDate') || '',
    lastViewedDate: get('lastViewedDate') || '',
    approvedBy: get('approvedBy') || '',
    approvedDate: get('approvedDate') || '',
    rejectedReason: get('rejectedReason') || '',
    validUntilDate: get('validUntilDate') || '',

    // URLs
    publicToken: get('publicToken') || '',
    publicUrl: get('publicUrl') || '',
    pdfUrl: get('pdfUrl') || '',
    qrCodeUrl: get('qrCodeUrl') || '',

    // Additional
    notes: get('notes') || '',
    termsAndConditions: get('termsAndConditions') || '',
    loanAvailable: get('loanAvailable') === 'TRUE',
    loanInterestRate: parseFloat(get('loanInterestRate')) || 0,

    // Company details
    companyName: get('companyName') || '',
    companyGst: get('companyGst') || '',
    companyUdyam: get('companyUdyam') || '',
    companyCspdclReg: get('companyCspdclReg') || '',
    companyBankName: get('companyBankName') || '',
    companyAccountNumber: get('companyAccountNumber') || '',
    companyIfsc: get('companyIfsc') || '',
    companyAddress: get('companyAddress') || '',
    companyPhone: get('companyPhone') || '',
    companyEmail: get('companyEmail') || '',
  };
}

/**
 * Helper: Convert column index to letter (0 = A, 25 = Z, 26 = AA, etc.)
 */
function columnToLetter(index: number): string {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}