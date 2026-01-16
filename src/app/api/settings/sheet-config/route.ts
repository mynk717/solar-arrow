import { NextResponse } from 'next/server';
import { getSheetConfig, saveSheetConfig } from '@/lib/sheetConfigStore';

export async function GET() {
  try {
    const config = await getSheetConfig();
    
    return NextResponse.json({
      sheetId: config.sheetId || '',
      sheetName: config.sheetName || 'Sheet1',
      serviceAccountEmail: config.serviceAccountEmail || '',
      privateKey: config.privateKey ? '***HIDDEN***' : '',
      isConnected: !!config.sheetId,
      lastSync: config.lastSync
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.sheetId || !body.serviceAccountEmail || !body.privateKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await saveSheetConfig({
      sheetId: body.sheetId,
      sheetName: body.sheetName || 'Sheet1',
      serviceAccountEmail: body.serviceAccountEmail,
      privateKey: body.privateKey,
      lastSync: new Date()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
