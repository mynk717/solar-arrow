// src/lib/types.ts

// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'admin' | 'sales' | 'survey' | 'registration' | 'payment' | 'quotation' | 'liaison' | 'bom' | 'dispatch' | 'installation' | 'wcr' | 'subsidy';

// ============================================
// ENQUIRY STATUS & TRACKING
// ============================================

export type EnquiryStatus =
  // Prospects/Sales
  | 'prospect'
  | 'lead'
  | 'new'
  // Survey Stage
  | 'survey-pending'
  | 'survey-completed'
  // Registration
  | 'registration-pending'
  | 'registration-completed'
  // Payment
  | 'payment-pending'
  | 'payment-received'
  | 'payment-disbursed'
  // Quotation
  | 'quotation-pending'
  | 'quotation-approved'
  // Liaison
  | 'liaison-pre'
  | 'liaison-grid'
  // BOM
  | 'bom-pending'
  | 'bom-approved'
  // Dispatch
  | 'dispatch-pending'
  | 'dispatch-scheduled'
  | 'dispatch-in-transit'
  | 'dispatched'
  | 'dispatch-delivered'
  // Installation
  | 'installation-pending'
  | 'installation-in-progress'
  | 'installation-completed'
  // Inspection/WCR
  | 'inspection-pending'
  | 'inspection-approved'
  | 'wcr-pending'
  | 'wcr-submitted'
  | 'wcr-approved'
  // Subsidy
  | 'subsidy-pending'
  | 'subsidy-disbursed'
  // Active
  | 'active';

export type PanelTag = 'RTS' | 'Commercial' | 'Shed';
export type PaymentType = 'Bank Loan' | 'Direct';
export type SubsidyStatus = 'pending' | 'approved' | 'disbursed' | 'rejected';

// ============================================
// MAIN ENQUIRY INTERFACE (120+ fields)
// ============================================

export interface Enquiry {
  // Core Details (12 fields)
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  capacity: number; // in kW
  status: EnquiryStatus;
  createdAt: Date;
  updatedAt: Date;
  panelTag?: PanelTag;

  // Lead Tracking (7 fields)
  leadSource?: string;
  leadNotes?: string;
  leadQualified?: boolean;
  leadQualifiedDate?: Date;
  leadConvertedDate?: Date;
  leadAssignedTo?: string;
  leadStatus?: 'new' | 'contacted' | 'qualified' | 'converted';

  // Survey (8 fields)
  surveyDate?: Date;
  surveyedBy?: string;
  surveyNotes?: string;
  surveyApproved?: boolean;
  surveyScheduledDate?: Date;
  surveyCompletedDate?: Date;
  surveyRejectedReason?: string;
  surveyPhotos?: string;

  // Loan (14 fields)
  loanRequired?: boolean;
  loanBank?: string;
  loanBranch?: string;
  loanAmount?: number;
  loanApplicationDate?: Date;
  loanSanctionDate?: Date;
  loanRejectionDate?: Date;
  loanRejectionReason?: string;
  loanFirstTrancheAmount?: number;
  loanFirstTrancheDate?: Date;
  loanSecondTrancheAmount?: number;
  loanSecondTrancheDate?: Date;
  loanStatus?: string;
  loanAccountNumber?: string;

  // Government Portal (9 fields)
  consumerRegistrationNumber?: string;
  applicationNumber?: string;
  discomCircle?: string;
  discomDivision?: string;
  discomSubDivision?: string;
  feasibilityApprovalDate?: Date;
  feasibilityApprovalNumber?: string;
  vendorAgreementDate?: Date;
  vendorAgreementNumber?: string;

  // Vendor Agreement (5 fields)
  vendorName?: string;
  vendorCompanyName?: string;
  vendorAgreementAmount?: number;
  vendorAgreementSignedDate?: Date;
  vendorAgreementDocumentPath?: string;

  // Payment (10 fields)
  estimatedCost?: number;
  initialPayment?: number;
  paymentDate?: Date;
  paymentMethod?: string;
  paymentType?: PaymentType;
  paymentStatus?: string;
  paymentAccountVerified?: boolean;
  paymentVerifiedBy?: string;
  paymentVerificationDate?: Date;
  paymentUTR?: string;

  // Quotation (7 fields)
  quotationId?: string;
  quotationDate?: Date;
  quotationAmount?: number;
  quotationApprovedDate?: Date;
  quotationApprovedBy?: string;
  quotationRejectedReason?: string;
  quotationDocumentPath?: string;

  // System Specifications (10 fields)
  systemCapacity?: number;
  panelMake?: string;
  panelWattage?: number;
  panelQuantity?: number;
  inverterMake?: string;
  inverterCapacity?: number;
  batteryRequired?: boolean;
  batteryCapacity?: number;
  batteryQuantity?: number;
  structureType?: string;

  // Installation (14 fields)
  installationScheduledDate?: Date;
  installationStartDate?: Date;
  installationCompletedDate?: Date;
  installationTeam?: string;
  installationSupervisor?: string;
  installationNotes?: string;
  pvModuleSerialNumbers?: string;
  inverterSerialNumber?: string;
  meterNumber?: string;
  meterInstalledDate?: Date;
  meterReadingInitial?: number;
  earthingDone?: boolean;
  earthingResistance?: number;
  installationPhotos?: string;

