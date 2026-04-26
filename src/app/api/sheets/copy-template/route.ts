import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { google } from 'googleapis';
import { getValidAccessToken } from '@/lib/tokenRefresh';


const TEMPLATE_SHEET_ID = '19V_ipRh36LmBuTCKx_z_1M_O3ice0ZFBS0iTDpvMzS4';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId || !session?.user?.email) {
            return NextResponse.json(
        { error: 'Unauthorized. Please sign in with Google.' },
        { status: 401 }
      );
    }

    const { title } = await request.json();
    const sheetTitle = title || `Solar Arrow Data - ${new Date().toLocaleDateString()}`;

    const accessToken = await getValidAccessToken(
      session.user.organizationId,
      session.user.email
    );
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google token expired. Please re-authenticate.' },
        { status: 401 }
      );
    }
    
    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: accessToken,
    });
    const drive = google.drive({ version: 'v3', auth });
    const copiedFile = await drive.files.copy({
      fileId: TEMPLATE_SHEET_ID,
      requestBody: {
        name: sheetTitle,
      },
    });

    const newSheetId = copiedFile.data.id;

    // Share with service account (non-fatal if fails)
    try {
      await drive.permissions.create({
        fileId: newSheetId!,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: process.env.GOOGLE_CLIENT_EMAIL!,
        },
      });
    } catch (permError) {
      console.warn('Sheet copied but service account share failed:', permError);
    }

    return NextResponse.json({
      success: true,
      sheetId: newSheetId,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${newSheetId}/edit`,
      message: 'Template copied successfully!'
    });

  } catch (error: any) {
    console.error('Error copying template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to copy template' },
      { status: 500 }
    );
  }
}
