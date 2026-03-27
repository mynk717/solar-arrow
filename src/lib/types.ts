// src/lib/types.ts

// ============================================
// USER & AUTH TYPES
// ============================================

// ============================================
// LEAD TYPES (extends existing Enquiry)
// ============================================

export type LeadStatus = 
  | 'new'              // Just received
  | 'assigned'         // Assigned to telecaller
  | 'contacted'        // First contact made
  | 'callback'         // Scheduled callback
  | 'qualified'        // Hot lead - ready for sales
  | 'converted'        // Converted to enquiry
  | 'lost'            // Lost/rejected
  | 'nurture';        // Long-term follow-up

export type LeadSource = 
  | 'website'
  | 'referral'
  | 'lead-provider'
  | 'walk-in'
  | 'social-media'
  | 'advertisement'
  | 'cold-call'
  | 'other';

export type CallOutcome = 
  | 'interested'
  | 'not-interested'
  | 'callback'
  | 'no-answer'
  | 'wrong-number'
  | 'not-reachable';

export interface Lead {
  // Core Fields (compatible with Enquiry)
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  area?: string;
  capacity?: string; // "3kW", "5kW", "10kW" - will convert to number in Enquiry

  // Lead-specific fields
  status: LeadStatus;
  source: LeadSource;
  providerId?: string;
  providerName?: string;

  // Assignment & Contact
  assignedTo?: string;        // Email of telecaller/sales
  assignedToName?: string;
  assignedDate?: Date;
  firstContactDate?: Date;
  lastContactDate?: Date;
  contactAttempts: number;

  // Qualification
  qualified: boolean;
  qualifiedDate?: Date;
  qualifiedBy?: string;

  // Conversion
  converted: boolean;
  convertedDate?: Date;
  convertedBy?: string;
  enquiryId?: string;         // Link to Enquiry after conversion

  // Budget & Interest
  estimatedBudget?: number;
  purchaseTimelineDays?: number;
  electricityBill?: number;
  roofType?: string;
  decisionMaker?: string;
  purchaseIntent?: string;
  urgency?: 'low' | 'medium' | 'high';
  timeline?: string;          // "1 month", "3 months", etc.

  // Lost tracking
  lostReason?: string;
  lostDate?: Date;

  // Follow-up
  nextFollowUpDate?: Date;
  callbackScheduled?: boolean;

  // Metadata
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastActivityBy?: string;
  lastActivityDate?: Date;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  timestamp: Date;

  // User info
  userId: string;
  userName: string;
  userRole: string;
  department: 'telecaller' | 'sales' | 'survey' | 'registration' | 'admin';

  // Activity details
  action: 'created' | 'assigned' | 'contacted' | 'qualified' | 'converted' | 'note-added' | 'status-changed' | 'lost';
  fromStatus?: LeadStatus;
  toStatus?: LeadStatus;

  // Call details
  callOutcome?: CallOutcome;
  callDuration?: number;      // in seconds
  callNotes?: string;

  // Next action
  nextAction?: string;
  nextActionDate?: Date;

  // Metadata
  metadata?: {
    enquiryId?: string;       // When converted
    quotationId?: string;
    registrationId?: string;
    lostReason?: string;
  };
}

// Lead funnel metrics
export interface LeadFunnelMetrics {
  totalLeads: number;
  newLeads: number;
  assigned: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;

  // Conversion rates
  contactRate: number;        // contacted / assigned
  qualificationRate: number;  // qualified / contacted
  conversionRate: number;     // converted / qualified
  overallConversion: number;  // converted / total

  // Time metrics
  avgTimeToContact: number;   // hours
  avgTimeToQualify: number;   // days
  avgTimeToConvert: number;   // days
}


export type UserRole =
  | 'owner'
  | 'admin'
  | 'lead-provider'
  | 'telecaller'
  | 'sales'
  | 'surveyor'
  | 'accounts'
  | 'liaison'
  | 'registration'
  | 'quotation'
  | 'payment'
  | 'bom'
  | 'dispatch'
  | 'installation'
  | 'subsidy';
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

  branchId?: string;
  branchName?: string;

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

 // Quotation (12 fields)
quotationId?: string;
quotationDate?: Date;
quotationAmount?: number;
quotationApprovedDate?: Date;
quotationApprovedBy?: string;
quotationRejectedReason?: string;
quotationDocumentPath?: string;
panelType?: string; // ADD THIS
systemCost?: number; // ADD THIS
finalCost?: number; // ADD THIS
quotationValidTill?: Date; // ADD THIS
quotationStatus?: 'draft' | 'sent' | 'approved' | 'rejected'; // ADD THIS
quotationSentDate?: Date; // ADD THIS


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

  registrationStage?: 'not_started' | 'consumer_registered' | 'application_submitted' | 'feasibility_approved' | 'vendor_selected' | 'project_inspection' | 'work_started' | 'project_commissioned';

  // WCR fields (add to Installation section or create new WCR section)
wcrStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
wcrSubmittedDate?: Date;
wcrApprovedDate?: Date;
panelsInstalled?: boolean;
inverterInstalled?: boolean;
wiringComplete?: boolean;
safetyMeasures?: boolean;
systemTested?: boolean;
customerBriefed?: boolean;

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

/**
 * NEW BOM Structure: 1 BOM = 1 Row
 */
export interface BOMLineItem {
  bomId: string;
  enquiryId: string;
  customerName: string;
  systemCapacity: string;
  
  // BOM Status
  bomStatus: 'draft' | 'generated' | 'approved' | 'cancelled';
  bomGeneratedDate: string;
  bomGeneratedBy: string;
  
