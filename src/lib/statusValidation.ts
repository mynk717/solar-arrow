// Status transition validation for enquiries
// Ensures workflow integrity and prevents invalid status jumps

export type EnquiryStatus =
  | 'new'
  | 'survey-pending'
  | 'survey-scheduled'
  | 'survey-completed'
  | 'survey-rejected'
  | 'quotation-sent'
  | 'quotation-approved'
  | 'quotation-rejected'
  | 'payment-pending'
  | 'payment-partial'
  | 'payment-complete'
  | 'registration-pending'
  | 'registration-submitted'
  | 'registration-approved'
  | 'registration-rejected'
  | 'bom-pending'
  | 'bom-created'
  | 'dispatch-pending'
  | 'dispatched'
  | 'delivered'
  | 'installation-pending'
  | 'installation-scheduled'
  | 'installation-in-progress'
  | 'installation-completed'
  | 'installation-rework-required'
  | 'wcr-pending'
  | 'wcr-submitted'
  | 'wcr-approved'
  | 'wcr-rejected'
  | 'inspection-pending'
  | 'inspection-scheduled'
  | 'inspection-completed'
  | 'inspection-approved'
  | 'inspection-rejected'
  | 'meter-installation-pending'
  | 'meter-installed'
  | 'grid-sync-pending'
  | 'grid-synced'
  | 'active'
  | 'cancelled'
  | 'on-hold';

// Define valid state transitions
// Key = current status, Value = array of allowed next statuses
export const VALID_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
  'new': ['survey-pending', 'cancelled', 'on-hold'],
  
  'survey-pending': ['survey-scheduled', 'cancelled', 'on-hold'],
  'survey-scheduled': ['survey-completed', 'survey-rejected', 'survey-pending', 'cancelled'],
  'survey-completed': ['quotation-sent', 'survey-rejected', 'cancelled'],
  'survey-rejected': ['survey-pending', 'cancelled'],
  
  'quotation-sent': ['quotation-approved', 'quotation-rejected', 'cancelled', 'on-hold'],
  'quotation-approved': ['payment-pending', 'registration-pending', 'cancelled'],
  'quotation-rejected': ['quotation-sent', 'survey-pending', 'cancelled'],
  
  'payment-pending': ['payment-partial', 'payment-complete', 'cancelled', 'on-hold'],
  'payment-partial': ['payment-complete', 'cancelled', 'on-hold'],
  'payment-complete': ['registration-pending', 'bom-pending', 'cancelled'],
  
  'registration-pending': ['registration-submitted', 'cancelled', 'on-hold'],
  'registration-submitted': ['registration-approved', 'registration-rejected', 'on-hold'],
  'registration-approved': ['bom-pending', 'cancelled'],
  'registration-rejected': ['registration-pending', 'cancelled'],
  
  'bom-pending': ['bom-created', 'cancelled'],
  'bom-created': ['dispatch-pending', 'cancelled'],
  
  'dispatch-pending': ['dispatched', 'cancelled', 'on-hold'],
  'dispatched': ['delivered', 'dispatch-pending', 'cancelled'],
  'delivered': ['installation-pending', 'cancelled'],
  
  'installation-pending': ['installation-scheduled', 'cancelled', 'on-hold'],
  'installation-scheduled': ['installation-in-progress', 'installation-pending', 'cancelled'],
  'installation-in-progress': ['installation-completed', 'installation-rework-required', 'cancelled'],
  'installation-completed': ['wcr-pending', 'installation-rework-required', 'cancelled'],
  'installation-rework-required': ['installation-scheduled', 'cancelled'],
  
  'wcr-pending': ['wcr-submitted', 'cancelled'],
  'wcr-submitted': ['wcr-approved', 'wcr-rejected', 'cancelled'],
  'wcr-approved': ['inspection-pending', 'cancelled'],
  'wcr-rejected': ['wcr-pending', 'installation-rework-required', 'cancelled'],
  
  'inspection-pending': ['inspection-scheduled', 'cancelled', 'on-hold'],
  'inspection-scheduled': ['inspection-completed', 'inspection-pending', 'cancelled'],
  'inspection-completed': ['inspection-approved', 'inspection-rejected', 'cancelled'],
  'inspection-approved': ['meter-installation-pending', 'cancelled'],
  'inspection-rejected': ['installation-rework-required', 'cancelled'],
  
  'meter-installation-pending': ['meter-installed', 'cancelled', 'on-hold'],
  'meter-installed': ['grid-sync-pending', 'cancelled'],
  
  'grid-sync-pending': ['grid-synced', 'cancelled', 'on-hold'],
  'grid-synced': ['active', 'cancelled'],
  
  'active': ['on-hold', 'cancelled'],
  'cancelled': [], // Terminal state
  'on-hold': ['survey-pending', 'payment-pending', 'registration-pending', 'dispatch-pending', 'installation-pending', 'inspection-pending', 'meter-installation-pending', 'grid-sync-pending', 'cancelled'],
};

