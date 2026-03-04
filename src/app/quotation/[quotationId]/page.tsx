// src/app/quotation/[quotationId]/page.tsx
'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Share2, Copy, Loader2, ExternalLink, Edit, CheckCircle, Eye, MessageCircle, Download, ChevronDown, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/quotations';

interface Quotation {
  quotationId: string;
  referenceNumber: string;
  organizationId: string;
  organizationName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  location: string;
  premisesType: string;
  systemCapacity: number;
  systemType: string;
  panelType: string;
  panelMake: string;
  panelModel: string;
  panelWattage: number;
  panelQuantity: number;
  inverterMake: string;
  inverterModel: string;
  inverterCapacity: number;
  baseCost: number;
  gstPercentage: number;
  gstAmount: number;
  totalCost: number;
  subsidyAmount: number;
  finalAmount: number;
  status: string;
  createdBy: string;
  createdDate: string;
  sentBy?: string;
  sentDate?: string;
  viewCount: number;
  firstViewedDate?: string;
  lastViewedDate?: string;
  validUntilDate: string;
  publicUrl: string;
  qrCodeUrl?: string;
  pdfUrl?: string;
  notes: string;
  termsAndConditions: string;
  leadId?: string;
  enquiryId?: string;
  quotationType?: string;
  panelWarranty?: string;
  inverterWarranty?: string;
  inverterQuantity?: number;
  advancePercentage?: number;
  preDispatchPercentage?: number;
  preGridPercentage?: number;
  paymentTerms?: string;
  publicToken?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export default function QuotationDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ quotationId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { data: session } = useSession();
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
const [generatingLink, setGeneratingLink] = useState(false);


