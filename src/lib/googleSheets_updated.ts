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
    status: row[7] || 'new',
    createdAt: row[8] ? new Date(row[8]) : new Date(),
    updatedAt: row[9] ? new Date(row[9]) : new Date(),
    panelTag: row[10] || 'RTS', // ✅ Added
    surveyDate: row[11] ? new Date(row[11]) : undefined,
    surveyedBy: row[12],
    surveyNotes: row[13],
    surveyApproved: row[14] === 'TRUE' || row[14] === true,
    registrationId: row[15],
    registrationDate: row[16] ? new Date(row[16]) : undefined,
    vendorName: row[17],
    governmentPortalRef: row[18],
    estimatedCost: row[19] ? parseFloat(row[19]) : undefined,
    initialPayment: row[20] ? parseFloat(row[20]) : undefined,
    paymentDate: row[21] ? new Date(row[21]) : undefined,
    paymentMethod: row[22],
    paymentType: row[23] as any || 'Direct', // ✅ Added
    subsidyAmount: row[24] ? parseFloat(row[24]) : undefined,
    subsidyStatus: row[25] as any,
    subsidyAppliedDate: row[26] ? new Date(row[26]) : undefined,
    subsidyApprovedDate: row[27] ? new Date(row[27]) : undefined,
    subsidyDisbursedDate: row[28] ? new Date(row[28]) : undefined,
    quotationId: row[29],
    quotationDate: row[30] ? new Date(row[30]) : undefined,
    quotationAmount: row[31] ? parseFloat(row[31]) : undefined,
    quotationApprovedDate: row[32] ? new Date(row[32]) : undefined,
    quotationApprovedBy: row[33],
    dispatchDate: row[34] ? new Date(row[34]) : undefined,
    installationDate: row[35] ? new Date(row[35]) : undefined,
    installedBy: row[36],
    inspectionDate: row[37] ? new Date(row[37]) : undefined,
    inspectionOfficer: row[38],
    inspectionApproved: row[39] === 'TRUE' || row[39] === true,
    activationDate: row[40] ? new Date(row[40]) : undefined,
    assignedTo: row[41],
    priority: row[42] as any,
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