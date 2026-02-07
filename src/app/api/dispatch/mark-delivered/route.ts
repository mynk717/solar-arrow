// src/app/api/dispatch/mark-delivered/route.ts
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
    const { enquiryId, deliveredBy, customerSignature, notes } = body;

    if (!enquiryId) {
      return NextResponse.json(
        { error: 'Missing enquiry ID' },
        { status: 400 }
      );
    }

    const deliveryDate = new Date();

    // Update in Google Sheets
    const updateData = {
      deliveredDate: deliveryDate.toISOString(),
      deliveryStatus: 'delivered',
      deliveredBy: deliveredBy || session.user.email,
      deliveryNotes: notes,
      customerSignature: customerSignature || 'Received',
      status: 'installation', // Move to installation stage
    };

    await updateEnquiryInSheet(enquiryId, updateData);

    // Send notification
    const message = `
✅ *Material Delivered Successfully*

📋 *Enquiry ID:* ${enquiryId}
📅 *Delivery Date:* ${deliveryDate.toLocaleDateString('en-IN')}
👤 *Delivered By:* ${updateData.deliveredBy}

${notes ? `💬 *Notes:* ${notes}` : ''}

🔧 Next Step: Installation can now begin.
    `.trim();

    const teamChatId = process.env.TELEGRAM_TEAM_CHAT_ID;
    if (teamChatId) {
      await telegramBot.sendMessage(teamChatId, message);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Delivery marked successfully',
      deliveryDate: deliveryDate.toISOString(),
    });
  } catch (error: any) {
    console.error('Error marking delivery:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark delivery' },
      { status: 500 }
    );
  }
}