  // Inspection (7 fields)
  inspectionScheduledDate?: Date;
  inspectionDate?: Date;
  inspectionOfficer?: string;
  inspectionStatus?: string;
  inspectionApproved?: boolean;
  inspectionRejectedReason?: string;
  inspectionReportPath?: string;

  // Subsidy (10 fields)
  subsidyAmount?: number;
  subsidyStatus?: SubsidyStatus;
  subsidyAppliedDate?: Date;
  subsidyApprovedDate?: Date;
  subsidyDisbursedDate?: Date;
  subsidyRejectedDate?: Date;
  subsidyRejectionReason?: string;
  subsidyBankAccount?: string;
  subsidyUTR?: string;
  subsidyDocumentPath?: string;

  // Tracking & Management (10 fields) - NEW FIELDS ADDED
  allottedUser?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  isBlocked?: boolean;
  blockedReason?: string;
  lastEditedBy?: string;
  lastEditedAt?: Date;
  lastFollowupDate?: Date;
  nextActionDate?: Date;
  tags?: string[];
  notes?: string;

  // Legacy fields for backward compatibility
  registrationId?: string;
  registrationDate?: Date;
  governmentPortalRef?: string;
  dispatchDate?: Date;
  installedBy?: string;
  activationDate?: Date;
  assignedTo?: string;

  // Additional fields
  installationDate?: Date; // Legacy - use installationCompletedDate
  attachments?: string[];
}

// ============================================
// LIAISON STAGES
// ============================================

export interface LiaisonStage1 {
  status: 'pending' | 'in-progress' | 'completed';
  startDate?: Date;
  completionDate?: Date;
  documents?: string[];
  notes?: string;
}

export interface LiaisonStage2 {
  status: 'pending' | 'department' | 'circular' | 'zone' | 'synchronized';
  department?: string;
  departmentDate?: Date;
  circular?: string;
  circularDate?: Date;
  zone?: string;
  zoneDate?: Date;
  syncDate?: Date;
  gridSyncId?: string;
  documents?: string[];
  notes?: string;
}

// ============================================
// BOM (BILL OF MATERIALS)
// ============================================

export interface BOMItem {
  item: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface BOM {
  id: string;
  enquiryId: string;
  items: BOMItem[];
  totalCost: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

// ============================================
// DISPATCH
// ============================================

export interface DispatchDetails {
  trackingNumber?: string;
  transportCompany?: string;
  dispatchDate?: Date;
  expectedDeliveryDate?: Date;
  deliveredDate?: Date;
  status: 'pending' | 'scheduled' | 'in-transit' | 'delivered';
  materials?: string[];
  notes?: string;
}

// ============================================
// WCR (WORK COMPLETION REPORT)
// ============================================

export interface WCRChecklist {
  panelsInstalled: boolean;
  invertorInstalled: boolean;
  wiringComplete: boolean;
  earthingDone: boolean;
  safetyMeasures: boolean;
  systemTested: boolean;
  customerBriefed: boolean;
}

export interface WCRReport {
  id: string;
  enquiryId: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedDate?: Date;
  approvedDate?: Date;
  approvedBy?: string;
  checklist: WCRChecklist;
  photos: string[];
  notes?: string;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  enquiryId: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
  actionRequired?: boolean;
  actionUrl?: string;
}

// ============================================
// ACTIVITY LOG
// ============================================

export interface ActivityLog {
  id: string;
  enquiryId: string;
  userId: string;
  userName: string;
  action: string;
  previousValue?: any;
  newValue?: any;
  timestamp: Date;
  notes?: string;
}

// ============================================
// KANBAN
// ============================================

export interface KanbanColumn {
  id: string;
  title: string;
  status: EnquiryStatus;
  color: string;
  order: number;
}

// ============================================
// PROJECT TRACKER (ADMIN DASHBOARD)
// ============================================

export interface ProjectStage {
  enquiryId: string;
  stage: string;
  status: string;
  startDate?: Date;
  completionDate?: Date;
  expectedCompletionDate?: Date;
  daysInStage: number;
  isOverdue: boolean;
  assignedTo?: string;
  notes?: string;
}

export interface ProjectTrackerItem {
  id: string;
  customerName: string;
  capacity: number;
  status: EnquiryStatus;
  currentStage: string;
  daysInStage: number;
  lastFollowupDate?: Date;
  nextActionDate?: Date;
  allottedUser?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isBlocked: boolean;
  blockedReason?: string;
  consumerRegistrationNumber?: string;
  applicationNumber?: string;
  surveyDate?: Date;
  registrationDate?: Date;
  paymentDate?: Date;
  quotationDate?: Date;
  installationCompletedDate?: Date;
  inspectionDate?: Date;
  subsidyDisbursedDate?: Date;
}

// ============================================
// FOLLOWUPS
// ============================================

export interface Followup {
  id: string;
  enquiryId: string;
  userId: string;
  followupType: 'Call' | 'Email' | 'Visit' | 'WhatsApp';
  followupDate: Date;
  followupNotes: string;
  outcome?: 'Interested' | 'Not Interested' | 'Converted' | 'Callback Later';
  nextFollowupDate?: Date;
  status: 'pending' | 'completed';
}