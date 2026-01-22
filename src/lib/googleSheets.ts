import { google } from 'googleapis';
import { Enquiry, EnquiryStatus, PanelTag, PaymentType, SubsidyStatus } from './types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get Google Sheets client - supports BOTH service account AND user OAuth
const getGoogleSheetsClient = async (userAccessToken?: string) => {
  if (userAccessToken) {
    // Use user's OAuth token (for their personal sheet)
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: userAccessToken });
    return google.sheets({ version: 'v4', auth });
  } else {
    // Use service account (admin/shared sheet)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
  }
};

// Get sheet configuration - user's sheet OR fallback to env
const getSheetConfig = async () => {
  try {
    // Try to get user's configured sheet from API
    const response = await fetch('/api/sheets/save-config');
    if (response.ok) {
      const data = await response.json();
      if (data.sheetId) {
        return {
          sheetId: data.sheetId,
          sheetName: data.sheetName || 'Sheet1',
        };
      }
    }
  } catch (error) {
    // Ignore and fallback to env
  }

  // Fallback to environment variables (service account mode)
  return {
    sheetId: process.env.GOOGLE_SHEET_ID || '',
    sheetName: 'Sheet1',
  };
};

// Convert row data to Enquiry object
const rowToEnquiry = (row: any[]): Enquiry | null => {
  if (!row || row.length < 7) return null;

  const [
    id,
    customerName,
    phone,
    email,
    address,
    area,
    capacity,
    status,
    createdAt,
    updatedAt,
    panelTag,
    // Survey details
    surveyDate,
    surveyedBy,
    surveyNotes,
    surveyApproved,
    // Registration details
    registrationId,
    registrationDate,
    vendorName,
    governmentPortalRef,
    // Payment details
    estimatedCost,
    initialPayment,
    paymentDate,
    paymentMethod,
    paymentType,
    // Subsidy details
    subsidyAmount,
    subsidyStatus,
    subsidyAppliedDate,
    subsidyApprovedDate,
    subsidyDisbursedDate,
    // Quotation
    quotationId,
    quotationDate,
    quotationAmount,
    quotationApprovedDate,
    quotationApprovedBy,
    // Dispatch/Installation
    dispatchDate,
    installationDate,
    installedBy,
    // Inspection
    inspectionDate,
    inspectionOfficer,
    inspectionApproved,
    activationDate,
    // Additional tracking
    assignedTo,
    priority,
  ] = row;

  return {
    id: id || '',
    customerName: customerName || '',
    phone: phone || '',
    email: email || '',
    address: address || '',
    area: area || '',
    capacity: capacity || '3',
    status: (status || 'new') as EnquiryStatus,
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    panelTag: (panelTag || 'RTS') as PanelTag,
    
    // Survey details
    surveyDate: surveyDate ? new Date(surveyDate) : undefined,
    surveyedBy: surveyedBy || undefined,
    surveyNotes: surveyNotes || undefined,
    surveyApproved: surveyApproved === 'TRUE',
    
    // Registration details
    registrationId: registrationId || undefined,
    registrationDate: registrationDate ? new Date(registrationDate) : undefined,
    vendorName: vendorName || undefined,
    governmentPortalRef: governmentPortalRef || undefined,
    
    // Payment details
    estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
    initialPayment: initialPayment ? parseFloat(initialPayment) : undefined,
    paymentDate: paymentDate ? new Date(paymentDate) : undefined,
    paymentMethod: paymentMethod || undefined,
    paymentType: (paymentType || 'Direct') as PaymentType,
    
    // Subsidy details
    subsidyAmount: subsidyAmount ? parseFloat(subsidyAmount) : undefined,
    subsidyStatus: (subsidyStatus || undefined) as SubsidyStatus | undefined,
    subsidyAppliedDate: subsidyAppliedDate ? new Date(subsidyAppliedDate) : undefined,
    subsidyApprovedDate: subsidyApprovedDate ? new Date(subsidyApprovedDate) : undefined,
    subsidyDisbursedDate: subsidyDisbursedDate ? new Date(subsidyDisbursedDate) : undefined,
    
    // Quotation
    quotationId: quotationId || undefined,
    quotationDate: quotationDate ? new Date(quotationDate) : undefined,
    quotationAmount: quotationAmount ? parseFloat(quotationAmount) : undefined,
    quotationApprovedDate: quotationApprovedDate ? new Date(quotationApprovedDate) : undefined,
    quotationApprovedBy: quotationApprovedBy || undefined,
    
    // Dispatch/Installation
    dispatchDate: dispatchDate ? new Date(dispatchDate) : undefined,
    installationDate: installationDate ? new Date(installationDate) : undefined,
    installedBy: installedBy || undefined,
    
    // Inspection
    inspectionDate: inspectionDate ? new Date(inspectionDate) : undefined,
    inspectionOfficer: inspectionOfficer || undefined,
    inspectionApproved: inspectionApproved === 'TRUE',
    activationDate: activationDate ? new Date(activationDate) : undefined,
    
    // Additional tracking
    assignedTo: assignedTo || undefined,
    priority: (priority || undefined) as 'low' | 'medium' | 'high' | 'urgent' | undefined,
  };
};

