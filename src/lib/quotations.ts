// src/lib/quotations.ts
import crypto from 'crypto';

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
  quotationType: 'Initial' | 'Revised' | 'Final';

  // Customer
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  location: string;
  premisesType: 'Residence' | 'Commercial' | 'Industrial';

  // System
  systemCapacity: number;
  systemType: 'On-Grid' | 'Hybrid' | 'Off-Grid';
  panelType: string;

  // Components
  panelMake: string;
  panelModel: string;
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
  bosItems: string;
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
  status: 'Draft' | 'Sent' | 'Viewed' | 'Approved' | 'Rejected';
  createdBy: string;
  createdDate: Date | string;
  sentBy?: string;
  sentDate?: Date | string;
  viewCount: number;
  firstViewedDate?: Date | string;
  lastViewedDate?: Date | string;
  approvedBy?: string;
  approvedDate?: Date | string;
  rejectedReason?: string;
  validUntilDate: Date | string;

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

  // Company
  companyName: string;
  companyGst: string;
  companyUdyam: string;
  companyCspdclReg: string;
  companyBankName: string;
  companyAccountNumber: string;
  companyIfsc: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
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
