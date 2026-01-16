import { EnquiryStatus } from '@/lib/types';

const statusConfig: Record<EnquiryStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  survey_pending: { label: 'Survey Pending', color: 'bg-yellow-100 text-yellow-800' },
  survey_completed: { label: 'Survey Done', color: 'bg-green-100 text-green-800' },
  registration_pending: { label: 'Registration Pending', color: 'bg-orange-100 text-orange-800' },
  payment_pending: { label: 'Payment Pending', color: 'bg-red-100 text-red-800' },
  payment_received: { label: 'Payment Received', color: 'bg-emerald-100 text-emerald-800' },
  dispatch_pending: { label: 'Dispatch Pending', color: 'bg-purple-100 text-purple-800' },
  dispatched: { label: 'Dispatched', color: 'bg-indigo-100 text-indigo-800' },
  installation_pending: { label: 'Installation Pending', color: 'bg-pink-100 text-pink-800' },
  installation_completed: { label: 'Installation Done', color: 'bg-teal-100 text-teal-800' },
  inspection_pending: { label: 'Inspection Pending', color: 'bg-amber-100 text-amber-800' },
  inspection_approved: { label: 'Inspection Approved', color: 'bg-lime-100 text-lime-800' },
  active: { label: 'Active', color: 'bg-green-500 text-white' },
};

export default function StatusBadge({ status }: { status: EnquiryStatus }) {
  const config = statusConfig[status];
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}