'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ClipboardCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  MapPin,
  Phone,
  Eye,
  FileText,
  RefreshCcw,
} from 'lucide-react';

interface Liaison {
  enquiryId: string;
  customerName: string;
  phone: string;
  address: string;
  area: string;
  capacity: string;
  status: string;
  
  // Installation data
  installationCompletedDate?: string;
  installationTeam?: string;
  
  // Inspection fields
  inspectionScheduledDate?: string;
  inspectionDate?: string;
  inspectionOfficer?: string;
  inspectionStatus?: string;
  inspectionApproved?: string;
  inspectionRejectedReason?: string;
  inspectionReportPath?: string;
  
  // System info
  systemCapacity: string;
  panelMake: string;
  inverterMake: string;
  meterNumber?: string;
  
  createdAt: string;
  updatedAt: string;
}

export default function LiaisonPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [liaisons, setLiaisons] = useState<Liaison[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedLiaison, setSelectedLiaison] = useState<Liaison | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);


  // Fetch liaisons (only enquiries with installation completed)
  const fetchLiaisons = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const url = forceRefresh ? '/api/liaison?refresh=true' : '/api/liaison';
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      if (!response.ok) throw new Error('Failed to fetch liaisons');
      const data = await response.json();
      setLiaisons(data.liaisons);
    } catch (error) {
      console.error('Error fetching liaisons:', error);
      alert('Failed to load liaisons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiaisons();
  }, []);

  // Filter liaisons
  const filteredLiaisons = liaisons.filter((liaison) => {
    const matchesSearch =
      !searchQuery ||
      liaison.enquiryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      liaison.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !liaison.inspectionScheduledDate) ||
      (filterStatus === 'scheduled' && liaison.inspectionScheduledDate && !liaison.inspectionDate) ||
      (filterStatus === 'completed' && liaison.inspectionApproved === 'TRUE');

    return matchesSearch && matchesStatus;
  });

  // Stats
  const pending = liaisons.filter((l) => !l.inspectionScheduledDate).length;
  const scheduled = liaisons.filter(
    (l) => l.inspectionScheduledDate && !l.inspectionDate
  ).length;
  const completed = liaisons.filter((l) => l.inspectionApproved === 'TRUE').length;

  const handleSchedule = (liaison: Liaison) => {
    setSelectedLiaison(liaison);
    setShowScheduleModal(true);
  };

  const handleComplete = (liaison: Liaison) => {
    setSelectedLiaison(liaison);
    setShowCompleteModal(true);
  };

  const handleApprove = (liaison: Liaison) => {
    setSelectedLiaison(liaison);
    setShowApprovalModal(true);
  };
  

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Liaison & Inspection
            </h1>
            <p className="text-slate-700 mt-1 text-sm md:text-base">
              Manage DISCOM inspections and grid synchronization
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatCard
          icon={<Clock size={24} />}
          label="Pending"
          value={pending}
          color="yellow"
        />
        <StatCard
          icon={<Calendar size={24} />}
          label="Scheduled"
          value={scheduled}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          label="Completed"
          value={completed}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <input
            type="text"
            placeholder="Search by Enquiry ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm md:text-base"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm md:text-base"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => fetchLiaisons(true)}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-4 py-2.5 rounded-lg hover:bg-slate-200 font-medium text-sm md:text-base"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Liaison List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-600 bg-white rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="font-medium">Loading liaisons...</p>
          </div>
        ) : filteredLiaisons.length === 0 ? (
          <div className="text-center py-16 text-slate-600 bg-white rounded-xl">
            <ClipboardCheck size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium text-lg">No liaisons found</p>
            <p className="text-slate-500 text-sm mt-2">
              Complete installations first to see them here
            </p>
          </div>
        ) : (
          filteredLiaisons.map((liaison) => (
            <LiaisonCard
              key={liaison.enquiryId}
              liaison={liaison}
              expanded={expanded === liaison.enquiryId}
              onToggleExpand={() =>
                setExpanded(expanded === liaison.enquiryId ? null : liaison.enquiryId)
              }
              onSchedule={() => handleSchedule(liaison)}
              onComplete={() => handleComplete(liaison)}
            />
          ))
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedLiaison && (
        <ScheduleModal
          liaison={selectedLiaison}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedLiaison(null);
          }}
          onSuccess={() => {
            setShowScheduleModal(false);
            setSelectedLiaison(null);
            fetchLiaisons(true);
          }}
          onRefresh={() => fetchLiaisons(true)}
        />
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedLiaison && (
        <CompleteModal
          liaison={selectedLiaison}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedLiaison(null);
          }}
          onSuccess={() => {
            setShowCompleteModal(false);
            setSelectedLiaison(null);
            fetchLiaisons(true);
          }}
          onRefresh={() => fetchLiaisons(true)}
        />
      )}

      {/* NEW: Approval Modal */}
{showApprovalModal && selectedLiaison && (
  <ApprovalModal
    liaison={selectedLiaison}
    onClose={() => {
      setShowApprovalModal(false);
      setSelectedLiaison(null);
    }}
    onSuccess={() => {
      setShowApprovalModal(false);
      setSelectedLiaison(null);
      fetchLiaisons(true);
    }}
    onRefresh={() => fetchLiaisons(true)}
  />
)}

    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    green: 'text-green-600 bg-green-50',
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || 'text-slate-600 bg-slate-50';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className={`p-2 rounded-lg ${bgClass}`}>{icon}</div>
        <span className={`text-xl md:text-2xl font-bold ${bgClass.split(' ')[0]}`}>
          {value}
        </span>
      </div>
      <div className="text-slate-700 text-xs md:text-sm font-medium">{label}</div>
    </div>
  );
}

