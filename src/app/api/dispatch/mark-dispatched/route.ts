// src/app/api/dispatch/mark-dispatched/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateEnquiryInSheet } from '@/lib/googleSheets';
import { telegramBot } from '@/lib/telegram';


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enquiryId, trackingNumber, transportCompany, notes } = body;

    if (!enquiryId) {
      return NextResponse.json(
        { error: 'Missing enquiry ID' },
        { status: 400 }
      );
    }

    const dispatchDate = new Date();
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 3);

    // Update in Google Sheets
    const updateData = {
      dispatchDate: dispatchDate.toISOString(),
      trackingNumber: trackingNumber || `TRACK-${Date.now()}`,
      transportCompany: transportCompany || 'Local Transport',
      expectedDelivery: expectedDelivery.toISOString(),
      dispatchStatus: 'dispatched',
      dispatchedBy: session.user.email,
      dispatchNotes: notes,
    };

    await updateEnquiryInSheet(enquiryId, updateData);

    // Send Telegram notification to customer and team
    const message = `
🚚 *Material Dispatched*

📋 *Enquiry ID:* ${enquiryId}
📦 *Tracking:* ${updateData.trackingNumber}
🚛 *Transport:* ${updateData.transportCompany}
📅 *Dispatch Date:* ${dispatchDate.toLocaleDateString('en-IN')}
📅 *Expected Delivery:* ${expectedDelivery.toLocaleDateString('en-IN')}

${notes ? `💬 *Notes:* ${notes}` : ''}
    `.trim();

    const teamChatId = process.env.TELEGRAM_TEAM_CHAT_ID;
    if (teamChatId) {
      await telegramBot.sendMessage(teamChatId, message);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Dispatch marked successfully',
      dispatchDate: dispatchDate.toISOString(),
      trackingNumber: updateData.trackingNumber,
    });
  } catch (error: any) {
    console.error('Error marking dispatch:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark dispatch' },
      { status: 500 }
    );
  }
}
