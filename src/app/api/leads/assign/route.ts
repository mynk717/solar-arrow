import { notifyLeadAssigned } from '@/lib/telegram';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { fetchLeads, updateLead } from '@/lib/googleSheets';
import { invalidateLeadsCache } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin and sales managers can assign
    const userRole = session.user.role || 'user';
    if (!['admin', 'owner', 'sales'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { leadIds, assignToEmail, assignToName, assignmentType } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'Invalid lead IDs' }, { status: 400 });
    }

    if (!assignToEmail) {
      return NextResponse.json({ error: 'Assignee email required' }, { status: 400 });
    }

    const results: any[] = [];
    const errors: any[] = [];
    const orgId = (session.user as any).organizationId || 'default-org'; // ✅ Moved up for cache invalidation

    console.log('🔍 Starting lead assignment for', leadIds.length, 'leads');

    for (const leadId of leadIds) {
      try {
        console.log(`📝 Assigning lead ${leadId} to ${assignToEmail}`);

        // Update lead with assignment
        await updateLead(
          leadId,
          {
            assignedTo: assignToEmail,
            assignedToName: assignToName || assignToEmail,
            assignedDate: new Date(),
            status: 'assigned',
            lastActivityBy: session.user.email,
            lastActivityDate: new Date(),
          },
          session.user.email || 'system'
        );

        console.log(`✅ Lead ${leadId} updated in Google Sheets`);

        // Telegram notification - WITH BETTER ERROR HANDLING
        try {
          console.log('📱 Sending Telegram notification...');
          console.log('🔍 OrgId:', orgId);
          
          const allLeads = await fetchLeads();
          const lead = allLeads.find((l: any) => l.id === leadId);

          if (!lead) {
            console.error('❌ Lead not found in fetchLeads for notification');
          } else {
            console.log('🔍 Found lead:', lead.customerName);
            
            const notificationData = {
              id: leadId,
              customerName: lead?.customerName || 'Unknown',
              phone: lead?.phone || 'N/A',
              area: lead?.area,
              capacity: lead?.capacity,
              priority: (lead?.priority as any) || 'medium',
              assignedToName: assignToName || assignToEmail,
              assignedToEmail: assignToEmail,
            };
            
            console.log('📤 Notification data:', notificationData);
            
            const notifyResult = await notifyLeadAssigned(orgId, notificationData);
            
            console.log('✅ Notification result:', notifyResult);
          }
        } catch (notificationError: any) {
          console.error('⚠️ Telegram notification failed (non-blocking):', notificationError);
          console.error('⚠️ Error details:', notificationError.message);
          // Don't fail the assignment if notification fails
        }

        results.push({ leadId, success: true });
      } catch (error: any) {
        console.error(`❌ Failed to assign lead ${leadId}:`, error);
        errors.push({ leadId, error: error.message });
      }
    }

    // ✅ CRITICAL: Invalidate cache after ALL assignments complete
    console.log('🔄 Invalidating leads cache for orgId:', orgId);
    try {
      await invalidateLeadsCache(orgId);
      console.log('✅ Cache invalidated successfully');
    } catch (cacheError: any) {
      console.error('⚠️ Cache invalidation failed (non-blocking):', cacheError);
      // Don't fail the assignment if cache invalidation fails
    }

    console.log(`✅ Assignment complete: ${results.length} succeeded, ${errors.length} failed`);

    return NextResponse.json({
      success: true,
      assigned: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('❌ Assignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
