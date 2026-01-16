import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { sheetId, sheetName, serviceAccountEmail, privateKey } = await request.json();
    
    // Validate inputs
    if (!sheetId || !serviceAccountEmail || !privateKey) {
      return NextResponse.json(
        { error: 'Missing required credentials' },
        { status: 400 }
      );
    }
    
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Try to read from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName || 'Sheet1'}!A1:AB1000`,
    });
    
    const rows = response.data.values || [];
    const columnCount = rows[0]?.length || 0;
    
    // Verify column structure
    const expectedColumns = [
      'id', 'customerName', 'phone', 'email', 'address', 'area', 'capacity', 'status',
      'createdAt', 'updatedAt', 'surveyDate', 'surveyedBy', 'surveyNotes', 'surveyApproved',
      'registrationId', 'registrationDate', 'vendorName', 'estimatedCost', 'initialPayment',
      'paymentDate', 'paymentMethod', 'dispatchDate', 'installationDate', 'installedBy',
      'inspectionDate', 'inspectionOfficer', 'inspectionApproved', 'activationDate'
    ];
    
    const actualColumns = rows[0] || [];
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required columns: ${missingColumns.join(', ')}`,
          rowCount: rows.length,
          columnCount
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      rowCount: rows.length - 1,
      columnCount,
      message: 'Connection successful'
    });
    
  } catch (error: any) {
    console.error('Connection test failed:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.message?.includes('Unable to parse')) {
      errorMessage = 'Invalid private key format';
    } else if (error.message?.includes('not found')) {
      errorMessage = 'Sheet not found. Make sure the Sheet ID is correct and shared with the service account';
    } else if (error.message?.includes('permission')) {
      errorMessage = 'Permission denied. Make sure the sheet is shared with the service account email';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
