// src/app/survey/page.tsx - FIXED DATE HANDLING
'use client';

import { useState } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Search, 
  ClipboardCheck,
  Eye,
  Download,
  User,
  MapPin,
  Phone,
  Upload,
  FileText
} from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import StatusBadge from '@/components/StatusBadge';

const surveyTeamMembers = [
  'Amit Sharma',
  'Rahul Patel',
  'Priya Singh',
  'Vikram Verma'
];

// Helper function to safely format dates
function formatDate(date: any): string {
  if (!date) return 'N/A';
  if (date instanceof Date) return date.toLocaleDateString();
  if (typeof date === 'string') return new Date(date).toLocaleDateString();
  return 'N/A';
}

export default function SurveyPage() {
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'scheduled' | 'completed'>('all');

  return (
    <PageWrapper
      title="Survey Management"
      filterFn={(enquiries) => {
        return enquiries.filter((e: any) => {
          const isNewLead = e.status === 'new' || e.status === 'lead' || e.status === 'prospect';
          const hasSurveyData = e.surveyScheduledDate || e.surveyCompletedDate || e.surveyApproved !== undefined;
          const isSurveyStatus = e.status === 'survey-pending' || e.status === 'survey-scheduled' || e.status === 'survey-completed';

          return isNewLead || hasSurveyData || isSurveyStatus;
        });
      }}
    >
      {({ enquiries, loading, error, isDemoMode }) => {
        if (loading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading survey data...</p>
              </div>
            </div>
          );
        }

        if (error) {
          return (
            <div className="p-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          );
        }

        const pendingSurveys = enquiries.filter((e: any) => 
          !e.surveyScheduledDate && !e.surveyCompletedDate
        );

        const scheduledSurveys = enquiries.filter((e: any) => 
          e.surveyScheduledDate && !e.surveyCompletedDate
        );

        const completedSurveys = enquiries.filter((e: any) => 
          e.surveyCompletedDate || e.surveyApproved !== undefined
        );

        let filteredEnquiries = enquiries;
        if (statusFilter === 'pending') filteredEnquiries = pendingSurveys;
        if (statusFilter === 'scheduled') filteredEnquiries = scheduledSurveys;
        if (statusFilter === 'completed') filteredEnquiries = completedSurveys;

        if (searchTerm) {
          filteredEnquiries = filteredEnquiries.filter((e: any) =>
            e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.area?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        return (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Survey Management {isDemoMode && <span className="text-blue-600">(Demo)</span>}
              </h1>
              <p className="text-gray-600 mt-2">
                {isDemoMode 
                  ? 'Viewing sample survey data - Sign in to manage real surveys'
                  : 'Schedule and manage site surveys for solar installations'}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard 
                title="Pending" 
                value={pendingSurveys.length} 
                icon={Calendar} 
                color="bg-yellow-500"
                isDemoMode={isDemoMode}
              />
              <StatCard 
                title="Scheduled" 
                value={scheduledSurveys.length} 
                icon={ClipboardCheck} 
                color="bg-blue-500"
                isDemoMode={isDemoMode}
              />
              <StatCard 
                title="Completed" 
                value={completedSurveys.length} 
                icon={CheckCircle} 
                color="bg-green-500"
                isDemoMode={isDemoMode}
              />
              <StatCard 
                title="Team Members" 
                value={surveyTeamMembers.length} 
                icon={User} 
                color="bg-purple-500"
                isDemoMode={isDemoMode}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-gray-900 font-medium"
                  style={{ color: '#111827', fontWeight: 600 }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all" style={{ color: '#111827', fontWeight: 600 }}>All Surveys</option>
                  <option value="pending" style={{ color: '#111827', fontWeight: 600 }}>Pending</option>
                  <option value="scheduled" style={{ color: '#111827', fontWeight: 600 }}>Scheduled</option>
                  <option value="completed" style={{ color: '#111827', fontWeight: 600 }}>Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredEnquiries.map((enquiry: any) => (
                <SurveyCard
                  key={enquiry.id}
                  enquiry={enquiry}
                  onSchedule={async (id: string, date: Date, assignee: string) => {
                    if (isDemoMode) {
                      alert('Demo mode - cannot schedule');
                      return;
                    }
                    try {
                      const response = await fetch('/api/survey/schedule', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          enquiryId: id,
                          surveyScheduledDate: date.toISOString(),
                          surveyedBy: assignee,
                        }),
                      });
                      if (!response.ok) throw new Error();
                      alert('✅ Survey scheduled successfully!');
                      window.location.reload();
                    } catch {
                      alert('❌ Failed to schedule');
                    }
                  }}
                  onComplete={() => {
                    setSelectedEnquiry(enquiry);
                    setShowSurveyForm(true);
                  }}
                  onViewDetails={() => setSelectedEnquiry(enquiry)}
                  onDownloadPDF={(id: string) => {
                    if (isDemoMode) {
                      alert('Demo mode - PDF not available');
                      return;
                    }
                    window.open(`/api/survey/${id}/pdf`, '_blank');
                  }}
                  isDemoMode={isDemoMode}
                />
              ))}
            </div>

            {filteredEnquiries.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <ClipboardCheck className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 font-medium">No surveys found</p>
                <p className="text-sm text-gray-500 mt-2">
                  {isDemoMode 
                    ? 'Connect your sheet to see real survey data' 
                    : 'No surveys match your current filter'}
                </p>
              </div>
            )}

            {showSurveyForm && selectedEnquiry && (
              <SurveyFormModal
                enquiry={selectedEnquiry}
                onClose={() => {
                  setShowSurveyForm(false);
                  setSelectedEnquiry(null);
                }}
                onSubmit={async (data: any) => {
                  if (isDemoMode) {
                    alert('Demo mode - cannot submit');
                    return;
                  }
                  try {
                    const response = await fetch('/api/survey/complete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        enquiryId: selectedEnquiry.id,
                        ...data,
                        surveyCompletedDate: new Date().toISOString(),
                      }),
                    });
                    if (!response.ok) throw new Error();
                    alert('✅ Survey submitted successfully!');
                    setShowSurveyForm(false);
                    window.location.reload();
                  } catch {
                    alert('❌ Failed to submit');
                  }
                }}
                isDemoMode={isDemoMode}
              />
            )}

            {selectedEnquiry && !showSurveyForm && (
              <DetailsModal
                enquiry={selectedEnquiry}
                onClose={() => setSelectedEnquiry(null)}
              />
            )}
          </div>
        );
      }}
    </PageWrapper>
  );
}

