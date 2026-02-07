// src/app/quotation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Download, Send, Loader2, Plus, RefreshCcw, Search, Filter, Eye } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';
import StatusBadge from '@/components/StatusBadge';

const demoQuotations = [
  {
    id: 'QUOT-001',
    enquiryId: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    panelType: 'Monocrystalline',
    systemCost: 250000,
    subsidyAmount: 78000,
    finalCost: 172000,
    validTill: new Date('2026-02-15'),
    status: 'sent',
    createdAt: new Date('2026-01-20'),
  },
  {
    id: 'QUOT-002',
    enquiryId: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    panelType: 'Polycrystalline',
    systemCost: 150000,
    subsidyAmount: 78000,
    finalCost: 72000,
    validTill: new Date('2026-02-20'),
    status: 'approved',
    createdAt: new Date('2026-01-22'),
  },
];

export default function QuotationPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [quotations, setQuotations] = useState(demoQuotations);
  const [loading, setLoading] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'approved' | 'rejected'>('all');
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState<'createdAt' | 'customerName' | 'finalCost'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [status]);

  const fetchData = async () => {
    if (status === 'unauthenticated') {
      setQuotations(demoQuotations);
      setLoading(false);
      return;
    }

    if (status === 'authenticated') {
      try {
        setLoading(true);
        const response = await fetch('/api/quotations');
        if (response.ok) {
          const data = await response.json();
          
          const quotationsWithDates = data.map((q: any) => ({
            ...q,
            createdAt: new Date(q.createdAt),
            validTill: new Date(q.validTill),
          }));
          
          setQuotations(quotationsWithDates);
        } else {
          setQuotations(demoQuotations);
        }
      } catch (error) {
        console.error('Error fetching quotations:', error);
        setQuotations(demoQuotations);
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
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.enquiryId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'createdAt') {
      comparison = a.createdAt.getTime() - b.createdAt.getTime();
    } else if (sortField === 'finalCost') {
      comparison = a.finalCost - b.finalCost;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalPages = Math.ceil(sortedQuotations.length / itemsPerPage);
  const paginatedQuotations = sortedQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleGeneratePDF = async (quotId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/quotations/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId: quotId }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quotId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('✅ PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Failed to generate PDF. Please try again.');
    }
  };

  const handleSendEmail = async (quotId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/quotations/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId: quotId }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      await fetchData();
      alert('✅ Quotation sent via email! Telegram notification sent.');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Failed to send email. Please try again.');
    }
  };

  const handleApproveReject = async (quotId: string, approved: boolean) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/quotations/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quotationId: quotId,
          status: approved ? 'approved' : 'rejected'
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      await fetchData();
      alert(`✅ Quotation ${approved ? 'approved' : 'rejected'}! Telegram notification sent.`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update status. Please try again.');
    }
  };
// Add these handler functions after handleApproveReject:

