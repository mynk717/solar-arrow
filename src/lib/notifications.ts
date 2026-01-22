// src/lib/notifications.ts
import { Enquiry, Notification } from './types';

export const checkNotifications = (enquiry: Enquiry): Notification[] => {
  const notifications: Notification[] = [];
  
  // Registration → Payment check
  if (enquiry.status === 'registration_completed' && !enquiry.paymentDate) {
    notifications.push({
      id: `${enquiry.id}-payment-pending`,
      enquiryId: enquiry.id,
      type: 'alert',
      message: `Payment not received for ${enquiry.customerName} (${enquiry.id})`,
      priority: 'high',
      read: false,
      createdAt: new Date(),
      actionRequired: true,
      actionUrl: `/payments?id=${enquiry.id}`
    });
  }
  
  // Payment → Subsidy check
  if (enquiry.paymentType.includes('Subsidy') && !enquiry.subsidyStatus) {
    notifications.push({
      id: `${enquiry.id}-subsidy-pending`,
      enquiryId: enquiry.id,
      type: 'warning',
      message: `Subsidy status pending for ${enquiry.customerName} (${enquiry.id})`,
      priority: 'medium',
      read: false,
      createdAt: new Date(),
      actionRequired: true,
      actionUrl: `/subsidy?id=${enquiry.id}`
    });
  }
  
  // Payment received → Quotation check
  if (enquiry.status === 'payment_received' && !enquiry.quotationId) {
    notifications.push({
      id: `${enquiry.id}-quotation-pending`,
      enquiryId: enquiry.id,
      type: 'warning',
      message: `Quotation pending for ${enquiry.customerName} (${enquiry.id})`,
      priority: 'medium',
      read: false,
      createdAt: new Date(),
      actionRequired: true,
      actionUrl: `/quotation?id=${enquiry.id}`
    });
  }
  
  // Quotation approved → BOM check
  if (enquiry.quotationApprovedDate && !enquiry.bom) {
    notifications.push({
      id: `${enquiry.id}-bom-pending`,
      enquiryId: enquiry.id,
      type: 'alert',
      message: `BOM generation required for ${enquiry.customerName} (${enquiry.id})`,
      priority: 'high',
      read: false,
      createdAt: new Date(),
      actionRequired: true,
      actionUrl: `/bom?id=${enquiry.id}`
    });
  }
  
  // Installation completed → WCR check
  if (enquiry.status === 'installation_completed' && !enquiry.wcr) {
    notifications.push({
      id: `${enquiry.id}-wcr-pending`,
      enquiryId: enquiry.id,
      type: 'alert',
      message: `WCR submission required for ${enquiry.customerName} (${enquiry.id})`,
      priority: 'high',
      read: false,
      createdAt: new Date(),
      actionRequired: true,
      actionUrl: `/wcr?id=${enquiry.id}`
    });
  }
  
  // Dispatch delayed check
  if (enquiry.dispatch?.status === 'delayed') {
    notifications.push({
      id: `${enquiry.id}-dispatch-delayed`,
      enquiryId: enquiry.id,
      type: 'warning',
      message: `Dispatch delayed for ${enquiry.customerName}: ${enquiry.dispatch.delayReason}`,
      priority: 'high',
      read: false,
      createdAt: new Date(),
      actionRequired: true,
      actionUrl: `/dispatch?id=${enquiry.id}`
    });
  }
  
  return notifications;
};

// Get all notifications for all enquiries
export const getAllNotifications = (enquiries: Enquiry[]): Notification[] => {
  return enquiries.flatMap(enquiry => checkNotifications(enquiry));
};

// Filter notifications by priority
export const filterNotificationsByPriority = (
  notifications: Notification[], 
  priority: 'low' | 'medium' | 'high'
): Notification[] => {
  return notifications.filter(n => n.priority === priority);
};

// Get unread notifications count
export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.read).length;
};
