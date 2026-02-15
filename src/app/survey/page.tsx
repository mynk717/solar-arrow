// src/app/survey/page.tsx - COMPLETE FILE

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
  Filter,
  Edit,
  Eye,
  Building2,
  Zap,
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
        console.log('📊 Surveys fetched:', data.surveys.length);
        setSurveys(data.surveys || []);
      } else {
        console.error('❌ Failed to fetch surveys');
        setSurveys([]);
      }
    } catch (error) {
      console.error('❌ Error fetching surveys:', error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = session?.user?.email?.includes('admin');

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.enquiryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.surveyorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.surveyorEmail?.toLowerCase().includes(searchTerm.toLowerCase());

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

  // Calculate counts for each filter
  const allCount = surveys.filter(s => isAdmin || s.surveyorEmail === session?.user?.email).length;
  const scheduledCount = surveys.filter(s => 
    (!s.surveyDate || s.surveyDate === '') && 
    (isAdmin || s.surveyorEmail === session?.user?.email)
  ).length;
  const pendingCount = surveys.filter(s => 
    s.surveyDate && s.surveyDate !== '' && s.surveyApproved === 'FALSE' &&
    (isAdmin || s.surveyorEmail === session?.user?.email)
  ).length;
  const approvedCount = surveys.filter(s => 
    s.surveyApproved === 'TRUE' &&
    (isAdmin || s.surveyorEmail === session?.user?.email)
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-24">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-20 bg-white shadow-md border-b border-gray-200">
        <div className="p-4">
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
            {isAdmin && (
              <button
                onClick={() => router.push('/survey/schedule')}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition shadow-md"
              >
                <Calendar size={18} />
                Schedule
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by Enquiry ID or Surveyor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <FilterButton
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              label="All"
              count={allCount}
              color="blue"
            />
            <FilterButton
              active={statusFilter === 'scheduled'}
              onClick={() => setStatusFilter('scheduled')}
              label="Scheduled"
              count={scheduledCount}
              color="yellow"
            />
            <FilterButton
              active={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
              label="Pending"
              count={pendingCount}
              color="orange"
            />
            <FilterButton
              active={statusFilter === 'approved'}
              onClick={() => setStatusFilter('approved')}
              label="Approved"
              count={approvedCount}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Survey Cards */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading surveys...</p>
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <ClipboardCheck className="mx-auto h-20 w-20 text-gray-300 mb-4" />
            <p className="text-gray-900 font-bold text-lg mb-2">No Surveys Yet</p>
            <p className="text-gray-600 text-sm mb-6 px-4">
              {isAdmin 
                ? 'Schedule a survey to get started with site assessments'
                : 'No surveys assigned to you yet'}
            </p>
            {isAdmin && (
              <button
                onClick={() => router.push('/survey/schedule')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition shadow-lg"
              >
                <Calendar size={20} />
                Schedule Survey
              </button>
            )}
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Filter className="mx-auto h-20 w-20 text-gray-300 mb-4" />
            <p className="text-gray-900 font-bold text-lg mb-2">No Results Found</p>
            <p className="text-gray-600 text-sm mb-4 px-4">
              {statusFilter === 'scheduled' && 'No scheduled surveys found'}
              {statusFilter === 'pending' && 'No pending surveys found'}
              {statusFilter === 'approved' && 'No approved surveys found'}
              {statusFilter === 'all' && 'No surveys match your search'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Clear Filters
            </button>
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

      {/* Floating Action Button - Only for admins on mobile */}
      {isAdmin && surveys.length > 0 && (
        <button
          onClick={() => router.push('/survey/schedule')}
          className="fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 active:scale-95 transition z-30 md:hidden"
        >
          <Calendar size={28} />
        </button>
      )}
    </div>
  );
}

// Filter Button Component - Mobile First
function FilterButton({ active, onClick, label, count, color = 'blue' }: any) {
  const colorClasses = {
    blue: {
      active: 'bg-blue-600 text-white shadow-lg',
      inactive: 'bg-white text-gray-800 border-2 border-gray-300'
    },
    yellow: {
      active: 'bg-yellow-500 text-white shadow-lg',
      inactive: 'bg-white text-gray-800 border-2 border-gray-300'
    },
    orange: {
      active: 'bg-orange-500 text-white shadow-lg',
      inactive: 'bg-white text-gray-800 border-2 border-gray-300'
    },
    green: {
      active: 'bg-green-600 text-white shadow-lg',
      inactive: 'bg-white text-gray-800 border-2 border-gray-300'
    },
  };

  const classes = active 
    ? colorClasses[color as keyof typeof colorClasses].active 
    : colorClasses[color as keyof typeof colorClasses].inactive;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all active:scale-95 ${classes}`}
    >
      {label}
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${active ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'}`}>
        {count}
      </span>
    </button>
  );
}

// Survey Card Component - Mobile First
function SurveyCard({ survey, onView, onSubmit, isAdmin }: any) {
  // Determine status
  const isScheduled = !survey.surveyDate || survey.surveyDate === '';
  const isPending = survey.surveyDate && survey.surveyDate !== '' && survey.surveyApproved === 'FALSE';
  const isApproved = survey.surveyApproved === 'TRUE';

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 hover:shadow-xl transition-all active:scale-[0.98]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1">{survey.enquiryId}</h3>
          <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
            <Building2 size={14} />
            {survey.surveyorName || 'Unknown Surveyor'}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
            isApproved
              ? 'bg-green-100 text-green-800 border border-green-200'
              : isPending
              ? 'bg-orange-100 text-orange-800 border border-orange-200'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}
        >
          {isApproved ? '✅ Approved' : isPending ? '⏳ Pending' : '📅 Scheduled'}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1 font-semibold">Project Type</p>
          <p className="font-bold text-gray-900 text-sm">{survey.projectType || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1 font-semibold flex items-center gap-1">
            <Zap size={12} />
            Capacity
          </p>
          <p className="font-bold text-gray-900 text-sm">{survey.sanctionedLoadKw || 0} kW</p>
        </div>
      </div>

      {/* Survey Date if exists */}
      {survey.surveyDate && (
        <div className="mb-3 text-xs text-gray-600 font-medium">
          📅 Surveyed: {new Date(survey.surveyDate).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 active:scale-95 transition flex items-center justify-center gap-2 border border-gray-300"
        >
          <Eye size={18} />
          View
        </button>
        
        {/* Show Submit button only for scheduled surveys */}
        {isScheduled && (
          <button
            onClick={onSubmit}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Edit size={18} />
            Submit
          </button>
        )}

        {/* Show Review button for admins on pending surveys */}
        {isAdmin && isPending && (
          <button
            onClick={onView}
            className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle size={18} />
            Review
          </button>
        )}
      </div>
    </div>
  );
}
