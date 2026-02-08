// src/app/survey/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Enquiry } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, User, CheckCircle, XCircle, Loader2, RefreshCcw, Search, Filter, Eye, Upload } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { demoEnquiries } from '@/lib/demoData';
import { useDemoMode } from '@/contexts/DemoContext';

const surveyTeamMembers = [
  'Amit Sharma',
  'Rahul Patel',
  'Priya Singh',
  'Vikram Verma'
];

export default function SurveyPage() {
  const { data: session, status } = useSession();
  const { isDemoMode } = useDemoMode();
  
  const [enquiries, setEnquiries] = useState<Enquiry[]>(demoEnquiries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'scheduled' | 'completed'>('all');
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<'surveyDate' | 'customerName'>('surveyDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch enquiries from API or use demo data
  useEffect(() => {
    fetchData();
  }, [status]);

  const fetchData = async () => {
    if (status === 'unauthenticated') {
      setEnquiries(demoEnquiries);
      setLoading(false);
      return;
    }

    if (status === 'authenticated') {
      try {
        setLoading(true);
        const response = await fetch('/api/enquiries');
        if (!response.ok) throw new Error('Failed to fetch enquiries');
        
        const data = await response.json();
        
        const enquiriesWithDates = data.map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
          surveyDate: e.surveyDate ? new Date(e.surveyDate) : undefined,
          surveyScheduledDate: e.surveyScheduledDate ? new Date(e.surveyScheduledDate) : undefined,
          surveyCompletedDate: e.surveyCompletedDate ? new Date(e.surveyCompletedDate) : undefined,
          registrationDate: e.registrationDate ? new Date(e.registrationDate) : undefined,
          paymentDate: e.paymentDate ? new Date(e.paymentDate) : undefined,
          dispatchDate: e.dispatchDate ? new Date(e.dispatchDate) : undefined,
          installationDate: e.installationDate ? new Date(e.installationDate) : undefined,
          inspectionDate: e.inspectionDate ? new Date(e.inspectionDate) : undefined,
          activationDate: e.activationDate ? new Date(e.activationDate) : undefined,
        }));
        
        setEnquiries(enquiriesWithDates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    if (isDemoMode) {
      return;
    }
    await fetchData();
  };
  
  const pendingSurveys = enquiries.filter(e => 
    (e.status === 'survey-pending' || e.status === 'new' || e.status === 'lead') && 
    !e.surveyScheduledDate
  );
  
  
  const scheduledSurveys = enquiries.filter(e => 
    e.surveyScheduledDate && !e.surveyCompletedDate
  );
  
  const completedSurveys = enquiries.filter(e => 
    e.surveyCompletedDate || 
    (e.surveyDate && e.surveyApproved !== undefined)
  );

  // Filter, sort, paginate
  const getFilteredSurveys = () => {
    let filtered = enquiries;

    if (statusFilter === 'pending') {
      filtered = pendingSurveys;
    } else if (statusFilter === 'scheduled') {
      filtered = scheduledSurveys;
    } else if (statusFilter === 'completed') {
      filtered = completedSurveys;
    }

    return filtered.filter(e => 
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.area.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredSurveys = getFilteredSurveys();

  const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'surveyDate') {
      const aDate = (a.surveyScheduledDate || a.surveyDate)?.getTime() || 0;
      const bDate = (b.surveyScheduledDate || b.surveyDate)?.getTime() || 0;
      comparison = aDate - bDate;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalPages = Math.ceil(sortedSurveys.length / itemsPerPage);
  const paginatedSurveys = sortedSurveys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleScheduleSurvey = async (enquiryId: string, surveyDate: Date, assignee: string) => {
    if (isDemoMode) {
      return;
    }
    
    try {
      const response = await fetch('/api/survey/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enquiryId, 
          surveyScheduledDate: surveyDate.toISOString().split('T')[0],
          surveyedBy: assignee
        }),
      });

      if (!response.ok) throw new Error('Failed to schedule survey');

      await fetchData();
      alert('✅ Survey scheduled successfully! Telegram notification sent.');
    } catch (error) {
      console.error('Error scheduling survey:', error);
      alert('❌ Failed to schedule survey. Please try again.');
    }
  };

  const handleApproveSurvey = async (enquiryId: string, approved: boolean, notes: string, roofType?: string, roofArea?: number) => {
    if (isDemoMode) {
      return;
    }
    
    try {
      const response = await fetch('/api/survey/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enquiryId, 
          surveyApproved: approved,
          surveyNotes: notes,
          roofType,
          roofArea
        }),
      });

      if (!response.ok) throw new Error('Failed to submit survey result');

      await fetchData();
      alert(`✅ Survey ${approved ? 'approved' : 'rejected'}! Telegram notification sent.`);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('❌ Failed to submit survey. Please try again.');
    }
  };

  // Loading state
  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading survey data...</p>
        </div>
      </div>
    );
  }

  // Error state (only for authenticated users)
  if (error && !isDemoMode) {
    return (
      <div>
        <DemoBanner />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DemoBanner />
      
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Survey Panel {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">
              {isDemoMode 
                ? 'Viewing sample survey data - Sign in to manage real surveys'
                : 'Schedule and manage site surveys (CSPDCL Guidelines)'
              }
            </p>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCcw size={20} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Pending Surveys" 
            value={pendingSurveys.length} 
            icon={Calendar} 
            color="bg-yellow-500"
            isDemoMode={isDemoMode}
          />
          <StatCard 
            title="Scheduled" 
            value={scheduledSurveys.length} 
            icon={Calendar} 
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer, ID, or area..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-900"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Surveys</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
            >
              <option value="surveyDate">Survey Date</option>
              <option value="customerName">Customer Name</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
            
            <span className="text-sm text-gray-600 ml-auto">
              Showing {paginatedSurveys.length} of {sortedSurveys.length} surveys
            </span>
          </div>
        </div>

        {/* Survey Cards */}
        <div className="space-y-6">
          {paginatedSurveys.map(enquiry => (
            <SurveyCard 
              key={enquiry.id} 
              enquiry={enquiry} 
              onSchedule={handleScheduleSurvey}
              onApprove={handleApproveSurvey}
              onViewDetails={() => setSelectedEnquiry(enquiry)}
              isDemoMode={isDemoMode}
            />
          ))}
        </div>

        {sortedSurveys.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No surveys found matching your criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 bg-white rounded-lg shadow-md px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
            >
              Next
            </button>
          </div>
        )}

        {/* Details Modal */}
        {selectedEnquiry && (
          <SurveyDetailsModal 
            enquiry={selectedEnquiry} 
            onClose={() => setSelectedEnquiry(null)}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, isDemoMode }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      {isDemoMode && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
          Demo
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function SurveyCard({ enquiry, onSchedule, onApprove, onViewDetails, isDemoMode }: any) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [surveyDate, setSurveyDate] = useState('');
  const [assignee, setAssignee] = useState(surveyTeamMembers[0]);
  const [notes, setNotes] = useState('');
  const [roofType, setRoofType] = useState('');
  const [roofArea, setRoofArea] = useState('');

  const isPending = !enquiry.surveyScheduledDate;
  const isScheduled = enquiry.surveyScheduledDate && !enquiry.surveyCompletedDate;
  const isCompleted = enquiry.surveyCompletedDate || enquiry.surveyApproved !== undefined;

  return (
    <div className={`border rounded-lg p-6 ${
      isCompleted ? 'border-green-200 bg-green-50' :
      isScheduled ? 'border-blue-200 bg-blue-50' :
      'border-yellow-200 bg-yellow-50'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-600 mt-1">{enquiry.address}</p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      {isPending && !isScheduling && (
        <button
          onClick={() => setIsScheduling(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Calendar size={16} />
          Schedule Survey
        </button>
      )}

      {isScheduling && (
        <div className="bg-white p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Survey Date *</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                min={new Date().toISOString().split('T')[0]}
                value={surveyDate}
                onChange={(e) => setSurveyDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
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
                  alert('Please select a survey date');
                  return;
                }
                onSchedule(enquiry.id, new Date(surveyDate), assignee);
                setIsScheduling(false);
                setSurveyDate('');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Confirm Schedule
            </button>
            <button
              onClick={() => setIsScheduling(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isScheduled && !isApproving && (
        <div>
          <div className="bg-white p-4 rounded-lg mb-3">
            <p className="text-sm text-gray-700">
              <strong>Scheduled:</strong> {enquiry.surveyScheduledDate?.toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Assigned To:</strong> {enquiry.surveyedBy}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsApproving(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Submit Survey Result
            </button>
            <button
              onClick={() => onViewDetails()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <Eye size={16} />
              View Details
            </button>
          </div>
        </div>
      )}

      {isApproving && (
        <div className="bg-white p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roof Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                value={roofType}
                onChange={(e) => setRoofType(e.target.value)}
              >
                <option value="">Select type</option>
                <option value="RCC">RCC</option>
                <option value="Metal Sheet">Metal Sheet</option>
                <option value="Asbestos">Asbestos</option>
                <option value="Tile">Tile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roof Area (sq ft)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                placeholder="Enter area"
                value={roofArea}
                onChange={(e) => setRoofArea(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Survey Notes *</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              placeholder="Survey notes and observations..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!notes) {
                  alert('Please enter survey notes');
                  return;
                }
                onApprove(enquiry.id, true, notes, roofType, parseFloat(roofArea));
                setIsApproving(false);
                setNotes('');
                setRoofType('');
                setRoofArea('');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle size={16} /> Approve Site
            </button>
            <button
              onClick={() => {
                if (!notes) {
                  alert('Please enter reason for rejection');
                  return;
                }
                onApprove(enquiry.id, false, notes);
                setIsApproving(false);
                setNotes('');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <XCircle size={16} /> Reject Site
            </button>
            <button
              onClick={() => setIsApproving(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="bg-white p-4 rounded-lg">
          <div className="flex items-start gap-3">
            {enquiry.surveyApproved ? (
              <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
            ) : (
              <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
            )}
            <div className="flex-1">
              <p className={`font-semibold ${enquiry.surveyApproved ? 'text-green-700' : 'text-red-700'}`}>
                {enquiry.surveyApproved ? 'Site Approved' : 'Site Rejected'}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Surveyed by:</strong> {enquiry.surveyedBy}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Date:</strong> {(enquiry.surveyCompletedDate || enquiry.surveyDate)?.toLocaleDateString()}
              </p>
              {enquiry.roofType && (
                <p className="text-sm text-gray-700">
                  <strong>Roof Type:</strong> {enquiry.roofType}
                </p>
              )}
              {enquiry.roofArea && (
                <p className="text-sm text-gray-700">
                  <strong>Roof Area:</strong> {enquiry.roofArea} sq ft
                </p>
              )}
              {enquiry.surveyNotes && (
                <p className="text-sm text-gray-600 mt-2 italic">"{enquiry.surveyNotes}"</p>
              )}
            </div>
            <button
              onClick={() => onViewDetails()}
              className="text-blue-600 hover:text-blue-700"
              title="View Details"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SurveyDetailsModal({ enquiry, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Survey Details - {enquiry.customerName}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <InfoRow label="Customer Name" value={enquiry.customerName} />
              <InfoRow label="Phone" value={enquiry.phone} />
              <InfoRow label="Email" value={enquiry.email || 'N/A'} />
              <InfoRow label="Address" value={enquiry.address} />
              <InfoRow label="Area" value={enquiry.area} />
              <InfoRow label="Capacity" value={`${enquiry.capacity} kW`} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Survey Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <InfoRow label="Status" value={<StatusBadge status={enquiry.status} />} />
              {enquiry.surveyScheduledDate && (
                <InfoRow label="Scheduled Date" value={enquiry.surveyScheduledDate.toLocaleDateString()} />
              )}
              {enquiry.surveyedBy && (
                <InfoRow label="Surveyed By" value={enquiry.surveyedBy} />
              )}
              {enquiry.surveyCompletedDate && (
                <InfoRow label="Completed Date" value={enquiry.surveyCompletedDate.toLocaleDateString()} />
              )}
              {enquiry.roofType && (
                <InfoRow label="Roof Type" value={enquiry.roofType} />
              )}
              {enquiry.roofArea && (
                <InfoRow label="Roof Area" value={`${enquiry.roofArea} sq ft`} />
              )}
              {enquiry.surveyApproved !== undefined && (
                <InfoRow 
                  label="Result" 
                  value={
                    <span className={enquiry.surveyApproved ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {enquiry.surveyApproved ? '✓ Approved' : '✗ Rejected'}
                    </span>
                  } 
                />
              )}
              {enquiry.surveyNotes && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                  <p className="text-sm text-gray-600 italic">{enquiry.surveyNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="text-gray-700 font-medium">{label}:</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
