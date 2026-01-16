export type EnquiryStatus = 
  | 'new' 
  | 'survey_pending' 
  | 'survey_completed' 
  | 'registration_pending'
  | 'payment_pending'
  | 'payment_received'
  | 'dispatch_pending'
  | 'dispatched'
  | 'installation_pending'
  | 'installation_completed'
  | 'inspection_pending'
  | 'inspection_approved'
  | 'active';

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
  
  // Survey details
  surveyDate?: Date;
  surveyedBy?: string;
  surveyNotes?: string;
  surveyApproved?: boolean;
  
  // Registration details
  registrationId?: string;
  registrationDate?: Date;
  vendorName?: string;
  
  // Payment details
  estimatedCost?: number;
  initialPayment?: number;
  paymentDate?: Date;
  paymentMethod?: string;
  
  // Installation details
  dispatchDate?: Date;
  installationDate?: Date;
  installedBy?: string;
  
  // Inspection details
  inspectionDate?: Date;
  inspectionOfficer?: string;
  inspectionApproved?: boolean;
  activationDate?: Date;
}