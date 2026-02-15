// src/app/api/leads/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchLeads } from '@/lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    const rawLeads = await fetchLeads();
    
    // Format leads
    let formattedLeads = rawLeads.map((lead: any) => ({
      id: lead.id,
      customerName: lead.customerName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      address: lead.address || '',
      area: lead.area || '',
      capacity: lead.capacity ? `${lead.capacity}kW` : undefined,
      status: lead.status || 'new',
      source: lead.source || 'website',
      assignedTo: lead.assignedTo || '',
      assignedToName: lead.assignedToName || '',
      qualified: lead.qualified === true,
      qualifiedDate: lead.qualifiedDate || '',
      converted: lead.converted === true,
      convertedDate: lead.convertedDate || '',
      enquiryId: lead.enquiryId || '',
      estimatedBudget: lead.estimatedBudget || '',
      priority: lead.priority || 'medium',
      notes: lead.notes || '',
      tags: lead.tags || [],
      contactAttempts: lead.contactAttempts || 0,
      createdAt: lead.createdAt || new Date().toISOString(),
      updatedAt: lead.updatedAt || new Date().toISOString(),
      createdBy: lead.createdBy || 'system',
    }));

    // Apply filters
    if (status) {
      formattedLeads = formattedLeads.filter((lead: any) => 
        lead.status?.toLowerCase() === status.toLowerCase()
      );
    }

    if (assignedTo) {
      formattedLeads = formattedLeads.filter((lead: any) => 
        lead.assignedTo === assignedTo
      );
    }

    return NextResponse.json({
      success: true,
      leads: formattedLeads,
      count: formattedLeads.length,
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
