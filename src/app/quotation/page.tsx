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
  FileText,
  Loader2,
  X,
  ClipboardList,
  PackageCheck,
  ThumbsUp,
  FileEdit
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function QuotationsPage() {
  const router = useRouter();
  const { quotations, loading, error } = useQuotations();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleSend = async (quotationId: string) => {
    if (!confirm('Send this quotation to the customer?')) return;
    
    setSendingId(quotationId);
    
    try {
      const response = await fetch('/api/quotations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send');
      }

      alert(`✅ Quotation sent successfully!\n\n📱 Public Link:\n${data.publicUrl}`);
      window.location.reload();
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setSendingId(null);
    }
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
          Icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Sent"
          value={quotations.filter(q => q.status === 'Sent' || q.status === 'Viewed').length}
          Icon={PackageCheck}
          color="green"
        />
        <StatCard
          title="Approved"
          value={quotations.filter(q => q.status === 'Approved').length}
          Icon={ThumbsUp}
          color="green"
        />
        <StatCard
          title="Draft"
          value={quotations.filter(q => q.status === 'Draft').length}
          Icon={FileEdit}
          color="gray"
        />
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {quotations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No quotations found</p>
            <p className="text-gray-500 text-sm">Create your first quotation to get started</p>
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
                    Created By
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
                        {quot.createdBy?.split('@')[0] || 'Unknown'}
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
                      
                      {(quot.status === 'Sent' || quot.status === 'Viewed') && quot.publicUrl && (
                        <button
                          onClick={() => handleShare(quot)}
                          className="text-purple-600 hover:text-purple-900 inline-flex items-center gap-1"
                        >
                          <Copy size={16} />
                          Share
                        </button>
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
          onClose={() => {
            setShowShareModal(false);
            setCopiedUrl(false);
          }}
          onCopy={copyToClipboard}
          copied={copiedUrl}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, Icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  };

  return (
    <div className={`${colors[color].split(' ').slice(0, 2).join(' ')} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${colors[color].split(' ')[2]}`} />
      </div>
    </div>
  );
}

function ShareModal({ quotation, onClose, onCopy, copied }: any) {
  const openWhatsApp = () => {
    const phone = quotation.customerPhone.replace(/\D/g, '');
    const message = `Hi ${quotation.customerName}, here's your solar quotation: ${quotation.publicUrl}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Share Quotation {quotation.quotationId}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block flex items-center gap-1">
              <Copy size={14} /> Public Link (for customer):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quotation.publicUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 font-mono"
              />
              <button
                onClick={() => onCopy(quotation.publicUrl)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share this link with customer via WhatsApp, Email or SMS
            </p>
          </div>

          <button
            onClick={openWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Share via WhatsApp
          </button>

          {quotation.qrCodeUrl && (
            <div className="text-center border-t pt-4">
              <p className="text-sm text-gray-600 mb-3 flex items-center justify-center gap-1">
                <Eye size={14} /> Or scan QR code:
              </p>
              <img
                src={quotation.qrCodeUrl}
                alt="QR Code"
                className="mx-auto w-48 h-48 border-2 border-gray-200 rounded-lg p-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Customer can scan this to view quotation
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-bold transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
