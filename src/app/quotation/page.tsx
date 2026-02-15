// src/app/quotation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Download, Send, Loader2, Plus, RefreshCcw, Search, Filter, Eye, Share2, Clock } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';
import StatusBadge from '@/components/StatusBadge';
import type { Quotation } from '@/lib/quotations';
import { formatCurrency } from '@/lib/quotations';
import QRCode from 'qrcode';

export default function QuotationPage() {
  const { data: session, status } = useSession();
  const { isDemoMode } = useDemoMode();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [qrCode, setQrCode] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sorting & Pagination
  const [sortField, setSortField] = useState<'createdDate' | 'customerName' | 'finalAmount'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuotations();
  }, [status]);

  const fetchQuotations = async () => {
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }

    if (status === 'authenticated') {
      try {
        setLoading(true);
        const response = await fetch('/api/quotations/list');

        if (response.ok) {
          const data = await response.json();
          setQuotations(data.quotations || []);
        }
      } catch (error) {
        console.error('Error fetching quotations:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    if (isDemoMode) return;
    await fetchQuotations();
  };

  const handleSendQuotation = async (quotationId: string) => {
    if (isDemoMode) {
      alert('Demo mode - Cannot send quotation');
      return;
    }

    if (!confirm('Send this quotation to customer via WhatsApp/Email?')) {
      return;
    }

    try {
      const response = await fetch('/api/quotations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send quotation');
      }

      alert(`✅ Quotation sent successfully!\n\n📱 Share this link:\n${data.publicUrl}`);
      await fetchQuotations();
    } catch (error: any) {
      alert('❌ ' + error.message);
    }
  };

  const handleViewQuotation = async (quotation: Quotation) => {
    setSelectedQuotation(quotation);

    // Generate QR code
    try {
      const qr = await QRCode.toDataURL(quotation.publicUrl);
      setQrCode(qr);
    } catch (error) {
      console.error('QR generation failed:', error);
    }
  };

  const handleCopyLink = (quotation: Quotation) => {
    navigator.clipboard.writeText(quotation.publicUrl);
    alert('✅ Public link copied to clipboard!');
  };

  const handleShareWhatsApp = (quotation: Quotation) => {
    const message = `🌞 Solar Installation Quotation

Customer: ${quotation.customerName}
Capacity: ${quotation.systemCapacity} kW
System Type: ${quotation.systemType}

💰 Pricing:
Base Cost: ${formatCurrency(quotation.baseCost)}
GST (${quotation.gstPercentage}%): ${formatCurrency(quotation.gstAmount)}
Total: ${formatCurrency(quotation.totalCost)}
${quotation.subsidyAmount > 0 ? `Subsidy: -${formatCurrency(quotation.subsidyAmount)}\n` : ''}
**Final Amount: ${formatCurrency(quotation.finalAmount)}**

📋 View detailed quotation: ${quotation.publicUrl}

Valid until: ${new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}

📞 Contact: ${quotation.companyPhone}`;

    const whatsappUrl = `https://wa.me/${quotation.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Filter, sort, paginate
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quotationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.leadId && q.leadId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || q.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    let comparison = 0;

    if (sortField === 'customerName') {
      comparison = a.customerName.localeCompare(b.customerName);
    } else if (sortField === 'createdDate') {
      comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    } else if (sortField === 'finalAmount') {
      comparison = a.finalAmount - b.finalAmount;
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

  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading quotations...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'Draft').length,
    sent: quotations.filter(q => q.status === 'Sent').length,
    viewed: quotations.filter(q => q.status === 'Viewed').length,
    approved: quotations.filter(q => q.status === 'Approved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Quotations {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">Create, manage and track solar quotations</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleRefresh}
              disabled={isDemoMode}
              className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
            >
              <RefreshCcw size={20} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => !isDemoMode && (window.location.href = '/quotation/create')}
              disabled={isDemoMode}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
            >
              <Plus size={20} />
              New Quotation
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard title="Total" value={stats.total} color="bg-blue-600" icon={FileText} />
          <StatCard title="Draft" value={stats.draft} color="bg-gray-600" icon={Clock} />
          <StatCard title="Sent" value={stats.sent} color="bg-yellow-600" icon={Send} />
          <StatCard title="Viewed" value={stats.viewed} color="bg-purple-600" icon={Eye} />
          <StatCard title="Approved" value={stats.approved} color="bg-green-600" icon={FileText} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search quotations..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-900 font-semibold"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-bold text-gray-900">Sort by:</label>
            <select
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
            >
              <option value="createdDate">Date Created</option>
              <option value="customerName">Customer Name</option>
              <option value="finalAmount">Final Cost</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-semibold"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>

            <span className="text-sm text-gray-700 font-medium ml-auto">
              Showing {paginatedQuotations.length} of {sortedQuotations.length}
            </span>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Quotation ID</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Customer</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Capacity</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Final Amount</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Valid Until</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuotations.map(quot => (
                  <tr key={quot.quotationId} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6 font-mono font-semibold text-gray-900">{quot.quotationId}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{quot.customerName}</div>
                      <div className="text-sm font-medium text-gray-700">{quot.customerPhone}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{quot.systemCapacity} kW</td>
                    <td className="py-4 px-6 font-bold text-green-700">{formatCurrency(quot.finalAmount)}</td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-700">
                      {new Date(quot.validUntilDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <QuotationStatusBadge status={quot.status} viewCount={quot.viewCount} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewQuotation(quot)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        {quot.status === 'Draft' && (
                          <button
                            onClick={() => handleSendQuotation(quot.quotationId)}
                            disabled={isDemoMode}
                            className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 disabled:opacity-50"
                            title="Send Quotation"
                          >
                            <Send size={18} />
                          </button>
                        )}

                        {(quot.status === 'Sent' || quot.status === 'Viewed') && (
                          <>
                            <button
                              onClick={() => handleShareWhatsApp(quot)}
                              className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                              title="Share via WhatsApp"
                            >
                              💬
                            </button>
                            <button
                              onClick={() => handleCopyLink(quot)}
                              className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50"
                              title="Copy Link"
                            >
                              <Share2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedQuotations.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold text-lg">No quotations found</p>
              <p className="text-gray-600 mt-2">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t-2 border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold"
              >
                Previous
              </button>

              <span className="text-sm text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold"
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
            qrCode={qrCode}
            onClose={() => {
              setSelectedQuotation(null);
              setQrCode('');
            }}
            onSend={() => handleSendQuotation(selectedQuotation.quotationId)}
            onShareWhatsApp={() => handleShareWhatsApp(selectedQuotation)}
            onCopyLink={() => handleCopyLink(selectedQuotation)}
            isDemoMode={isDemoMode}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-bold">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function QuotationStatusBadge({ status, viewCount }: { status: string; viewCount: number }) {
  const config: Record<string, { color: string; label: string }> = {
    Draft: { color: 'bg-gray-100 text-gray-900 border-gray-300', label: 'Draft' },
    Sent: { color: 'bg-yellow-100 text-yellow-900 border-yellow-400', label: 'Sent' },
    Viewed: { color: 'bg-blue-100 text-blue-900 border-blue-400', label: `Viewed (${viewCount})` },
    Approved: { color: 'bg-green-100 text-green-900 border-green-400', label: 'Approved' },
    Rejected: { color: 'bg-red-100 text-red-900 border-red-300', label: 'Rejected' },
  };

  const { color, label } = config[status] || config.Draft;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 ${color}`}>
      {label}
    </span>
  );
}