  // Dispatch Tracking
  dispatchStatus: 'pending' | 'dispatched' | 'in_transit' | 'delivered';
  dispatchDate?: string;
  dispatchedBy?: string;
  trackingNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveredTo?: string;
  deliveryNotes?: string;
  
  // Installation
  installationStatus: 'not_started' | 'in_progress' | 'completed';
  installationDate?: string;
  installedBy?: string;
  
  // Materials - JSON string
  materialsJSON: string;
  
  // Material Utilization
  materialUtilizationStatus: 'not_started' | 'partial' | 'completed';
  materialReturnStatus: 'not_applicable' | 'pending' | 'collected';
  returnCollectedDate?: string;
  utilizationNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

export interface MaterialItem {
  sno: number;
  section: string;
  particular: string;
  uom: string;
  qty: number;
  rem?: string;
  qtyDispatched: number;
  qtyUtilized: number;
  qtyReturned: number;
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

export interface Branch {
  id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserPermissions {
  canView: string[];    // Array of page paths: ['/leads', '/survey', etc.]
  canEdit: string[];    // Array of page paths user can edit
  canDelete: string[];  // Array of page paths user can delete
  canExport: boolean;
  canImport: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  accountType: 'owner' | 'admin' | 'user';
  organizationId: string;
  branchId?: string;  // Optional branch assignment
  branchName?: string;
  permissions: UserPermissions;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}


export interface Survey {
  // Basic
  enquiryId: string;
  customerName?: string;
  updatedAt?: string; 
  surveyDate: string;
  surveyorEmail: string;
  surveyorName: string;

  // Project Details
  projectType: 'ONGRID' | 'OFFGRID' | 'HYBRID';
  consumerCategory: 'DOMESTIC' | 'COMMERCIAL' | 'INDUSTRIAL';
  installationSurface: 'ROOFTOP' | 'GROUND' | 'TERRACE';
  buildingFloor: number;
  soilType: 'CLAY' | 'SANDY' | 'ROCKY' | 'MIXED';
  
  // Structure Details
  structureStyle: 'STANDARD' | 'ELEVATED' | 'BALLAST' | 'FLAT_ROOF';
  slopeDirection: 'SOUTH' | 'SOUTH_EAST' | 'SOUTH_WEST' | 'EAST' | 'WEST' | 'NORTH';
  inclinationDegrees: number;
  frontLegHeight: number; // in meters
  rearLegHeight: number; // in meters
  rafterCount: number;
  purlineCount: number;
  sectionSpecifications: string; // e.g., "C_CHANNEL", "HOLLOW_SQUARE"

  // Electrical Details
  sanctionedLoad: number; // in kW
  bpNumber: string;
  transformerCapacity: number; // in kVA
  substationDistance: number; // in meters

  // Cable Sizing
  panelToDcdbLength: number;
  panelToDcdbSize: number; // sq mm
  dcdbToInverterLength: number;
  dcdbToInverterSize: number;
  inverterToAcdbLength: number;
  inverterToAcdbSize: number;
  acdbToMeterLength: number;
  acdbToMeterSize: number;
  meterToLtPanelLength: number;
  meterToLtPanelSize: number;

  // Safety & Infrastructure
  existingEarthingCount: number;
  newEarthingRequired: number;
  lightningArrestorRequired: number;
  shadowSources: string[]; // ["TREE", "BUILDING", "POLE"]
  shadowRemovable: boolean;
  
  // Monitoring
  internetAvailability: 'WIFI' | 'GSM' | 'LAN' | 'NONE';
  monitoringSystem: 'RMS' | 'SCADA' | 'NONE';

  // Status & Notes
  surveyApproved: boolean;
  surveyNotes: string;
  surveyPhotos: string; // URL or path
}

// ============================================
// BOM (BILL OF MATERIALS) TYPES
// ============================================

export type BOMStatus = 
  | 'draft' 
  | 'generated' 
  | 'approved' 
  | 'cancelled';

export type DispatchStatus = 
  | 'pending' 
  | 'dispatched' 
  | 'in_transit' 
  | 'delivered';

export type InstallationStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed';

export type MaterialUtilizationStatus = 
  | 'not_started' 
  | 'partial' 
  | 'completed';

export type MaterialReturnStatus = 
  | 'not_applicable' 
  | 'pending' 
  | 'collected';

export interface BOMItem {
  // Identification
  id: string;
  enquiryId: string;
  
  // BOM Status
  bomStatus: BOMStatus;
  bomGeneratedDate: string;
  bomGeneratedBy: string;
  
  // Dispatch Tracking
  dispatchStatus: DispatchStatus;
  dispatchDate?: string;
  dispatchedBy?: string;
  trackingNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveredTo?: string;
  deliveryNotes?: string;
  
  // Installation Tracking
  installationStatus: InstallationStatus;
  installationStartDate?: string;
  installationCompletedDate?: string;
  installedBy?: string;
  
  // Material Return Tracking
  materialUtilizationStatus: MaterialUtilizationStatus;
  materialReturnStatus: MaterialReturnStatus;
  returnCollectedDate?: string;
  returnCollectedBy?: string;
  
  // Line Item Details
  sno: number;
  section: string; // "3KW KIT", "STRUCTURE", etc.
  particular: string; // Item name
  uom: string; // Unit of measure (nos, mtr, pkt, kg)
  qty: number; // Quantity allocated
  rem?: string; // Remarks
  qtyDispatched: number;
  qtyUtilized: number;
  qtyReturned: number;
  utilizationNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}