// Convert Enquiry object to row data
const enquiryToRow = (enquiry: Enquiry): any[] => {
  return [
    enquiry.id,
    enquiry.customerName,
    enquiry.phone,
    enquiry.email,
    enquiry.address,
    enquiry.area,
    enquiry.capacity,
    enquiry.status,
    enquiry.createdAt?.toISOString().split('T')[0] || '',
    enquiry.updatedAt?.toISOString().split('T')[0] || '',
    enquiry.panelTag || 'RTS',
    // Survey details
    enquiry.surveyDate?.toISOString().split('T')[0] || '',
    enquiry.surveyedBy || '',
    enquiry.surveyNotes || '',
    enquiry.surveyApproved ? 'TRUE' : 'FALSE',
    // Registration details
    enquiry.registrationId || '',
    enquiry.registrationDate?.toISOString().split('T')[0] || '',
    enquiry.vendorName || '',
    enquiry.governmentPortalRef || '',
    // Payment details
    enquiry.estimatedCost || '',
    enquiry.initialPayment || '',
    enquiry.paymentDate?.toISOString().split('T')[0] || '',
    enquiry.paymentMethod || '',
    enquiry.paymentType || 'Direct',
    // Subsidy details
    enquiry.subsidyAmount || '',
    enquiry.subsidyStatus || '',
    enquiry.subsidyAppliedDate?.toISOString().split('T')[0] || '',
    enquiry.subsidyApprovedDate?.toISOString().split('T')[0] || '',
    enquiry.subsidyDisbursedDate?.toISOString().split('T')[0] || '',
    // Quotation
    enquiry.quotationId || '',
    enquiry.quotationDate?.toISOString().split('T')[0] || '',
    enquiry.quotationAmount || '',
    enquiry.quotationApprovedDate?.toISOString().split('T')[0] || '',
    enquiry.quotationApprovedBy || '',
    // Dispatch/Installation
    enquiry.dispatchDate?.toISOString().split('T')[0] || '',
    enquiry.installationDate?.toISOString().split('T')[0] || '',
    enquiry.installedBy || '',
    // Inspection
    enquiry.inspectionDate?.toISOString().split('T')[0] || '',
    enquiry.inspectionOfficer || '',
    enquiry.inspectionApproved ? 'TRUE' : 'FALSE',
    enquiry.activationDate?.toISOString().split('T')[0] || '',
    // Additional tracking
    enquiry.assignedTo || '',
    enquiry.priority || '',
  ];
};

// Fetch all enquiries from Google Sheets
export async function fetchEnquiries(userAccessToken?: string): Promise<Enquiry[]> {
  try {
    const sheets = await getGoogleSheetsClient(userAccessToken);
    const config = await getSheetConfig();
    
    if (!config.sheetId) {
      console.warn('No sheet ID configured');
      return [];
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${config.sheetName}!A2:AQ`,
    });

    const rows = response.data.values || [];
    
    return rows
      .map(rowToEnquiry)
      .filter((enquiry): enquiry is Enquiry => enquiry !== null);
  } catch (error: any) {
    console.error('Error fetching enquiries from Google Sheets:', error);
    // Return empty array instead of throwing
    return [];
  }
}

// Add new enquiry to Google Sheets
export async function addEnquiry(enquiry: Enquiry, userAccessToken?: string): Promise<void> {
  try {
    const sheets = await getGoogleSheetsClient(userAccessToken);
    const config = await getSheetConfig();
    
    const row = enquiryToRow(enquiry);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.sheetId,
      range: `${config.sheetName}!A:AQ`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    console.error('Error adding enquiry to Google Sheets:', error);
    throw new Error('Failed to add enquiry');
  }
}

// Create new enquiry (alias for addEnquiry)
export async function createEnquiry(enquiry: Enquiry, userAccessToken?: string): Promise<void> {
  return addEnquiry(enquiry, userAccessToken);
}

// Update existing enquiry in Google Sheets
export async function updateEnquiry(enquiry: Enquiry, userAccessToken?: string): Promise<void> {
  try {
    const sheets = await getGoogleSheetsClient(userAccessToken);
    const config = await getSheetConfig();
    
    // First, find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${config.sheetName}!A:A`,
    });

    const ids = response.data.values || [];
    const rowIndex = ids.findIndex((row) => row[0] === enquiry.id);
    
    if (rowIndex === -1) {
      throw new Error('Enquiry not found');
    }

    const rowNumber = rowIndex + 1;
    const row = enquiryToRow(enquiry);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: `${config.sheetName}!A${rowNumber}:AQ${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    console.error('Error updating enquiry in Google Sheets:', error);
    throw new Error('Failed to update enquiry');
  }
}

// Delete enquiry from Google Sheets
export async function deleteEnquiry(enquiryId: string, userAccessToken?: string): Promise<void> {
  try {
    const sheets = await getGoogleSheetsClient(userAccessToken);
    const config = await getSheetConfig();
    
    // Find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${config.sheetName}!A:A`,
    });

    const ids = response.data.values || [];
    const rowIndex = ids.findIndex((row) => row[0] === enquiryId);
    
    if (rowIndex === -1) {
      throw new Error('Enquiry not found');
    }

    const rowNumber = rowIndex + 1;
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: config.sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('Error deleting enquiry from Google Sheets:', error);
    throw new Error('Failed to delete enquiry');
  }
}

// Get next enquiry ID
export async function getNextEnquiryId(userAccessToken?: string): Promise<string> {
  try {
    const sheets = await getGoogleSheetsClient(userAccessToken);
    const config = await getSheetConfig();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${config.sheetName}!A:A`,
    });

    const ids = response.data.values || [];
    const lastId = ids[ids.length - 1]?.[0] || 'ENQ000';
    const number = parseInt(lastId.replace('ENQ', '')) + 1;
    
    return `ENQ${String(number).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error getting next enquiry ID:', error);
    return `ENQ${String(Date.now()).slice(-3)}`;
  }
}
