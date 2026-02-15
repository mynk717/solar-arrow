// src/app/q/[orgId]/[quotationId]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import Image from 'next/image';

interface Quotation {
  quotationId: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  location: string;
  systemCapacity: number;
  systemType: string;
  panelType: string;
  panelMake: string;
  panelModel: string;
  panelWattage: number;
  panelQuantity: number;
  inverterMake: string;
  inverterModel: string;
  baseCost: number;
  gstAmount: number;
  gstPercentage: number;
  totalCost: number;
  subsidyAmount: number;
  finalAmount: number;
  validUntilDate: string;
  status: string;
  organizationName: string;
  createdAt: string;
}

export default function PublicQuotationPage({
  params: paramsPromise,
}: {
  params: Promise<{ orgId: string; quotationId: string }>;
}) {
  // Unwrap params promise
  const params = use(paramsPromise);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [params.orgId, params.quotationId, token]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);

      const viewResponse = await fetch('/api/quotations/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: params.orgId,
          quotationId: params.quotationId,
          token,
        }),
      });

      const data = await viewResponse.json();

      if (!viewResponse.ok) {
        throw new Error(data.error || 'Failed to load quotation');
      }

      setQuotation(data.quotation);
      if (data.quotation.status === 'Approved') {
        setApproved(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!quotation || !token) return;

    try {
      setApproving(true);

      const response = await fetch('/api/quotations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: params.orgId,
          quotationId: params.quotationId,
          token,
          customerName: quotation.customerName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve quotation');
      }

      setApproved(true);
      alert('✅ ' + data.message);
      await fetchQuotation();
    } catch (err: any) {
      alert('❌ ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Please contact the sales team for assistance.</p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quotation Not Found</h1>
          <p className="text-gray-600">This quotation does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Solar Installation Quotation</h1>
                <p className="text-blue-100">Quotation ID: {quotation.quotationId}</p>
                <p className="text-blue-100">Reference: {quotation.referenceNumber}</p>
              </div>
              <div className="text-6xl">☀️</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-6">
              <p className="text-sm text-blue-100 mb-1">Organization</p>
              <p className="text-xl font-bold">{quotation.organizationName}</p>
            </div>
          </div>

          {/* Status Badge */}
          {approved && (
            <div className="bg-green-500 text-white text-center py-4 font-bold text-lg flex items-center justify-center gap-2">
              <CheckCircle size={24} />
              QUOTATION APPROVED - Our team will contact you soon!
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-3">
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={<Phone className="text-blue-600" />} label="Customer Name" value={quotation.customerName} />
            <InfoCard icon={<Phone className="text-green-600" />} label="Phone" value={quotation.customerPhone} />
            <InfoCard icon={<Mail className="text-purple-600" />} label="Email" value={quotation.customerEmail || 'N/A'} />
            <InfoCard icon={<MapPin className="text-red-600" />} label="Location" value={quotation.location} />
          </div>
        </div>

        {/* System Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-3">
            System Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailCard 
              title="System Capacity" 
              value={`${quotation.systemCapacity} kW`}
              subtitle={quotation.systemType}
              color="blue"
            />
            <DetailCard 
              title="Solar Panels" 
              value={`${quotation.panelQuantity} Panels`}
              subtitle={`${quotation.panelMake} ${quotation.panelWattage}Wp`}
              color="yellow"
            />
            <DetailCard 
              title="Inverter" 
              value={quotation.inverterMake}
              subtitle={quotation.inverterModel.substring(0, 20) + '...'}
              color="green"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl shadow-2xl p-8 text-white mb-6">
          <h2 className="text-3xl font-bold mb-6 text-center">Investment Details</h2>
          <div className="space-y-4">
            <PriceRow label="System Cost" value={quotation.baseCost} />
            <PriceRow label={`GST (${quotation.gstPercentage}%)`} value={quotation.gstAmount} />
            <PriceRow label="Total Cost" value={quotation.totalCost} bold />
            {quotation.subsidyAmount > 0 && (
              <PriceRow label="Government Subsidy" value={-quotation.subsidyAmount} isDiscount />
            )}
            <div className="border-t-2 border-white/30 pt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">Final Investment:</span>
                  <span className="text-4xl font-bold">₹{quotation.finalAmount.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-center text-sm text-blue-100 mt-3">
                  Price per Watt: ₹{(quotation.finalAmount / (quotation.systemCapacity * 1000)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Valid Until */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-orange-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Date(quotation.validUntilDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Approve Button */}
        {!approved && quotation.status !== 'Approved' && (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 px-8 rounded-2xl text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {approving ? (
              <>
                <Loader2 className="animate-spin" size={28} />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle size={28} />
                Approve This Quotation
              </>
            )}
          </button>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm mt-8">
          <p>Generated on {new Date(quotation.createdAt).toLocaleDateString('en-IN')}</p>
          <p className="mt-2">© {quotation.organizationName} - Powered by Solar Arrow</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        <p className="text-base font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function DetailCard({ title, value, subtitle, color }: { title: string; value: string; subtitle: string; color: string }) {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
  };

  const textColors: Record<string, string> = {
    blue: 'text-blue-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700',
  };

  return (
    <div className={`${bgColors[color]} border-2 rounded-xl p-6 text-center`}>
      <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
      <p className={`text-2xl font-bold ${textColors[color]} mb-1`}>{value}</p>
      <p className="text-xs text-gray-600">{subtitle}</p>
    </div>
  );
}

function PriceRow({ label, value, bold = false, isDiscount = false }: any) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className={`${bold ? 'text-xl font-bold' : 'text-lg'}`}>{label}:</span>
      <span className={`${bold ? 'text-2xl font-bold' : 'text-xl font-semibold'} ${isDiscount ? 'text-green-300' : ''}`}>
        ₹{Math.abs(value).toLocaleString('en-IN')}
      </span>
    </div>
  );
}