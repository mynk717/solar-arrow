'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  TrendingUp,
  Eye,
  RefreshCcw,
  AlertCircle,
} from 'lucide-react';

interface Subsidy {
  enquiryId: string;
  customerName: string;
  phone: string;
  address: string;
  area: string;
  capacity: string;
  systemCapacity: string;
  status: string;
  
  // Inspection info
  inspectionApproved?: string;
  inspectionDate?: string;
  
  // Subsidy fields
  subsidyAmount?: string;
  subsidyStatus?: string;
  subsidyAppliedDate?: string;
  subsidyApprovedDate?: string;
  subsidyDisbursedDate?: string;
  subsidyRejectedDate?: string;
  subsidyRejectionReason?: string;
  subsidyBankAccount?: string;
  subsidyUTR?: string;
  subsidyDocumentPath?: string;
  
  createdAt: string;
  updatedAt: string;
}

export default function SubsidyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Fetch subsidies (only enquiries with inspection approved)
  const fetchSubsidies = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const url = forceRefresh ? '/api/subsidy?refresh=true' : '/api/subsidy';
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      if (!response.ok) throw new Error('Failed to fetch subsidies');
      const data = await response.json();
      setSubsidies(data.subsidies);
    } catch (error) {
      console.error('Error fetching subsidies:', error);
      alert('Failed to load subsidies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubsidies();
  }, []);

  // Filter subsidies
  const filteredSubsidies = subsidies.filter((subsidy) => {
    const matchesSearch =
      !searchQuery ||
      subsidy.enquiryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subsidy.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && subsidy.subsidyStatus === 'pending') ||
      (filterStatus === 'applied' && subsidy.subsidyStatus === 'applied') ||
      (filterStatus === 'approved' && subsidy.subsidyStatus === 'approved') ||
      (filterStatus === 'disbursed' && subsidy.subsidyStatus === 'disbursed');

    return matchesSearch && matchesStatus;
  });

  // Stats
  const pending = subsidies.filter((s) => s.subsidyStatus === 'pending').length;
  const applied = subsidies.filter((s) => s.subsidyStatus === 'applied').length;
  const approved = subsidies.filter((s) => s.subsidyStatus === 'approved').length;
  const disbursed = subsidies.filter((s) => s.subsidyStatus === 'disbursed').length;
  
  const totalAmount = subsidies
    .filter((s) => s.subsidyAmount)
    .reduce((sum, s) => sum + parseFloat(s.subsidyAmount || '0'), 0);

  const handleApply = (subsidy: Subsidy) => {
    setSelectedSubsidy(subsidy);
    setShowApplyModal(true);
  };

  const handleUpdate = (subsidy: Subsidy) => {
    setSelectedSubsidy(subsidy);
    setShowUpdateModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Subsidy Management
            </h1>
            <p className="text-slate-700 mt-1 text-sm md:text-base">
              Track MNRE/State subsidy applications and disbursements
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard icon={<Clock size={20} />} label="Pending" value={pending} color="yellow" />
        <StatCard icon={<FileText size={20} />} label="Applied" value={applied} color="blue" />
        <StatCard icon={<CheckCircle size={20} />} label="Approved" value={approved} color="green" />
        <StatCard icon={<DollarSign size={20} />} label="Disbursed" value={disbursed} color="emerald" />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Total Amount"
          value={`₹${(totalAmount / 100000).toFixed(1)}L`}
          color="purple"
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
            <option value="applied">Applied</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed</option>
          </select>
          <button
            onClick={() => fetchSubsidies(true)}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-4 py-2.5 rounded-lg hover:bg-slate-200 font-medium text-sm md:text-base"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Subsidy List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-600 bg-white rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="font-medium">Loading subsidies...</p>
          </div>
        ) : filteredSubsidies.length === 0 ? (
          <div className="text-center py-16 text-slate-600 bg-white rounded-xl">
            <DollarSign size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium text-lg">No subsidies found</p>
            <p className="text-slate-500 text-sm mt-2">
              Complete liaison/inspection first
            </p>
          </div>
        ) : (
          filteredSubsidies.map((subsidy) => (
            <SubsidyCard
              key={subsidy.enquiryId}
              subsidy={subsidy}
              expanded={expanded === subsidy.enquiryId}
              onToggleExpand={() =>
                setExpanded(expanded === subsidy.enquiryId ? null : subsidy.enquiryId)
              }
              onApply={() => handleApply(subsidy)}
              onUpdate={() => handleUpdate(subsidy)}
            />
          ))
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedSubsidy && (
        <ApplyModal
          subsidy={selectedSubsidy}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedSubsidy(null);
          }}
          onSuccess={() => {
            setShowApplyModal(false);
            setSelectedSubsidy(null);
            fetchSubsidies(true);
          }}
          onRefresh={() => fetchSubsidies(true)}
        />
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedSubsidy && (
        <UpdateModal
          subsidy={selectedSubsidy}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedSubsidy(null);
          }}
          onSuccess={() => {
            setShowUpdateModal(false);
            setSelectedSubsidy(null);
            fetchSubsidies(true);
          }}
          onRefresh={() => fetchSubsidies(true)}
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
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || 'text-slate-600 bg-slate-50';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${bgClass}`}>{icon}</div>
        <span className={`text-lg md:text-xl font-bold ${bgClass.split(' ')[0]}`}>
          {value}
        </span>
      </div>
      <div className="text-slate-700 text-xs md:text-sm font-medium">{label}</div>
    </div>
  );
}

function SubsidyCard({ subsidy, expanded, onToggleExpand, onApply, onUpdate }: any) {
  const getStatusBadge = () => {
    switch (subsidy.subsidyStatus) {
      case 'disbursed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            DISBURSED
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            APPROVED
          </span>
        );
      case 'applied':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            APPLIED
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">{subsidy.enquiryId}</h3>
          <p className="text-sm md:text-base text-slate-700 font-medium mt-1">
            {subsidy.customerName}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
              {subsidy.systemCapacity} kW
            </span>
            {subsidy.subsidyAmount && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                ₹{parseFloat(subsidy.subsidyAmount).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Subsidy Timeline */}
      {subsidy.subsidyStatus !== 'pending' && (
        <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {subsidy.subsidyAppliedDate && (
              <div>
                <span className="text-blue-700">Applied:</span>
                <span className="text-blue-900 font-medium ml-1">
                  {new Date(subsidy.subsidyAppliedDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {subsidy.subsidyApprovedDate && (
              <div>
                <span className="text-blue-700">Approved:</span>
                <span className="text-blue-900 font-medium ml-1">
                  {new Date(subsidy.subsidyApprovedDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {subsidy.subsidyDisbursedDate && (
              <div>
                <span className="text-blue-700">Disbursed:</span>
                <span className="text-blue-900 font-medium ml-1">
                  {new Date(subsidy.subsidyDisbursedDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {subsidy.subsidyUTR && (
              <div className="col-span-2">
                <span className="text-blue-700">UTR:</span>
                <span className="text-blue-900 font-medium ml-1">{subsidy.subsidyUTR}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Info */}
      {subsidy.subsidyRejectedDate && (
        <div className="mb-4 bg-red-50 rounded-lg p-3 border border-red-200">
          <p className="text-xs font-semibold text-red-900 mb-1 flex items-center gap-1">
            <AlertCircle size={14} />
            Subsidy Rejected
          </p>
          <p className="text-xs text-red-700">
            {subsidy.subsidyRejectionReason || 'No reason provided'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200">
        <p className="text-slate-800 font-medium text-sm md:text-base">
          Inspection: {subsidy.inspectionDate ? new Date(subsidy.inspectionDate).toLocaleDateString('en-IN') : 'N/A'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onToggleExpand}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors"
          >
            <Eye size={16} className="inline mr-1" />
            {expanded ? 'Hide' : 'View'} Details
          </button>
          {subsidy.subsidyStatus === 'pending' && (
            <button
              onClick={onApply}
              className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              <FileText size={16} className="inline mr-1" />
              Apply
            </button>
          )}
          {subsidy.subsidyStatus !== 'pending' && subsidy.subsidyStatus !== 'disbursed' && (
            <button
              onClick={onUpdate}
              className="flex-1 sm:flex-initial px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
            >
              <CheckCircle size={16} className="inline mr-1" />
              Update Status
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Customer Details</h4>
              <div className="space-y-1 text-slate-700">
                <p><strong>Address:</strong> {subsidy.address}</p>
                <p><strong>Area:</strong> {subsidy.area}</p>
                <p><strong>Phone:</strong> {subsidy.phone}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Subsidy Info</h4>
              <div className="space-y-1 text-slate-700">
                <p><strong>Bank Account:</strong> {subsidy.subsidyBankAccount || 'N/A'}</p>
                {subsidy.subsidyDocumentPath && (
                  <p>
                    <strong>Documents:</strong>{' '}
                    <a
                      href={subsidy.subsidyDocumentPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
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

// Apply Modal
function ApplyModal({ subsidy, onClose, onSuccess, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subsidyAppliedDate: new Date().toISOString().split('T')[0],
    subsidyAmount: '',
    subsidyBankAccount: '',
    subsidyDocumentPath: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/subsidy/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: subsidy.enquiryId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply for subsidy');
      }

      alert('✅ Subsidy application submitted successfully!');
      await onRefresh();
      onSuccess();
    } catch (error: any) {
      console.error('Apply error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Apply for Subsidy</h2>
          <p className="text-slate-600 text-sm mt-1">
            {subsidy.enquiryId} - {subsidy.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Application Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.subsidyAppliedDate}
              onChange={(e) =>
                setFormData({ ...formData, subsidyAppliedDate: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Subsidy Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.subsidyAmount}
              onChange={(e) =>
                setFormData({ ...formData, subsidyAmount: e.target.value })
              }
              placeholder="Enter amount in ₹"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Bank Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.subsidyBankAccount}
              onChange={(e) =>
                setFormData({ ...formData, subsidyBankAccount: e.target.value })
              }
              placeholder="Enter account number"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Document Path (optional)
            </label>
            <input
              type="text"
              value={formData.subsidyDocumentPath}
              onChange={(e) =>
                setFormData({ ...formData, subsidyDocumentPath: e.target.value })
              }
              placeholder="/docs/subsidy/ENQ-XXX.pdf"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 font-semibold transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
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

// Update Modal
function UpdateModal({ subsidy, onClose, onSuccess, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subsidyStatus: subsidy.subsidyStatus || 'applied',
    subsidyApprovedDate: '',
    subsidyDisbursedDate: '',
    subsidyUTR: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/subsidy/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: subsidy.enquiryId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subsidy');
      }

      alert('✅ Subsidy status updated successfully!');
      await onRefresh();
      onSuccess();
    } catch (error: any) {
      console.error('Update error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Update Subsidy Status</h2>
          <p className="text-slate-600 text-sm mt-1">
            {subsidy.enquiryId} - {subsidy.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.subsidyStatus}
              onChange={(e) =>
                setFormData({ ...formData, subsidyStatus: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
            >
              <option value="applied">Applied</option>
              <option value="approved">Approved</option>
              <option value="disbursed">Disbursed</option>
            </select>
          </div>

          {(formData.subsidyStatus === 'approved' || formData.subsidyStatus === 'disbursed') && (
            <div>
              <label className="block text-slate-800 font-medium mb-2 text-sm">
                Approved Date
              </label>
              <input
                type="date"
                value={formData.subsidyApprovedDate}
                onChange={(e) =>
                  setFormData({ ...formData, subsidyApprovedDate: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
              />
            </div>
          )}

          {formData.subsidyStatus === 'disbursed' && (
            <>
              <div>
                <label className="block text-slate-800 font-medium mb-2 text-sm">
                  Disbursed Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.subsidyDisbursedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, subsidyDisbursedDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-medium mb-2 text-sm">
                  UTR Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subsidyUTR}
                  onChange={(e) =>
                    setFormData({ ...formData, subsidyUTR: e.target.value })
                  }
                  placeholder="Enter UTR number"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:bg-slate-400 font-semibold transition-colors"
            >
              {loading ? 'Updating...' : 'Update Status'}
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
