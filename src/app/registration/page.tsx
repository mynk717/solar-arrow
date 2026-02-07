// src/app/registration/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileCheck, Upload, Loader2, CheckCircle, Clock, RefreshCcw, Search, Filter, Eye, ExternalLink } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';
import StatusBadge from '@/components/StatusBadge';

const demoRegistrations = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    area: 'Shankar Nagar',
    consumerRegistrationNumber: 'CONS-2026-001',
    applicationNumber: 'APP-2026-001',
    registrationId: 'CSPDCL-2026-001',
    registrationDate: new Date('2026-01-15'),
    vendorName: 'Hope Energy',
    vendorAgreementNumber: 'VA-2026-001',
    status: 'approved',
    registrationStage: 'feasibility_approved',
    documents: ['aadhar.pdf', 'electricity_bill.pdf', 'roof_ownership.pdf'],
    approvalDate: new Date('2026-01-18'),
    feasibilityApprovalDate: new Date('2026-01-18'),
    discomCircle: 'Raipur',
    discomDivision: 'Central',
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    area: 'Civil Lines',
    consumerRegistrationNumber: 'CONS-2026-002',
    applicationNumber: 'APP-2026-002',
    registrationId: 'CSPDCL-2026-002',
    registrationDate: new Date('2026-01-20'),
    vendorName: 'Hope Energy',
    status: 'pending',
    registrationStage: 'application_submitted',
    documents: ['aadhar.pdf', 'electricity_bill.pdf'],
    approvalDate: null,
    discomCircle: 'Raipur',
  },
  {
    id: 'ENQ-003',
    customerName: 'Amit Patel',
    capacity: '10 kW',
    area: 'Telibandha',
    registrationId: null,
    registrationDate: null,
    vendorName: 'Hope Energy',
    status: 'not_registered',
    registrationStage: 'not_started',
    documents: [],
    approvalDate: null,
  },
];

const registrationStages = [
  { key: 'not_started', label: 'Not Started', color: 'gray' },
  { key: 'consumer_registered', label: 'Consumer Registered', color: 'blue' },
  { key: 'application_submitted', label: 'Application Submitted', color: 'yellow' },
  { key: 'feasibility_approved', label: 'Feasibility Approved', color: 'green' },
  { key: 'vendor_selected', label: 'Vendor Selected', color: 'purple' },
  { key: 'project_inspection', label: 'Project Inspection', color: 'orange' },
  { key: 'work_started', label: 'Work Started', color: 'indigo' },
  { key: 'project_commissioned', label: 'Project Commissioned', color: 'teal' },
];

