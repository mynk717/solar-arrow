// src/lib/types.ts

// User roles for RBAC
export type UserRole = 'admin' | 'sales' | 'survey' | 'registration' | 
  'payment' | 'quotation' | 'liaison' | 'bom' | 'dispatch' | 'installation' | 
  'wcr' | 'subsidy';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
}

// Enhanced status workflow
export type EnquiryStatus = 
  | 'prospect' // Prospects/Sales pitch
  | 'lead' // Leads/Enquiries
  | 'new' // Legacy support
  | 'survey_pending'
  | 'survey_completed'
  | 'registration_pending' // Registration in progress
  | 'registration_completed' 
  | 'payment_pending' // Bank Loan or Direct
  | 'payment_received'
  | 'payment_disbursed' 
  | 'quotation_pending'
  | 'quotation_approved'
  | 'liaison_pre' // Pre-installation liaison
  | 'bom_pending'
  | 'bom_approved'
  | 'dispatch_pending'
  | 'dispatch_scheduled'
  | 'dispatch_in_transit'
  | 'dispatched'
  | 'dispatch_delivered'
  | 'installation_pending'
  | 'installation_in_progress'
  | 'installation_completed'
  | 'inspection_pending'
  | 'inspection_approved'
  | 'liaison_grid' // Grid synchronization liaison
  | 'wcr_pending'
  | 'wcr_submitted'
  | 'wcr_approved'
  | 'subsidy_pending'
  | 'subsidy_disbursed'
  | 'active';

// Panel tag types
export type PanelTag = 'RTS' | 'Commercial' | 'Shed';

// Payment types
export type PaymentType = 'Bank Loan' | 'Direct' | 'Subsidy + Direct' | 'Subsidy + Finance';

// Subsidy status
export type SubsidyStatus = 'pending' | 'approved' | 'disbursed' | 'rejected';

// Liaison stage 1 (Pre-installation)
export interface LiaisonStage1 {
  status: 'pending' | 'in_progress' | 'completed';
  startDate?: Date;
  completionDate?: Date;
  documents: string[];
  notes?: string;
}

// Liaison stage 2 (Grid synchronization)
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
  documents: string[];
  notes?: string;
}

// Work Completion Report
export interface WCRReport {
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedDate?: Date;
  approvedDate?: Date;
  rejectedDate?: Date;
  rejectionReason?: string;
  documents: string[];
  inspectorName?: string;
  inspectorId?: string;
  notes?: string;
}

// BOM (Bill of Materials)
export interface BOMItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  partNumber?: string;
}

export interface BOM {
  id: string;
  items: BOMItem[];
  totalCost: number;
  generatedDate: Date;
  approvedDate?: Date;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

// Dispatch tracking
export interface DispatchDetails {
  scheduledDate?: Date;
  actualDispatchDate?: Date;
  deliveryDate?: Date;
  trackingNumber?: string;
  transportCompany?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  status: 'scheduled' | 'in_transit' | 'delivered' | 'delayed';
  delayReason?: string;
  documents: string[];
}

// Enhanced Enquiry interface
export interface Enquiry {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  capacity: string; // in kW
  status: EnquiryStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Panel tag for categorization
  panelTag: PanelTag;
  
  // Survey details
  surveyDate?: Date;
  surveyedBy?: string;
  surveyNotes?: string;
  surveyApproved?: boolean;
  
  // Registration details (Government site)
  registrationId?: string;
  registrationDate?: Date;
  vendorName?: string;
  governmentPortalRef?: string;
  
  // Payment details
  estimatedCost?: number;
  initialPayment?: number;
  paymentDate?: Date;
  paymentMethod?: string;
  paymentType: PaymentType;
  
  // Subsidy details
  subsidyAmount?: number;
  subsidyStatus?: SubsidyStatus;
  subsidyAppliedDate?: Date;
  subsidyApprovedDate?: Date;
  subsidyDisbursedDate?: Date;
  
  // Quotation
  quotationId?: string;
  quotationDate?: Date;
  quotationAmount?: number;
  quotationApprovedDate?: Date;
  quotationApprovedBy?: string;
  
  // Liaison Stage 1 (Pre-installation)
  liaisonStage1?: LiaisonStage1;
  
  // BOM (Bill of Materials)
  bom?: BOM;
  
  // Dispatch details
  dispatch?: DispatchDetails;
  dispatchDate?: Date; // Legacy support
  
  // Installation details
  installationDate?: Date;
  installedBy?: string;
  installationTeam?: string[];
  installationNotes?: string;
  
  // Liaison Stage 2 (Grid synchronization)
  liaisonStage2?: LiaisonStage2;
  
  // WCR (Work Completion Report)
  wcr?: WCRReport;
  
  // Inspection details (Legacy support)
  inspectionDate?: Date;
  inspectionOfficer?: string;
  inspectionApproved?: boolean;
  activationDate?: Date;
  
  // Additional tracking
  assignedTo?: string; // User ID of assigned team member
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  attachments?: string[];
}

// Notification types
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

// Kanban column definition
export interface KanbanColumn {
  id: string;
  title: string;
  status: EnquiryStatus[];
  color: string;
  order: number;
}

// Activity log
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