const handleShare = async (quotation: any, method: 'email' | 'whatsapp' | 'copy') => {
  if (isDemoMode) {
    showDemoAlert();
    return;
  }

  const shareText = `
Solar Installation Quotation

Customer: ${quotation.customerName}
Capacity: ${quotation.capacity}
System Cost: ₹${quotation.systemCost.toLocaleString()}
Subsidy: ₹${quotation.subsidyAmount.toLocaleString()}
Final Cost: ₹${quotation.finalCost.toLocaleString()}

Valid Till: ${quotation.validTill.toLocaleDateString()}

Contact us for more details!
  `.trim();

  const pdfUrl = `${window.location.origin}/api/quotations/generate-pdf?id=${quotation.id}`;

  switch (method) {
    case 'email':
      window.location.href = `mailto:?subject=Solar Installation Quotation - ${quotation.id}&body=${encodeURIComponent(shareText)}`;
      break;
    
    case 'whatsapp':
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
      break;
    
    case 'copy':
      try {
        await navigator.clipboard.writeText(shareText);
        alert('✅ Quotation details copied to clipboard!');
      } catch (error) {
        console.error('Copy failed:', error);
        alert('❌ Failed to copy. Please try again.');
      }
      break;
  }
};

  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quotations...</p>
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
              Quotations {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">Generate and send quotations to customers</p>
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
              onClick={() => isDemoMode ? showDemoAlert() : setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              New Quotation
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Quotations" value={quotations.length} color="bg-blue-500" />
          <StatCard title="Sent" value={quotations.filter(q => q.status === 'sent').length} color="bg-yellow-500" />
          <StatCard title="Approved" value={quotations.filter(q => q.status === 'approved').length} color="bg-green-500" />
          <StatCard title="Rejected" value={quotations.filter(q => q.status === 'rejected').length} color="bg-red-500" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by customer, quotation ID, or enquiry ID..."
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
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
              <option value="finalCost">Final Cost</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
            
            <span className="text-sm text-gray-600 ml-auto">
              Showing {paginatedQuotations.length} of {sortedQuotations.length} quotations
            </span>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Quotation ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Capacity</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">System Cost</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Subsidy</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Final Cost</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Valid Till</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
  {paginatedQuotations.map(quot => (
    <tr key={quot.id} className="border-t border-gray-200 hover:bg-gray-50">
      <td className="py-4 px-6 font-medium text-gray-900">{quot.id}</td>
      <td className="py-4 px-6">
        <div>
          <div className="font-medium text-gray-900">{quot.customerName}</div>
          <div className="text-sm text-gray-600">{quot.enquiryId}</div>
        </div>
      </td>
      <td className="py-4 px-6 text-gray-700">{quot.capacity}</td>
      <td className="py-4 px-6 text-gray-700">₹{quot.systemCost.toLocaleString()}</td>
      <td className="py-4 px-6 text-green-600">₹{quot.subsidyAmount.toLocaleString()}</td>
      <td className="py-4 px-6 font-bold text-green-700">₹{quot.finalCost.toLocaleString()}</td>
      <td className="py-4 px-6 text-sm text-gray-700">{quot.validTill.toLocaleDateString()}</td>
      <td className="py-4 px-6">
        <StatusBadge status={quot.status as any} />
      </td>
      <td className="py-4 px-6">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedQuotation(quot)}
            className="text-blue-600 hover:text-blue-700"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleGeneratePDF(quot.id)}
            className="text-blue-600 hover:text-blue-700"
            title="Download PDF"
          >
            <Download size={18} />
          </button>
          
          {/* Share Dropdown */}
          <div className="relative group">
            <button
              className="text-green-600 hover:text-green-700"
              title="Share"
            >
              <Send size={18} />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleShare(quot, 'email')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2 rounded-t-lg"
              >
                📧 Email
              </button>
              <button
                onClick={() => handleShare(quot, 'whatsapp')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={() => handleShare(quot, 'copy')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2 rounded-b-lg"
              >
                📋 Copy
              </button>
            </div>
          </div>
          
          {quot.status === 'draft' && (
            <button
              onClick={() => handleSendEmail(quot.id)}
              className="text-purple-600 hover:text-purple-700"
              title="Send via Email"
            >
              <FileText size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>

          {sortedQuotations.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              No quotations found matching your criteria
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

        {/* Quotation Details Modal */}
        {selectedQuotation && (
          <QuotationModal 
            quotation={selectedQuotation} 
            onClose={() => setSelectedQuotation(null)}
            onApprove={() => handleApproveReject(selectedQuotation.id, true)}
            onReject={() => handleApproveReject(selectedQuotation.id, false)}
            onDownload={() => handleGeneratePDF(selectedQuotation.id)}
            isDemoMode={isDemoMode}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          <FileText size={24} />
        </div>
      </div>
    </div>
  );
}

function QuotationModal({ quotation, onClose, onApprove, onReject, onDownload, isDemoMode }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Quotation Details - {quotation.id}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-2xl">
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <InfoRow label="Customer Name" value={quotation.customerName} />
              <InfoRow label="Enquiry ID" value={quotation.enquiryId} />
              <InfoRow label="Capacity" value={quotation.capacity} />
              <InfoRow label="Panel Type" value={quotation.panelType} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cost Breakdown</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <InfoRow label="System Cost" value={`₹${quotation.systemCost.toLocaleString()}`} />
              <InfoRow label="Subsidy Amount" value={`₹${quotation.subsidyAmount.toLocaleString()}`} valueClass="text-green-600" />
              <div className="pt-2 border-t">
                <InfoRow label="Final Cost" value={`₹${quotation.finalCost.toLocaleString()}`} valueClass="text-lg font-bold text-green-700" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quotation Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <InfoRow label="Created On" value={quotation.createdAt.toLocaleDateString()} />
              <InfoRow label="Valid Till" value={quotation.validTill.toLocaleDateString()} />
              <InfoRow label="Status" value={<StatusBadge status={quotation.status} />} />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => {
                if (isDemoMode) return;
                onDownload();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download PDF
            </button>
            
            {quotation.status === 'sent' && (
              <>
                <button
                  onClick={() => {
                    if (isDemoMode) return;
                    onApprove();
                    onClose();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    if (isDemoMode) return;
                    onReject();
                    onClose();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClass = 'text-gray-900' }: any) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="text-gray-700 font-medium">{label}:</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
