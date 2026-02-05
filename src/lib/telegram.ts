// src/lib/telegram.ts
export interface TelegramNotification {
    chatId: string;
    message: string;
    parseMode?: 'HTML' | 'Markdown';
  }
  
  export class TelegramBot {
    private botToken: string;
    private baseUrl: string;
  
    constructor() {
      this.botToken = process.env.TELEGRAM_BOT_TOKEN!;
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
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Telegram API error: ${response.statusText}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Failed to send Telegram message:', error);
        throw error;
      }
    }
  
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
  
  // Export singleton instance
  export const telegramBot = new TelegramBot();
  