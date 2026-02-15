// src/lib/telegram.ts
import { 
  getTelegramBotToken, 
  getTelegramGroupChatId, 
  getUserTelegramChatId 
} from './redis';

// ============================================
// TYPES
// ============================================

export interface TelegramNotification {
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown';
}

export interface TelegramMessage {
  text: string;
  parseMode?: 'Markdown' | 'HTML';
  disableWebPagePreview?: boolean;
}

// ============================================
// TELEGRAM BOT CLASS (Original + Enhanced)
// ============================================

export class TelegramBot {
  private botToken: string;
  private baseUrl: string;

  constructor(botToken?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN!;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Send message to specific user via their chat ID
   */
  async sendMessage(chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Telegram API error:', error);
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Telegram message sent to:', chatId);
      return result;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  // ============================================
  // ORIGINAL NOTIFICATION METHODS (Keep existing)
  // ============================================

  /**
   * Send stage change notification
   */
  async notifyStageChange(
    userChatId: string,
    enquiryId: string,
    customerName: string,
    fromStage: string,
    toStage: string
  ) {
    const message = `
🔔 <b>Stage Update</b>

<b>Enquiry:</b> ${enquiryId}
<b>Customer:</b> ${customerName}
<b>Status:</b> ${fromStage} → ${toStage}

<i>Please take appropriate action.</i>
    `.trim();

    return this.sendMessage(userChatId, message);
  }

  /**
   * Send follow-up reminder
   */
  async notifyFollowUp(
    userChatId: string,
    enquiryId: string,
    customerName: string,
    dueDate: string
  ) {
    const message = `
⏰ <b>Follow-up Reminder</b>

<b>Enquiry:</b> ${enquiryId}
<b>Customer:</b> ${customerName}
<b>Due:</b> ${dueDate}

<i>Time for follow-up action.</i>
    `.trim();

    return this.sendMessage(userChatId, message);
  }

  /**
   * Send survey completion notification
   */
  async notifySurveyComplete(
    adminChatId: string,
    enquiryId: string,
    customerName: string,
    surveyorName: string
  ) {
    const message = `
✅ <b>Survey Completed</b>

<b>Enquiry:</b> ${enquiryId}
<b>Customer:</b> ${customerName}
<b>Surveyor:</b> ${surveyorName}

<i>Ready for next stage.</i>
    `.trim();

    return this.sendMessage(adminChatId, message);
  }

  /**
   * Send payment received notification
   */
  async notifyPaymentReceived(
    userChatId: string,
    enquiryId: string,
    customerName: string,
    amount: number
  ) {
    const message = `
💰 <b>Payment Received</b>

<b>Enquiry:</b> ${enquiryId}
<b>Customer:</b> ${customerName}
<b>Amount:</b> ₹${amount.toLocaleString('en-IN')}

<i>Payment confirmed.</i>
    `.trim();

    return this.sendMessage(userChatId, message);
  }
}

// ============================================
// NEW: ORG-AWARE NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send notification to organization's Telegram GROUP
 */
export async function sendOrgGroupNotification(orgId: string, message: TelegramMessage) {
  try {
    const botToken = await getTelegramBotToken(orgId);
    const groupChatId = await getTelegramGroupChatId(orgId);

    if (!botToken || !groupChatId) {
      console.log('⚠️ Telegram not configured for org:', orgId);
      return { success: false, reason: 'not_configured' };
    }

    const bot = new TelegramBot(botToken);
    const result = await bot.sendMessage(
      groupChatId,
      message.text,
      message.parseMode || 'Markdown'
    );

    return { success: true, result };
  } catch (error) {
    console.error('❌ Telegram group notification error:', error);
    return { success: false, error };
  }
}

/**
 * Send personal DM to a specific user
 */
export async function sendUserDM(orgId: string, userEmail: string, message: TelegramMessage) {
  try {
    const botToken = await getTelegramBotToken(orgId);
    const userChatId = await getUserTelegramChatId(userEmail);

    if (!botToken || !userChatId) {
      console.log('⚠️ User Telegram not configured:', userEmail);
      return { success: false, reason: 'not_configured' };
    }

    const bot = new TelegramBot(botToken);
    const result = await bot.sendMessage(
      userChatId,
      message.text,
      message.parseMode || 'Markdown'
    );

    return { success: true, result };
  } catch (error) {
    console.error('❌ Telegram user DM error:', error);
    return { success: false, error };
  }
}

/**
 * Send notification to BOTH group and user DM
 */
export async function sendDualNotification(
  orgId: string,
  groupMessage: string,
  userEmail: string,
  userMessage: string
) {
  const [groupResult, userResult] = await Promise.all([
    sendOrgGroupNotification(orgId, { text: groupMessage }),
    sendUserDM(orgId, userEmail, { text: userMessage }),
  ]);

  return { groupResult, userResult };
}

/**
 * NEW: Send lead creation notification to group
 */
export async function notifyLeadCreated(
  orgId: string,
  leadData: {
    id: string;
    customerName: string;
    phone: string;
    area?: string;
    capacity?: string;
    source: string;
    priority: string;
    createdBy: string;
  }
) {
  const message = `🆕 *New Lead Created*

*Customer:* ${leadData.customerName}
*Phone:* ${leadData.phone}
*Area:* ${leadData.area || 'N/A'}
*Capacity:* ${leadData.capacity || 'N/A'} kW
*Source:* ${leadData.source}
*Priority:* ${leadData.priority}
*Lead ID:* ${leadData.id}
*Created By:* ${leadData.createdBy}`;

  return await sendOrgGroupNotification(orgId, { text: message, parseMode: 'Markdown' });
}

/**
 * NEW: Send lead assignment notification (group + user DM)
 */
export async function notifyLeadAssigned(
  orgId: string,
  leadData: {
    id: string;
    customerName: string;
    phone: string;
    area?: string;
    capacity?: string;
    priority: string;
    assignedToName: string;
    assignedToEmail: string;
  }
) {
  const groupMessage = `👤 *Lead Assigned*

*Lead:* ${leadData.customerName} (${leadData.id})
*Assigned To:* ${leadData.assignedToName}
*Phone:* ${leadData.phone}
*Area:* ${leadData.area || 'N/A'}
*Capacity:* ${leadData.capacity || 'N/A'} kW`;

  const userMessage = `🎯 *New Lead Assigned to You!*

*Customer:* ${leadData.customerName}
*Phone:* ${leadData.phone}
*Area:* ${leadData.area || 'N/A'}
*Capacity:* ${leadData.capacity || 'N/A'} kW
*Priority:* ${leadData.priority}
*Lead ID:* ${leadData.id}

_Please contact this lead as soon as possible._`;

  return await sendDualNotification(
    orgId,
    groupMessage,
    leadData.assignedToEmail,
    userMessage
  );
}

/**
 * NEW: Send lead status update notification
 */
export async function notifyLeadStatusUpdate(
  orgId: string,
  leadData: {
    id: string;
    customerName: string;
    oldStatus: string;
    newStatus: string;
    updatedBy: string;
    notes?: string;
  }
) {
  const message = `📊 *Lead Status Updated*

*Lead:* ${leadData.customerName} (${leadData.id})
*Status:* ${leadData.oldStatus} → ${leadData.newStatus}
*Updated By:* ${leadData.updatedBy}${leadData.notes ? `\n*Notes:* ${leadData.notes}` : ''}`;

  return await sendOrgGroupNotification(orgId, { text: message, parseMode: 'Markdown' });
}

/**
 * NEW: Send generic activity/update notification to group
 * Use this for ANY workflow activity (enquiry updates, status changes, etc.)
 */
export async function notifyActivity(
  orgId: string,
  activity: {
    title: string;           // e.g., "Enquiry Updated", "Survey Completed"
    emoji?: string;          // e.g., "📝", "✅", "🔄"
    entityType: string;      // "enquiry" | "lead" | "survey" | "payment"
    entityId: string;        // ENQ-001, LEAD-123, etc.
    customerName?: string;
    fields: Record<string, string | number | undefined>; // Key-value pairs to display
    performedBy?: string;    // Who made the change
    notes?: string;          // Additional notes
  }
) {
  const emoji = activity.emoji || '📋';
  
  let message = `${emoji} *${activity.title}*\n\n`;
  
  if (activity.customerName) {
    message += `*Customer:* ${activity.customerName}\n`;
  }
  
  message += `*${activity.entityType.charAt(0).toUpperCase() + activity.entityType.slice(1)} ID:* ${activity.entityId}\n`;
  
  // Add all fields
  for (const [key, value] of Object.entries(activity.fields)) {
    if (value !== undefined && value !== null && value !== '') {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      message += `*${formattedKey}:* ${value}\n`;
    }
  }
  
  if (activity.performedBy) {
    message += `\n_Updated by: ${activity.performedBy}_`;
  }
  
  if (activity.notes) {
    message += `\n*Notes:* ${activity.notes}`;
  }

  return await sendOrgGroupNotification(orgId, { text: message, parseMode: 'Markdown' });
}


/**
 * NEW: Send enquiry update notification
 */
export async function notifyEnquiryUpdate(
  orgId: string,
  enquiryData: {
    id: string;
    customerName: string;
    updateType: string;      // "status_change" | "payment" | "survey" | "installation" | "general"
    changes: Record<string, { old?: any; new: any }>;
    updatedBy: string;
    notes?: string;
  }
) {
  const emojiMap: Record<string, string> = {
    status_change: '🔄',
    payment: '💰',
    survey: '📋',
    installation: '🔧',
    inspection: '✅',
    general: '📝',
  };

  const emoji = emojiMap[enquiryData.updateType] || '📝';
  
  let message = `${emoji} *Enquiry Updated*\n\n`;
  message += `*Customer:* ${enquiryData.customerName}\n`;
  message += `*Enquiry ID:* ${enquiryData.id}\n\n`;
  
  // Show changes
  message += `*Changes:*\n`;
  for (const [field, change] of Object.entries(enquiryData.changes)) {
    const formattedField = field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    
    if (change.old !== undefined) {
      message += `• ${formattedField}: ${change.old} → ${change.new}\n`;
    } else {
      message += `• ${formattedField}: ${change.new}\n`;
    }
  }
  
  message += `\n_Updated by: ${enquiryData.updatedBy}_`;
  
  if (enquiryData.notes) {
    message += `\n*Notes:* ${enquiryData.notes}`;
  }

  return await sendOrgGroupNotification(orgId, { text: message, parseMode: 'Markdown' });
}


// ============================================
// SINGLETON INSTANCE (Keep for backward compatibility)
// ============================================

export const telegramBot = new TelegramBot();