function StatCard({ title, value, icon: Icon, color, isDemoMode }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 relative">
      {isDemoMode && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
          Demo
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function SurveyCard({ enquiry, onSchedule, onComplete, onViewDetails, onDownloadPDF, isDemoMode }: any) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [surveyDate, setSurveyDate] = useState('');
  const [assignee, setAssignee] = useState(surveyTeamMembers[0]);

  const isPending = !enquiry.surveyScheduledDate && !enquiry.surveyCompletedDate;
  const isScheduled = enquiry.surveyScheduledDate && !enquiry.surveyCompletedDate;
  const isCompleted = enquiry.surveyCompletedDate || enquiry.surveyApproved !== undefined;

  return (
    <div className={`border-2 rounded-lg p-6 ${
      isCompleted ? 'border-green-200 bg-green-50' :
      isScheduled ? 'border-blue-200 bg-blue-50' :
      'border-yellow-200 bg-yellow-50'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
            <MapPin size={14} /> {enquiry.area || 'N/A'} • {enquiry.capacity} kW
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
            <Phone size={14} /> {enquiry.phone}
          </p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      {isPending && !isScheduling && (
        <button
          onClick={() => setIsScheduling(true)}
          disabled={isDemoMode}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 font-medium"
        >
          <Calendar size={16} /> Schedule Survey
        </button>
      )}

      {isScheduling && (
        <div className="bg-white p-4 rounded-lg space-y-3 border-2 border-blue-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Survey Date *</label>
              <input
                type="date"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
                min={new Date().toISOString().split('T')[0]}
                value={surveyDate}
                onChange={(e) => setSurveyDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Assign To *</label>
              <select
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                {surveyTeamMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!surveyDate) {
                  alert('⚠️ Please select a survey date');
                  return;
                }
                onSchedule(enquiry.id, new Date(surveyDate), assignee);
                setIsScheduling(false);
                setSurveyDate('');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold"
            >
              ✓ Confirm Schedule
            </button>
            <button
              onClick={() => {
                setIsScheduling(false);
                setSurveyDate('');
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isScheduled && (
        <div>
          <div className="bg-white p-4 rounded-lg mb-3 border-2 border-blue-300">
            <p className="text-sm text-gray-700"><strong>Scheduled:</strong> {formatDate(enquiry.surveyScheduledDate)}</p>
            <p className="text-sm text-gray-700"><strong>Assigned To:</strong> {enquiry.surveyedBy}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onComplete}
              disabled={isDemoMode}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 font-bold"
            >
              <FileText size={16} /> Submit Survey Report
            </button>
            <button
              onClick={onViewDetails}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 font-bold"
            >
              <Eye size={16} /> View Details
            </button>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="bg-white p-4 rounded-lg border-2 border-green-300">
          <div className="flex items-start gap-3 mb-3">
            {enquiry.surveyApproved ? (
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
            ) : (
              <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            )}
            <div className="flex-1">
              <p className={`font-bold text-lg ${enquiry.surveyApproved ? 'text-green-700' : 'text-red-700'}`}>
                {enquiry.surveyApproved ? '✓ Site Approved' : '✗ Site Rejected'}
              </p>
              <p className="text-sm text-gray-700 mt-1"><strong>Surveyed by:</strong> {enquiry.surveyedBy}</p>
              {enquiry.roofType && (
                <p className="text-sm text-gray-700"><strong>Roof Type:</strong> {enquiry.roofType}</p>
              )}
              {enquiry.roofArea && (
                <p className="text-sm text-gray-700"><strong>Roof Area:</strong> {enquiry.roofArea} sq ft</p>
              )}
              {enquiry.surveyNotes && (
                <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">{enquiry.surveyNotes}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onViewDetails}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-bold"
            >
              <Eye size={16} /> View Full Details
            </button>
            <button
              onClick={() => onDownloadPDF(enquiry.id)}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 font-bold"
              title="Download PDF"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SurveyFormModal({ enquiry, onClose, onSubmit, isDemoMode }: any) {
  const [surveyApproved, setSurveyApproved] = useState(true);
  const [surveyNotes, setSurveyNotes] = useState('');
  const [roofType, setRoofType] = useState('');
  const [roofArea, setRoofArea] = useState('');
  const [surveyedBy, setSurveyedBy] = useState(surveyTeamMembers[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!surveyNotes.trim()) {
      alert('⚠️ Please enter survey notes');
      return;
    }

    setSubmitting(true);
    await onSubmit({
      surveyApproved,
      surveyNotes,
      surveyedBy,
      roofType: roofType || undefined,
      roofArea: roofArea ? parseFloat(roofArea) : undefined,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto shadow-2xl">
        <div className="p-6 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">📋 Submit Survey Report</h2>
          <p className="text-sm text-gray-600 mt-1">{enquiry.customerName} • {enquiry.id} • {enquiry.area} • {enquiry.capacity} kW</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">Customer Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Phone:</strong> {enquiry.phone}</p>
              <p><strong>Email:</strong> {enquiry.email || 'N/A'}</p>
              <p className="col-span-2"><strong>Address:</strong> {enquiry.address}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">Survey Result *</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={surveyApproved}
                  onChange={() => setSurveyApproved(true)}
                  className="mr-2 w-5 h-5"
                />
                <span className="text-green-700 font-bold flex items-center gap-2">
                  <CheckCircle size={20} /> Approve Site
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={!surveyApproved}
                  onChange={() => setSurveyApproved(false)}
                  className="mr-2 w-5 h-5"
                />
                <span className="text-red-700 font-bold flex items-center gap-2">
                  <XCircle size={20} /> Reject Site
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Surveyed By *</label>
            <select
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
              value={surveyedBy}
              onChange={(e) => setSurveyedBy(e.target.value)}
            >
              {surveyTeamMembers.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Roof Type</label>
              <select
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
                value={roofType}
                onChange={(e) => setRoofType(e.target.value)}
              >
                <option value="">Select type</option>
                <option value="RCC">RCC</option>
                <option value="Metal Sheet">Metal Sheet</option>
                <option value="Asbestos">Asbestos</option>
                <option value="Tile">Tile</option>
                <option value="Shed">Shed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Roof Area (sq ft)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
                placeholder="Enter area"
                value={roofArea}
                onChange={(e) => setRoofArea(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Survey Notes *</label>
            <textarea
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
              rows={5}
              placeholder="Enter detailed survey observations:
• Roof condition and structural integrity
• Shading analysis and sun exposure
• Accessibility for installation team
• Electrical infrastructure status
• Safety considerations
• Recommended panel placement
• Any obstacles or challenges"
              value={surveyNotes}
              onChange={(e) => setSurveyNotes(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">* Required fields</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Survey Photos <span className="text-gray-500 text-xs">(Coming Soon)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-500">Photo upload feature coming soon</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t-2 border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border-2 border-gray-300 text-gray-900 font-bold px-4 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || isDemoMode}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Submitting...
              </>
            ) : (
              <>
                <FileText size={20} />
                Submit Survey Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ enquiry, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-90vh overflow-y-auto shadow-2xl">
        <div className="p-6 border-b-2 border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">📋 Survey Details</h2>
            <p className="text-sm text-gray-600 mt-1">{enquiry.id} - {enquiry.customerName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 space-y-2 text-sm">
              <InfoRow label="Name" value={enquiry.customerName} />
              <InfoRow label="Phone" value={enquiry.phone} />
              <InfoRow label="Email" value={enquiry.email || 'N/A'} />
              <InfoRow label="Address" value={enquiry.address} />
              <InfoRow label="Area" value={enquiry.area || 'N/A'} />
              <InfoRow label="Capacity" value={`${enquiry.capacity} kW`} />
              <InfoRow label="Status" value={<StatusBadge status={enquiry.status} />} />
            </div>
          </div>

          {enquiry.surveyScheduledDate && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Survey Information</h3>
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 space-y-2 text-sm">
                <InfoRow label="Scheduled Date" value={formatDate(enquiry.surveyScheduledDate)} />
                <InfoRow label="Surveyed By" value={enquiry.surveyedBy || 'N/A'} />
                {enquiry.surveyCompletedDate && (
                  <InfoRow label="Completed Date" value={formatDate(enquiry.surveyCompletedDate)} />
                )}
                {enquiry.surveyApproved !== undefined && (
                  <InfoRow 
                    label="Result" 
                    value={
                      <span className={`font-bold ${enquiry.surveyApproved ? 'text-green-600' : 'text-red-600'}`}>
                        {enquiry.surveyApproved ? '✓ Approved' : '✗ Rejected'}
                      </span>
                    } 
                  />
                )}
                {enquiry.roofType && <InfoRow label="Roof Type" value={enquiry.roofType} />}
                {enquiry.roofArea && <InfoRow label="Roof Area" value={`${enquiry.roofArea} sq ft`} />}
                {enquiry.surveyNotes && (
                  <div className="pt-3 border-t border-blue-300">
                    <p className="font-bold text-gray-900 mb-1">Notes:</p>
                    <p className="text-gray-700 italic bg-white p-3 rounded">{enquiry.surveyNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Timeline</h3>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 space-y-2 text-sm">
              <InfoRow label="Created" value={formatDate(enquiry.createdAt)} />
              <InfoRow label="Last Updated" value={formatDate(enquiry.updatedAt)} />
            </div>
          </div>
        </div>

        <div className="p-6 border-t-2 border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="font-bold text-gray-700">{label}:</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}