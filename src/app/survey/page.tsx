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
  customerName?: string;
  updatedAt?: string;
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
      survey.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.surveyDate || 0).getTime();
    const dateB = new Date(b.updatedAt || b.surveyDate || 0).getTime();
    return dateB - dateA;
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <DemoBanner />

      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm w-full"
  style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="p-4 pt-3 w-full min-w-0">
  <div className="flex items-center justify-between mb-3">
    <div className="min-w-0">
      <h1 className="text-lg font-bold text-gray-900 truncate">Surveys</h1>
      <p className="text-xs text-gray-500 mt-0.5">{stats.total} total surveys</p>
    </div>
            {/* ✅ Only admin/owner can schedule */}
            {canSchedule && (
              <button
                onClick={() => router.push('/survey/schedule')}
                className="bg-blue-600 active:bg-blue-700 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold text-sm shadow active:scale-95 transition-transform flex-shrink-0"
>
  <Calendar size={16} />
  <span>Schedule</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-3 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by customer, enquiry ID or surveyor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 text-sm bg-gray-50"
              style={{ fontSize: '16px' }}
            />
          </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 pb-1">
            {[
              { key: 'all',       label: 'All',       value: stats.total,     color: 'bg-blue-50 text-blue-700 border-blue-200'   },
              { key: 'scheduled', label: 'Scheduled', value: stats.scheduled, color: 'bg-orange-50 text-orange-700 border-orange-200' },
              { key: 'submitted', label: 'Pending',   value: stats.submitted, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
              { key: 'approved',  label: 'Approved',  value: stats.approved,  color: 'bg-green-50 text-green-700 border-green-200'  },
              { key: 'rejected',  label: 'Rejected',  value: stats.rejected,  color: 'bg-red-50 text-red-700 border-red-200'    },
            ].map(({ key, label, value, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`${color} ${filter === key ? 'ring-2 ring-blue-500 ring-offset-1 font-bold' : 'font-semibold'} border rounded-full px-3 py-1 text-xs flex items-center gap-1 active:scale-95 transition-all`}
              >
                {label} <span className="font-bold">{value}</span>
              </button>
            ))}
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
          <div className="flex items-start justify-between gap-2 mb-2">
  <div className="min-w-0 flex-1">
    <span className="text-xs font-mono font-bold text-blue-600">{enq.id}</span>
    <p className="font-bold text-gray-900 text-sm truncate">{enq.customerName}</p>
    <p className="text-xs text-gray-500">{enq.phone}</p>
  </div>
  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full border border-orange-200 whitespace-nowrap flex-shrink-0">
    Scheduled
  </span>
</div>
<div className="text-xs text-gray-600 space-y-1 mt-2">
  <p className="flex items-center gap-1.5 min-w-0">
    <MapPin size={12} className="flex-shrink-0" />
    <span className="truncate">{enq.area}{enq.address ? ` — ${enq.address}` : ''}</span>
  </p>
  <p className="flex items-center gap-1.5 min-w-0">
    <Calendar size={12} className="flex-shrink-0" />
    <span className="truncate">{enq.surveyScheduledDate
      ? new Date(enq.surveyScheduledDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Date not set'}</span>
  </p>
  <p className="flex items-center gap-1.5 min-w-0">
    <User size={12} className="flex-shrink-0" />
    <span className="truncate">Surveyor: <strong>{enq.surveyedBy || '—'}</strong></span>
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
{sortedSurveys.length === 0 ? (
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
          sortedSurveys.map((survey) => (
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
      } border rounded-xl px-3 py-2 min-w-[72px] flex-shrink-0 active:scale-95 transition-all`}
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
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 flex items-center gap-1 whitespace-nowrap">
          <CheckCircle size={14} />
          Approved
        </span>
      );
    }
    if (rejected) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 whitespace-nowrap">
          <XCircle size={14} />
          Rejected
        </span>
      );
    }
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1 whitespace-nowrap">
        <Clock size={14} />
        Pending Review
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden active:shadow-xl transition-all">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <span className="text-sm font-mono font-bold text-blue-600 truncate block">
              {survey.enquiryId}
            </span>
            {survey.customerName && (
              <p className="font-bold text-gray-900 text-sm truncate">{survey.customerName}</p>
            )}
          </div>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap mt-1">
          <span className="flex items-center gap-1 font-semibold">
            <User size={12} />
            {survey.surveyorName}
          </span>
          {survey.surveyDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(survey.surveyDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 bg-gray-50">
      <div className="grid grid-cols-2 gap-2 mb-3">
  <div className="flex items-center gap-2 min-w-0">
    <Building2 size={14} className="text-gray-400 flex-shrink-0" />
    <div className="min-w-0">
    <p className="text-xs text-gray-600 font-bold">Type</p>
<p className="text-sm font-bold text-gray-900 truncate">
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

        <div className="flex items-center gap-2 mb-3 min-w-0">
  <MapPin size={14} className="text-gray-500 flex-shrink-0" />
  <p className="text-sm text-gray-800 font-bold truncate">
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


