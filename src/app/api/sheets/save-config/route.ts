import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const userSheetConfigs = new Map<string, { sheetId: string; sheetName: string }>();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sheetId, sheetName } = await request.json();
    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet ID is required' }, { status: 400 });
    }

    userSheetConfigs.set(session.user.email, {
      sheetId,
      sheetName: sheetName || 'Sheet1'
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = userSheetConfigs.get(session.user.email);

    return NextResponse.json({
      sheetId: config?.sheetId || '',
      sheetName: config?.sheetName || 'Sheet1',
      isConfigured: !!config
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get configuration' },
      { status: 500 }
    );
  }
}