function LiaisonCard({ liaison, expanded, onToggleExpand, onSchedule, onComplete, onApprove  }: any) {
  const getStatusBadge = () => {
    if (liaison.inspectionApproved === 'TRUE') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          APPROVED
        </span>
      );
    }
    if (liaison.inspectionDate && liaison.inspectionDate.trim() !== '') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
          INSPECTED
        </span>
      );
    }
    if (liaison.inspectionScheduledDate && liaison.inspectionScheduledDate.trim() !== '') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          SCHEDULED
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
        PENDING
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">{liaison.enquiryId}</h3>
          <p className="text-sm md:text-base text-slate-700 font-medium mt-1">
            {liaison.customerName}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium flex items-center gap-1">
              <MapPin size={12} />
              {liaison.area}
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium flex items-center gap-1">
              <Phone size={12} />
              {liaison.phone}
            </span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Inspection Info */}
      {liaison.inspectionScheduledDate && (
        <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
            <Calendar size={14} />
            Inspection Schedule
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {liaison.inspectionScheduledDate && (
              <div>
                <span className="text-blue-700">Scheduled:</span>
                <span className="text-blue-900 font-medium ml-1">
                  {new Date(liaison.inspectionScheduledDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {liaison.inspectionDate && (
              <div>
                <span className="text-blue-700">Completed:</span>
                <span className="text-blue-900 font-medium ml-1">
                  {new Date(liaison.inspectionDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {liaison.inspectionOfficer && (
              <div className="col-span-2">
                <span className="text-blue-700">Officer:</span>
                <span className="text-blue-900 font-medium ml-1">{liaison.inspectionOfficer}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approval Info */}
      {liaison.inspectionApproved === 'TRUE' && (
        <div className="mb-4 bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
            <CheckCircle size={14} />
            Inspection Approved
          </p>
          {liaison.inspectionReportPath && (
            <a
              href={liaison.inspectionReportPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-700 hover:text-green-900 flex items-center gap-1"
            >
              <FileText size={12} />
              View Report
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200">
        <p className="text-slate-800 font-medium text-sm md:text-base">
          <strong className="text-slate-900">{liaison.systemCapacity} kW</strong> •{' '}
          {liaison.panelMake} panels • {liaison.inverterMake}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onToggleExpand}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors"
          >
            <Eye size={16} className="inline mr-1" />
            {expanded ? 'Hide' : 'View'} Details
          </button>
          {!liaison.inspectionScheduledDate && (
            <button
              onClick={onSchedule}
              className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              <Calendar size={16} className="inline mr-1" />
              Schedule
            </button>
          )}
          {liaison.inspectionScheduledDate && liaison.inspectionApproved !== 'TRUE' && (
            <button
              onClick={onComplete}
              className="flex-1 sm:flex-initial px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
            >
              <CheckCircle size={16} className="inline mr-1" />
              Record Inspection
            </button>
          )}
        </div>
      </div>

      {/* NEW: Separate Approval Button */}
{liaison.inspectionDate && 
 liaison.inspectionDate.trim() !== '' && 
 liaison.inspectionApproved !== 'TRUE' && 
 !liaison.meterNumber && (
  <button
    onClick={() => onApprove(liaison)}
    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
  >
    <CheckCircle size={18} />
    Approve Inspection
  </button>
)}

{/* Show if already approved */}
{liaison.inspectionApproved === 'TRUE' && !liaison.meterNumber && (
  <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border-2 border-green-200">
    <CheckCircle size={18} />
    <span className="font-semibold">Inspection Approved</span>
  </div>
)}

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Site Details</h4>
              <div className="space-y-1 text-slate-700">
                <p>
                  <strong>Address:</strong> {liaison.address}
                </p>
                <p>
                  <strong>Area:</strong> {liaison.area}
                </p>
                <p>
                  <strong>Phone:</strong> {liaison.phone}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Installation Info</h4>
              <div className="space-y-1 text-slate-700">
                <p>
                  <strong>Completed:</strong>{' '}
                  {liaison.installationCompletedDate
                    ? new Date(liaison.installationCompletedDate).toLocaleDateString('en-IN')
                    : 'N/A'}
                </p>
                <p>
                  <strong>Team:</strong> {liaison.installationTeam || 'N/A'}
                </p>
                {liaison.meterNumber && (
                  <p>
                    <strong>Meter:</strong> {liaison.meterNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Schedule Modal
function ScheduleModal({ liaison, onClose, onSuccess, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    inspectionScheduledDate: '',
    inspectionOfficer: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/liaison/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: liaison.enquiryId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to schedule inspection');
      }

      alert('✅ Inspection scheduled successfully!');
      await onRefresh();
      onSuccess();
    } catch (error: any) {
      console.error('Schedule error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Schedule Inspection</h2>
          <p className="text-slate-600 text-sm mt-1">
            {liaison.enquiryId} - {liaison.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.inspectionScheduledDate}
              onChange={(e) =>
                setFormData({ ...formData, inspectionScheduledDate: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Inspection Officer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.inspectionOfficer}
              onChange={(e) =>
                setFormData({ ...formData, inspectionOfficer: e.target.value })
              }
              placeholder="Enter officer name"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 font-semibold transition-colors"
            >
              {loading ? 'Scheduling...' : 'Schedule Inspection'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-200 text-slate-800 py-3 rounded-xl hover:bg-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Complete Modal
function CompleteModal({ liaison, onClose, onSuccess, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionApproved: true,
    inspectionRejectedReason: '',
    inspectionReportPath: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/liaison/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: liaison.enquiryId,
          inspectionOfficer: liaison.inspectionOfficer,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete inspection');
      }

      alert('✅ Inspection recorded successfully!');
      await onRefresh();
      onSuccess();
    } catch (error: any) {
      console.error('Complete error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Record Inspection</h2>
          <p className="text-slate-600 text-sm mt-1">
            {liaison.enquiryId} - {liaison.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Inspection Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.inspectionDate}
              onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="approved"
              checked={formData.inspectionApproved}
              onChange={(e) =>
                setFormData({ ...formData, inspectionApproved: e.target.checked })
              }
              className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
            />
            <label htmlFor="approved" className="text-slate-800 font-medium text-sm">
              Inspection Approved
            </label>
          </div>

          {!formData.inspectionApproved && (
            <div>
              <label className="block text-slate-800 font-medium mb-2 text-sm">
                Rejection Reason
              </label>
              <textarea
                value={formData.inspectionRejectedReason}
                onChange={(e) =>
                  setFormData({ ...formData, inspectionRejectedReason: e.target.value })
                }
                placeholder="Why was the inspection rejected?"
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Report Document Path (optional)
            </label>
            <input
              type="text"
              value={formData.inspectionReportPath}
              onChange={(e) =>
                setFormData({ ...formData, inspectionReportPath: e.target.value })
              }
              placeholder="/docs/inspection/ENQ-XXX.pdf"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:bg-slate-400 font-semibold transition-colors"
            >
              {loading ? 'Processing...' : 'Record Inspection'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-200 text-slate-800 py-3 rounded-xl hover:bg-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApprovalModal({
  liaison,
  onClose,
  onSuccess,
  onRefresh,
}: {
  liaison: Liaison;
  onClose: () => void;
  onSuccess: () => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    approved: true,
    rejectionReason: '',
    approvalNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.approved && !formData.rejectionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/liaison/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: liaison.enquiryId,
          approved: formData.approved,
          rejectionReason: formData.rejectionReason,
          approvalNotes: formData.approvalNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit approval');
      }

      alert(formData.approved ? 'Inspection approved!' : 'Inspection rejected');
      await onRefresh();
      onSuccess();
    } catch (error: any) {
      console.error('Approval error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {formData.approved ? 'Approve Inspection' : 'Reject Inspection'}
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            {liaison.enquiryId} - {liaison.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Inspection Summary */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-slate-700">Inspection Date:</span>
              <span className="text-sm font-bold text-slate-900">
                {liaison.inspectionDate ? new Date(liaison.inspectionDate).toLocaleDateString('en-IN') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-slate-700">Inspector:</span>
              <span className="text-sm font-bold text-slate-900">{liaison.inspectionOfficer || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-slate-700">System Capacity:</span>
              <span className="text-sm font-bold text-slate-900">{liaison.systemCapacity || liaison.capacity} kW</span>
            </div>
          </div>

          {/* Approval Decision */}
          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Decision <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  checked={formData.approved}
                  onChange={() => setFormData({ ...formData, approved: true })}
                  className="w-4 h-4 text-green-600"
                />
                <span className="font-semibold text-green-700">✅ Approve</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="decision"
                  checked={!formData.approved}
                  onChange={() => setFormData({ ...formData, approved: false })}
                  className="w-4 h-4 text-red-600"
                />
                <span className="font-semibold text-red-700">❌ Reject</span>
              </label>
            </div>
          </div>

          {/* Rejection Reason (only if rejected) */}
          {!formData.approved && (
            <div>
              <label className="block text-slate-800 font-medium mb-2 text-sm">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                required={!formData.approved}
                rows={3}
                value={formData.rejectionReason}
                onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 text-slate-900"
                placeholder="Specify the reason for rejection (safety issues, incomplete work, etc.)"
              />
            </div>
          )}

          {/* Approval Notes (optional) */}
          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.approvalNotes}
              onChange={(e) => setFormData({ ...formData, approvalNotes: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              placeholder="Any additional comments or observations..."
            />
          </div>

          {/* Warning for Rejection */}
          {!formData.approved && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
              <p className="text-sm font-medium text-red-900">
                ⚠️ Rejecting will require the installation team to rectify issues and re-schedule inspection.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 border-slate-300 text-slate-900 font-bold px-4 py-2.5 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 ${
                formData.approved
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? 'Processing...' : formData.approved ? 'Approve Inspection' : 'Reject Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
