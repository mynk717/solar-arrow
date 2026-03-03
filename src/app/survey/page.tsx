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
  MapPin,
  User,
  Zap,
  Building2,
  Eye,
  Edit,
  Search,
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

interface Survey {
  enquiryId: string;
  surveyDate: string;
  surveyorName: string;
  surveyorEmail?: string;
  projectType: string;
  consumerCategory: string;
  installationSurface: string;
  sanctionedLoad: number;
  surveyApproved: boolean | string;
  surveyNotes: string;
}

export default function SurveyPage() {
  const router = useRouter();
  const { surveys, loading, error } = useSurveys();
  const { data: session } = useSession();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'submitted' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const isApproved = (s: Survey) => s.surveyApproved === true || s.surveyApproved === 'TRUE';

const isRejected = (s: Survey) =>
  (s.surveyNotes || '').toLowerCase().startsWith('rejected:') ||
  (s.surveyNotes || '').toLowerCase().includes('rejected');


  // ✅ Admin/Owner can schedule surveys
  const canSchedule = ['admin', 'owner'].includes(session?.user?.role || '');
  const isAdminOrOwner = ['admin', 'owner'].includes(session?.user?.role || '');

  const [scheduledEnquiries, setScheduledEnquiries] = useState<any[]>([]);
const [loadingScheduled, setLoadingScheduled] = useState(true);

useEffect(() => {
  fetch('/api/enquiries')
    .then(r => r.json())
    .then(data => {
      setScheduledEnquiries(
        data.filter((e: any) => e.status === 'survey-scheduled')
      );
    })
    .catch(console.error)
    .finally(() => setLoadingScheduled(false));
}, []);


  // ✅ ROLE-BASED FILTERING
  const filteredSurveys = surveys.filter(survey => {
    // Search filter
    const matchesSearch = 
      survey.enquiryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.surveyorName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = (() => {
      if (filter === 'all') return true;
      if (filter === 'scheduled') return true; // scheduled cards are shown in separate section
      if (filter === 'submitted') return !isApproved(survey) && !isRejected(survey);
      if (filter === 'approved') return isApproved(survey);
      if (filter === 'rejected') return isRejected(survey);
      return true;
    })();
    

    // ✅ User filter - Admin/Owner see all, Surveyors see only assigned
    const matchesUser = isAdminOrOwner || survey.surveyorEmail === session?.user?.email;

    return matchesSearch && matchesStatus && matchesUser;
  });

  // ✅ Stats based on user role
  const visibleSurveys = surveys.filter(s => 
    isAdminOrOwner || s.surveyorEmail === session?.user?.email
  );

  const stats = {
    total: scheduledEnquiries.length + visibleSurveys.length,
    scheduled: scheduledEnquiries.filter(e => isAdminOrOwner || e.surveyedBy === session?.user?.email).length,
    submitted: visibleSurveys.filter(s => !isApproved(s) && !isRejected(s)).length,
    approved: visibleSurveys.filter(s => isApproved(s)).length,
rejected: visibleSurveys.filter(s => isRejected(s)).length,
 };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 font-bold">Loading surveys...</p>
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
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="p-4 pt-3">
  <div className="flex items-center justify-between mb-3">
    <div className="min-w-0">
      <h1 className="text-lg font-bold text-gray-900 truncate">Surveys</h1>
      <p className="text-xs text-gray-500 mt-0.5">{stats.total} total surveys</p>
    </div>
            {/* ✅ Only admin/owner can schedule */}
            {canSchedule && (
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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 text-sm bg-gray-50"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          <StatCard title="All" value={stats.total} Icon={ClipboardCheck} color="blue" active={filter === 'all'} onClick={() => setFilter('all')} />
<StatCard title="Scheduled" value={stats.scheduled} Icon={Calendar} color="orange" active={filter === 'scheduled'} onClick={() => setFilter('scheduled')} />
<StatCard title="Submitted" value={stats.submitted} Icon={Clock} color="yellow" active={filter === 'submitted'} onClick={() => setFilter('submitted')} />
<StatCard title="Approved" value={stats.approved} Icon={CheckCircle} color="green" active={filter === 'approved'} onClick={() => setFilter('approved')} />
<StatCard title="Rejected" value={stats.rejected} Icon={XCircle} color="red" active={filter === 'rejected'} onClick={() => setFilter('rejected')} />
          </div>
        </div>
      </div>

{/* Scheduled But Not Yet Submitted */}
{scheduledEnquiries.length > 0 && (filter === 'all' || filter === 'scheduled') && (
  <div className="p-4 pt-4 space-y-3" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
      <Clock size={18} className="text-orange-500" />
      Awaiting Survey Visit ({scheduledEnquiries.length})
    </h2>
    {scheduledEnquiries
      .filter(e =>
        isAdminOrOwner || e.surveyedBy === session?.user?.email
      )
      .map((enq) => (
        <div key={enq.id} className="bg-white rounded-2xl border-2 border-orange-200 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-sm font-mono font-bold text-blue-600">{enq.id}</span>
                <p className="font-bold text-gray-900 mt-0.5">{enq.customerName}</p>
                <p className="text-sm text-gray-600">{enq.phone}</p>
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-300 whitespace-nowrap">
                📅 Scheduled
              </span>
            </div>
            <div className="text-sm text-gray-700 space-y-1 mt-2">
              <p className="flex items-center gap-2">
                <MapPin size={14} />
                {enq.area} — {enq.address}
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={14} />
                {enq.surveyScheduledDate
                  ? new Date(enq.surveyScheduledDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Date not set'}
              </p>
              <p className="flex items-center gap-2">
                <User size={14} />
                Surveyor: <strong>{enq.surveyedBy || '—'}</strong>
              </p>
            </div>
          </div>
          {/* Action — only assigned surveyor or admin can submit */}
          {(isAdminOrOwner || enq.surveyedBy === session?.user?.email) && (
            <div className="px-4 pb-4">
              <button
                onClick={() => router.push(`/survey/submit/${enq.id}`)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-md"
              >
                <Edit size={16} />
                Submit Survey Report
              </button>
            </div>
          )}
        </div>
      ))}
  </div>
)}

      {/* Survey Cards */}
      {filter !== 'scheduled' && (
        <div className="p-4 pt-4 space-y-3" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        {filteredSurveys.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <ClipboardCheck className="mx-auto h-20 w-20 text-gray-300 mb-4" />
            <p className="text-gray-900 font-bold text-lg mb-2">No surveys found</p>
            <p className="text-gray-700 text-sm mb-6 px-4 font-medium">
            {filter === 'approved' && 'No approved surveys found'}
{filter === 'rejected' && 'No rejected surveys found'}
{filter === 'submitted' && 'No surveys pending review'}
{filter === 'all' && searchTerm && 'No surveys match your search'}
{filter === 'all' && !searchTerm && (
  isAdminOrOwner ? 'No surveys available' : 'No surveys assigned to you'
)}

            </p>
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
      )}
    </div>
  );
}


function StatCard({ title, value, Icon, color, active, onClick }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800', 
  };

  return (
    <button
      onClick={onClick}
      className={`${colors[color]} ${
        active ? 'ring-2 ring-offset-1 ring-blue-500 shadow' : ''
      } border rounded-xl px-3 py-2 min-w-[80px] flex-shrink-0 active:scale-95 transition-all`}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon className="h-3.5 w-3.5" />
          <p className="text-xs font-semibold opacity-90">{title}</p>
        </div>
        <p className="text-lg font-bold">{value}</p>      
    </button>
  );
}

function SurveyCard({ survey, onView }: any) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // ✅ Check permissions
  const isAdminOrOwner = ['admin', 'owner'].includes(session?.user?.role || '');
  const isSurveyor = survey.surveyorEmail === session?.user?.email;
  
  // ✅ Can submit if: not approved, not rejected, and is assigned surveyor
  const approved = survey.surveyApproved === true || survey.surveyApproved === 'TRUE';
  const rejected = (survey.surveyNotes || '').toLowerCase().startsWith('rejected:') ||
                   (survey.surveyNotes || '').toLowerCase().includes('rejected');
  const canSubmit = !approved && !rejected && isSurveyor;
  
  const getStatusBadge = () => {
    if (approved) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border-2 border-green-300 flex items-center gap-1 whitespace-nowrap">
          <CheckCircle size={14} />
          Approved
        </span>
      );
    }
    if (rejected) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border-2 border-red-300 flex items-center gap-1 whitespace-nowrap">
          <XCircle size={14} />
          Rejected
        </span>
      );
    }
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border-2 border-orange-300 flex items-center gap-1 whitespace-nowrap">
        <Clock size={14} />
        Pending Review
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
              <span className="flex items-center gap-1 font-bold">
                <User size={14} />
                {survey.surveyorName}
              </span>
              {survey.surveyDate && (
                <span className="flex items-center gap-1 font-bold">
                  <Calendar size={14} />
                  {new Date(survey.surveyDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 bg-gray-50">
      <div className="grid grid-cols-2 gap-2 mb-3">
  <div className="flex items-center gap-2 min-w-0">
    <Building2 size={14} className="text-gray-400 flex-shrink-0" />
    <div className="min-w-0">
              <p className="text-xs text-gray-600 font-bold">Type</p>
              <p className="text-sm font-bold text-gray-900">
                {survey.projectType}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
    <Zap size={14} className="text-gray-400 flex-shrink-0" />
    <div className="min-w-0">
              <p className="text-xs text-gray-600 font-bold">Load</p>
              <p className="text-sm font-bold text-gray-900">
                {survey.sanctionedLoad} kW
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <MapPin size={14} className="text-gray-500" />
          <p className="text-sm text-gray-800 font-bold">
            {survey.installationSurface} • {survey.consumerCategory}
          </p>
        </div>

        {survey.surveyNotes && (
          <div className="p-2 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 font-bold">Notes</p>
            <p className="text-sm text-gray-900 line-clamp-2 font-medium">
              {survey.surveyNotes}
            </p>
          </div>
        )}
      </div>

      {/* ✅ FIXED Actions - View + Submit buttons */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 bg-gray-100 text-gray-800 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 active:scale-95 transition flex items-center justify-center gap-2 border border-gray-300"
          >
            <Eye size={18} />
            View
          </button>
          
          {/* ✅ Submit Button - Only for assigned surveyor on pending surveys */}
          {canSubmit && (
            <button
              onClick={() => router.push(`/survey/submit/${survey.enquiryId}`)}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Edit size={18} />
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


