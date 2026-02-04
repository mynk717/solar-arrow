// src/lib/notifications.ts
import { Enquiry } from './types';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: Date;
  read: boolean;
}

export function generateNotifications(enquiries: Enquiry[]): Notification[] {
  const notifications: Notification[] = [];

  enquiries.forEach(enquiry => {
    // Payment pending after registration (fixed status comparison)
    if (enquiry.status === 'registration-completed' && !enquiry.paymentDate) {
      notifications.push({
        id: `payment-pending-${enquiry.id}`,
        title: 'Payment Pending',
        message: `Payment pending for ${enquiry.customerName} (${enquiry.registrationId})`,
        type: 'warning',
        createdAt: new Date(),
        read: false,
      });
    }

    // Subsidy application (fixed optional chaining)
    if (enquiry.paymentType && enquiry.paymentType.includes('Subsidy') && !enquiry.subsidyStatus) {
      notifications.push({
        id: `subsidy-pending-${enquiry.id}`,
        title: 'Subsidy Application Needed',
        message: `Apply for subsidy: ${enquiry.customerName}`,
        type: 'info',
        createdAt: new Date(),
        read: false,
      });
    }

    // Installation scheduling after payment (fixed status comparison)
    if (enquiry.status === 'payment-received' && !enquiry.quotationId) {
      notifications.push({
        id: `quotation-pending-${enquiry.id}`,
        title: 'Quotation Pending',
        message: `Create quotation for ${enquiry.customerName}`,
        type: 'info',
        createdAt: new Date(),
        read: false,
      });
    }

    // Survey approval pending
    if (enquiry.surveyDate && !enquiry.surveyApproved) {
      notifications.push({
        id: `survey-approval-${enquiry.id}`,
        title: 'Survey Awaiting Approval',
        message: `Survey for ${enquiry.customerName} needs approval`,
        type: 'warning',
        createdAt: new Date(),
        read: false,
      });
    }

    // Installation completion inspection (fixed status comparison)
    if (enquiry.status === 'installation-completed' && !enquiry.inspectionDate) {
      notifications.push({
        id: `inspection-needed-${enquiry.id}`,
        title: 'Inspection Required',
        message: `Schedule inspection for ${enquiry.customerName}`,
        type: 'warning',
        createdAt: new Date(),
        read: false,
      });
    }

    // Note: Removed checks for 'bom', 'wcr', and 'dispatch' properties
    // as they don't exist in the Enquiry type definition
  });

  return notifications;
}