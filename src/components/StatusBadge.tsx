import { EnquiryStatus } from '@/lib/types';

const statusConfig: Record<EnquiryStatus, { label: string; color: string }> = {
  // Prospects & Leads
  prospect: { label: 'Prospect', color: 'bg-purple-100 text-purple-800' },
  lead: { label: 'Lead', color: 'bg-indigo-100 text-indigo-800' },
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  
  // Survey Stage
  survey_pending: { label: 'Survey Pending', color: 'bg-yellow-100 text-yellow-800' },
  survey_completed: { label: 'Survey Done', color: 'bg-green-100 text-green-800' },
  
  // Registration Stage
  registration_pending: { label: 'Registration Pending', color: 'bg-orange-100 text-orange-800' },
  registration_completed: { label: 'Registration Done', color: 'bg-teal-100 text-teal-800' },
  
  // Payment Stage
  payment_pending: { label: 'Payment Pending', color: 'bg-red-100 text-red-800' },
  payment_received: { label: 'Payment Received', color: 'bg-green-100 text-green-800' },
  payment_disbursed: { label: 'Payment Disbursed', color: 'bg-emerald-100 text-emerald-800' },
  
  // Quotation Stage
  quotation_pending: { label: 'Quotation Pending', color: 'bg-amber-100 text-amber-800' },
  quotation_approved: { label: 'Quotation Approved', color: 'bg-lime-100 text-lime-800' },
  
  // Liaison Pre-installation
  liaison_pre: { label: 'Pre-Installation Liaison', color: 'bg-cyan-100 text-cyan-800' },
  
  // BOM Stage
  bom_pending: { label: 'BOM Pending', color: 'bg-violet-100 text-violet-800' },
  bom_approved: { label: 'BOM Approved', color: 'bg-fuchsia-100 text-fuchsia-800' },
  
  // Dispatch Stage
  dispatch_pending: { label: 'Dispatch Pending', color: 'bg-rose-100 text-rose-800' },
  dispatch_scheduled: { label: 'Dispatch Scheduled', color: 'bg-pink-100 text-pink-800' },
  dispatch_in_transit: { label: 'In Transit', color: 'bg-sky-100 text-sky-800' },
  dispatched: { label: 'Dispatched', color: 'bg-blue-100 text-blue-800' },
  dispatch_delivered: { label: 'Delivered', color: 'bg-teal-100 text-teal-800' },
  
  // Installation Stage
  installation_pending: { label: 'Installation Pending', color: 'bg-amber-100 text-amber-800' },
  installation_in_progress: { label: 'Installing', color: 'bg-orange-100 text-orange-800' },
  installation_completed: { label: 'Installation Done', color: 'bg-green-100 text-green-800' },
  
  // Inspection Stage
  inspection_pending: { label: 'Inspection Pending', color: 'bg-yellow-100 text-yellow-800' },
  inspection_approved: { label: 'Inspection Approved', color: 'bg-lime-100 text-lime-800' },
  
  // Liaison Grid Sync
  liaison_grid: { label: 'Grid Sync Liaison', color: 'bg-cyan-100 text-cyan-800' },
  
  // WCR Stage
  wcr_pending: { label: 'WCR Pending', color: 'bg-indigo-100 text-indigo-800' },
  wcr_submitted: { label: 'WCR Submitted', color: 'bg-purple-100 text-purple-800' },
  wcr_approved: { label: 'WCR Approved', color: 'bg-violet-100 text-violet-800' },
  
  // Subsidy Stage
  subsidy_pending: { label: 'Subsidy Pending', color: 'bg-fuchsia-100 text-fuchsia-800' },
  subsidy_disbursed: { label: 'Subsidy Disbursed', color: 'bg-pink-100 text-pink-800' },
  
  // Final Stage
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-800' },
};

interface StatusBadgeProps {
  status: EnquiryStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
