// src/lib/demoData.ts
import { Enquiry } from './types';

// Lead types
export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  source: string;
  capacity: string;
  status: 'new' | 'contacted' | 'qualified';
  createdAt: Date;
  notes: string;
}

// Leads Demo Data
export const demoLeads: Lead[] = [
  {
    id: 'LEAD-001',
    name: 'Ramesh Patel',
    phone: '+91 98765 43210',
    email: 'ramesh.patel@email.com',
    location: 'Civil Lines, Raipur',
    source: 'Website',
    capacity: '3 kW',
    status: 'new',
    createdAt: new Date('2026-01-20'),
    notes: 'Interested in rooftop solar for home',
  },
  {
    id: 'LEAD-002',
    name: 'Sunita Verma',
    phone: '+91 98765 43211',
    email: 'sunita.v@email.com',
    location: 'Shankar Nagar, Raipur',
    source: 'Referral',
    capacity: '5 kW',
    status: 'contacted',
    createdAt: new Date('2026-01-21'),
    notes: 'Follow up on Thursday',
  },
  {
    id: 'LEAD-003',
    name: 'Anil Kumar',
    phone: '+91 98765 43212',
    email: 'anil.kumar@email.com',
    location: 'Telibandha, Raipur',
    source: 'Walk-in',
    capacity: '10 kW',
    status: 'qualified',
    createdAt: new Date('2026-01-22'),
    notes: 'Commercial property, high interest',
  },
];

// Enquiries Demo Data
export const demoEnquiries: Enquiry[] = [
  {
    id: 'ENQ-2024-001',
    customerName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@example.com',
    address: '123 Civil Lines, Sector 10',
    area: 'Civil Lines',
    capacity: 5,  // FIXED: number not string
    panelTag: 'RTS',
    paymentType: 'Direct',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    surveyDate: new Date('2024-01-18'),
    surveyedBy: 'Amit Sharma',
    surveyNotes: 'Roof suitable for 5kW installation. South-facing orientation perfect.',
    surveyApproved: true,
    registrationId: 'CSPDCL-2024-001',
    registrationDate: new Date('2024-01-22'),
    vendorName: 'Hope Energy Solutions',
    estimatedCost: 250000,
    initialPayment: 125000,
    paymentDate: new Date('2024-01-25'),
    paymentMethod: 'Bank Transfer',
    installationDate: new Date('2024-02-10'),
    installedBy: 'Installation Team A',
    inspectionDate: new Date('2024-02-15'),
    inspectionOfficer: 'Mr. Verma',
    inspectionApproved: true,
    activationDate: new Date('2024-02-20'),
  },
  {
    id: 'ENQ-2024-002',
    customerName: 'Priya Patel',
    phone: '+91 98765 43211',
    email: 'priya.patel@example.com',
    address: '456 Pandri Road, Near Bus Stand',
    area: 'Pandri',
    capacity: 3,  // FIXED: number not string
    panelTag: 'RTS',
    paymentType: 'Direct',
    status: 'payment-pending',  // FIXED: hyphen not underscore
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-28'),
    surveyDate: new Date('2024-01-23'),
    surveyedBy: 'Rahul Verma',
    surveyNotes: 'Residential rooftop, adequate shadow-free area available.',
    surveyApproved: true,
    registrationId: 'CSPDCL-2024-002',
    registrationDate: new Date('2024-01-26'),
    vendorName: 'Hope Energy Solutions',
    estimatedCost: 180000,
    quotationId: 'QT-2024-002',
    quotationDate: new Date('2024-01-25'),
    quotationAmount: 180000,
  },
  {
    id: 'ENQ-2024-003',
    customerName: 'Suresh Yadav',
    phone: '+91 98765 43212',
    email: 'suresh.yadav@example.com',
    address: '789 Telibandha, Behind Market',
    area: 'Telibandha',
    capacity: 10,  // FIXED: number not string
    panelTag: 'RTS',
    paymentType: 'Direct',
    status: 'survey-pending',  // FIXED: hyphen not underscore
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    surveyDate: new Date('2024-02-08'),
    surveyedBy: 'Amit Sharma',
  },
  {
    id: 'ENQ-2024-004',
    customerName: 'Meera Singh',
    phone: '+91 98765 43213',
    email: 'meera.singh@example.com',
    address: '321 Shankar Nagar, Near School',
    area: 'Shankar Nagar',
    capacity: 7,  // FIXED: number not string
    panelTag: 'RTS',
    paymentType: 'Subsidy + Direct',  // FIXED: changed from 'Subsidy' to valid type
    status: 'installation-completed',  // FIXED: hyphen not underscore
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-18'),
    surveyDate: new Date('2024-01-13'),
    surveyedBy: 'Priya Singh',
    surveyNotes: 'Commercial building, excellent for solar installation.',
    surveyApproved: true,
    registrationId: 'CSPDCL-2024-003',
    registrationDate: new Date('2024-01-16'),
    vendorName: 'Hope Energy Solutions',
    estimatedCost: 350000,
    initialPayment: 175000,
    paymentDate: new Date('2024-01-20'),
    paymentMethod: 'Online',
    subsidyAmount: 87500,
    subsidyStatus: 'approved',
    subsidyAppliedDate: new Date('2024-01-22'),
    subsidyApprovedDate: new Date('2024-02-01'),
    installationDate: new Date('2024-02-15'),
    installedBy: 'Installation Team B',
  },
  {
    id: 'ENQ-2024-005',
    customerName: 'Arjun Desai',
    phone: '+91 98765 43214',
    email: 'arjun.desai@example.com',
    address: '654 GE Road, Opposite Mall',
    area: 'GE Road',
    capacity: 4,  // FIXED: number not string
    panelTag: 'RTS',
    paymentType: 'Direct',
    status: 'new',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
];

// Stats
export const demoStats = {
  totalEnquiries: 5,
  pendingSurveys: 2,
  activeProjects: 1,
  pendingPayments: 1,
  totalRevenue: 1030000,
  completedInstallations: 2,
};

// Survey Team Members
export const surveyTeamMembers = [
  'Amit Sharma',
  'Rahul Verma',
  'Priya Singh',
  'Vikram Patel'
];

// Export all demo data
export const allDemoData = {
  leads: demoLeads,
  enquiries: demoEnquiries,
  stats: demoStats,
  surveyTeam: surveyTeamMembers,
};