export default function RegistrationPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [registrations, setRegistrations] = useState(demoRegistrations);
  const [loading, setLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<'registrationDate' | 'customerName'>('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [status]);

  const fetchData = async () => {
    if (status === 'unauthenticated') {
      setRegistrations(demoRegistrations);
      setLoading(false);
      return;
    }

    if (status === 'authenticated') {
      try {
        setLoading(true);
        const response = await fetch('/api/registrations');
        if (response.ok) {
          const data = await response.json();
          
          const registrationsWithDates = data.map((r: any) => ({
            ...r,
            registrationDate: r.registrationDate ? new Date(r.registrationDate) : null,
            approvalDate: r.approvalDate ? new Date(r.approvalDate) : null,
            feasibilityApprovalDate: r.feasibilityApprovalDate ? new Date(r.feasibilityApprovalDate) : null,
          }));
          
          setRegistrations(registrationsWithDates);
        } else {
          setRegistrations(demoRegistrations);
        }
      } catch (error) {
        console.error('Error fetching registrations:', error);
        setRegistrations(demoRegistrations);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    await fetchData();
  };

  // Filter, sort, paginate
  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = 
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.registrationId && r.registrationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.applicationNumber && r.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage = stageFilter === 'all' || r.registrationStage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'registrationDate') {
      const aDate = a.registrationDate?.getTime() || 0;
      const bDate = b.registrationDate?.getTime() || 0;
      comparison = aDate - bDate;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalPages = Math.ceil(sortedRegistrations.length / itemsPerPage);
  const paginatedRegistrations = sortedRegistrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter]);

  const handleRegister = async (enquiryId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/registrations/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId }),
      });

      if (!response.ok) throw new Error('Failed to register');

      await fetchData();
      alert('✅ Consumer registration initiated! Telegram notification sent.');
    } catch (error) {
      console.error('Error registering:', error);
      alert('❌ Failed to register. Please try again.');
    }
  };

  const handleUpdateStage = async (enquiryId: string, stage: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/registrations/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId, stage }),
      });

      if (!response.ok) throw new Error('Failed to update stage');

      await fetchData();
      alert('✅ Registration stage updated! Telegram notification sent.');
    } catch (error) {
      console.error('Error updating stage:', error);
      alert('❌ Failed to update stage. Please try again.');
    }
  };

  const handleUploadDoc = (enquiryId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Upload document for ${enquiryId}`);
  };

  const notRegistered = registrations.filter(r => r.registrationStage === 'not_started');
  const pending = registrations.filter(r => 
    r.registrationStage && 
    ['consumer_registered', 'application_submitted'].includes(r.registrationStage)
  );
  const approved = registrations.filter(r => 
    r.registrationStage && 
    ['feasibility_approved', 'vendor_selected', 'project_inspection', 'work_started', 'project_commissioned'].includes(r.registrationStage)
  );

  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading registrations...</p>
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
              CSPDCL Registration {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">Register solar installations with CSPDCL Government Portal</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Registration</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{notRegistered.length}</p>
              </div>
              <div className="bg-red-500 text-white p-3 rounded-lg">
                <FileCheck size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Under Review</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pending.length}</p>
              </div>
              <div className="bg-yellow-500 text-white p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{approved.length}</p>
              </div>
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer, ID, registration number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-900"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="all">All Stages</option>
                {registrationStages.map(stage => (
                  <option key={stage.key} value={stage.key}>{stage.label}</option>
                ))}
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
              <option value="registrationDate">Registration Date</option>
              <option value="customerName">Customer Name</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
            
            <span className="text-sm text-gray-600 ml-auto">
              Showing {paginatedRegistrations.length} of {sortedRegistrations.length} registrations
            </span>
          </div>
        </div>

        {/* Pending Registration */}
        {notRegistered.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileCheck size={24} className="text-red-600" />
              Pending Registration
            </h2>
            <div className="space-y-4">
              {notRegistered.map(reg => (
                <div key={reg.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{reg.id} - {reg.customerName}</h3>
                      <p className="text-sm text-gray-600">{reg.area} • {reg.capacity}</p>
                      <p className="text-sm text-gray-500 mt-1">Ready for CSPDCL registration</p>
                    </div>
                    <button
                      onClick={() => handleRegister(reg.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Register with CSPDCL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registration Cards */}
        <div className="space-y-6">
          {paginatedRegistrations.filter(r => r.registrationStage !== 'not_started').map((reg) => (
            <RegistrationCard 
              key={reg.id} 
              registration={reg} 
              onUpdateStage={handleUpdateStage}
              onUploadDoc={handleUploadDoc}
              onViewDetails={() => setSelectedRegistration(reg)}
              isDemoMode={isDemoMode}
            />
          ))}
        </div>

        {sortedRegistrations.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No registrations found matching your criteria</p>
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
        {selectedRegistration && (
          <RegistrationModal 
            registration={selectedRegistration} 
            onClose={() => setSelectedRegistration(null)}
          />
        )}
      </div>
    </div>
  );
}

function RegistrationCard({ registration, onUpdateStage, onUploadDoc, onViewDetails, isDemoMode }: any) {
  const getStageColor = (stage: string) => {
    const colors: any = {
      consumer_registered: 'blue',
      application_submitted: 'yellow',
      feasibility_approved: 'green',
      vendor_selected: 'purple',
      project_inspection: 'orange',
      work_started: 'indigo',
      project_commissioned: 'teal',
    };
    return colors[stage] || 'gray';
  };

  const color = getStageColor(registration.registrationStage);

  return (
    <div className={`border border-${color}-200 bg-${color}-50 rounded-lg p-6`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{registration.customerName}</h3>
          <p className="text-sm text-gray-600">{registration.id} • {registration.capacity} • {registration.area}</p>
          {registration.consumerRegistrationNumber && (
            <p className="text-sm text-gray-700 mt-1 font-medium">Consumer No: {registration.consumerRegistrationNumber}</p>
          )}
          {registration.applicationNumber && (
            <p className="text-sm text-gray-700">Application No: {registration.applicationNumber}</p>
          )}
        </div>
        <span className={`bg-${color}-200 text-${color}-800 px-3 py-1 rounded-full text-xs font-medium`}>
          {registration.registrationStage?.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600">Registration Date:</p>
            <p className="font-medium text-gray-900">{registration.registrationDate?.toLocaleDateString() || 'N/A'}</p>
          </div>
          {registration.feasibilityApprovalDate && (
            <div>
              <p className="text-gray-600">Feasibility Approved:</p>
              <p className="font-medium text-gray-900">{registration.feasibilityApprovalDate.toLocaleDateString()}</p>
            </div>
          )}
          {registration.discomCircle && (
            <div>
              <p className="text-gray-600">DISCOM Circle:</p>
              <p className="font-medium text-gray-900">{registration.discomCircle}</p>
            </div>
          )}
          {registration.vendorAgreementNumber && (
            <div>
              <p className="text-gray-600">Vendor Agreement:</p>
              <p className="font-medium text-gray-900">{registration.vendorAgreementNumber}</p>
            </div>
          )}
        </div>

        {registration.documents.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
            <div className="flex flex-wrap gap-2">
              {registration.documents.map((doc: string, idx: number) => (
                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
        >
          <Eye size={16} />
          View Details
        </button>
        <button
          onClick={() => onUploadDoc(registration.id)}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm flex items-center gap-2"
        >
          <Upload size={16} />
          Documents
        </button>
      </div>
    </div>
  );
}

function RegistrationModal({ registration, onClose }: any) {
  const stages = [
    { key: 'consumer_registered', label: 'Consumer Registered', icon: '👤' },
    { key: 'application_submitted', label: 'Application Submitted', icon: '📝' },
    { key: 'feasibility_approved', label: 'Feasibility Approved', icon: '✅' },
    { key: 'vendor_selected', label: 'Vendor Selected', icon: '🤝' },
    { key: 'project_inspection', label: 'Project Inspection', icon: '🔍' },
    { key: 'work_started', label: 'Work Started', icon: '⚙️' },
    { key: 'project_commissioned', label: 'Project Commissioned', icon: '🎉' },
  ];

  const currentIndex = stages.findIndex(s => s.key === registration.registrationStage);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Registration Journey - {registration.customerName}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {/* Journey Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Journey</h3>
            <div className="space-y-4">
              {stages.map((stage, index) => (
                <div key={stage.key} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    index <= currentIndex ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {stage.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${index <= currentIndex ? 'text-green-700' : 'text-gray-500'}`}>
                      {stage.label}
                    </p>
                    {index === currentIndex && (
                      <p className="text-sm text-blue-600">← Current Stage</p>
                    )}
                  </div>
                  {index <= currentIndex && (
                    <CheckCircle className="text-green-600" size={20} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="Consumer Reg. No" value={registration.consumerRegistrationNumber || 'N/A'} />
              <InfoRow label="Application No" value={registration.applicationNumber || 'N/A'} />
              <InfoRow label="Registration ID" value={registration.registrationId || 'N/A'} />
              <InfoRow label="DISCOM Circle" value={registration.discomCircle || 'N/A'} />
              <InfoRow label="DISCOM Division" value={registration.discomDivision || 'N/A'} />
              <InfoRow label="Vendor" value={registration.vendorName || 'N/A'} />
              {registration.vendorAgreementNumber && (
                <InfoRow label="Vendor Agreement" value={registration.vendorAgreementNumber} />
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