  useEffect(() => {
    if (session) {
      fetchQuotation();
    }
  }, [params.quotationId, session]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotations/${params.quotationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotation');
      }

      const data = await response.json();
      setQuotation(data.quotation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // REPLACE handleSend entirely with:

const generateLink = async () => {
  try {
    setGeneratingLink(true);
    const response = await fetch('/api/quotations/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotationId: params.quotationId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to generate link');
    await fetchQuotation(); // refresh to get updated publicUrl
  } catch (err: any) {
    alert('❌ ' + err.message);
  } finally {
    setGeneratingLink(false);
  }
};

const hasValidLink =
  !!quotation?.publicUrl &&
  quotation.publicUrl.includes('token=') &&
  quotation.publicUrl.includes('/q/');

const shareViaWhatsApp = () => {
  if (!quotation?.publicUrl) return;
  const text = encodeURIComponent(
    `Hi ${quotation.customerName},\n\nPlease find your Solar Installation Quotation:\n🔗 ${quotation.publicUrl}\n\nCapacity: ${quotation.systemCapacity} kWp | Amount: ₹${quotation.finalAmount.toLocaleString('en-IN')}\nValid Until: ${new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}\n\n- ${quotation.organizationName}`
  );
  window.open(`https://wa.me/${quotation.customerPhone?.replace(/\D/g, '')}?text=${text}`, '_blank');
  setShareOpen(false);
};

const shareViaEmail = () => {
  if (!quotation?.publicUrl) return;
  const subject = encodeURIComponent(`Solar Quotation - ${quotation.referenceNumber}`);
  const body = encodeURIComponent(
    `Dear ${quotation.customerName},\n\nPlease find your Solar Installation Quotation at:\n${quotation.publicUrl}\n\nFinal Amount: ₹${quotation.finalAmount.toLocaleString('en-IN')}\nValid Until: ${new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}\n\nRegards,\n${quotation.organizationName}`
  );
  window.open(`mailto:${quotation.customerEmail}?subject=${subject}&body=${body}`, '_blank');
  setShareOpen(false);
};

  const copyLink = () => {
    if (quotation?.publicUrl) {
      navigator.clipboard.writeText(quotation.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-medium">❌ {error || 'Quotation not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/quotation')}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quotation {quotation.quotationId}
              </h1>
              <p className="text-gray-600">Reference: {quotation.referenceNumber}</p>
            </div>
          </div>

          {/* Actions */}
<div className="flex items-center gap-2 relative">

{/* View Public Page — always visible if link exists */}
{hasValidLink && (
  <a
    href={quotation.publicUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm"
  >
    <ExternalLink size={15} />
    Preview
  </a>
)}

{/* Generate Link — shown when no valid link exists */}
{!hasValidLink && (
  <button
    onClick={generateLink}
    disabled={generatingLink}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm disabled:opacity-50"
  >
    {generatingLink ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />}
    {generatingLink ? 'Generating...' : 'Generate Link'}
  </button>
)}

{/* Share dropdown — only when valid link exists */}
{hasValidLink && (
  <div className="relative">
    <button
      onClick={() => setShareOpen((prev) => !prev)}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm"
    >
      <Share2 size={15} />
      Share
      <ChevronDown size={14} />
    </button>

    {shareOpen && (
      <>
        {/* Backdrop to close dropdown */}
        <div className="fixed inset-0 z-10" onClick={() => setShareOpen(false)} />
        <div className="absolute right-0 top-11 z-20 bg-white border border-gray-200 rounded-xl shadow-xl w-52 overflow-hidden">
          <button
            onClick={shareViaWhatsApp}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
          >
            <MessageCircle size={16} className="text-green-500" />
            WhatsApp
          </button>
          <button
            onClick={shareViaEmail}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition border-t border-gray-100"
          >
            <ExternalLink size={16} className="text-blue-500" />
            Email
          </button>
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition border-t border-gray-100"
          >
            {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          {quotation.pdfUrl && (
            <a
              href={quotation.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition border-t border-gray-100"
              onClick={() => setShareOpen(false)}
            >
              <Download size={16} className="text-orange-500" />
              Download PDF
            </a>
          )}
        </div>
      </>
    )}
  </div>
)}

{/* Resend/regenerate link for already-sent quotations with broken URLs */}
{hasValidLink && (
  <button
    onClick={generateLink}
    disabled={generatingLink}
    title="Regenerate link"
    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
  >
    {generatingLink ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
  </button>
)}

</div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Status</h2>
                <StatusBadge status={quotation.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Created By</p>
                  <p className="font-medium">{quotation.createdBy?.split('@')[0]}</p>
                </div>
                <div>
                  <p className="text-gray-600">Created Date</p>
                  <p className="font-medium">{new Date(quotation.createdDate).toLocaleDateString('en-IN')}</p>
                </div>
                {quotation.sentBy && (
                  <>
                    <div>
                      <p className="text-gray-600">Sent By</p>
                      <p className="font-medium">{quotation.sentBy.split('@')[0]}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sent Date</p>
                      <p className="font-medium">{new Date(quotation.sentDate!).toLocaleDateString('en-IN')}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-gray-600">Views</p>
                  <p className="font-medium flex items-center gap-1">
                    <Eye size={14} />
                    {quotation.viewCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Valid Until</p>
                  <p className="font-medium">{new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}</p>
                </div>
                {/* ADD after Valid Until div: */}
{quotation.leadId && (
  <div>
    <p className="text-gray-600">Lead ID</p>
    <p className="font-medium font-mono text-xs">{quotation.leadId}</p>
  </div>
)}
{quotation.enquiryId && (
  <div>
    <p className="text-gray-600">Enquiry ID</p>
    <p className="font-medium font-mono text-xs">{quotation.enquiryId}</p>
  </div>
)}
{quotation.firstViewedDate && (
  <div>
    <p className="text-gray-600">First Viewed</p>
    <p className="font-medium">{new Date(quotation.firstViewedDate).toLocaleDateString('en-IN')}</p>
  </div>
)}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Name" value={quotation.customerName} />
                <InfoField label="Phone" value={quotation.customerPhone} />
                <InfoField label="Email" value={quotation.customerEmail || 'N/A'} />
                <InfoField label="Location" value={quotation.location} />
                <InfoField label="Address" value={quotation.customerAddress} fullWidth />
                <InfoField label="Premises Type" value={quotation.premisesType} />
              </div>
            </div>

            {/* System Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">System Configuration</h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Capacity" value={`${quotation.systemCapacity} kW`} />
                <InfoField label="Type" value={quotation.systemType} />
                <InfoField label="Panel Make" value={quotation.panelMake} />
                <InfoField label="Panel Model" value={quotation.panelModel || 'N/A'} />
                <InfoField label="Panel Wattage" value={`${quotation.panelWattage}W`} />
                <InfoField label="Panel Quantity" value={quotation.panelQuantity} />
                <InfoField label="Inverter Make" value={quotation.inverterMake} />
                <InfoField label="Inverter Capacity" value={`${quotation.inverterCapacity} kVA`} />
              </div>
            </div>

            {/* Notes */}
            {quotation.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Pricing */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Pricing</h2>
              <div className="space-y-3">
                <PriceRow label="Base Cost" value={quotation.baseCost} />
                <PriceRow label={`GST (${quotation.gstPercentage}%)`} value={quotation.gstAmount} />
                <PriceRow label="Total Cost" value={quotation.totalCost} />
                {quotation.subsidyAmount > 0 && (
                  <PriceRow 
                    label="Subsidy" 
                    value={-quotation.subsidyAmount} 
                    className="text-green-300" 
                  />
                )}
                <div className="pt-3 border-t-2 border-white/30">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Final Amount:</span>
                    <span className="text-3xl font-bold">
                      {formatCurrency(quotation.finalAmount)}
                    </span>
                  </div>
                  <p className="text-center text-xs text-blue-100 mt-2">
                    ₹{(quotation.finalAmount / (quotation.systemCapacity * 1000)).toFixed(2)}/Watt
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {quotation.qrCodeUrl && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <h3 className="text-sm font-medium text-gray-700 mb-3">QR Code</h3>
                <img
                  src={quotation.qrCodeUrl}
                  alt="QR Code"
                  className="mx-auto w-48 h-48"
                />
                <p className="text-xs text-gray-500 mt-2">Scan to view quotation</p>
              </div>
            )}

            
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Ready: 'bg-indigo-100 text-indigo-800',
    Sent: 'bg-blue-100 text-blue-800',
    Viewed: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
}

function InfoField({ label, value, fullWidth = false }: any) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}

function PriceRow({ label, value, className = '' }: any) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span>{label}:</span>
      <span className={`font-bold ${className}`}>
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
