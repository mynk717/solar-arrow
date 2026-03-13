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
  FileEdit,
  Share2,
  Phone,
  MapPin,
  Search
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function QuotationsPage() {
  const router = useRouter();
  const { quotations, loading, error } = useQuotations();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


  const handleMarkReady = async (quotationId: string) => {
    if (!confirm('Mark this quotation as ready to share with customer?')) return;
    
    setSendingId(quotationId);
    
    try {
      const response = await fetch('/api/quotations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as ready');
      }

      alert(`✅ Quotation is ready to share!\n\n📱 Click "Share" to send to customer.`);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-700 border-gray-300',
      'Ready': 'bg-blue-50 text-blue-700 border-blue-300',
      'Shared': 'bg-purple-50 text-purple-700 border-purple-300',
      'Viewed': 'bg-yellow-50 text-yellow-700 border-yellow-300',
      'Approved': 'bg-green-50 text-green-700 border-green-300',
      'Rejected': 'bg-red-50 text-red-700 border-red-300',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading quotations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-semibold">❌ {error}</p>
        </div>
      </div>
    );
  }

  const filteredQuotations = quotations
  .filter(q => {
    const matchesStatus = filterStatus
      ? (filterStatus === 'Shared' ? q.status === 'Shared' || q.status === 'Viewed' : q.status === filterStatus)
      : true;
    const matchesSearch = searchTerm
      ? q.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quotationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerPhone?.includes(searchTerm)
      : true;
    return matchesStatus && matchesSearch;
  })
  .sort((a, b) => new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime());

  return (
<div className="min-h-screen bg-gray-50 overflow-x-hidden pb-24">
<DemoBanner />

      {/* Mobile-optimized Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {quotations.length} total
              </p>
            </div>
            <button
              onClick={() => router.push('/quotation/create')}
              className="bg-blue-600 active:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg active:scale-95 transition-transform"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Create</span>
            </button>
          </div>

{/* Search Bar */}
<div className="relative mb-3">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
  <input
    type="text"
    placeholder="Search by name, ID, reference or phone..."
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 bg-white text-sm"
  />
</div>

         {/* Stats Grid */}
<div className="grid grid-cols-4 gap-2">
  <StatCard
    title="Draft"
    value={quotations.filter(q => q.status === 'Draft').length}
    Icon={FileEdit}
    color="gray"
    onClick={() => setFilterStatus(filterStatus === 'Draft' ? null : 'Draft')}
    active={filterStatus === 'Draft'}
  />
  <StatCard
    title="Ready"
    value={quotations.filter(q => q.status === 'Ready').length}
    Icon={PackageCheck}
    color="blue"
    onClick={() => setFilterStatus(filterStatus === 'Ready' ? null : 'Ready')}
    active={filterStatus === 'Ready'}
  />
  <StatCard
    title="Shared"
    value={quotations.filter(q => q.status === 'Shared' || q.status === 'Viewed').length}
    Icon={Share2}
    color="purple"
    onClick={() => setFilterStatus(filterStatus === 'Shared' ? null : 'Shared')}
    active={filterStatus === 'Shared'}
  />
  <StatCard
    title="Approved"
    value={quotations.filter(q => q.status === 'Approved').length}
    Icon={ThumbsUp}
    color="green"
    onClick={() => setFilterStatus(filterStatus === 'Approved' ? null : 'Approved')}
    active={filterStatus === 'Approved'}
  />
</div>


        </div>
      </div>

      {/* Quotations List - Mobile Cards */}
      <div className="p-4 space-y-3">
        {quotations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-700 font-semibold mb-2">No quotations yet</p>
            <p className="text-gray-500 text-sm mb-6">Create your first quotation</p>
            <button
              onClick={() => router.push('/quotation/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Quotation
            </button>
          </div>
        ) : (
          filteredQuotations.map((quot: any) => (
            <QuotationCard
              key={quot.quotationId}
              quotation={quot}
              onView={() => router.push(`/quotation/${quot.quotationId}`)}
              onMarkReady={() => handleMarkReady(quot.quotationId)}
              onShare={() => handleShare(quot)}
              isSending={sendingId === quot.quotationId}
              getStatusColor={getStatusColor}
            />
          ))
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

// Mobile-optimized Stat Card
function StatCard({ title, value, Icon, color, onClick, active }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  return (
    <div
      onClick={onClick}
      className={`${colors[color]} border-2 rounded-xl p-2.5 cursor-pointer active:scale-95 transition-transform ${active ? 'ring-2 ring-offset-1 ring-current' : ''}`}
    >
      <div className="flex items-center gap-1 mb-1">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-bold opacity-75">{title}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}


// Mobile-optimized Quotation Card
function QuotationCard({ 
  quotation, 
  onView, 
  onMarkReady, 
  onShare, 
  isSending,
  getStatusColor 
}: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden active:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono font-bold text-blue-600 truncate block">
                {quotation.quotationId}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(quotation.status)}`}>
                {quotation.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-0.5">
              {quotation.customerName}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 min-w-0">
  <span className="flex items-center gap-1 flex-shrink-0">
    <Phone size={14} />
    {quotation.customerPhone}
  </span>
  {quotation.location && (
    <span className="flex items-center gap-1 min-w-0">
      <MapPin size={14} className="flex-shrink-0" />
      <span className="truncate">{quotation.location}</span>
    </span>
  )}
</div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">System Capacity</p>
            <p className="text-lg font-bold text-gray-900">
              {quotation.systemCapacity} kW
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Final Amount</p>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(quotation.finalAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Valid until {new Date(quotation.validUntilDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          <span>By {quotation.createdBy?.split('@')[0]}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <button
          onClick={onView}
          className="flex-1 bg-gray-100 active:bg-gray-200 text-gray-900 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Eye size={18} />
          View
        </button>
        
        {quotation.status === 'Draft' && (
          <button
            onClick={onMarkReady}
            disabled={isSending}
            className="flex-1 bg-blue-600 active:bg-blue-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
          >
            {isSending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Mark Ready</span>
              </>
            )}
          </button>
        )}
        
        {(quotation.status === 'Ready' || quotation.status === 'Shared' || quotation.status === 'Viewed') && quotation.publicUrl && (
          <button
            onClick={onShare}
            className="flex-1 bg-green-600 active:bg-green-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Share2 size={18} />
            Share
          </button>
        )}
      </div>
    </div>
  );
}

// Mobile-optimized Share Modal
function ShareModal({ quotation, onClose, onCopy, copied }: any) {
  const openWhatsApp = () => {
    const phone = quotation.customerPhone.replace(/\D/g, '');
    const message = `Hi ${quotation.customerName}, here's your solar quotation: ${quotation.publicUrl}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
     <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Share Quotation</h3>
            <p className="text-sm text-gray-600 font-mono">{quotation.quotationId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Public Link */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-1">
              <Copy size={14} /> Public Link
            </label>
            <div className="flex gap-2 min-w-0">
  <input
    type="text"
    value={quotation.publicUrl}
    readOnly
    className="flex-1 min-w-0 px-3 py-2.5 border-2 border-gray-300 rounded-xl text-sm bg-gray-50 font-mono truncate"
  />
              <button
                onClick={() => onCopy(quotation.publicUrl)}
                className="bg-blue-600 active:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold active:scale-95 transition-transform"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with customer via WhatsApp, Email or SMS
            </p>
          </div>

          {/* WhatsApp Quick Share */}
          <button
            onClick={openWhatsApp}
            className="w-full bg-green-600 active:bg-green-700 text-white px-4 py-4 rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg active:scale-95 transition-transform"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="text-lg">Send via WhatsApp</span>
          </button>

          {/* QR Code */}
          {quotation.qrCodeUrl && (
            <div className="text-center border-t-2 border-gray-100 pt-4">
              <p className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-center gap-1">
                <Eye size={14} /> Or scan QR code
              </p>
              <img
                src={quotation.qrCodeUrl}
                alt="QR Code"
                className="mx-auto w-56 h-56 border-2 border-gray-200 rounded-2xl p-3"
              />
              <p className="text-xs text-gray-500 mt-3">
                Customer can scan this to view quotation
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 active:bg-gray-700 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
