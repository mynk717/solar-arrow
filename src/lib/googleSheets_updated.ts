import { google } from 'googleapis';
import { Enquiry } from './types';
import { getSheetConfig } from './sheetConfigStore';

async function getAuthenticatedSheets() {
  const config = await getSheetConfig();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.serviceAccountEmail,
      private_key: config.privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return {
    sheets: google.sheets({ version: 'v4', auth }),
    config
  };
}

export async function fetchEnquiries(): Promise<Enquiry[]> {
  try {
    const { sheets, config } = await getAuthenticatedSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${config.sheetName}!A2:AB`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((row) => rowToEnquiry(row));
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    throw new Error('Failed to fetch enquiries from Google Sheets');
  }
}

export async function addEnquiry(enquiry: Enquiry): Promise<void> {
  try {
    const { sheets, config } = await getAuthenticatedSheets();

    await sheets.spreadsheets.values.append({
      spreadsheetId: config.sheetId,
      range: `${config.sheetName}!A:AB`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [enquiryToRow(enquiry)],
      },
    });
  } catch (error) {
    console.error('Error adding enquiry:', error);
    throw new Error('Failed to add enquiry to Google Sheets');
  }
}

export async function updateEnquiry(enquiry: Enquiry): Promise<void> {
  try {
    const { sheets, config } = await getAuthenticatedSheets();

    const allEnquiries = await fetchEnquiries();
    const rowIndex = allEnquiries.findIndex((e) => e.id === enquiry.id);

    if (rowIndex === -1) {
      throw new Error('Enquiry not found');
    }

    const sheetRowIndex = rowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: `${config.sheetName}!A${sheetRowIndex}:AB${sheetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [enquiryToRow(enquiry)],
      },
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    throw new Error('Failed to update enquiry in Google Sheets');
  }
}

export async function deleteEnquiry(id: string): Promise<void> {
  try {
    const { sheets, config } = await getAuthenticatedSheets();

    const allEnquiries = await fetchEnquiries();
    const rowIndex = allEnquiries.findIndex((e) => e.id === id);

    if (rowIndex === -1) {
      throw new Error('Enquiry not found');
    }

    const sheetRowIndex = rowIndex + 1;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: config.sheetId,
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
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    throw new Error('Failed to delete enquiry from Google Sheets');
  }
}

export async function getNextEnquiryId(): Promise<string> {
  const enquiries = await fetchEnquiries();
  if (enquiries.length === 0) {
    return 'ENQ001';
  }

  const lastId = enquiries[enquiries.length - 1].id;
  const numericPart = parseInt(lastId.replace('ENQ', ''));
  const nextNumber = numericPart + 1;
  return `ENQ${String(nextNumber).padStart(3, '0')}`;
}

function rowToEnquiry(row: any[]): Enquiry {
  return {
    id: row[0] || '',
    customerName: row[1] || '',
    phone: row[2] || '',
    email: row[3] || '',
    address: row[4] || '',
    area: row[5] || '',
    capacity: row[6] || '',
    status: row[7] as any || 'new',
    createdAt: row[8] ? new Date(row[8]) : new Date(),
    updatedAt: row[9] ? new Date(row[9]) : new Date(),
    surveyDate: row[10] ? new Date(row[10]) : undefined,
    surveyedBy: row[11] || undefined,
    surveyNotes: row[12] || undefined,
    surveyApproved: row[13] === 'TRUE',
    registrationId: row[14] || undefined,
    registrationDate: row[15] ? new Date(row[15]) : undefined,
    vendorName: row[16] || undefined,
    estimatedCost: row[17] ? parseFloat(row[17]) : undefined,
    initialPayment: row[18] ? parseFloat(row[18]) : undefined,
    paymentDate: row[19] ? new Date(row[19]) : undefined,
    paymentMethod: row[20] || undefined,
    dispatchDate: row[21] ? new Date(row[21]) : undefined,
    installationDate: row[22] ? new Date(row[22]) : undefined,
    installedBy: row[23] || undefined,
    inspectionDate: row[24] ? new Date(row[24]) : undefined,
    inspectionOfficer: row[25] || undefined,
    inspectionApproved: row[26] === 'TRUE',
    activationDate: row[27] ? new Date(row[27]) : undefined,
  };
}

function enquiryToRow(enquiry: Enquiry): any[] {
  return [
    enquiry.id,
    enquiry.customerName,
    enquiry.phone,
    enquiry.email,
    enquiry.address,
    enquiry.area,
    enquiry.capacity,
    enquiry.status,
    enquiry.createdAt.toISOString().split('T')[0],
    enquiry.updatedAt.toISOString().split('T')[0],
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
}