// src/lib/googleSheets.ts
import { google } from 'googleapis';
import { Enquiry, EnquiryStatus, PanelTag, PaymentType, SubsidyStatus } from './types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getValidAccessToken } from './tokenRefresh';


// ============================================
// AUTHENTICATION
// ============================================

/** Get authenticated Google Sheets client */
async function getAuthClient() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.organizationId || !session?.user?.email) {
    throw new Error('Not authenticated');
  }  

  // Get valid access token (auto-refreshes if expired)
  const accessToken = await getValidAccessToken(session.user.organizationId, session.user.email!);

  
  if (!accessToken) {
    throw new Error('Failed to get valid access token. Please re-authenticate.');
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

/** Get Sheet ID from session */
async function getSheetId(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sheetId) {
    throw new Error('No sheet ID configured');
  }

  return session.user.sheetId;
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
    const sheets = await getSheets();
    const sheetId = await getSheetId();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:DR', // 116 columns
    });

    const rows = response.data.values || [];
    return rows
      .map(rowToEnquiry)
      .filter((enquiry): enquiry is Enquiry => enquiry !== null);
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