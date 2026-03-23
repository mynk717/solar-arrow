// src/app/api/leads/convert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { convertLeadToEnquiry } from '@/lib/googleSheets';
import { sendOrgGroupNotification } from '@/lib/telegram';
import {redis} from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, enquiryData } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // Convert lead to enquiry
    const enquiry = await convertLeadToEnquiry(leadId, enquiryData, session.user.email);

    try {
      const orgId = (session.user as any).organizationId || 'default-org';
      await sendOrgGroupNotification(orgId, {
        text: `🎯 *LEAD CONVERTED TO ENQUIRY*\n\n*Lead:* ${leadId}\n*Enquiry:* ${enquiry.id}\n*Customer:* ${enquiry.customerName}\n*Capacity:* ${enquiry.capacity} kW\n*Source:* ${enquiry.leadSource || 'N/A'}\n\n*Converted By:* ${session.user.email}\n\n_Ready for survey scheduling._`,
        parseMode: 'Markdown',
      });
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    console.error('Error converting lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert lead' },
      { status: 500 }
    );
  }
}