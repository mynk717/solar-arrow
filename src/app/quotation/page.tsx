// src/app/quotation/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuotations } from '@/lib/useQuotations';
import { formatCurrency } from '@/lib/quotations';
import { 
  Plus, 
  Send, 
  Eye, 
  Copy, 
  CheckCircle, 
  Clock, 
  FileText,
  Loader2,
  QrCode 
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function QuotationsPage() {
  const router = useRouter();
  const { quotations, loading, error, sendQuotation } = useQuotations();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleSend = async (quotationId: string) => {
    if (!confirm('Send this quotation to the customer?')) return;
    
    setSendingId(quotationId);
    const success = await sendQuotation(quotationId);
    if (success) {
      alert('✅ Quotation sent successfully!');
    } else {
      alert('❌ Failed to send quotation');
    }
    setSendingId(null);
  };

  const handleShare = (quotation: any) => {
    setSelectedQuotation(quotation);
    setShowShareModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Viewed': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quotations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DemoBanner />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
            <p className="text-gray-600 mt-1">Create, manage and track solar quotations</p>
          </div>
          <button
            onClick={() => router.push('/quotation/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold shadow-md"
          >
            <Plus size={20} />
            Create Quotation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Quotations"
          value={quotations.length}
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Sent"
          value={quotations.filter(q => q.status === 'Sent' || q.status === 'Viewed').length}
          icon="📤"
          color="green"
        />
        <StatCard
          title="Approved"
          value={quotations.filter(q => q.status === 'Approved').length}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Draft"
          value={quotations.filter(q => q.status === 'Draft').length}
          icon="📝"
          color="gray"
        />
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {quotations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No quotations found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotation ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotations.map((quot: any) => (
                  <tr key={quot.quotationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">
                        {quot.quotationId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{quot.customerName}</div>
                      <div className="text-sm text-gray-500">{quot.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{quot.systemCapacity} kW</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(quot.finalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(quot.validUntilDate).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(quot.status)}`}>
                        {quot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => router.push(`/quotation/${quot.quotationId}`)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      
                      {quot.status === 'Draft' && (
                        <button
                          onClick={() => handleSend(quot.quotationId)}
                          disabled={sendingId === quot.quotationId}
                          className="text-green-600 hover:text-green-900 inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          {sendingId === quot.quotationId ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                          {sendingId === quot.quotationId ? 'Sending...' : 'Send'}
                        </button>
                      )}
                      
                      {(quot.status === 'Sent' || quot.status === 'Viewed') && (
                        <>
                          <button
                            onClick={() => handleShare(quot)}
                            className="text-purple-600 hover:text-purple-900 inline-flex items-center gap-1"
                          >
                            <Copy size={16} />
                            Share
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedQuotation && (
        <ShareModal
          quotation={selectedQuotation}
          onClose={() => setShowShareModal(false)}
          onCopy={copyToClipboard}
          copied={copiedUrl}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function ShareModal({ quotation, onClose, onCopy, copied }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Share Quotation {quotation.quotationId}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Public Link:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quotation.publicUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50"
              />
              <button
                onClick={() => onCopy(quotation.publicUrl)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {quotation.qrCodeUrl && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Scan to view:</p>
              <img
                src={quotation.qrCodeUrl}
                alt="QR Code"
                className="mx-auto w-48 h-48"
              />
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
