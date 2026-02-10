import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { redis } from '@/lib/redis';
import { getValidAccessToken } from '@/lib/tokenRefresh';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const googleId = session.userId || session.user?.id;
    const refreshToken = session.refreshToken;
    
    const internalUserId = await redis.get(`googleId:${googleId}`) as string;
    const sheetId = await redis.get(`user:${internalUserId}:activeSheet`) as string;
    const accessToken = await getValidAccessToken(internalUserId, refreshToken || '');

    if (!accessToken || !sheetId) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 401 });
    }

    // Create BRANCHES sheet
    const createRequest = {
      requests: [{
        addSheet: {
          properties: {
            title: 'BRANCHES',
            gridProperties: {
              rowCount: 1000,
              columnCount: 15,
              frozenRowCount: 1
            }
          }
        }
      }]
    };

    const createResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest)
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      return NextResponse.json({ error: 'Failed to create sheet', details: error }, { status: 500 });
    }

    const createResult = await createResponse.json();
    const newSheetId = createResult.replies[0].addSheet.properties.sheetId;

    // Add headers
    const headers = [
      'ID', 'Name', 'City', 'State', 'Address', 'Phone', 'Email',
      'Manager Name', 'Manager Email', 'Is Active', 'Created At',
      'Employees Count', 'Projects Count', 'Region', 'Notes'
    ];

    const headerRequest = {
      requests: [{
        updateCells: {
          range: {
            sheetId: newSheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: headers.length
          },
          rows: [{
            values: headers.map(header => ({
              userEnteredValue: { stringValue: header },
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.5, blue: 0.8 },
                textFormat: { 
                  bold: true, 
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 11
                },
                horizontalAlignment: 'CENTER'
              }
            }))
          }],
          fields: 'userEnteredValue,userEnteredFormat'
        }
      }]
    };

    const headerResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(headerRequest)
      }
    );

    if (!headerResponse.ok) {
      return NextResponse.json({ 
        success: true,
        warning: 'Sheet created but failed to format headers'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'BRANCHES tab created successfully!',
      sheetId: newSheetId
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
