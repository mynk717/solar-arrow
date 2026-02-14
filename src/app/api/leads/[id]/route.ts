// src/app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateLead, fetchLeads } from '@/lib/googleSheets';
import { notifyLeadStatusUpdate } from '@/lib/telegram';
import { notifyLeadActivity } from '@/lib/notificationHelpers';

// PATCH - Update lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();

    // Fetch current lead to track changes
    const allLeads = await fetchLeads();
    const currentLead = allLeads.find((l: any) => l.id === id);

    const updatedLead = await updateLead(id, updates, session.user.email);

    // 🚀 NEW: Send Telegram notification for lead updates
    try {
      const orgId = session.user.organizationId || 'default-org';

      // If status changed, send specific status update notification
      if (updates.status && currentLead && updates.status !== currentLead.status) {
        await notifyLeadStatusUpdate(orgId, {
          id: updatedLead.id,
          customerName: updatedLead.customerName || 'Unknown',
          oldStatus: currentLead.status || 'unknown',
          newStatus: updates.status,
          updatedBy: session.user.name || session.user.email || 'System',
          notes: updates.notes,
        });
      } else {
        // For any other updates, send general activity notification
        const displayUpdates: Record<string, any> = {};
        for (const [key, value] of Object.entries(updates)) {
          if (key !== 'id' && key !== 'updatedAt' && value !== undefined) {
            displayUpdates[key] = value;
          }
        }

        if (Object.keys(displayUpdates).length > 0) {
          await notifyLeadActivity(
            orgId,
            updatedLead.id,
            updatedLead.customerName || 'Unknown',
            'general',
            displayUpdates,
            session.user.name || session.user.email || 'System',
            updates.notes
          );
        }
      }
    } catch (err) {
      console.error('⚠️ Lead notification failed (non-blocking):', err);
      // Don't fail the update if notification fails
    }

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Mark as deleted
    await updateLead(id, { status: 'lost' as any }, session.user.email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
