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
  Plus,
  Filter,
  Eye,
} from 'lucide-react';

export default function RegistrationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === 'all') return true;
    return reg.registrationStatus === filter;
  });

  const stats = {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          DISCOM Registration Management
        </h1>
        <p className="text-gray-600 mt-2">
          Track registration submissions and approvals from electricity board
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          </div>
        ) : (
          filteredRegistrations.map((reg) => (
            <RegistrationCard key={reg.id} registration={reg} />
          ))
        )}
      </div>
    </div>
  );
}

function RegistrationCard({ registration }: any) {
  const router = useRouter();

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
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
        📋 Submitted
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
              {registration.customerName}
            </h3>
            <p className="text-gray-600">
              {registration.phone} • {registration.capacity} kW
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Application No</p>
            <p className="font-bold text-gray-900">
              {registration.applicationNumber || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">DISCOM</p>
            <p className="font-bold text-gray-900">
              {registration.discomCircle || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Submitted</p>
            <p className="font-bold text-gray-900">
              {registration.submittedDate
                ? new Date(registration.submittedDate).toLocaleDateString('en-IN')
                : 'N/A'}
            </p>
          </div>
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

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/registration/${registration.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            View Details
          </button>
          
          {['submitted', 'under-review'].includes(registration.registrationStatus) && (
            <button
              onClick={() => router.push(`/registration/update/${registration.id}`)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
            >
              Update Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
