// src/app/liaison/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Clock, CheckCircle, XCircle, Loader2, Upload, RefreshCcw, Search, Filter } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

const demoLiaisons = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    registrationId: 'CSPDCL-2026-001',
    installationDate: new Date('2026-01-20'),
    liaisonStage: 'inspection_pending',
    inspectionOfficer: 'Ramesh Verma',
    inspectionDate: new Date('2026-01-23'),
    inspectionNotes: null,
    inspectionStatus: null,
    meterInstallationDate: null,
    netMeteringAgreement: false,
    gridSyncDate: null,
    documents: ['installation_report.pdf', 'safety_certificate.pdf'],
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    registrationId: 'CSPDCL-2026-002',
    installationDate: new Date('2026-01-18'),
    liaisonStage: 'inspection_approved',
    inspectionOfficer: 'Suresh Kumar',
    inspectionDate: new Date('2026-01-21'),
    inspectionNotes: 'All safety measures verified. Installation quality good.',
    inspectionStatus: 'approved',
    meterInstallationDate: new Date('2026-01-24'),
    netMeteringAgreement: true,
    gridSyncDate: null,
    documents: ['installation_report.pdf', 'safety_certificate.pdf', 'inspection_approval.pdf'],
  },
  {
    id: 'ENQ-003',
    customerName: 'Amit Patel',
    capacity: '10 kW',
    registrationId: 'CSPDCL-2026-003',
    installationDate: new Date('2026-01-15'),
    liaisonStage: 'grid_synced',
    inspectionOfficer: 'Prakash Jain',
    inspectionDate: new Date('2026-01-18'),
    inspectionNotes: 'System verified and approved',
    inspectionStatus: 'approved',
    meterInstallationDate: new Date('2026-01-20'),
    netMeteringAgreement: true,
    gridSyncDate: new Date('2026-01-22'),
    documents: ['installation_report.pdf', 'safety_certificate.pdf', 'inspection_approval.pdf', 'net_metering_agreement.pdf'],
  },
];

