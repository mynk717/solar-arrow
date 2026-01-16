import { google } from 'googleapis';
import { Enquiry, EnquiryStatus } from './types';

// Initialize Google Sheets client
const getGoogleSheetsClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name

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
    surveyDate,
    surveyedBy,
    surveyNotes,
    surveyApproved,
    registrationId,
    registrationDate,
    vendorName,
    estimatedCost,
    initialPayment,
    paymentDate,
    paymentMethod,
    dispatchDate,
    installationDate,
    installedBy,
    inspectionDate,
    inspectionOfficer,
    inspectionApproved,
    activationDate,
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
    surveyDate: surveyDate ? new Date(surveyDate) : undefined,
    surveyedBy: surveyedBy || undefined,
    surveyNotes: surveyNotes || undefined,
    surveyApproved: surveyApproved === 'TRUE',
    registrationId: registrationId || undefined,
    registrationDate: registrationDate ? new Date(registrationDate) : undefined,
    vendorName: vendorName || undefined,
    estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
    initialPayment: initialPayment ? parseFloat(initialPayment) : undefined,
    paymentDate: paymentDate ? new Date(paymentDate) : undefined,
    paymentMethod: paymentMethod || undefined,
    dispatchDate: dispatchDate ? new Date(dispatchDate) : undefined,
    installationDate: installationDate ? new Date(installationDate) : undefined,
    installedBy: installedBy || undefined,
    inspectionDate: inspectionDate ? new Date(inspectionDate) : undefined,
    inspectionOfficer: inspectionOfficer || undefined,
    inspectionApproved: inspectionApproved === 'TRUE',
    activationDate: activationDate ? new Date(activationDate) : undefined,
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
    enquiry.surveyDate?.toISOString().split('T')[0] || '',
    enquiry.surveyedBy || '',
    enquiry.surveyNotes || '',
    enquiry.surveyApproved ? 'TRUE' : 'FALSE',
    enquiry.registrationId || '',
    enquiry.registrationDate?.toISOString().split('T')[0] || '',
    enquiry.vendorName || '',
    enquiry.estimatedCost || '',
    enquiry.initialPayment || '',
    enquiry.paymentDate?.toISOString().split('T')[0] || '',
    enquiry.paymentMethod || '',
    enquiry.dispatchDate?.toISOString().split('T')[0] || '',
    enquiry.installationDate?.toISOString().split('T')[0] || '',
    enquiry.installedBy || '',
    enquiry.inspectionDate?.toISOString().split('T')[0] || '',
    enquiry.inspectionOfficer || '',
    enquiry.inspectionApproved ? 'TRUE' : 'FALSE',
    enquiry.activationDate?.toISOString().split('T')[0] || '',
  ];
};

// Fetch all enquiries from Google Sheets
export async function fetchEnquiries(): Promise<Enquiry[]> {
  try {
    const sheets = getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A2:AB`, // Skip header row
    });

    const rows = response.data.values || [];
    
    return rows
      .map(rowToEnquiry)
      .filter((enquiry): enquiry is Enquiry => enquiry !== null);
  } catch (error) {
    console.error('Error fetching enquiries from Google Sheets:', error);
    throw new Error('Failed to fetch enquiries');
  }
}

// Add new enquiry to Google Sheets
export async function addEnquiry(enquiry: Enquiry): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();
    
    const row = enquiryToRow(enquiry);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:AB`,
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

// Update existing enquiry in Google Sheets
export async function updateEnquiry(enquiry: Enquiry): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();
    
    // First, find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const ids = response.data.values || [];
    const rowIndex = ids.findIndex((row) => row[0] === enquiry.id);
    
    if (rowIndex === -1) {
      throw new Error('Enquiry not found');
    }

    const rowNumber = rowIndex + 1; // +1 because sheets are 1-indexed
    const row = enquiryToRow(enquiry);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:AB${rowNumber}`,
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
export async function deleteEnquiry(enquiryId: string): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();
    
    // Find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });

    const ids = response.data.values || [];
    const rowIndex = ids.findIndex((row) => row[0] === enquiryId);
    
    if (rowIndex === -1) {
      throw new Error('Enquiry not found');
    }

    const rowNumber = rowIndex + 1;
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // First sheet
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
export async function getNextEnquiryId(): Promise<string> {
  try {
    const sheets = getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:A`,
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