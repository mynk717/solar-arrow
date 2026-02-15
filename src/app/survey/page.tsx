// src/app/survey/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSurveys } from '@/lib/useSurveys';
import {
  ClipboardCheck,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Plus,
  MapPin,
  User,
  Zap,
  Building2,
  Eye,
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

interface Survey {
  enquiryId: string;
  surveyDate: string;
  surveyorName: string;
  projectType: string;
  consumerCategory: string;
  installationSurface: string;
  sanctionedLoad: number;
  surveyApproved: boolean;
  surveyNotes: string;
}

export default function SurveyPage() {
  const router = useRouter();
  const { surveys, loading, error } = useSurveys();
  const { data: session } = useSession();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  

  const filteredSurveys = surveys.filter(survey => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !survey.surveyApproved && survey.surveyNotes !== 'Rejected';
    if (filter === 'approved') return survey.surveyApproved;
    if (filter === 'rejected') return !survey.surveyApproved && survey.surveyNotes?.includes('Rejected');
    return true;
  });

  const stats = {
    total: surveys.length,
    pending: surveys.filter(s => !s.surveyApproved && !s.surveyNotes?.includes('Rejected')).length,
    approved: surveys.filter(s => s.surveyApproved).length,
    rejected: surveys.filter(s => !s.surveyApproved && s.surveyNotes?.includes('Rejected')).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading surveys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-semibold">❌ {error}</p>
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
              <p className="text-sm text-gray-600 mt-0.5">{surveys.length} total surveys</p>
            </div>
            <button
              onClick={() => router.push('/survey/schedule')}
              className="bg-blue-600 active:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg active:scale-95 transition-transform"
            >
              <Calendar size={20} />
              <span className="hidden sm:inline">Schedule</span>
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            <StatCard
              title="Total"
              value={stats.total}
              Icon={ClipboardCheck}
              color="blue"
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              Icon={Clock}
              color="yellow"
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
            <StatCard
              title="Rejected"
              value={stats.rejected}
              Icon={XCircle}
              color="red"
              active={filter === 'rejected'}
              onClick={() => setFilter('rejected')}
            />
          </div>
        </div>
      </div>

      {/* Survey Cards */}
      <div className="p-4 pt-6 space-y-3">
        {filteredSurveys.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <ClipboardCheck className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-700 font-semibold mb-2">No surveys found</p>
            <p className="text-gray-500 text-sm mb-6">Schedule a survey to get started</p>
            <button
              onClick={() => router.push('/survey/schedule')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"
            >
              <Calendar size={20} />
              Schedule Survey
            </button>
          </div>
        ) : (
          filteredSurveys.map((survey) => (
            <SurveyCard
              key={survey.enquiryId}
              survey={survey}
              onView={() => router.push(`/survey/${survey.enquiryId}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, Icon, color, active, onClick }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <button
      onClick={onClick}
      className={`${colors[color]} ${
        active ? 'ring-2 ring-offset-2 ring-blue-500' : ''
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

function SurveyCard({ survey, onView }: any) {
  const getStatusBadge = () => {
    if (survey.surveyApproved) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border-2 border-green-300 flex items-center gap-1">
          <CheckCircle size={14} />
          Approved
        </span>
      );
    }
    if (survey.surveyNotes?.includes('Rejected')) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border-2 border-red-300 flex items-center gap-1">
          <XCircle size={14} />
          Rejected
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border-2 border-yellow-300 flex items-center gap-1">
        <Clock size={14} />
        Pending
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden active:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono font-bold text-blue-600">
                {survey.enquiryId}
              </span>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <User size={14} />
                {survey.surveyorName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(survey.surveyDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Type</p>
              <p className="text-sm font-bold text-gray-900">
                {survey.projectType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-gray-500" />
            <div>
              <p className="text-xs text-gray-600">Load</p>
              <p className="text-sm font-bold text-gray-900">
                {survey.sanctionedLoad} kW
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <MapPin size={14} className="text-gray-500" />
          <p className="text-sm text-gray-700">
            {survey.installationSurface} • {survey.consumerCategory}
          </p>
        </div>

        {survey.surveyNotes && (
          <div className="mt-3 p-2 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">Notes</p>
            <p className="text-sm text-gray-900 line-clamp-2">
              {survey.surveyNotes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 bg-white border-t border-gray-100">
        <button
          onClick={onView}
          className="w-full bg-blue-600 active:bg-blue-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Eye size={18} />
          View Details
        </button>
      </div>
    </div>
  );
}
