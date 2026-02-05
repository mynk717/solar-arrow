// src/app/api/sheets/save-config/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { google } from 'googleapis';
import { getValidAccessToken } from '@/lib/tokenRefresh';  // ✅ Import fixed function

const CONFIG_FILE_NAME = 'solar_arrow_config.json';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ✅ Use validated token with refresh
    const accessToken = await getValidAccessToken(session.user.organizationId);
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Authentication expired. Please re-authenticate.' 
      }, { status: 401 });
    }

    const { sheetId, sheetName, organizationDomain } = await request.json();
    
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });  // ✅ Validated token
    
    const drive = google.drive({ version: 'v3', auth });

    // Check if config file exists
    const existingFiles = await drive.files.list({
      q: `name='${CONFIG_FILE_NAME}' and trashed=false`,
      spaces: 'appDataFolder',
      fields: 'files(id, name)'
    });

    const configData = {
      sheetId,
      sheetName: sheetName || 'Sheet1',
      organizationDomain: organizationDomain || session.user?.email?.split('@')[1],
      updatedAt: new Date().toISOString(),
      updatedBy: session.user?.email
    };

    if (existingFiles.data.files && existingFiles.data.files.length > 0) {
      // Update existing file
      const fileId = existingFiles.data.files[0].id!;
      
      await drive.files.update({
        fileId,
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(configData, null, 2)
        }
      });
    } else {
      // Create new file
      await drive.files.create({
        requestBody: {
          name: CONFIG_FILE_NAME,
          parents: ['appDataFolder']
        },
        media: {
          mimeType: 'application/json',
          body: JSON.stringify(configData, null, 2)
        },
        fields: 'id'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration saved to Google Drive'
    });

  } catch (error: any) {
    console.error('Error saving config:', error);
    
    // ✅ Better error messages
    if (error.status === 401 || error.code === 401) {
      return NextResponse.json({ 
        error: 'Authentication expired. Please re-authenticate.' 
      }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // ✅ Use validated token
    const accessToken = await getValidAccessToken(session.user.organizationId);
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Authentication expired. Please re-authenticate.' 
      }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    const drive = google.drive({ version: 'v3', auth });

    // Find config file
    const files = await drive.files.list({
      q: `name='${CONFIG_FILE_NAME}' and trashed=false`,
      spaces: 'appDataFolder',
      fields: 'files(id, name)'
    });

    if (!files.data.files || files.data.files.length === 0) {
      return NextResponse.json({
        configured: false,
        sheetId: null,
        sheetName: null
      });
    }

    // Read file content
    const fileId = files.data.files[0].id!;
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'text' });

    const config = JSON.parse(response.data as string);

    return NextResponse.json({
      configured: true,
      sheetId: config.sheetId,
      sheetName: config.sheetName,
      organizationDomain: config.organizationDomain,
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy
    });

  } catch (error: any) {
    console.error('Error getting config:', error);
    
    if (error.status === 401 || error.code === 401) {
      return NextResponse.json({ 
        error: 'Authentication expired. Please re-authenticate.' 
      }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to get configuration' },
      { status: 500 }
    );
  }
}
