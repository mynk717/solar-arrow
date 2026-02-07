// src/app/installation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Enquiry } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { Truck, Wrench, ClipboardCheck, Package, Loader2, RefreshCcw, Search, Filter } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { demoEnquiries } from '@/lib/demoData';
import { useDemoMode } from '@/contexts/DemoContext';

const installationTeams = ['Tech Team A', 'Tech Team B', 'Tech Team C'];

export default function InstallationPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(demoEnquiries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'dispatch' | 'installation' | 'inspection' | 'completed'>('all');
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<'createdAt' | 'customerName' | 'dispatchDate'>('dispatchDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
      showDemoAlert();
      return;
    }
    await fetchData();
  };

  // Filter by stage and search
  const getFilteredEnquiries = () => {
    let filtered = enquiries.filter(e => {
      const matchesSearch = 
        e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.area.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (stageFilter) {
        case 'dispatch':
          return e.status === 'payment-received';
        case 'installation':
          return e.status === 'dispatched' || e.status === 'dispatch-pending' || 
                 e.status === 'installation-pending' || (e.dispatchDate && !e.installationDate);
        case 'inspection':
          return e.installationDate && !e.inspectionDate;
        case 'completed':
          return e.status === 'installation-completed' || e.status === 'active';
        default:
          return true;
      }
    });

    return filtered;
  };

  const filteredEnquiries = getFilteredEnquiries();

  // Sort enquiries
  const sortedEnquiries = [...filteredEnquiries].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'createdAt') {
      comparison = a.createdAt.getTime() - b.createdAt.getTime();
    } else if (sortField === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'dispatchDate') {
      const aDate = a.dispatchDate?.getTime() || 0;
      const bDate = b.dispatchDate?.getTime() || 0;
      comparison = aDate - bDate;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Paginate
  const totalPages = Math.ceil(sortedEnquiries.length / itemsPerPage);
  const paginatedEnquiries = sortedEnquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter]);

  const readyForDispatch = enquiries.filter(e => e.status === 'payment-received');
  const dispatched = enquiries.filter(e => e.status === 'dispatched' || e.status === 'dispatch-pending');
  const inInstallation = enquiries.filter(e => 
    e.status === 'installation-pending' || (e.dispatchDate && !e.installationDate)
  );
  const installationCompleted = enquiries.filter(e => 
    e.status === 'installation-completed' && e.installationDate
  );
  const awaitingInspection = enquiries.filter(e => e.installationDate && !e.inspectionDate);

  const handleDispatch = async (enquiryId: string, trackingNumber: string, transportCompany: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/installation/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enquiryId, 
          trackingNumber, 
          transportCompany 
        }),
      });

      if (!response.ok) throw new Error('Failed to mark as dispatched');

      setEnquiries(prev => prev.map(e => 
        e.id === enquiryId 
          ? { 
              ...e, 
              dispatchDate: new Date(), 
              status: 'dispatched' as any,
              updatedAt: new Date()
            }
          : e
      ));

      alert('✅ Dispatched successfully! Telegram notification sent.');
    } catch (error) {
      console.error('Error dispatching:', error);
      alert('❌ Failed to dispatch. Please try again.');
    }
  };

  const handleInstallation = async (enquiryId: string, team: string, notes: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/installation/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enquiryId, 
          installedBy: team,
          installationNotes: notes
        }),
      });

      if (!response.ok) throw new Error('Failed to mark installation as complete');

      setEnquiries(prev => prev.map(e => 
        e.id === enquiryId 
          ? { 
              ...e, 
              installationDate: new Date(), 
              installedBy: team,
              status: 'installation-completed' as any,
              updatedAt: new Date()
            }
          : e
      ));

      alert('✅ Installation completed! Telegram notification sent.');
    } catch (error) {
      console.error('Error completing installation:', error);
      alert('❌ Failed to complete installation. Please try again.');
    }
  };

  const handleInspection = async (enquiryId: string, approved: boolean, officer: string, notes: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/installation/inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enquiryId, 
          approved,
          inspectionOfficer: officer,
          inspectionNotes: notes
        }),
      });

      if (!response.ok) throw new Error('Failed to record inspection');

      setEnquiries(prev => prev.map(e => 
        e.id === enquiryId 
          ? { 
              ...e, 
              inspectionDate: new Date(), 
              inspectionOfficer: officer,
              inspectionApproved: approved,
              activationDate: approved ? new Date() : undefined,
              status: (approved ? 'active' : 'installation-completed') as any,
              updatedAt: new Date()
            }
          : e
      ));

      alert(`✅ Inspection ${approved ? 'approved' : 'rejected'}! Telegram notification sent.`);
    } catch (error) {
      console.error('Error recording inspection:', error);
      alert('❌ Failed to record inspection. Please try again.');
    }
  };

  // Loading state
  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading installation data...</p>
        </div>
      </div>
    );
  }

  // Error state
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
              Installation Management {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">
              {isDemoMode 
                ? 'Viewing sample installation data - Sign in to manage real installations'
                : 'Manage dispatch, installation, and inspection process'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard 
            title="Ready for Dispatch" 
            value={readyForDispatch.length} 
            icon={Package} 
            color="bg-blue-500"
            isDemoMode={isDemoMode}
          />
          <StatCard 
            title="Dispatched" 
            value={dispatched.length} 
            icon={Truck} 
            color="bg-purple-500"
            isDemoMode={isDemoMode}
          />
          <StatCard 
            title="In Installation" 
            value={inInstallation.length} 
            icon={Wrench} 
            color="bg-orange-500"
            isDemoMode={isDemoMode}
          />
          <StatCard 
            title="Awaiting Inspection" 
            value={awaitingInspection.length} 
            icon={ClipboardCheck} 
            color="bg-yellow-500"
            isDemoMode={isDemoMode}
          />
          <StatCard 
            title="Completed" 
            value={installationCompleted.filter(e => e.status === 'active').length} 
            icon={ClipboardCheck} 
            color="bg-green-500"
            isDemoMode={isDemoMode}
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer name, ID, or area..."
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
                <option value="dispatch">Ready for Dispatch</option>
                <option value="installation">In Installation</option>
                <option value="inspection">Awaiting Inspection</option>
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
              <option value="dispatchDate">Dispatch Date</option>
              <option value="customerName">Customer Name</option>
              <option value="createdAt">Date Created</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
            
            <span className="text-sm text-gray-600 ml-auto">
              Showing {paginatedEnquiries.length} of {sortedEnquiries.length} installations
            </span>
          </div>
        </div>

        {/* Installation Cards */}
        <div className="space-y-6">
          {paginatedEnquiries.map((enquiry) => {
            // Determine which card to show
            if (enquiry.status === 'payment-received') {
              return <DispatchCard key={enquiry.id} enquiry={enquiry} onDispatch={handleDispatch} isDemoMode={isDemoMode} />;
            } else if (enquiry.status === 'dispatched' || enquiry.status === 'dispatch-pending' || 
                       enquiry.status === 'installation-pending' || (enquiry.dispatchDate && !enquiry.installationDate)) {
              return <InstallationCard key={enquiry.id} enquiry={enquiry} onComplete={handleInstallation} isDemoMode={isDemoMode} />;
            } else if (enquiry.installationDate && !enquiry.inspectionDate) {
              return <InspectionCard key={enquiry.id} enquiry={enquiry} onInspect={handleInspection} isDemoMode={isDemoMode} />;
            } else if (enquiry.status === 'installation-completed' || enquiry.status === 'active') {
              return <CompletedCard key={enquiry.id} enquiry={enquiry} />;
            }
            return null;
          })}
        </div>

        {sortedEnquiries.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No installations found matching your criteria</p>
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

function DispatchCard({ enquiry, onDispatch, isDemoMode }: any) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [transportCompany, setTransportCompany] = useState('');

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-600 mt-1">
            Payment Received: {enquiry.paymentDate?.toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Materials to Dispatch</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Solar Panels: {Math.ceil(enquiry.capacity * 3)} units (330W each)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Inverter: 1 unit ({enquiry.capacity}kW)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Mounting Structure: Complete set
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Wiring & Accessories: Complete kit
          </li>
        </ul>
      </div>

      {!isDispatching ? (
        <button 
          onClick={() => setIsDispatching(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Truck size={20} />
          Mark as Dispatched
        </button>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number *
            </label>
            <input 
              type="text" 
              placeholder="Enter shipment tracking number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transport Company *
            </label>
            <input 
              type="text" 
              placeholder="e.g., Transport Co. Ltd"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              value={transportCompany}
              onChange={(e) => setTransportCompany(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (!trackingNumber || !transportCompany) {
                  alert('Please fill in all required fields');
                  return;
                }
                onDispatch(enquiry.id, trackingNumber, transportCompany);
                setIsDispatching(false);
                setTrackingNumber('');
                setTransportCompany('');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Confirm Dispatch
            </button>
            <button 
              onClick={() => setIsDispatching(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InstallationCard({ enquiry, onComplete, isDemoMode }: any) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(installationTeams[0]);
  const [notes, setNotes] = useState('');

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-600 mt-1">
            Dispatched: {enquiry.dispatchDate?.toLocaleDateString()}
          </p>
          <p className="text-sm font-medium text-gray-700 mt-2">{enquiry.address}</p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      {!isCompleting ? (
        <button 
          onClick={() => setIsCompleting(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Wrench size={20} />
          Mark Installation Complete
        </button>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installation Team *
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              {installationTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installation Notes
            </label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              rows={3}
              placeholder="Enter installation details, any issues, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                onComplete(enquiry.id, selectedTeam, notes);
                setIsCompleting(false);
                setNotes('');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Complete Installation
            </button>
            <button 
              onClick={() => setIsCompleting(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InspectionCard({ enquiry, onInspect, isDemoMode }: any) {
  const [isInspecting, setIsInspecting] = useState(false);
  const [officer, setOfficer] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-600 mt-1">
            Installation Completed: {enquiry.installationDate?.toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Installed by: {enquiry.installedBy}
          </p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      {!isInspecting ? (
        <button 
          onClick={() => setIsInspecting(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
        >
          <ClipboardCheck size={20} />
          Record Inspection
        </button>
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
                onInspect(enquiry.id, true, officer, notes);
                setIsInspecting(false);
                setOfficer('');
                setNotes('');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              ✓ Approve
            </button>
            <button 
              onClick={() => {
                if (!officer) {
                  alert('Please enter inspector name');
                  return;
                }
                onInspect(enquiry.id, false, officer, notes);
                setIsInspecting(false);
                setOfficer('');
                setNotes('');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              ✗ Reject
            </button>
            <button 
              onClick={() => setIsInspecting(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletedCard({ enquiry }: any) {
  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <p>✓ Dispatched: {enquiry.dispatchDate?.toLocaleDateString()}</p>
            <p>✓ Installed: {enquiry.installationDate?.toLocaleDateString()} by {enquiry.installedBy}</p>
            {enquiry.inspectionDate && (
              <p>
                {enquiry.inspectionApproved ? '✓' : '✗'} Inspection: {enquiry.inspectionDate.toLocaleDateString()}
                {enquiry.inspectionApproved && ' - Approved'}
              </p>
            )}
            {enquiry.activationDate && (
              <p>✓ Activated: {enquiry.activationDate.toLocaleDateString()}</p>
            )}
          </div>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>
    </div>
  );
}
