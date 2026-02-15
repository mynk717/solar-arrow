// src/app/survey/page.tsx - COMPLETE FIXED FILE

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSurveys } from '@/lib/useSurveys';
import type { Survey } from '@/lib/types'; // ✅ IMPORT THE CORRECT TYPE
import {
  ClipboardCheck,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
  Edit,
  Building2,
  Zap,
  User,
  Search,
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function SurveyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { surveys, loading, error } = useSurveys();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'pending' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = session?.user?.email?.includes('admin');

  // Filter surveys
  const filteredSurveys = surveys.filter((survey: Survey) => {
    // Search filter
    const matchesSearch =
      survey.enquiryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.surveyorName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = (() => {
      if (filter === 'all') return true;
      if (filter === 'scheduled') {
        // Scheduled but not yet submitted (no surveyDate)
        return !survey.surveyDate || survey.surveyDate === '';
      }
      if (filter === 'pending') {
        // Submitted but not approved
        return survey.surveyDate && survey.surveyDate !== '' && !survey.surveyApproved;
      }
      if (filter === 'approved') {
        return survey.surveyApproved === true;
      }
      return true;
    })();

    // User filter - surveyors see only their own
    const matchesUser = isAdmin || survey.surveyorEmail === session?.user?.email;

    return matchesSearch && matchesStatus && matchesUser;
  });

  // Calculate stats
  const stats = {
    total: surveys.filter((s: Survey) => isAdmin || s.surveyorEmail === session?.user?.email).length,
    scheduled: surveys.filter((s: Survey) => 
      (!s.surveyDate || s.surveyDate === '') && 
      (isAdmin || s.surveyorEmail === session?.user?.email)
    ).length,
    pending: surveys.filter((s: Survey) => 
      s.surveyDate && s.surveyDate !== '' && !s.surveyApproved &&
      (isAdmin || s.surveyorEmail === session?.user?.email)
    ).length,
    approved: surveys.filter((s: Survey) => 
      s.surveyApproved === true &&
      (isAdmin || s.surveyorEmail === session?.user?.email)
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold">Loading surveys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <DemoBanner />
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mt-4">
          <p className="text-red-900 font-bold">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />

      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4 pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
              <p className="text-sm text-gray-700 mt-0.5 font-medium">{stats.total} total surveys</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => router.push('/survey/schedule')}
                className="bg-blue-600 active:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg active:scale-95 transition-transform"
              >
                <Calendar size={20} />
                <span className="hidden sm:inline">Schedule</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by Enquiry ID or Surveyor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 font-medium"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            <StatCard
              title="All"
              value={stats.total}
              Icon={ClipboardCheck}
              color="blue"
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <StatCard
              title="Scheduled"
              value={stats.scheduled}
              Icon={Clock}
              color="yellow"
              active={filter === 'scheduled'}
              onClick={() => setFilter('scheduled')}
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              Icon={ClipboardCheck}
              color="orange"
              active={filter === 'pending'}
              onClick={() => setFilter('pending')}
            />
            <StatCard
              title="Approved"
              value={stats.approved}
              Icon={CheckCircle}
              color="green"
              active={filter === 'approved'}
              onClick={() => setFilter('approved')}
            />
          </div>
        </div>
      </div>

      {/* Survey Cards */}
      <div className="p-4 pt-6 space-y-3">
        {filteredSurveys.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <ClipboardCheck className="mx-auto h-20 w-20 text-gray-300 mb-4" />
            <p className="text-gray-900 font-bold text-lg mb-2">No surveys found</p>
            <p className="text-gray-600 text-sm mb-6 px-4">
              {filter === 'scheduled' && 'No scheduled surveys assigned to you'}
              {filter === 'pending' && 'No pending surveys found'}
              {filter === 'approved' && 'No approved surveys found'}
              {filter === 'all' && 'No surveys match your search'}
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
        ) : (
          filteredSurveys.map((survey: Survey) => (
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
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, Icon, color, active, onClick }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  };

  return (
    <button
      onClick={onClick}
      className={`${colors[color]} ${
        active ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg' : ''
      } border-2 rounded-xl p-3 min-w-[110px] flex-shrink-0 active:scale-95 transition-all`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-5 w-5" />
        <p className="text-xs font-bold opacity-75">{title}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </button>
  );
}

// Survey Card Component
function SurveyCard({ survey, onView, onSubmit, isAdmin }: any) {
  // Determine status
  const isScheduled = !survey.surveyDate || survey.surveyDate === '';
  const isPending = survey.surveyDate && survey.surveyDate !== '' && !survey.surveyApproved;
  const isApproved = survey.surveyApproved === true;

  const getStatusBadge = () => {
    if (isApproved) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border-2 border-green-300 flex items-center gap-1 whitespace-nowrap">
          <CheckCircle size={14} />
          Approved
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border-2 border-orange-300 flex items-center gap-1 whitespace-nowrap">
          <Clock size={14} />
          Pending
        </span>
      );
    }
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border-2 border-yellow-300 flex items-center gap-1 whitespace-nowrap">
        <Calendar size={14} />
        Scheduled
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden active:shadow-xl transition-all">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-mono font-bold text-blue-600">
                {survey.enquiryId}
              </span>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 mb-2 flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <User size={14} />
                {survey.surveyorName}
              </span>
              {survey.surveyDate && (
                <span className="flex items-center gap-1 font-medium">
                  <Calendar size={14} />
                  {new Date(survey.surveyDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Type</p>
              <p className="text-sm font-bold text-gray-900">
                {survey.projectType || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Load</p>
              <p className="text-sm font-bold text-gray-900">
                {survey.sanctionedLoad || 0} kW
              </p>
            </div>
          </div>
        </div>

        {survey.surveyNotes && (
          <div className="mt-3 p-2 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold">Notes</p>
            <p className="text-sm text-gray-900 line-clamp-2 font-medium">
              {survey.surveyNotes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 bg-gray-100 text-gray-800 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 active:scale-95 transition flex items-center justify-center gap-2 border border-gray-300"
          >
            <Eye size={18} />
            View
          </button>
          
          {/* Show Submit button only for scheduled surveys */}
          {isScheduled && (
            <button
              onClick={onSubmit}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Edit size={18} />
              Submit
            </button>
          )}

          {/* Show Review button for admins on pending surveys */}
          {isAdmin && isPending && (
            <button
              onClick={onView}
              className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle size={18} />
              Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
