// src/app/q/[orgId]/[quotationId]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, Phone, Mail, MapPin, Calendar, Copy } from 'lucide-react';
import Image from 'next/image';

interface Quotation {
  quotationId: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string; 
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
  inverterCapacity: number;  
  inverterQuantity: number;  
  inverterWarranty: string;  
  panelWarranty: string;     
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
    <div className="min-h-screen bg-gray-100 py-4 px-3">
      <div className="max-w-3xl mx-auto space-y-4">
  
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Org Logo */}
                {(quotation as any).orgLogoUrl && (
                  <img
                    src={(quotation as any).orgLogoUrl}
                    alt={(quotation as any).organizationName}
                    className="h-12 object-contain bg-white rounded-lg px-2 py-1 mb-3"
                  />
                )}
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
                  Techno-Commercial Proposal
                </p>
                <h1 className="text-2xl font-bold">Solar Installation Quotation</h1>
                <p className="text-blue-200 text-sm mt-1">
                  Ref: {quotation.referenceNumber}
                </p>
                <p className="text-blue-200 text-xs mt-0.5">
                  Quotation ID: {quotation.quotationId}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-blue-200">Dated</p>
                <p className="font-bold">{new Date(quotation.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p className="text-blue-200 mt-2">Valid Until</p>
                <p className="font-bold text-yellow-300">{new Date(quotation.validUntilDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
  
          {/* To: Customer */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Prepared For</p>
            <p className="font-bold text-gray-900 text-lg">{quotation.customerName}</p>
            {quotation.customerAddress && <p className="text-gray-600 text-sm">{quotation.customerAddress}</p>}
            {quotation.location && <p className="text-gray-600 text-sm">{quotation.location}</p>}
            <div className="flex flex-wrap gap-4 mt-2">
              {quotation.customerPhone && (
                <a href={`tel:${quotation.customerPhone}`} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold">
                  <Phone size={14} /> {quotation.customerPhone}
                </a>
              )}
              {quotation.customerEmail && (
                <a href={`mailto:${quotation.customerEmail}`} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold">
                  <Mail size={14} /> {quotation.customerEmail}
                </a>
              )}
            </div>
          </div>
  
          {/* Approved Banner */}
          {approved && (
            <div className="bg-green-500 text-white text-center py-3 font-bold flex items-center justify-center gap-2">
              <CheckCircle size={20} /> QUOTATION APPROVED — Our team will contact you soon!
            </div>
          )}
        </div>
  
        {/* System Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b border-gray-100">
            ⚡ System Configuration
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Capacity', `${quotation.systemCapacity} kWp`],
              ['System Type', quotation.systemType],
              ['Panel Type', quotation.panelType],
              ['Premises', (quotation as any).premisesType],
            ].map(([label, value]) => (
              <div key={label} className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-semibold">{label}</p>
                <p className="font-bold text-gray-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
  
        {/* Bill of Materials Table */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b border-gray-100">
            📋 List of Major Equipment
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="text-left py-2 px-3 rounded-tl-lg">S.No</th>
                  <th className="text-left py-2 px-3">Item</th>
                  <th className="text-left py-2 px-3">Specification</th>
                  <th className="text-left py-2 px-3">Make</th>
                  <th className="text-left py-2 px-3">Warranty</th>
                  <th className="text-left py-2 px-3 rounded-tr-lg">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { item: 'Solar PV Modules', spec: `${quotation.panelWattage}Wp ${quotation.panelType}`, make: quotation.panelMake, warranty: (quotation as any).panelWarranty, qty: `${quotation.panelQuantity} Nos` },
                  { item: 'String Inverter', spec: `${quotation.inverterCapacity}kVA`, make: quotation.inverterMake, warranty: (quotation as any).inverterWarranty, qty: `${(quotation as any).inverterQuantity} Nos` },
                  { item: 'Module Mounting Structure', spec: (quotation as any).structureType || 'Hot Dip Galvanized', make: (quotation as any).structureMake || 'As per design', warranty: (quotation as any).structureWarranty || '5 Years', qty: '1 Lot' },
                  { item: 'DC/AC Cables', spec: 'Solar Grade, UV Resistant', make: (quotation as any).cableMake || 'Polycab/Waacab', warranty: (quotation as any).cableWarranty || '5 Years', qty: '1 Lot' },
                  { item: 'Earthing System', spec: (quotation as any).earthingType || 'Chemical Earthing', make: 'Standard', warranty: (quotation as any).earthingWarranty || '5 Years', qty: `${(quotation as any).earthingQuantity || 3} Nos` },
                  { item: 'Lightning Arrestor', spec: (quotation as any).lightningArrestorType || 'ESE Type', make: 'Reputed Make', warranty: (quotation as any).lightningArrestorWarranty || '5 Years', qty: `${(quotation as any).lightningArrestorQuantity || 1} Nos` },
                  { item: 'BOS & Accessories', spec: (quotation as any).bosItems || 'Balance of System', make: 'Standard', warranty: (quotation as any).bosWarranty || '5 Years', qty: '1 Lot' },
                  { item: 'Remote Monitoring', spec: (quotation as any).monitoringSystem || 'RMS/Data Logger', make: 'OEM', warranty: 'As per OEM', qty: '1 Nos' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2.5 px-3 font-semibold text-gray-500">{i + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{row.item}</td>
                    <td className="py-2.5 px-3 text-gray-700">{row.spec}</td>
                    <td className="py-2.5 px-3 text-gray-700">{row.make}</td>
                    <td className="py-2.5 px-3 text-gray-600 text-xs">{row.warranty}</td>
                    <td className="py-2.5 px-3 font-semibold">{row.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b border-gray-100">
            💰 Commercial Offer
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                { label: 'Project Cost (Base)', value: quotation.baseCost, normal: true },
                { label: `GST (${quotation.gstPercentage}%)`, value: quotation.gstAmount, normal: true },
                { label: 'Grand Total', value: quotation.totalCost, bold: true },
              ].map((row) => (
                <tr key={row.label} className="border-b border-gray-100">
                  <td className={`py-2.5 ${row.bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{row.label}</td>
                  <td className={`py-2.5 text-right ${row.bold ? 'font-bold text-gray-900 text-base' : 'text-gray-700'}`}>
                    ₹{row.value.toLocaleString('en-IN')}/-
                  </td>
                </tr>
              ))}
              {quotation.subsidyAmount > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2.5 text-green-700 font-semibold">MNRE/State Subsidy</td>
                  <td className="py-2.5 text-right text-green-700 font-bold">- ₹{quotation.subsidyAmount.toLocaleString('en-IN')}/-</td>
                </tr>
              )}
              <tr className="bg-blue-50">
                <td className="py-3 px-2 font-bold text-blue-900 text-base rounded-bl-xl">
                  Effective Cost After Subsidy
                </td>
                <td className="py-3 px-2 text-right font-bold text-blue-900 text-xl rounded-br-xl">
                  ₹{quotation.finalAmount.toLocaleString('en-IN')}/-
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        {/* Payment Terms */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b border-gray-100">
            💳 Payment Schedule
          </h2>
          <div className="space-y-2 text-sm">
            {[
              { label: `Advance with PO`, pct: (quotation as any).advancePercentage || 70, color: 'bg-blue-50 border-blue-200 text-blue-800' },
              { label: 'Before Despatch', pct: (quotation as any).preDispatchPercentage || 20, color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
              { label: 'Before Grid Synchronization', pct: (quotation as any).preGridPercentage || 10, color: 'bg-green-50 border-green-200 text-green-800' },
            ].map((p) => (
              <div key={p.label} className={`flex justify-between items-center px-4 py-3 rounded-xl border ${p.color}`}>
                <span className="font-semibold">{p.label}</span>
                <span className="font-bold text-lg">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
  
        {/* T&C */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b border-gray-100">
            📄 Terms & Conditions
          </h2>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>GST for Supply (5%) and Installation (18%) is included as per government clause.</li>
            <li>Payment Schedule: {(quotation as any).paymentTerms || '70% Advance with PO, 20% before Despatch, 10% before Grid synchronization'}.</li>
            <li>O&M, Commissioning, Erection and Grid connectivity included for {(quotation as any).maintenanceYears || 5} years.</li>
            <li>Transportation is included up to site.</li>
            <li>Prices are subject to change based on market rates at time of procurement.</li>
            <li>All back-to-back OEM warranties will be provided.</li>
            <li>Subjected to Raipur Jurisdiction.</li>
            {(quotation as any).termsAndConditions && (quotation as any).termsAndConditions !== 'Standard T&C as per company policy' && (
              <li>{(quotation as any).termsAndConditions}</li>
            )}
          </ol>
        </div>
  
        {/* WhatsApp + Share */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-3">📤 Share This Quotation</h2>
          <div className="flex gap-3 flex-wrap">
            <a
              href={`https://wa.me/${quotation.customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${quotation.customerName},\n\nPlease find your Solar Installation Quotation:\n🔗 ${window.location.href}\n\nCapacity: ${quotation.systemCapacity} kWp\nFinal Amount: ₹${quotation.finalAmount.toLocaleString('en-IN')}\nValid Until: ${new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}\n\n- ${quotation.organizationName}`)}`}
              target="_blank"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a
              href={`mailto:${quotation.customerEmail}?subject=Solar Installation Quotation - ${quotation.quotationId}&body=Dear ${quotation.customerName},%0D%0A%0D%0APlease find your quotation at:%0D%0A${window.location.href}%0D%0A%0D%0AAmount: Rs.${quotation.finalAmount.toLocaleString('en-IN')}%0D%0AValid Until: ${new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}%0D%0A%0D%0ARegards,%0D%0A${quotation.organizationName}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <Mail size={18} /> Email
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-gray-300"
            >
              <Copy size={18} /> Copy Link
            </button>
          </div>
        </div>
  
        {/* Approve Button */}
        {!approved && quotation.status !== 'Approved' && (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-5 rounded-2xl text-xl font-bold shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {approving ? <><Loader2 className="animate-spin" size={24} /> Approving...</> : <><CheckCircle size={24} /> Approve This Quotation</>}
          </button>
        )}
  
        {/* Footer */}
        <div className="text-center text-gray-500 text-xs pb-8">
          <p className="font-semibold">{quotation.organizationName}</p>
          <p>Generated on {new Date(quotation.createdAt).toLocaleDateString('en-IN')}</p>
          <p className="mt-1 text-gray-400">Powered by Solar Arrow</p>
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