import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateEnquiryInSheet, fetchEnquiryById } from '@/lib/googleSheets';
import { telegramBot, notifyNextStageUsers } from '@/lib/telegram';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enquiryId } = await request.json();

    if (!enquiryId) {
      return NextResponse.json({ error: 'Missing enquiry ID' }, { status: 400 });
    }

    const enquiry = await fetchEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    await updateEnquiryInSheet(enquiryId, {
      gridSyncDate: new Date().toISOString().split('T')[0],
      liaisonStage: 'grid_synced',
      status: 'active',
      activationDate: new Date().toISOString().split('T')[0],
    });

    // Send Telegram notifications
    const sheetId = session.user.sheetId;
    if (sheetId) {
      try {
        const chatIdsData = await redis.get(`sheet:${sheetId}:liaison_notify`);
        const chatIds = chatIdsData ? JSON.parse(chatIdsData as string) : [];
        
        const message = `
🎉 *Grid Synchronization Complete!*

📋 *Enquiry:* ${enquiryId}
👤 *Customer:* ${enquiry.customerName}
🆔 *Registration:* ${enquiry.registrationId || 'N/A'}
⚡ *Capacity:* ${enquiry.capacity} kW

✅ *Status:* System is now ACTIVE & OPERATIONAL
📅 *Activation Date:* ${new Date().toLocaleDateString()}

🌞 Solar power system successfully connected to grid!
        `.trim();

        for (const chatId of chatIds) {
          if (chatId) {
            await telegramBot.sendMessage(chatId, message, 'Markdown');
          }
        }
      } catch (error) {
        console.error('Telegram notification failed:', error);
      }
    }
    const orgId = (session.user as any).organizationId || 'default-org';
    await notifyNextStageUsers(
      orgId,
      '/subsidy',
      `🔔 *Action Required: Subsidy Claim*\n\n📋 *Enquiry:* ${enquiryId}\n👤 *Customer:* ${enquiry.customerName}\n⚡ *Capacity:* ${enquiry.capacity} kW\n\n_System is now active & grid-synced. Please initiate PM Surya Ghar subsidy claim._`
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error syncing with grid:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