export default function LiaisonPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [liaisons, setLiaisons] = useState(demoLiaisons);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'inspection_pending' | 'inspection_approved' | 'grid_synced'>('all');
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<'inspectionDate' | 'customerName' | 'gridSyncDate'>('inspectionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [status]);

  const fetchData = async () => {
    if (status === 'unauthenticated') {
      setLiaisons(demoLiaisons);
      setLoading(false);
      return;
    }

    if (status === 'authenticated') {
      try {
        setLoading(true);
        const response = await fetch('/api/liaison');
        if (response.ok) {
          const data = await response.json();
          
          const liaisonsWithDates = data.map((l: any) => ({
            ...l,
            installationDate: new Date(l.installationDate),
            inspectionDate: l.inspectionDate ? new Date(l.inspectionDate) : null,
            meterInstallationDate: l.meterInstallationDate ? new Date(l.meterInstallationDate) : null,
            gridSyncDate: l.gridSyncDate ? new Date(l.gridSyncDate) : null,
          }));
          
          setLiaisons(liaisonsWithDates);
        } else {
          setLiaisons(demoLiaisons);
        }
      } catch (error) {
        console.error('Error fetching liaisons:', error);
        setLiaisons(demoLiaisons);
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
  const filteredLiaisons = liaisons.filter(l => {
    const matchesSearch = 
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'all' || l.liaisonStage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const sortedLiaisons = [...filteredLiaisons].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'inspectionDate') {
      const aDate = a.inspectionDate?.getTime() || 0;
      const bDate = b.inspectionDate?.getTime() || 0;
      comparison = aDate - bDate;
    } else if (sortField === 'gridSyncDate') {
      const aDate = a.gridSyncDate?.getTime() || 0;
      const bDate = b.gridSyncDate?.getTime() || 0;
      comparison = aDate - bDate;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalPages = Math.ceil(sortedLiaisons.length / itemsPerPage);
  const paginatedLiaisons = sortedLiaisons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter]);

  const handleRecordInspection = async (id: string, approved: boolean, officer: string, notes: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/liaison/inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enquiryId: id, 
          approved,
          inspectionOfficer: officer,
          inspectionNotes: notes
        }),
      });

      if (!response.ok) throw new Error('Failed to record inspection');

      await fetchData();
      alert(`✅ Inspection ${approved ? 'approved' : 'rejected'}! Telegram notification sent.`);
    } catch (error) {
      console.error('Error recording inspection:', error);
      alert('❌ Failed to record inspection. Please try again.');
    }
  };

  const handleMeterInstallation = async (id: string, meterNumber: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/liaison/meter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enquiryId: id, 
          meterNumber
        }),
      });

      if (!response.ok) throw new Error('Failed to record meter installation');

      await fetchData();
      alert('✅ Meter installation recorded! Telegram notification sent.');
    } catch (error) {
      console.error('Error recording meter installation:', error);
      alert('❌ Failed to record meter installation. Please try again.');
    }
  };

  const handleGridSync = async (id: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/liaison/grid-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId: id }),
      });

      if (!response.ok) throw new Error('Failed to sync with grid');

      await fetchData();
      alert('✅ Grid synchronization completed! Telegram notification sent.');
    } catch (error) {
      console.error('Error syncing with grid:', error);
      alert('❌ Failed to sync with grid. Please try again.');
    }
  };

  const handleUploadDocument = (id: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Upload document for ${id}`);
  };

  const inspectionPending = liaisons.filter(l => l.liaisonStage === 'inspection_pending');
  const inspectionApproved = liaisons.filter(l => l.liaisonStage === 'inspection_approved');
  const gridSynced = liaisons.filter(l => l.liaisonStage === 'grid_synced');

  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading liaison data...</p>
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
              Liaison & Grid Synchronization {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">CSPDCL inspection, net metering & grid sync</p>
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
                <p className="text-gray-600 text-sm font-medium">Awaiting Inspection</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{inspectionPending.length}</p>
              </div>
              <div className="bg-yellow-500 text-white p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Inspection Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{inspectionApproved.length}</p>
              </div>
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Grid Synced</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{gridSynced.length}</p>
              </div>
              <div className="bg-blue-500 text-white p-3 rounded-lg">
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
                placeholder="Search by customer, ID, or registration..."
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
                onChange={(e) => setStageFilter(e.target.value as any)}
              >
                <option value="all">All Stages</option>
                <option value="inspection_pending">Inspection Pending</option>
                <option value="inspection_approved">Inspection Approved</option>
                <option value="grid_synced">Grid Synced</option>
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
              <option value="inspectionDate">Inspection Date</option>
              <option value="customerName">Customer Name</option>
              <option value="gridSyncDate">Grid Sync Date</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
            
            <span className="text-sm text-gray-600 ml-auto">
              Showing {paginatedLiaisons.length} of {sortedLiaisons.length} liaisons
            </span>
          </div>
        </div>

        {/* Liaison Cards */}
        <div className="space-y-6">
          {paginatedLiaisons.map((liaison) => {
            if (liaison.liaisonStage === 'inspection_pending') {
              return <InspectionPendingCard key={liaison.id} liaison={liaison} onRecordInspection={handleRecordInspection} onUpload={handleUploadDocument} isDemoMode={isDemoMode} />;
            } else if (liaison.liaisonStage === 'inspection_approved') {
              return <InspectionApprovedCard key={liaison.id} liaison={liaison} onMeterInstall={handleMeterInstallation} onGridSync={handleGridSync} onUpload={handleUploadDocument} isDemoMode={isDemoMode} />;
            } else if (liaison.liaisonStage === 'grid_synced') {
              return <GridSyncedCard key={liaison.id} liaison={liaison} />;
            }
            return null;
          })}
        </div>

        {sortedLiaisons.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No liaisons found matching your criteria</p>
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
      </div>
    </div>
  );
}

function InspectionPendingCard({ liaison, onRecordInspection, onUpload, isDemoMode }: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [officer, setOfficer] = useState(liaison.inspectionOfficer || '');
  const [notes, setNotes] = useState('');

  return (
    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{liaison.customerName}</h3>
          <p className="text-sm text-gray-600">{liaison.registrationId} • {liaison.capacity}</p>
          <p className="text-sm text-gray-600 mt-1">
            Installation Completed: {liaison.installationDate.toLocaleDateString()}
          </p>
        </div>
        <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
          Inspection Pending
        </span>
      </div>

      <div className="bg-white rounded p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600">Inspection Officer:</p>
            <p className="font-medium text-gray-900">{liaison.inspectionOfficer}</p>
          </div>
          <div>
            <p className="text-gray-600">Scheduled Date:</p>
            <p className="font-medium text-gray-900">{liaison.inspectionDate?.toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <p className="text-sm font-medium text-gray-700 mb-2">Documents Submitted:</p>
          <div className="flex flex-wrap gap-2">
            {liaison.documents.map((doc: string, idx: number) => (
              <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {doc}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!isRecording ? (
        <div className="flex gap-2">
          <button
            onClick={() => setIsRecording(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
          >
            Record Inspection
          </button>
          <button
            onClick={() => onUpload(liaison.id)}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm"
          >
            <Upload size={16} />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Officer *
            </label>
            <input 
              type="text" 
              placeholder="Officer name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Notes
            </label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              rows={2}
              placeholder="Inspection findings..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!officer) {
                  alert('Please enter inspector name');
                  return;
                }
                onRecordInspection(liaison.id, true, officer, notes);
                setIsRecording(false);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1"
            >
              <CheckCircle size={16} />
              Approve
            </button>
            <button
              onClick={() => {
                if (!officer) {
                  alert('Please enter inspector name');
                  return;
                }
                onRecordInspection(liaison.id, false, officer, notes);
                setIsRecording(false);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1"
            >
              <XCircle size={16} />
              Reject
            </button>
            <button
              onClick={() => setIsRecording(false)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InspectionApprovedCard({ liaison, onMeterInstall, onGridSync, onUpload, isDemoMode }: any) {
  const [isMeterInstall, setIsMeterInstall] = useState(false);
  const [meterNumber, setMeterNumber] = useState('');

  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{liaison.customerName}</h3>
          <p className="text-sm text-gray-600">{liaison.registrationId} • {liaison.capacity}</p>
        </div>
        <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
          Approved
        </span>
      </div>

      <div className="bg-white rounded p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <p className="text-gray-600">Inspection Date:</p>
            <p className="font-medium text-gray-900">{liaison.inspectionDate?.toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Inspector:</p>
            <p className="font-medium text-gray-900">{liaison.inspectionOfficer}</p>
          </div>
          <div>
            <p className="text-gray-600">Meter Installation:</p>
            <p className="font-medium text-gray-900">{liaison.meterInstallationDate?.toLocaleDateString() || 'Pending'}</p>
          </div>
          <div>
            <p className="text-gray-600">Net Metering Agreement:</p>
            <p className={`font-medium ${liaison.netMeteringAgreement ? 'text-green-600' : 'text-red-600'}`}>
              {liaison.netMeteringAgreement ? '✓ Signed' : '✗ Pending'}
            </p>
          </div>
        </div>

        {liaison.inspectionNotes && (
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-700 italic">{liaison.inspectionNotes}</p>
          </div>
        )}
      </div>

      {!isMeterInstall ? (
        <div className="flex gap-2">
          <button
            onClick={() => setIsMeterInstall(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
            disabled={liaison.meterInstallationDate}
          >
            {liaison.meterInstallationDate ? 'Meter Installed' : 'Install Meter'}
          </button>
          <button
            onClick={() => onGridSync(liaison.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm"
            disabled={!liaison.meterInstallationDate || !liaison.netMeteringAgreement}
          >
            Sync with Grid
          </button>
          <button
            onClick={() => onUpload(liaison.id)}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm flex items-center gap-1"
          >
            <Upload size={16} />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meter Number *
            </label>
            <input 
              type="text" 
              placeholder="Enter meter number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!meterNumber) {
                  alert('Please enter meter number');
                  return;
                }
                onMeterInstall(liaison.id, meterNumber);
                setIsMeterInstall(false);
                setMeterNumber('');
              }}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg"
            >
              Confirm Installation
            </button>
            <button
              onClick={() => setIsMeterInstall(false)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GridSyncedCard({ liaison }: any) {
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{liaison.customerName}</h3>
          <p className="text-sm text-gray-600">{liaison.registrationId} • {liaison.capacity}</p>
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <p>✓ Inspection: {liaison.inspectionDate?.toLocaleDateString()}</p>
            <p>✓ Meter Installed: {liaison.meterInstallationDate?.toLocaleDateString()}</p>
            <p>✓ Grid Synced: {liaison.gridSyncDate?.toLocaleDateString()}</p>
            <p className="font-medium text-blue-600 mt-2">System Active & Operational</p>
          </div>
        </div>
        <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
          Active
        </span>
      </div>
    </div>
  );
}
