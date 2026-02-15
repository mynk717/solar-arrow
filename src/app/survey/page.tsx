// src/app/survey/page.tsx - COMPLETE UPDATED VERSION

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Search,
  Calendar,
  ClipboardCheck,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Edit,
} from 'lucide-react';

export default function SurveyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const res = await fetch('/api/survey/list');
      if (res.ok) {
        const data = await res.json();
        setSurveys(data.surveys);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = session?.user?.email?.includes('admin');

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.enquiryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.surveyorName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = (() => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'scheduled') {
        // Scheduled but not yet submitted
        return !survey.surveyDate || survey.surveyDate === '';
      }
      if (statusFilter === 'pending') {
        // Submitted but not approved
        return survey.surveyDate && survey.surveyDate !== '' && survey.surveyApproved === 'FALSE';
      }
      if (statusFilter === 'approved') {
        return survey.surveyApproved === 'TRUE';
      }
      return true;
    })();

    // User filter - surveyors only see their own, admins see all
    const matchesUser = isAdmin || survey.surveyorEmail === session?.user?.email;

    return matchesSearch && matchesStatus && matchesUser;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Surveys</h1>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Enquiry ID or Surveyor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <FilterButton
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              icon={<Filter size={16} />}
              label="All"
              count={surveys.filter(s => isAdmin || s.surveyorEmail === session?.user?.email).length}
            />
            <FilterButton
              active={statusFilter === 'scheduled'}
              onClick={() => setStatusFilter('scheduled')}
              icon={<Clock size={16} />}
              label="Scheduled"
              count={surveys.filter(s => 
                (!s.surveyDate || s.surveyDate === '') && 
                (isAdmin || s.surveyorEmail === session?.user?.email)
              ).length}
              color="yellow"
            />
            <FilterButton
              active={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
              icon={<ClipboardCheck size={16} />}
              label="Pending"
              count={surveys.filter(s => 
                s.surveyDate && s.surveyDate !== '' && s.surveyApproved === 'FALSE' &&
                (isAdmin || s.surveyorEmail === session?.user?.email)
              ).length}
              color="orange"
            />
            <FilterButton
              active={statusFilter === 'approved'}
              onClick={() => setStatusFilter('approved')}
              icon={<CheckCircle size={16} />}
              label="Approved"
              count={surveys.filter(s => 
                s.surveyApproved === 'TRUE' &&
                (isAdmin || s.surveyorEmail === session?.user?.email)
              ).length}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Survey Cards - ADDED PADDING TOP */}
      <div className="p-4 pt-6 space-y-3">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <ClipboardCheck className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-700 font-semibold mb-2">No surveys found</p>
            <p className="text-gray-500 text-sm mb-6">
              {statusFilter === 'scheduled' 
                ? 'No scheduled surveys assigned to you'
                : 'No surveys match your filters'}
            </p>
            {isAdmin && (
              <button
                onClick={() => router.push('/survey/schedule')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <Calendar size={20} />
                Schedule Survey
              </button>
            )}
          </div>
        ) : (
          filteredSurveys.map((survey) => (
            <SurveyCard
              key={survey.enquiryId}
              survey={survey}
              onView={() => router.push(`/survey/${survey.enquiryId}`)}
              onSubmit={() => router.push(`/survey/submit/${survey.enquiryId}`)}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>

      {/* Floating Action Button - Only for admins */}
      {isAdmin && (
        <button
          onClick={() => router.push('/survey/schedule')}
          className="fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <Calendar size={24} />
        </button>
      )}
    </div>
  );
}

// Filter Button Component
function FilterButton({ active, onClick, icon, label, count, color = 'blue' }: any) {
  const colors = {
    blue: active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700',
    yellow: active ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700',
    orange: active ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700',
    green: active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${colors[color as keyof typeof colors]}`}
    >
      {icon}
      {label}
      <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white/20' : 'bg-gray-200'}`}>
        {count}
      </span>
    </button>
  );
}

// Survey Card Component
function SurveyCard({ survey, onView, onSubmit, isAdmin }: any) {
  // Determine status
  const isScheduled = !survey.surveyDate || survey.surveyDate === '';
  const isPending = survey.surveyDate && survey.surveyDate !== '' && survey.surveyApproved === 'FALSE';
  const isApproved = survey.surveyApproved === 'TRUE';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{survey.enquiryId}</h3>
          <p className="text-sm text-gray-600">{survey.surveyorName}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isApproved
              ? 'bg-green-100 text-green-700'
              : isPending
              ? 'bg-orange-100 text-orange-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {isApproved ? '✅ Approved' : isPending ? '⏳ Pending Review' : '📅 Scheduled'}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-gray-600 text-xs">Project Type</p>
          <p className="font-semibold text-gray-900">{survey.projectType || 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-600 text-xs">Capacity</p>
          <p className="font-semibold text-gray-900">{survey.sanctionedLoadKw || 0} kW</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          View Details
        </button>
        
        {/* Show Submit button only for scheduled surveys */}
        {isScheduled && (
          <button
            onClick={onSubmit}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Edit size={18} />
            Submit Survey
          </button>
        )}

        {/* Show Approve button for admins on pending surveys */}
        {isAdmin && isPending && (
          <button
            onClick={onView}
            className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition"
          >
            Review
          </button>
        )}
      </div>
    </div>
  );
}
