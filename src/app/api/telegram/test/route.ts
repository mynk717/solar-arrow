// src/app/api/telegram/test/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendOrgGroupNotification, sendUserDM } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json();
    const orgId = session.user.organizationId;
    const userEmail = session.user.email;

    // ✅ Add null checks for TypeScript
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID not found' }, { status: 400 });
    }

    if (type === 'group') {
      const result = await sendOrgGroupNotification(orgId, {
        text: `🧪 *Test Notification*\n\nThis is a test message from Solar Arrow!\n\n_Sent by: ${userEmail}_`,
      });

      if (!result.success) {
        return NextResponse.json({ 
          error: 'Failed to send. Make sure group chat ID is configured.' 
        }, { status: 400 });
      }
    } else if (type === 'personal') {
      if (!userEmail) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }

      const result = await sendUserDM(orgId, userEmail, {
        text: `🧪 *Test Personal Notification*\n\nThis is a test direct message from Solar Arrow!\n\n_Your account: ${userEmail}_`,
      });

      if (!result.success) {
        return NextResponse.json({ 
          error: 'Failed to send. Make sure your Telegram is connected.' 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Test notification sent!' });
  } catch (error: any) {
    console.error('❌ Test notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
