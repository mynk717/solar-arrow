// src/app/wcr/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileCheck, Download, Upload, Loader2, Camera, CheckCircle, RefreshCcw, Search, Filter, Eye, XCircle } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';
import StatusBadge from '@/components/StatusBadge';

const demoWCRs = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    registrationId: 'CSPDCL-2026-001',
    installationDate: new Date('2026-01-20'),
    installationCompletedDate: new Date('2026-01-20'),
    installedBy: 'Tech Team A',
    installationTeam: 'Tech Team A',
    wcrStatus: 'pending',
    wcrSubmittedDate: null,
    wcrApprovedDate: null,
    photos: [],
    checklist: {
      panelsInstalled: true,
      inverterInstalled: true,
      wiringComplete: true,
      earthingDone: true,
      safetyMeasures: true,
      systemTested: false,
      customerBriefed: false,
    },
    pvModuleSerialNumbers: '',
    inverterSerialNumber: '',
    meterNumber: '',
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    registrationId: 'CSPDCL-2026-002',
    installationDate: new Date('2026-01-18'),
    installationCompletedDate: new Date('2026-01-18'),
    installedBy: 'Tech Team B',
    installationTeam: 'Tech Team B',
    wcrStatus: 'submitted',
    wcrSubmittedDate: new Date('2026-01-19'),
    wcrApprovedDate: null,
    photos: ['site_before.jpg', 'panels_installed.jpg', 'inverter_setup.jpg', 'site_after.jpg'],
    checklist: {
      panelsInstalled: true,
      inverterInstalled: true,
      wiringComplete: true,
      earthingDone: true,
      safetyMeasures: true,
      systemTested: true,
      customerBriefed: true,
    },
    pvModuleSerialNumbers: 'PV001, PV002, PV003',
    inverterSerialNumber: 'INV-2026-002',
    meterNumber: 'MTR-2026-002',
  },
  {
    id: 'ENQ-003',
    customerName: 'Amit Patel',
    capacity: '10 kW',
    registrationId: 'CSPDCL-2026-003',
    installationDate: new Date('2026-01-15'),
    installationCompletedDate: new Date('2026-01-15'),
    installedBy: 'Tech Team A',
    installationTeam: 'Tech Team A',
    wcrStatus: 'approved',
    wcrSubmittedDate: new Date('2026-01-16'),
    wcrApprovedDate: new Date('2026-01-17'),
    photos: ['site_before.jpg', 'panels_installed.jpg', 'inverter_setup.jpg', 'site_after.jpg', 'meter_setup.jpg'],
    checklist: {
      panelsInstalled: true,
      inverterInstalled: true,
      wiringComplete: true,
      earthingDone: true,
      safetyMeasures: true,
      systemTested: true,
      customerBriefed: true,
    },
    pvModuleSerialNumbers: 'PV001-PV030',
    inverterSerialNumber: 'INV-2026-003',
    meterNumber: 'MTR-2026-003',
  },
];

