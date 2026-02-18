'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FileCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Upload,
  Image as ImageIcon,
  Calendar,
  User,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface WCR {
  enquiryId: string;
  customerName: string;
  phone: string;
  capacity: string;
  address: string;
  
  // Installation details
  installationDate: string;
  installedBy: string;
  
  // WCR details
  wcrStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
  wcrSubmittedDate?: string;
  wcrSubmittedBy?: string;
  wcrApprovedDate?: string;
  wcrApprovedBy?: string;
  wcrRejectedReason?: string;
  
  // WCR content
  wcrPhotos?: string[]; // Array of photo URLs
  wcrNotes?: string;
  workQuality?: string;
  safetyCompliance?: string;
  customerSignature?: string;
}

export default function WCRPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  
  const [wcrs, setWcrs] = useState<WCR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWcr, setSelectedWcr] = useState<WCR | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    fetchWcrs();
  }, []);

  const fetchWcrs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch('/api/wcr');
      if (response.ok) {
        const data = await response.json();
        setWcrs(data.wcrs);
      }
    } catch (error) {
      console.error('Failed to fetch WCRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWcr = (wcr: WCR) => {
    setSelectedWcr(wcr);
    setShowSubmitModal(true);
  };

  const handleApproveReject = (wcr: WCR) => {
    setSelectedWcr(wcr);
    setShowApprovalModal(true);
  };

  // Filter WCRs
  const filteredWcrs = wcrs.filter((wcr) => {
    const matchesSearch =
      wcr.enquiryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wcr.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wcr.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || wcr.wcrStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const metrics = {
    total: wcrs.length,
    pending: wcrs.filter(w => w.wcrStatus === 'pending').length,
    submitted: wcrs.filter(w => w.wcrStatus === 'submitted').length,
    approved: wcrs.filter(w => w.wcrStatus === 'approved').length,
    rejected: wcrs.filter(w => w.wcrStatus === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">Loading WCRs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Work Completion Reports
        </h1>
        <p className="text-gray-800 font-medium mt-2">
          Submit and manage installation completion reports with photos and signatures
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="text-sm font-semibold text-gray-700">Total</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="text-sm font-semibold text-gray-700">Pending</div>
          <div className="text-2xl font-bold text-yellow-700 mt-1">{metrics.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <div className="text-sm font-semibold text-gray-700">Submitted</div>
          <div className="text-2xl font-bold text-orange-700 mt-1">{metrics.submitted}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="text-sm font-semibold text-gray-700">Approved</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{metrics.approved}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="text-sm font-semibold text-gray-700">Rejected</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{metrics.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by enquiry ID, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Submission</option>
            <option value="submitted">Submitted - Awaiting Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={() => fetchWcrs(true)}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* WCR List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Enquiry ID</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Customer</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Installation Date</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Installed By</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">WCR Status</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWcrs.map((wcr) => (
                <tr key={wcr.enquiryId} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 font-mono text-sm font-semibold text-gray-900">
                    {wcr.enquiryId}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{wcr.customerName}</div>
                    <div className="text-sm font-medium text-gray-700">{wcr.phone}</div>
                    <div className="text-xs font-medium text-gray-600">{wcr.capacity}</div>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                    {wcr.installationDate ? new Date(wcr.installationDate).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    {wcr.installedBy || 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <WCRStatusBadge status={wcr.wcrStatus} />
                    {wcr.wcrSubmittedDate && (
                      <div className="text-xs text-gray-600 mt-1">
                        Submitted: {new Date(wcr.wcrSubmittedDate).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      {wcr.wcrStatus === 'pending' && userRole === 'installation' && (
                        <button
                          onClick={() => handleSubmitWcr(wcr)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm"
                        >
                          Submit WCR
                        </button>
                      )}
                      
                      {wcr.wcrStatus === 'submitted' && (userRole === 'admin' || userRole === 'liaison') && (
                        <button
                          onClick={() => handleApproveReject(wcr)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm"
                        >
                          Review
                        </button>
                      )}

                      {(wcr.wcrStatus === 'approved' || wcr.wcrStatus === 'rejected' || wcr.wcrStatus === 'submitted') && (
                        <button
                          onClick={() => setSelectedWcr(wcr)}
                          className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWcrs.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold">No WCRs found</p>
          </div>
        )}
      </div>

      {/* Submit WCR Modal */}
      {showSubmitModal && selectedWcr && (
        <SubmitWCRModal
          wcr={selectedWcr}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedWcr(null);
          }}
          onSuccess={() => {
            setShowSubmitModal(false);
            setSelectedWcr(null);
            fetchWcrs(true);
          }}
        />
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedWcr && (
        <ApprovalModal
          wcr={selectedWcr}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedWcr(null);
          }}
          onSuccess={() => {
            setShowApprovalModal(false);
            setSelectedWcr(null);
            fetchWcrs(true);
          }}
        />
      )}

      {/* View Details Modal */}
      {selectedWcr && !showSubmitModal && !showApprovalModal && (
        <ViewWCRModal
          wcr={selectedWcr}
          onClose={() => setSelectedWcr(null)}
        />
      )}
    </div>
  );
}

// WCR Status Badge
function WCRStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
    submitted: { label: 'Submitted', color: 'bg-orange-100 text-orange-900 border-orange-300' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-900 border-green-300' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-900 border-red-300' },
  };

  const { label, color } = config[status] || config.pending;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 ${color} inline-block`}>
      {label}
    </span>
  );
}

// Submit WCR Modal
function SubmitWCRModal({
  wcr,
  onClose,
  onSuccess,
}: {
  wcr: WCR;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    completionDate: new Date().toISOString().split('T')[0],
    workQuality: 'excellent',
    safetyCompliance: 'yes',
    wcrNotes: '',
    photoUrls: '',
    customerSignature: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.wcrNotes.trim()) {
      alert('Work completion notes are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/wcr/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: wcr.enquiryId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit WCR');
      }

      alert('Work Completion Report submitted successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Submit Work Completion Report</h2>
          <p className="text-gray-600 text-sm mt-1">
            {wcr.enquiryId} - {wcr.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Installation Summary */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Customer:</span>
              <span className="text-sm font-bold text-gray-900">{wcr.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">System Capacity:</span>
              <span className="text-sm font-bold text-gray-900">{wcr.capacity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Installation Date:</span>
              <span className="text-sm font-bold text-gray-900">
                {wcr.installationDate ? new Date(wcr.installationDate).toLocaleDateString('en-IN') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Address:</span>
              <span className="text-sm font-bold text-gray-900">{wcr.address || 'N/A'}</span>
            </div>
          </div>

          {/* Completion Date */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Work Completion Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.completionDate}
              onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Work Quality */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Work Quality Assessment <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.workQuality}
              onChange={(e) => setFormData({ ...formData, workQuality: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="satisfactory">Satisfactory</option>
              <option value="needs-improvement">Needs Improvement</option>
            </select>
          </div>

          {/* Safety Compliance */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Safety Standards Compliance <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="safety"
                  checked={formData.safetyCompliance === 'yes'}
                  onChange={() => setFormData({ ...formData, safetyCompliance: 'yes' })}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-green-700">✅ Yes - All standards met</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="safety"
                  checked={formData.safetyCompliance === 'no'}
                  onChange={() => setFormData({ ...formData, safetyCompliance: 'no' })}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-red-700">❌ No - Issues found</span>
              </label>
            </div>
          </div>

          {/* Work Completion Notes */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Work Completion Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.wcrNotes}
              onChange={(e) => setFormData({ ...formData, wcrNotes: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Describe the completed work, any challenges faced, materials used, etc..."
            />
          </div>

          {/* Photo URLs */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Installation Photos (URLs) <span className="text-gray-600 text-xs">- comma separated</span>
            </label>
            <textarea
              rows={2}
              value={formData.photoUrls}
              onChange={(e) => setFormData({ ...formData, photoUrls: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
            />
            <p className="text-xs text-gray-600 mt-1">
              📸 Upload photos to Google Drive/Cloud and paste URLs here
            </p>
          </div>

          {/* Customer Signature */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Customer Signature/Approval
            </label>
            <input
              type="text"
              value={formData.customerSignature}
              onChange={(e) => setFormData({ ...formData, customerSignature: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Customer name or signature image URL"
            />
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">
              ℹ️ This report will be submitted for approval. Ensure all details are accurate before submitting.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 border-gray-300 text-gray-900 font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit WCR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Approval Modal
function ApprovalModal({
  wcr,
  onClose,
  onSuccess,
}: {
  wcr: WCR;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!approved && !rejectionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/wcr/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: wcr.enquiryId,
          approved,
          rejectionReason,
          approvalNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process approval');
      }

      alert(approved ? 'WCR approved successfully!' : 'WCR rejected');
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
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Review Work Completion Report</h2>
          <p className="text-gray-600 text-sm mt-1">
            {wcr.enquiryId} - {wcr.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* WCR Details */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Submitted By:</span>
              <span className="text-sm font-bold text-gray-900">{wcr.wcrSubmittedBy || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Submitted Date:</span>
              <span className="text-sm font-bold text-gray-900">
                {wcr.wcrSubmittedDate ? new Date(wcr.wcrSubmittedDate).toLocaleDateString('en-IN') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Work Quality:</span>
              <span className="text-sm font-bold text-gray-900">{wcr.workQuality || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Safety Compliance:</span>
              <span className="text-sm font-bold text-gray-900">{wcr.safetyCompliance || 'N/A'}</span>
            </div>
          </div>

          {/* WCR Notes */}
          {wcr.wcrNotes && (
            <div>
              <label className="block text-gray-800 font-medium mb-2 text-sm">Work Completion Notes</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900">
                {wcr.wcrNotes}
              </div>
            </div>
          )}

          {/* Photos */}
          {wcr.wcrPhotos && wcr.wcrPhotos.length > 0 && (
            <div>
              <label className="block text-gray-800 font-medium mb-2 text-sm">Installation Photos</label>
              <div className="grid grid-cols-2 gap-2">
                {wcr.wcrPhotos.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Photo {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Decision */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Decision <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={approved}
                  onChange={() => setApproved(true)}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-green-700">✅ Approve</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!approved}
                  onChange={() => setApproved(false)}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-red-700">❌ Reject</span>
              </label>
            </div>
          </div>

          {/* Rejection Reason */}
          {!approved && (
            <div>
              <label className="block text-gray-800 font-medium mb-2 text-sm">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                required={!approved}
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="Specify why the WCR is being rejected..."
              />
            </div>
          )}

          {/* Approval Notes */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Any additional comments..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 border-gray-300 text-gray-900 font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 ${
                approved
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? 'Processing...' : approved ? 'Approve WCR' : 'Reject WCR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View WCR Modal (Read-only)
function ViewWCRModal({ wcr, onClose }: { wcr: WCR; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Work Completion Report</h2>
              <p className="text-gray-600 text-sm mt-1">{wcr.enquiryId} - {wcr.customerName}</p>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-3xl font-bold">
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <WCRStatusBadge status={wcr.wcrStatus} />
          </div>

          {/* Installation Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Installation Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Customer:</span>
                <span className="text-sm font-bold text-gray-900">{wcr.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Phone:</span>
                <span className="text-sm font-bold text-gray-900">{wcr.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Capacity:</span>
                <span className="text-sm font-bold text-gray-900">{wcr.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Installation Date:</span>
                <span className="text-sm font-bold text-gray-900">
                  {wcr.installationDate ? new Date(wcr.installationDate).toLocaleDateString('en-IN') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Installed By:</span>
                <span className="text-sm font-bold text-gray-900">{wcr.installedBy || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* WCR Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">WCR Details</h3>
            <div className="space-y-3">
              {wcr.wcrNotes && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Work Completion Notes:</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-900">
                    {wcr.wcrNotes}
                  </div>
                </div>
              )}

              {wcr.workQuality && (
                <div className="flex justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-sm font-semibold text-gray-700">Work Quality:</span>
                  <span className="text-sm font-bold text-gray-900">{wcr.workQuality}</span>
                </div>
              )}

              {wcr.safetyCompliance && (
                <div className="flex justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-sm font-semibold text-gray-700">Safety Compliance:</span>
                  <span className="text-sm font-bold text-gray-900">{wcr.safetyCompliance}</span>
                </div>
              )}

              {wcr.wcrPhotos && wcr.wcrPhotos.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Installation Photos:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {wcr.wcrPhotos.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
                      >
                        <ImageIcon size={16} />
                        Photo {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Approval/Rejection Info */}
          {(wcr.wcrStatus === 'approved' || wcr.wcrStatus === 'rejected') && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {wcr.wcrStatus === 'approved' ? 'Approval Details' : 'Rejection Details'}
              </h3>
              <div className={`rounded-lg p-4 border-2 ${
                wcr.wcrStatus === 'approved' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      {wcr.wcrStatus === 'approved' ? 'Approved By:' : 'Rejected By:'}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{wcr.wcrApprovedBy || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-700">Date:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {wcr.wcrApprovedDate ? new Date(wcr.wcrApprovedDate).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                  </div>
                  {wcr.wcrStatus === 'rejected' && wcr.wcrRejectedReason && (
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block mb-1">Reason:</span>
                      <div className="bg-white border border-red-300 rounded p-2 text-sm text-gray-900">
                        {wcr.wcrRejectedReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