// Status workflow stages for display
export const STATUS_STAGES = {
  'Survey': ['survey-pending', 'survey-scheduled', 'survey-completed', 'survey-rejected'],
  'Quotation': ['quotation-sent', 'quotation-approved', 'quotation-rejected'],
  'Payment': ['payment-pending', 'payment-partial', 'payment-complete'],
  'Registration': ['registration-pending', 'registration-submitted', 'registration-approved', 'registration-rejected'],
  'BOM & Dispatch': ['bom-pending', 'bom-created', 'dispatch-pending', 'dispatched', 'delivered'],
  'Installation': ['installation-pending', 'installation-scheduled', 'installation-in-progress', 'installation-completed', 'installation-rework-required'],
  'WCR': ['wcr-pending', 'wcr-submitted', 'wcr-approved', 'wcr-rejected'],
  'Inspection': ['inspection-pending', 'inspection-scheduled', 'inspection-completed', 'inspection-approved', 'inspection-rejected'],
  'Meter & Grid': ['meter-installation-pending', 'meter-installed', 'grid-sync-pending', 'grid-synced'],
  'Final': ['active', 'cancelled', 'on-hold'],
};

// Validate if transition is allowed
export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): { valid: boolean; error?: string } {
  // Allow same status (no change)
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  // Check if current status exists in our transitions map
  if (!VALID_TRANSITIONS[currentStatus as EnquiryStatus]) {
    return {
      valid: false,
      error: `Unknown current status: ${currentStatus}`,
    };
  }

  // Check if new status exists in our transitions map
  if (!VALID_TRANSITIONS[newStatus as EnquiryStatus]) {
    return {
      valid: false,
      error: `Unknown new status: ${newStatus}`,
    };
  }

  // Check if transition is allowed
  const allowedTransitions = VALID_TRANSITIONS[currentStatus as EnquiryStatus];
  
  if (!allowedTransitions.includes(newStatus as EnquiryStatus)) {
    return {
      valid: false,
      error: `Invalid status transition: Cannot move from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowedTransitions.join(', ')}`,
    };
  }

  return { valid: true };
}

// Get allowed next statuses for a given status
export function getAllowedNextStatuses(currentStatus: string): EnquiryStatus[] {
  return VALID_TRANSITIONS[currentStatus as EnquiryStatus] || [];
}

// Check if status requires specific data
export function getRequiredFieldsForStatus(status: string): string[] {
  const requiredFields: Record<string, string[]> = {
    'survey-scheduled': ['surveyDate', 'surveyorName'],
    'survey-completed': ['surveyDate', 'surveyedBy', 'surveyApproved'],
    'quotation-sent': ['quotationAmount', 'quotationDate'],
    'quotation-approved': ['quotationAmount', 'quotationApprovedDate'],
    'payment-partial': ['payment1Amount', 'payment1Date', 'payment1Status'],
    'payment-complete': ['payment1Status', 'payment2Status'],
    'registration-submitted': ['registrationId', 'registrationDate'],
    'registration-approved': ['registrationId', 'approvedDate'],
    'bom-created': ['bomItems'],
    'dispatched': ['dispatchDate', 'trackingNumber'],
    'delivered': ['deliveredDate'],
    'installation-scheduled': ['installationDate', 'installerName'],
    'installation-completed': ['installationDate', 'installedBy'],
    'wcr-submitted': ['wcrSubmittedDate', 'wcrNotes'],
    'wcr-approved': ['wcrApprovedDate', 'wcrApprovedBy'],
    'inspection-scheduled': ['inspectionScheduledDate', 'inspectionOfficer'],
    'inspection-completed': ['inspectionDate', 'inspectionOfficer'],
    'inspection-approved': ['inspectionApproved', 'inspectionApprovalDate'],
    'meter-installed': ['meterNumber', 'meterInstalledDate'],
    'grid-synced': ['gridSyncDate'],
    'active': ['gridSyncDate', 'meterNumber'],
  };

  return requiredFields[status] || [];
}

