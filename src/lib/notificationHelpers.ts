// src/lib/notificationHelpers.ts
import { notifyActivity, notifyEnquiryUpdate } from './telegram';

/**
 * Helper to send notification for any enquiry update
 * Call this after updateEnquiryInSheet or any status change
 */
export async function notifyEnquiryActivity(
  orgId: string,
  enquiryId: string,
  customerName: string,
  activityType: 'status' | 'payment' | 'survey' | 'installation' | 'inspection' | 'dispatch' | 'registration' | 'general',
  updates: Record<string, any>,
  performedBy: string,
  notes?: string
) {
  try {
    const activityTitles: Record<string, string> = {
      status: 'Status Updated',
      payment: 'Payment Recorded',
      survey: 'Survey Updated',
      installation: 'Installation Updated',
      inspection: 'Inspection Updated',
      dispatch: 'Dispatch Updated',
      registration: 'Registration Updated',
      general: 'Enquiry Updated',
    };

    const emojiMap: Record<string, string> = {
      status: '🔄',
      payment: '💰',
      survey: '📋',
      installation: '🔧',
      inspection: '✅',
      dispatch: '🚚',
      registration: '📄',
      general: '📝',
    };

    // Format updates for better display
    const formattedUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'updatedAt' || key === 'id') continue; // Skip meta fields
      
      // Format dates
      if (key.toLowerCase().includes('date') && value) {
        formattedUpdates[key] = new Date(value).toLocaleDateString('en-IN');
      } else {
        formattedUpdates[key] = value;
      }
    }

    await notifyActivity(orgId, {
      title: activityTitles[activityType],
      emoji: emojiMap[activityType],
      entityType: 'enquiry',
      entityId: enquiryId,
      customerName: customerName,
      fields: formattedUpdates,
      performedBy: performedBy,
      notes: notes,
    });

    console.log(`✅ Notification sent for ${activityType} activity on ${enquiryId}`);
    return { success: true };
  } catch (error) {
    console.error('⚠️ Failed to send activity notification (non-blocking):', error);
    return { success: false, error };
    // Don't throw - notification failure shouldn't break the update
  }
}


/**
 * Helper to send notification for lead updates
 */
export async function notifyLeadActivity(
  orgId: string,
  leadId: string,
  customerName: string,
  activityType: 'status' | 'assignment' | 'call' | 'general',
  updates: Record<string, any>,
  performedBy: string,
  notes?: string
) {
  try {
    const activityTitles: Record<string, string> = {
      status: 'Lead Status Updated',
      assignment: 'Lead Assigned',
      call: 'Call Logged',
      general: 'Lead Updated',
    };

    const emojiMap: Record<string, string> = {
      status: '🔄',
      assignment: '👤',
      call: '📞',
      general: '📝',
    };

    await notifyActivity(orgId, {
      title: activityTitles[activityType],
      emoji: emojiMap[activityType],
      entityType: 'lead',
      entityId: leadId,
      customerName: customerName,
      fields: updates,
      performedBy: performedBy,
      notes: notes,
    });

    console.log(`✅ Notification sent for ${activityType} activity on ${leadId}`);
    return { success: true };
  } catch (error) {
    console.error('⚠️ Failed to send lead activity notification (non-blocking):', error);
    return { success: false, error };
  }
}