function QuotationModal({ quotation, qrCode, onClose, onSend, onShareWhatsApp, onCopyLink, isDemoMode }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b-2 border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quotation Details</h2>
            <p className="text-sm font-mono text-gray-600 mt-1">{quotation.quotationId}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <Section title="Customer Information">
            <InfoRow label="Name" value={quotation.customerName} />
            <InfoRow label="Phone" value={quotation.customerPhone} />
            <InfoRow label="Email" value={quotation.customerEmail} />
            <InfoRow label="Location" value={quotation.location} />
            <InfoRow label="Premises" value={quotation.premisesType} />
          </Section>

          {/* System Details */}
          <Section title="System Details">
            <InfoRow label="Capacity" value={`${quotation.systemCapacity} kW`} />
            <InfoRow label="System Type" value={quotation.systemType} />
            <InfoRow label="Panel Type" value={quotation.panelType} />
            <InfoRow label="Panel Make" value={`${quotation.panelMake} (${quotation.panelWattage}Wp × ${quotation.panelQuantity})`} />
            <InfoRow label="Inverter" value={`${quotation.inverterMake} ${quotation.inverterModel}`} />
          </Section>

          {/* Pricing */}
          <Section title="Cost Breakdown">
            <InfoRow label="Base Cost" value={formatCurrency(quotation.baseCost)} />
            <InfoRow label={`GST (${quotation.gstPercentage}%)`} value={formatCurrency(quotation.gstAmount)} />
            <InfoRow label="Total Cost" value={formatCurrency(quotation.totalCost)} valueClass="font-bold" />
            {quotation.subsidyAmount > 0 && (
              <InfoRow label="Subsidy" value={`- ${formatCurrency(quotation.subsidyAmount)}`} valueClass="text-green-600 font-bold" />
            )}
            <div className="pt-3 border-t-2 border-gray-300">
              <InfoRow label="Final Amount" value={formatCurrency(quotation.finalAmount)} valueClass="text-xl font-bold text-green-700" />
            </div>
          </Section>

          {/* Status & Tracking */}
          <Section title="Status & Tracking">
            <InfoRow label="Status" value={<QuotationStatusBadge status={quotation.status} viewCount={quotation.viewCount} />} />
            <InfoRow label="Created" value={new Date(quotation.createdDate).toLocaleString('en-IN')} />
            {quotation.sentDate && <InfoRow label="Sent" value={new Date(quotation.sentDate).toLocaleString('en-IN')} />}
            {quotation.firstViewedDate && <InfoRow label="First Viewed" value={new Date(quotation.firstViewedDate).toLocaleString('en-IN')} />}
            <InfoRow label="Valid Until" value={new Date(quotation.validUntilDate).toLocaleDateString('en-IN')} />
          </Section>

          {/* Public Link & QR */}
          {(quotation.status === 'Sent' || quotation.status === 'Viewed') && (
            <Section title="Share Quotation">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Public Link:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quotation.publicUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-mono text-gray-900"
                  />
                  <button
                    onClick={onCopyLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {qrCode && (
                <div className="text-center mt-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">Scan to view:</p>
                  <img src={qrCode} alt="QR Code" className="mx-auto border-2 border-gray-300 rounded-lg" width={180} height={180} />
                </div>
              )}
            </Section>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-gray-200">
            {quotation.status === 'Draft' && (
              <button
                onClick={() => {
                  if (isDemoMode) return;
                  onSend();
                  onClose();
                }}
                disabled={isDemoMode}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold disabled:opacity-50"
              >
                <Send size={20} />
                Send Quotation
              </button>
            )}

            {(quotation.status === 'Sent' || quotation.status === 'Viewed') && (
              <button
                onClick={onShareWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold"
              >
                💬 WhatsApp
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">{title}</h3>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClass = 'text-gray-900 font-semibold' }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
      <span className="text-gray-700 font-bold text-sm">{label}:</span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}