// Get status display name
export function getStatusDisplayName(status: string): string {
  const displayNames: Record<string, string> = {
    'new': 'New Enquiry',
    'survey-pending': 'Survey Pending',
    'survey-scheduled': 'Survey Scheduled',
    'survey-completed': 'Survey Completed',
    'survey-rejected': 'Survey Rejected',
    'quotation-sent': 'Quotation Sent',
    'quotation-approved': 'Quotation Approved',
    'quotation-rejected': 'Quotation Rejected',
    'payment-pending': 'Payment Pending',
    'payment-partial': 'Partial Payment (70%)',
    'payment-complete': 'Payment Complete',
    'registration-pending': 'Registration Pending',
    'registration-submitted': 'Registration Submitted',
    'registration-approved': 'Registration Approved',
    'registration-rejected': 'Registration Rejected',
    'bom-pending': 'BOM Pending',
    'bom-created': 'BOM Created',
    'dispatch-pending': 'Dispatch Pending',
    'dispatched': 'Dispatched',
    'delivered': 'Delivered',
    'installation-pending': 'Installation Pending',
    'installation-scheduled': 'Installation Scheduled',
    'installation-in-progress': 'Installation In Progress',
    'installation-completed': 'Installation Completed',
    'installation-rework-required': 'Installation Rework Required',
    'wcr-pending': 'WCR Pending',
    'wcr-submitted': 'WCR Submitted',
    'wcr-approved': 'WCR Approved',
    'wcr-rejected': 'WCR Rejected',
    'inspection-pending': 'Inspection Pending',
    'inspection-scheduled': 'Inspection Scheduled',
    'inspection-completed': 'Inspection Completed',
    'inspection-approved': 'Inspection Approved',
    'inspection-rejected': 'Inspection Rejected',
    'meter-installation-pending': 'Meter Installation Pending',
    'meter-installed': 'Meter Installed',
    'grid-sync-pending': 'Grid Sync Pending',
    'grid-synced': 'Grid Synced',
    'active': 'Active',
    'cancelled': 'Cancelled',
    'on-hold': 'On Hold',
  };

  return displayNames[status] || status;
}

// Get status color for UI
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'new': 'bg-gray-100 text-gray-900 border-gray-300',
    'survey-pending': 'bg-blue-100 text-blue-900 border-blue-300',
    'survey-scheduled': 'bg-blue-100 text-blue-900 border-blue-300',
    'survey-completed': 'bg-green-100 text-green-900 border-green-300',
    'survey-rejected': 'bg-red-100 text-red-900 border-red-300',
    'quotation-sent': 'bg-purple-100 text-purple-900 border-purple-300',
    'quotation-approved': 'bg-green-100 text-green-900 border-green-300',
    'quotation-rejected': 'bg-red-100 text-red-900 border-red-300',
    'payment-pending': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'payment-partial': 'bg-orange-100 text-orange-900 border-orange-300',
    'payment-complete': 'bg-green-100 text-green-900 border-green-300',
    'registration-pending': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'registration-submitted': 'bg-blue-100 text-blue-900 border-blue-300',
    'registration-approved': 'bg-green-100 text-green-900 border-green-300',
    'registration-rejected': 'bg-red-100 text-red-900 border-red-300',
    'bom-pending': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'bom-created': 'bg-green-100 text-green-900 border-green-300',
    'dispatch-pending': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'dispatched': 'bg-blue-100 text-blue-900 border-blue-300',
    'delivered': 'bg-green-100 text-green-900 border-green-300',
    'installation-pending': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'installation-scheduled': 'bg-blue-100 text-blue-900 border-blue-300',
    'installation-in-progress': 'bg-indigo-100 text-indigo-900 border-indigo-300',
    'installation-completed': 'bg-green-100 text-green-900 border-green-300',
    'installation-rework-required': 'bg-orange-100 text-orange-900 border-orange-300',
    'wcr-pending': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'wcr-submitted': 'bg-blue-100 text-blue-900 border-blue-300',
    'wcr-approved': 'bg-green-100 text-green-900 border-green-300',
    'wcr-rejected': 'bg-red-100 text-red-900 border-red-300',
    'inspection-pending': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'inspection-scheduled': 'bg-blue-100 text-blue-900 border-blue-300',
    'inspection-completed': 'bg-green-100 text-green-900 border-green-300',
    'inspection-approved': 'bg-green-100 text-green-900 border-green-300',
    'inspection-rejected': 'bg-red-100 text-red-900 border-red-300',
    'meter-installation-pending': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'meter-installed': 'bg-green-100 text-green-900 border-green-300',
    'grid-sync-pending': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'grid-synced': 'bg-green-100 text-green-900 border-green-300',
    'active': 'bg-emerald-100 text-emerald-900 border-emerald-400',
    'cancelled': 'bg-gray-100 text-gray-900 border-gray-300',
    'on-hold': 'bg-amber-100 text-amber-900 border-amber-300',
  };

  return colors[status] || 'bg-gray-100 text-gray-900 border-gray-300';
}

// Validate required fields before status change
export function validateRequiredFields(
  status: string,
  data: Record<string, any>
): { valid: boolean; missingFields?: string[] } {
  const requiredFields = getRequiredFieldsForStatus(status);
  
  if (requiredFields.length === 0) {
    return { valid: true };
  }

  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    return {
      valid: false,
      missingFields,
    };
  }

  return { valid: true };
}
