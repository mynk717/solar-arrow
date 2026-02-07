// src/app/enquiries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Enquiry, EnquiryStatus } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { Search, Filter, Plus, Eye, Loader2, RefreshCcw } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';
import DemoBanner from '@/components/DemoBanner';
import { demoEnquiries } from '@/lib/demoData';
import { useDemoMode } from '@/contexts/DemoContext';

export default function EnquiriesPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  
  const [enquiries, setEnquiries] = useState<Enquiry[]>(demoEnquiries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'all'>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<'createdAt' | 'customerName' | 'capacity'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch enquiries from API or use demo data
  useEffect(() => {
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
          
          if (!response.ok) {
            throw new Error('Failed to fetch enquiries');
          }
          
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
    
    fetchData();
  }, [status]);

  // Filter, Sort, and Paginate
  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch = 
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedEnquiries = [...filteredEnquiries].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'createdAt') {
      comparison = a.createdAt.getTime() - b.createdAt.getTime();
    } else if (sortField === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'capacity') {
      comparison = a.capacity - b.capacity;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalPages = Math.ceil(sortedEnquiries.length / itemsPerPage);
  const paginatedEnquiries = sortedEnquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Handle form submission
  const handleFormSubmit = (newEnquiry: Enquiry) => {
    if (isDemoMode) {
      showDemoAlert();
      setShowForm(false);
      return;
    }
    
    setEnquiries(prev => [newEnquiry, ...prev]);
    setShowForm(false);
  };

  // Refresh data
  const handleRefresh = async () => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/enquiries');
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
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading enquiries...</p>
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
              Enquiry Management {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">
              {isDemoMode 
                ? 'Viewing sample enquiry data - Sign in to manage real enquiries'
                : 'Manage all customer enquiries'
              }
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCcw size={20} />
              Refresh
            </button>
            
            <button 
              onClick={() => {
                if (isDemoMode) {
                  showDemoAlert();
                } else {
                  setShowForm(true);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              New Enquiry
            </button>
          </div>
        </div>

        {showForm && !isDemoMode && (
          <EnquiryForm
            onClose={() => setShowForm(false)}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* Filters & Sort */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, ID, or phone..."
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
                <option value="new">New</option>
                <option value="survey_pending">Survey Pending</option>
                <option value="survey_completed">Survey Completed</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="payment_received">Payment Received</option>
                <option value="installation_completed">Installation Completed</option>
                <option value="active">Active</option>
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
              <option value="createdAt">Date Created</option>
              <option value="customerName">Customer Name</option>
              <option value="capacity">Capacity</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
            
            <span className="text-sm text-gray-600 ml-auto">
              Showing {paginatedEnquiries.length} of {sortedEnquiries.length} enquiries
            </span>
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer Details</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Capacity</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{enquiry.id}</td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{enquiry.customerName}</div>
                        <div className="text-sm text-gray-600">{enquiry.phone}</div>
                        <div className="text-sm text-gray-600">{enquiry.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{enquiry.area}</div>
                        <div className="text-gray-600">{enquiry.address}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">{enquiry.capacity} kW</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={enquiry.status} />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {enquiry.createdAt.toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedEnquiry(enquiry)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedEnquiries.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              No enquiries found matching your criteria
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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

        {/* Enquiry Details Modal */}
        {selectedEnquiry && (
          <EnquiryModal 
            enquiry={selectedEnquiry} 
            onClose={() => setSelectedEnquiry(null)} 
          />
        )}
      </div>
    </div>
  );
}


function EnquiryModal({ enquiry, onClose }: { enquiry: Enquiry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Enquiry Details - {enquiry.id}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <Section title="Customer Information">
            <InfoRow label="Name" value={enquiry.customerName} />
            <InfoRow label="Phone" value={enquiry.phone} />
            <InfoRow label="Email" value={enquiry.email} />
            <InfoRow label="Address" value={enquiry.address} />
            <InfoRow label="Area" value={enquiry.area} />
          </Section>

          <Section title="Project Details">
            <InfoRow label="Capacity" value={`${enquiry.capacity} kW`} />
            <InfoRow label="Panel Tag" value={enquiry.panelTag} />
            <InfoRow label="Payment Type" value={enquiry.paymentType} />
            <InfoRow label="Status" value={<StatusBadge status={enquiry.status} />} />
            <InfoRow label="Created" value={enquiry.createdAt.toLocaleDateString()} />
          </Section>

          {enquiry.surveyDate && (
            <Section title="Survey Information">
              <InfoRow label="Survey Date" value={enquiry.surveyDate.toLocaleDateString()} />
              <InfoRow label="Surveyed By" value={enquiry.surveyedBy || '-'} />
              <InfoRow label="Survey Notes" value={enquiry.surveyNotes || '-'} />
              <InfoRow label="Approved" value={enquiry.surveyApproved ? '✅ Yes' : '❌ No'} />
            </Section>
          )}

          {enquiry.registrationId && (
            <Section title="Registration Details">
              <InfoRow label="Registration ID" value={enquiry.registrationId} />
              <InfoRow label="Registration Date" value={enquiry.registrationDate?.toLocaleDateString()} />
              <InfoRow label="Vendor Name" value={enquiry.vendorName || '-'} />
            </Section>
          )}

          {enquiry.estimatedCost && (
            <Section title="Payment Information">
              <InfoRow label="Estimated Cost" value={`₹${enquiry.estimatedCost.toLocaleString()}`} />
              <InfoRow label="Initial Payment" value={`₹${enquiry.initialPayment?.toLocaleString()}`} />
              <InfoRow label="Payment Date" value={enquiry.paymentDate?.toLocaleDateString()} />
              <InfoRow label="Payment Method" value={enquiry.paymentMethod || '-'} />
            </Section>
          )}

          {enquiry.installationDate && (
            <Section title="Installation Details">
              <InfoRow label="Dispatch Date" value={enquiry.dispatchDate?.toLocaleDateString()} />
              <InfoRow label="Installation Date" value={enquiry.installationDate?.toLocaleDateString()} />
              <InfoRow label="Installed By" value={enquiry.installedBy || '-'} />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 bg-gray-50 rounded-lg p-4">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="text-gray-700 font-medium">{label}:</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
