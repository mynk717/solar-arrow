'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Edit,
  Plus,
} from 'lucide-react';

export default function RegistrationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/registration/list');
      const data = await response.json();
      
      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (registration: any) => {
    setSelectedRegistration(registration);
    setShowUpdateModal(true);
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === 'all') return true;
    return reg.registrationStatus === filter;
  });

  const stats = {
    pending: registrations.filter((r) => r.registrationStatus === 'pending').length,
    submitted: registrations.filter((r) => r.registrationStatus === 'submitted').length,
    underReview: registrations.filter((r) => r.registrationStatus === 'under-review').length,
    approved: registrations.filter((r) => r.registrationStatus === 'approved').length,
    rejected: registrations.filter((r) => r.registrationStatus === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            DISCOM Registration Tracking
          </h1>
          <p className="text-gray-600 mt-2">
            Track registration status and DISCOM approvals
          </p>
        </div>
        
        <button
          onClick={() => router.push('/registration/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Submit Enquiry for Registration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">
                {stats.pending}
              </p>
            </div>
            <div className="bg-gray-500 text-white p-3 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Submitted</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.submitted}
              </p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Under Review</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {stats.underReview}
              </p>
            </div>
            <div className="bg-orange-500 text-white p-3 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.approved}
              </p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats.rejected}
              </p>
            </div>
            <div className="bg-red-500 text-white p-3 rounded-lg">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={20} className="text-gray-600" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({registrations.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'submitted'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Submitted ({stats.submitted})
          </button>
          <button
            onClick={() => setFilter('under-review')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'under-review'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Under Review ({stats.underReview})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredRegistrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No registrations found</p>
            <button
              onClick={() => router.push('/registration/create')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Submit First Enquiry
            </button>
          </div>
        ) : (
          filteredRegistrations.map((reg) => (
            <RegistrationCard
              key={reg.id}
              registration={reg}
              onUpdate={handleUpdateClick}
            />
          ))
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedRegistration && (
        <UpdateStatusModal
          registration={selectedRegistration}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedRegistration(null);
          }}
          onSuccess={() => {
            setShowUpdateModal(false);
            setSelectedRegistration(null);
            router.refresh(); // Silent background refresh
            fetchRegistrations(); // Refetch data
          }}
        />
      )}
    </div>
  );
}

function RegistrationCard({ registration, onUpdate }: any) {
  const getStatusBadge = () => {
    const status = registration.registrationStatus;
    
    if (status === 'approved') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
          ✅ Approved
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
          ❌ Rejected
        </span>
      );
    }
    if (status === 'under-review') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
          🔄 Under Review
        </span>
      );
    }
    if (status === 'submitted') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
          📋 Submitted
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300">
        ⏳ Pending
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono font-bold text-blue-600">
                {registration.enquiryId}
              </span>
              {getStatusBadge()}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {registration.customerName || 'N/A'}
            </h3>
            <p className="text-gray-600">
              {registration.phone || 'N/A'} • {registration.capacity || 'N/A'} kW
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          {registration.applicationNumber && (
            <div>
              <p className="text-gray-600 font-medium">Application No</p>
              <p className="font-bold text-gray-900">
                {registration.applicationNumber}
              </p>
            </div>
          )}
          {registration.discomCircle && (
            <div>
              <p className="text-gray-600 font-medium">DISCOM</p>
              <p className="font-bold text-gray-900">
                {registration.discomCircle}
              </p>
            </div>
          )}
          {registration.submittedDate && (
            <div>
              <p className="text-gray-600 font-medium">Submitted</p>
              <p className="font-bold text-gray-900">
                {new Date(registration.submittedDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          )}
          {registration.registrationId && (
            <div>
              <p className="text-gray-600 font-medium">Registration ID</p>
              <p className="font-bold text-green-600">
                {registration.registrationId}
              </p>
            </div>
          )}
        </div>

        {registration.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">
              <strong>Rejection Reason:</strong> {registration.rejectionReason}
            </p>
          </div>
        )}

        {registration.notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Notes:</strong> {registration.notes}
            </p>
          </div>
        )}

        <button
          onClick={() => onUpdate(registration)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Edit size={18} />
          Update Status
        </button>
      </div>
    </div>
  );
}

function UpdateStatusModal({ registration, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    registrationStatus: registration.registrationStatus,
    registrationId: registration.registrationId || '',
    applicationNumber: registration.applicationNumber || '',
    feasibilityApprovalNumber: registration.feasibilityApprovalNumber || '',
    approvedDate: registration.approvedDate || '',
    rejectedDate: registration.rejectedDate || '',
    rejectionReason: registration.rejectionReason || '',
    notes: registration.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/registration/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: registration.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update');
      }

      alert('✅ Status updated successfully!');
      onSuccess(); // This now includes router.refresh() + fetchRegistrations()
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Update Registration Status
        </h2>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Enquiry: <strong>{registration.enquiryId}</strong></p>
          <p className="text-sm text-gray-600">Customer: <strong>{registration.customerName}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.registrationStatus}
              onChange={(e) =>
                setFormData({ ...formData, registrationStatus: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Application Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Number
            </label>
            <input
              type="text"
              value={formData.applicationNumber}
              onChange={(e) =>
                setFormData({ ...formData, applicationNumber: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="APP/PMSG/2026/00001"
            />
          </div>

          {/* If Approved */}
          {formData.registrationStatus === 'approved' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration ID *
                </label>
                <input
                  type="text"
                  value={formData.registrationId}
                  onChange={(e) =>
                    setFormData({ ...formData, registrationId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="CSPDCL/CR/2026/0001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feasibility Approval Number
                </label>
                <input
                  type="text"
                  value={formData.feasibilityApprovalNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      feasibilityApprovalNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="FA/2026/0001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved Date *
                </label>
                <input
                  type="date"
                  value={formData.approvedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, approvedDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}

          {/* If Rejected */}
          {formData.registrationStatus === 'rejected' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejected Date *
                </label>
                <input
                  type="date"
                  value={formData.rejectedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, rejectedDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={formData.rejectionReason}
                  onChange={(e) =>
                    setFormData({ ...formData, rejectionReason: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter reason for rejection"
                  required
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any internal notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
