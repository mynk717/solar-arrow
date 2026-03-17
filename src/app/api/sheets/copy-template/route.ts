import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { google } from 'googleapis';

const TEMPLATE_SHEET_ID = '1w1D-6EeN7rlYpTc4dOyaEmUTX7hFQMe9ZcttpoiR6Jk';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in with Google.' },
        { status: 401 }
      );
    }

    const { title } = await request.json();
    const sheetTitle = title || `Solar Arrow Data - ${new Date().toLocaleDateString()}`;

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: session.accessToken,
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
