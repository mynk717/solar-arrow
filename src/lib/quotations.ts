// src/lib/quotations.ts
import crypto from 'crypto';

export type QuotationStatus = 'Draft' | 'Ready' | 'Sent' | 'Shared' | 'Viewed' | 'Approved' | 'Rejected';

export interface Quotation {
  // Multi-tenant
  organizationId: string;
  organizationName: string;
  sheetId: string;

  // Basic
  quotationId: string;
  referenceNumber: string;
  leadId?: string;
  enquiryId?: string;
  quotationType: string; // "Initial" | "Revised"

  // Customer
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  location: string;
  premisesType: string; // "Residence" | "Commercial" | "Industrial"

  // System
  systemCapacity: number; // in kW
  systemType: string; // "On-Grid" | "Hybrid" | "Off-Grid"
  panelType: string; // "RTS DCR" | "ALMM" | "Standard"

  // Components
  panelMake: string;
  panelModel?: string;
  panelWattage: number;
  panelQuantity: number;
  panelWarranty: string;

  inverterMake: string;
  inverterModel: string;
  inverterCapacity: number;
  inverterQuantity: number;
  inverterWarranty: string;

  structureType: string;
  structureMake: string;
  structureWarranty: string;

  bosItems: string; // Balance of System
  bosWarranty: string;

  cableMake: string;
  cableWarranty: string;

  earthingType: string;
  earthingQuantity: number;
  earthingWarranty: string;

  lightningArrestorType: string;
  lightningArrestorQuantity: number;
  lightningArrestorWarranty: string;

  // Services
  maintenanceYears: number;
  gridConnectivityIncluded: boolean;
  netMeteringIncluded: boolean;

  // Pricing
  baseCost: number;
  gstPercentage: number;
  gstAmount: number;
  totalCost: number;
  subsidyAmount: number;
  finalAmount: number;

  // Payment Terms
  advancePercentage: number;
  preDispatchPercentage: number;
  preGridPercentage: number;
  paymentTerms: string;

  // Tracking
  status: QuotationStatus;
  createdBy: string;
  createdDate: string;
  sentBy?: string;
  sentDate?: string;
  viewCount: number;
  firstViewedDate?: string;
  lastViewedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  validUntilDate: string;

  // Security & URLs
  publicToken: string;
  publicUrl: string;
  pdfUrl?: string;
  qrCodeUrl?: string;

  // Additional
  notes?: string;
  termsAndConditions: string;
  loanAvailable: boolean;
  loanInterestRate?: number;

  // Company Details (for PDF generation)
  companyName: string;
  companyGst?: string;
  companyUdyam?: string;
  companyCspdclReg?: string;
  companyBankName?: string;
  companyAccountNumber?: string;
  companyIfsc?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}


/**
 * Generate secure public token
 */
export function generatePublicToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate public URL for quotation
 */
export function generatePublicUrl(orgId: string, quotationId: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sa.mktgdime.com';
  return `${baseUrl}/q/${orgId}/${quotationId}?token=${token}`;
}

/**
 * Generate unique quotation ID based on existing IDs (max+1, not count-based)
 */
export function generateQuotationId(existingIds: string[]): string {
  const numbers = existingIds
    .filter(id => /^QT-\d+$/.test(id))
    .map(id => parseInt(id.replace('QT-', ''), 10))
    .filter(n => !isNaN(n));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `QT-${String(next).padStart(3, '0')}`;
}

/**
 * Generate quotation reference number
 */
export function generateReferenceNumber(orgPrefix: string, location: string, counter: number): string {
  return `${orgPrefix}/${location}/${String(counter).padStart(3, '0')}`;
}

/**
 * Calculate GST amount
 */
export function calculateGST(baseCost: number, gstPercentage: number): number {
  return Math.round(baseCost * (gstPercentage / 100));
}

/**
 * Calculate quotation validity (default 30 days)
 */
export function calculateValidityDate(days: number = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Validate quotation token
 */
export function validateQuotationToken(
  quotation: Quotation,
  providedToken: string
): boolean {
  return quotation.publicToken === providedToken;
}

/**
 * Check if quotation is expired
 */
export function isQuotationExpired(validUntilDate: Date | string): boolean {
  const expiryDate = typeof validUntilDate === 'string' 
    ? new Date(validUntilDate) 
    : validUntilDate;
  return expiryDate < new Date();
}

/**
 * Format currency (Indian Rupees)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}