export default function WCRPage() {
  const { data: session, status } = useSession();
  const { isDemoMode } = useDemoMode();
  const [wcrs, setWcrs] = useState(demoWCRs);
  const [loading, setLoading] = useState(false);
  const [selectedWCR, setSelectedWCR] = useState<any>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'approved'>('all');
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<'installationDate' | 'customerName'>('installationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [status]);

  const fetchData = async () => {
    if (status === 'unauthenticated') {
      setWcrs(demoWCRs);
      setLoading(false);
      return;
    }

    if (status === 'authenticated') {
      try {
        setLoading(true);
        const response = await fetch('/api/wcr');
        if (response.ok) {
          const data = await response.json();
          
          const wcrsWithDates = data.map((w: any) => ({
            ...w,
            installationDate: w.installationDate ? new Date(w.installationDate) : null,
            installationCompletedDate: w.installationCompletedDate ? new Date(w.installationCompletedDate) : null,
            wcrSubmittedDate: w.wcrSubmittedDate ? new Date(w.wcrSubmittedDate) : null,
            wcrApprovedDate: w.wcrApprovedDate ? new Date(w.wcrApprovedDate) : null,
          }));
          
          setWcrs(wcrsWithDates);
        } else {
          setWcrs(demoWCRs);
        }
      } catch (error) {
        console.error('Error fetching WCRs:', error);
        setWcrs(demoWCRs);
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

  const handleSubmitWCR = async (id: string, data: any) => {
    if (isDemoMode) {
      return;
    }

    try {
      const response = await fetch('/api/wcr/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId: id, ...data }),
      });

      if (!response.ok) throw new Error('Failed to submit WCR');

      await fetchData();
      setSelectedWCR(null);
      alert('✅ WCR submitted successfully! Telegram notification sent.');
    } catch (error) {
      console.error('Error submitting WCR:', error);
      alert('❌ Failed to submit WCR. Please try again.');
    }
  };

  const handleApproveWCR = async (id: string, approved: boolean) => {
    if (isDemoMode) {
      return;
    }

    try {
      const response = await fetch('/api/wcr/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId: id, approved }),
      });

      if (!response.ok) throw new Error('Failed to approve WCR');

      await fetchData();
      alert(`✅ WCR ${approved ? 'approved' : 'rejected'}! Telegram notification sent.`);
    } catch (error) {
      console.error('Error approving WCR:', error);
      alert('❌ Failed to approve WCR. Please try again.');
    }
  };

  const handleUploadPhotos = (id: string) => {
    if (isDemoMode) {
      return;
    }
    alert(`Upload photos for ${id}`);
  };

  const pending = wcrs.filter(w => w.wcrStatus === 'pending');
  const submitted = wcrs.filter(w => w.wcrStatus === 'submitted');
  const approved = wcrs.filter(w => w.wcrStatus === 'approved');

  // Filter, sort, paginate
  const getFilteredWCRs = () => {
    let filtered = wcrs;

    if (statusFilter === 'pending') {
      filtered = pending;
    } else if (statusFilter === 'submitted') {
      filtered = submitted;
    } else if (statusFilter === 'approved') {
      filtered = approved;
    }

    return filtered.filter(w => 
      w.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.registrationId && w.registrationId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredWCRs = getFilteredWCRs();

  const sortedWCRs = [...filteredWCRs].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'installationDate') {
      const aDate = (a.installationCompletedDate || a.installationDate)?.getTime() || 0;
      const bDate = (b.installationCompletedDate || b.installationDate)?.getTime() || 0;
      comparison = aDate - bDate;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalPages = Math.ceil(sortedWCRs.length / itemsPerPage);
  const paginatedWCRs = sortedWCRs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading WCR data...</p>
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
              Work Completion Report {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">Installation completion documentation & approval</p>
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
                <p className="text-gray-600 text-sm font-medium">Pending WCR</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pending.length}</p>
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
                <p className="text-3xl font-bold text-yellow-600 mt-2">{submitted.length}</p>
              </div>
              <div className="bg-yellow-500 text-white p-3 rounded-lg">
                <FileCheck size={24} />
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
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
              <option value="installationDate">Installation Date</option>
              <option value="customerName">Customer Name</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
            
            <span className="text-sm text-gray-600 ml-auto">
              Showing {paginatedWCRs.length} of {sortedWCRs.length} WCRs
            </span>
          </div>
        </div>

        {/* WCR Cards */}
        <div className="space-y-6">
          {paginatedWCRs.map(wcr => (
            <WCRCard 
              key={wcr.id} 
              wcr={wcr} 
              onSubmit={handleSubmitWCR}
              onApprove={handleApproveWCR}
              onViewDetails={() => setSelectedWCR(wcr)}
              onUploadPhotos={handleUploadPhotos}
              isDemoMode={isDemoMode}
            />
          ))}
        </div>

        {sortedWCRs.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No WCRs found matching your criteria</p>
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

        {/* WCR Details Modal */}
        {selectedWCR && (
          <WCRModal 
            wcr={selectedWCR} 
            onClose={() => setSelectedWCR(null)}
            onSubmit={handleSubmitWCR}
            onUploadPhotos={handleUploadPhotos}
          />
        )}
      </div>
    </div>
  );
}

function WCRCard({ wcr, onSubmit, onApprove, onViewDetails, onUploadPhotos, isDemoMode }: any) {
  const isPending = wcr.wcrStatus === 'pending';
  const isSubmitted = wcr.wcrStatus === 'submitted';
  const isApproved = wcr.wcrStatus === 'approved';

  const allChecklistComplete = Object.values(wcr.checklist).every(v => v === true);

  return (
    <div className={`border rounded-lg p-6 ${
      isApproved ? 'border-green-200 bg-green-50' :
      isSubmitted ? 'border-yellow-200 bg-yellow-50' :
      'border-red-200 bg-red-50'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{wcr.customerName}</h3>
          <p className="text-sm text-gray-600">{wcr.id} • {wcr.registrationId} • {wcr.capacity}</p>
          <p className="text-sm text-gray-600 mt-1">Installed by: {wcr.installationTeam || wcr.installedBy}</p>
          <p className="text-sm text-gray-500">
            Installation: {(wcr.installationCompletedDate || wcr.installationDate)?.toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isApproved ? 'bg-green-200 text-green-800' :
          isSubmitted ? 'bg-yellow-200 text-yellow-800' :
          'bg-red-200 text-red-800'
        }`}>
          {wcr.wcrStatus.toUpperCase()}
        </span>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Checklist Status:</p>
          <span className={`text-xs px-2 py-1 rounded ${allChecklistComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {Object.values(wcr.checklist).filter(v => v).length} / {Object.keys(wcr.checklist).length} Complete
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(wcr.checklist).map(([key, value]: [string, any]) => (
            <div key={key} className="flex items-center gap-2">
              {value ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <XCircle size={16} className="text-gray-300" />
              )}
              <span className={value ? 'text-gray-700' : 'text-gray-400'}>
                {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
              </span>
            </div>
          ))}
        </div>

        {wcr.photos.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-blue-600" />
              <p className="text-sm font-medium text-gray-700">{wcr.photos.length} Photos Uploaded</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isPending && (
          <>
            <button
              onClick={() => onViewDetails()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <FileCheck size={16} />
              Complete WCR
            </button>
            <button
              onClick={() => onUploadPhotos(wcr.id)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm flex items-center gap-2"
            >
              <Upload size={16} />
              Upload
            </button>
          </>
        )}

        {isSubmitted && (
          <>
            <button
              onClick={() => onApprove(wcr.id, true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              Approve WCR
            </button>
            <button
              onClick={() => onApprove(wcr.id, false)}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm flex items-center gap-2"
            >
              <XCircle size={16} />
              Reject
            </button>
            <button
              onClick={() => onViewDetails()}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm flex items-center gap-2"
            >
              <Eye size={16} />
              View
            </button>
          </>
        )}

        {isApproved && (
          <>
            <button
              onClick={() => onViewDetails()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              View Details
            </button>
            <button
              onClick={() => !isDemoMode && alert('Download WCR PDF')}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function WCRModal({ wcr, onClose, onSubmit, onUploadPhotos }: any) {
  const [checklist, setChecklist] = useState(wcr.checklist);
  const [pvModuleSerialNumbers, setPvModuleSerialNumbers] = useState(wcr.pvModuleSerialNumbers || '');
  const [inverterSerialNumber, setInverterSerialNumber] = useState(wcr.inverterSerialNumber || '');
  const [meterNumber, setMeterNumber] = useState(wcr.meterNumber || '');
  const [installationNotes, setInstallationNotes] = useState(wcr.installationNotes || '');

  const allComplete = Object.values(checklist).every(v => v === true);
  const isPending = wcr.wcrStatus === 'pending';

  const handleSubmit = () => {
    if (!allComplete) {
      alert('Please complete all checklist items');
      return;
    }
    if (!pvModuleSerialNumbers || !inverterSerialNumber || !meterNumber) {
      alert('Please fill all required fields');
      return;
    }

    onSubmit(wcr.id, {
      checklist,
      pvModuleSerialNumbers,
      inverterSerialNumber,
      meterNumber,
      installationNotes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Work Completion Report</h2>
              <p className="text-sm text-gray-600 mt-1">{wcr.customerName} • {wcr.registrationId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Installation Checklist */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Installation Checklist *</h3>
            <div className="space-y-2">
              {Object.entries(checklist).map(([key, value]: [string, any]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                    disabled={!isPending}
                    className="rounded"
                  />
                  <span className="text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* System Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PV Module Serial Numbers *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                placeholder="e.g., PV001, PV002, PV003"
                value={pvModuleSerialNumbers}
                onChange={(e) => setPvModuleSerialNumbers(e.target.value)}
                disabled={!isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inverter Serial Number *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                placeholder="e.g., INV-2026-001"
                value={inverterSerialNumber}
                onChange={(e) => setInverterSerialNumber(e.target.value)}
                disabled={!isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meter Number *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                placeholder="e.g., MTR-2026-001"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                disabled={!isPending}
              />
            </div>
          </div>

          {/* Installation Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installation Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              rows={3}
              placeholder="Any additional notes or observations..."
              value={installationNotes}
              onChange={(e) => setInstallationNotes(e.target.value)}
              disabled={!isPending}
            />
          </div>

          {/* Photos */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Installation Photos ({wcr.photos.length})</h3>
              {isPending && (
                <button
                  onClick={() => onUploadPhotos(wcr.id)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <Upload size={14} />
                  Upload Photos
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {wcr.photos.map((photo: string, idx: number) => (
                <div key={idx} className="aspect-square bg-gray-200 rounded flex flex-col items-center justify-center text-gray-600">
                  <Camera size={32} />
                  <span className="text-xs mt-1">Photo {idx + 1}</span>
                </div>
              ))}
              {wcr.photos.length === 0 && (
                <div className="col-span-4 text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                  No photos uploaded yet
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isPending && (
            <button
              onClick={handleSubmit}
              disabled={!allComplete}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              Submit WCR for Approval
            </button>
          )}

          {wcr.wcrStatus === 'submitted' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-medium">WCR Submitted - Awaiting Approval</p>
              <p className="text-sm text-yellow-700 mt-1">
                Submitted on: {wcr.wcrSubmittedDate?.toLocaleDateString()}
              </p>
            </div>
          )}

          {wcr.wcrStatus === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-800 font-medium">✓ WCR Approved</p>
              <p className="text-sm text-green-700 mt-1">
                Approved on: {wcr.wcrApprovedDate?.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
