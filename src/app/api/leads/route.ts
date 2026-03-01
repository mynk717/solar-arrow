// src/app/api/leads/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { fetchLeads, createLead } from '@/lib/googleSheets';
import { sendOrgGroupNotification } from '@/lib/telegram';


// GET - Fetch all leads
// GET - Fetch all leads
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawLeads = await fetchLeads();
    
    // ✅ Format leads to match Lead type
    const formattedLeads = rawLeads.map((lead: any) => ({
      id: lead.id,
      customerName: lead.customerName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      address: lead.address || '',
      area: lead.area || '',
      capacity: lead.capacity ? `${lead.capacity}kW` : undefined,
      status: lead.leadStatus || lead.status || 'new',
      source: lead.leadSource || 'website',
      assignedTo: lead.leadAssignedTo || '',
      assignedToName: lead.assignedToName || '',
      qualified: lead.leadQualified === 'TRUE' || lead.leadQualified === true,
      qualifiedDate: lead.leadQualifiedDate || '',
      converted: !!lead.leadConvertedDate,
      convertedDate: lead.leadConvertedDate || '',
      enquiryId: lead.enquiryId || '',
      estimatedBudget: lead.estimatedCost || '',
      priority: lead.priority || 'medium',
      notes: lead.leadNotes || lead.notes || '',
      tags: lead.tags || '',
      contactAttempts: lead.contactAttempts || 0,
      createdAt: lead.createdAt || new Date().toISOString(),
      updatedAt: lead.updatedAt || new Date().toISOString(),
      createdBy: lead.createdBy || 'system',
    }));

    return NextResponse.json(formattedLeads);
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}


// POST - Create new lead
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leadData = await request.json();
    const newLead = await createLead(leadData, session.user.email);

    // Notify org group about new lead
    try {
      const orgId = (session.user as any).organizationId ?? 'default-org';
      await sendOrgGroupNotification(orgId, {
        text: `🆕 *NEW LEAD CAPTURED*\n👤 *${newLead.customerName || leadData.customerName}*\n📞 ${newLead.phone || leadData.phone || 'N/A'}\n📍 ${newLead.area || leadData.area || 'N/A'} · ${newLead.capacity || leadData.capacity || '?'}kW\n🔗 Source: ${leadData.source || 'Direct'}\n➕ Added by: ${session.user.name || session.user.email}`,
        parseMode: 'Markdown',
      });
    } catch (notifError) {
      console.error('Telegram notification failed (non-blocking):', notifError);
    }

    return NextResponse.json(newLead, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    );
  }
}