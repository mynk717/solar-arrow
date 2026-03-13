// src/app/q/[orgId]/[quotationId]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, Phone, Mail, MapPin, Copy, Building2 } from 'lucide-react';


// Safe date formatter
function formatDate(
  dateStr: string | undefined | null,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
): string {
  if (!dateStr) return 'N/A';
  // Handle DD/MM/YYYY format from Google Sheets
  let d = new Date(dateStr);
  if (isNaN(d.getTime()) && typeof dateStr === 'string') {
    const parts = dateStr.split('/');
    if (parts.length === 3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN', options);
}


interface Quotation {
  quotationId: string;
  organizationId: string;
  referenceNumber: string;
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
  panelWattage: number;
  panelQuantity: number;
  panelWarranty: string;
  inverterMake: string;
  inverterModel: string;
  inverterCapacity: number;
  inverterQuantity: number;
  inverterWarranty: string;
  structureType: string;
  structureMake: string;
  structureWarranty: string;
  bosItems: string;
  boqItems?: any[];
  bosWarranty: string;
  cableMake: string;
  cableWarranty: string;
  earthingType: string;
  earthingQuantity: number;
  earthingWarranty: string;
  lightningArrestorType: string;
  lightningArrestorQuantity: number;
  lightningArrestorWarranty: string;
  maintenanceYears: number;
  baseCost: number;
  gstAmount: number;
  gstPercentage: number;
  totalCost: number;
  subsidyAmount: number;
  finalAmount: number;
  advancePercentage: number;
  preDispatchPercentage: number;
  preGridPercentage: number;
  paymentTerms: string;
  validUntilDate: string;
  status: string;
  organizationName: string;
  createdAt: string;
  termsAndConditions: string;
  loanAvailable: boolean;
  loanInterestRate: number;
  // Company details
  companyGst: string;
  companyUdyam: string;
  companyCspdclReg: string;
  companyBankName: string;
  companyAccountNumber: string;
  companyIfsc: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  // Org logo from Cloudinary
  orgLogoUrl?: string;
}

export default function PublicQuotationPage({
  params: paramsPromise,
}: {
  params: Promise<{ orgId: string; quotationId: string }>;
}) {
  const params = use(paramsPromise);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => { fetchQuotation(); }, []);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quotations/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: params.orgId, quotationId: params.quotationId, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load quotation');
      setQuotation(data.quotation);
      if (data.quotation.status === 'Approved') setApproved(true);
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
      const res = await fetch('/api/quotations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: params.orgId, quotationId: params.quotationId, token, customerName: quotation.customerName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve');
      setApproved(true);
      alert('✅ ' + data.message);
      await fetchQuotation();
    } catch (err: any) {
      alert('❌ ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center">
        <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading quotation...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <p className="text-sm text-gray-500">Please contact the sales team for assistance.</p>
      </div>
    </div>
  );

  if (!quotation) return null;

  const bomRows = quotation.boqItems && quotation.boqItems.length > 0
  ? quotation.boqItems!.map((item: any) => ({
    item: item.description,
      spec: item.make,
      make: item.make,
      warranty: item.warranty || '—',
      qty: `${item.quantity} ${item.unit}`,
      unitRate: item.unitRate,
      amount: item.amount,
    }))
  : [
      { item: 'Solar PV Modules', spec: `${quotation.panelWattage}Wp ${quotation.panelType}`, make: quotation.panelMake, warranty: quotation.panelWarranty, qty: `${quotation.panelQuantity} Nos`, unitRate: 0, amount: 0 },
      { item: 'String Inverter', spec: `${quotation.inverterCapacity}kVA ${quotation.inverterModel}`, make: quotation.inverterMake, warranty: quotation.inverterWarranty, qty: `${quotation.inverterQuantity} Nos`, unitRate: 0, amount: 0 },
      { item: 'Module Mounting Structure', spec: quotation.structureType || 'Hot Dip Galvanized', make: quotation.structureMake || 'As per design', warranty: quotation.structureWarranty || '5 Years', qty: '1 Lot', unitRate: 0, amount: 0 },
      { item: 'DC Solar Cables', spec: 'Solar Grade, UV Resistant, Halogen Free', make: quotation.cableMake || 'Polycab/Waacab', warranty: quotation.cableWarranty || '5 Years', qty: '1 Lot', unitRate: 0, amount: 0 },
      { item: 'AC Power LT Cables', spec: 'Al Core, XLPE, Armoured', make: quotation.cableMake || 'Polycab/Waacab', warranty: quotation.cableWarranty || '5 Years', qty: '1 Lot', unitRate: 0, amount: 0 },
      { item: 'Earthing System', spec: quotation.earthingType || 'Chemical Earthing', make: 'Standard/True Power', warranty: quotation.earthingWarranty || '5 Years', qty: `${quotation.earthingQuantity || 3} Nos`, unitRate: 0, amount: 0 },
      { item: 'Lightning Arrestor', spec: quotation.lightningArrestorType || 'ESE / Pipe Type', make: 'Reputed Make', warranty: quotation.lightningArrestorWarranty || '5 Years', qty: `${quotation.lightningArrestorQuantity || 1} Nos`, unitRate: 0, amount: 0 },
      { item: 'BOS & Protection Devices', spec: quotation.bosItems || 'MCB, MCCB, SPD, DC Fuse', make: 'Standard', warranty: quotation.bosWarranty || '5 Years', qty: '1 Lot', unitRate: 0, amount: 0 },
      { item: 'Remote Monitoring System', spec: 'Data Logger / RMS with WiFi', make: 'OEM Provided', warranty: 'As per OEM', qty: '1 Nos', unitRate: 0, amount: 0 },
      { item: 'Miscellaneous Items', spec: 'Conduits, Cable Trays, Clamps', make: 'Reputed Make', warranty: 'As provided by OEM', qty: '1 Lot', unitRate: 0, amount: 0 },
    ];

const hasBoqPricing = quotation.boqItems && quotation.boqItems.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-3 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* ═══ LETTERHEAD HEADER ═══ */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

          {/* Top: Company Identity Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              {quotation.orgLogoUrl ? (
                <img
                  src={quotation.orgLogoUrl}
                  alt={quotation.organizationName}
                  className="h-14 w-auto object-contain"
                />
              ) : (
                <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="text-white" size={28} />
                </div>
              )}
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{quotation.organizationName}</h2>
                {quotation.companyGst && (
                  <p className="text-xs text-gray-500 mt-0.5">GST: {quotation.companyGst}</p>
                )}
                {quotation.companyCspdclReg && (
                  <p className="text-xs text-gray-500">CSPDCL Reg: {quotation.companyCspdclReg}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Proposal No.</p>
              <p className="font-bold text-blue-700 text-base">{quotation.referenceNumber}</p>
              <p className="text-xs text-gray-500 mt-1">Dated: {formatDate(quotation.createdAt)}</p>
            </div>
          </div>

          {/* Blue Proposal Title Banner */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-3 text-white text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-0.5">Techno-Commercial Proposal</p>
            <h1 className="text-lg font-bold">
              {quotation.systemCapacity} kWp {quotation.systemType} Rooftop Solar PV Project
            </h1>
          </div>

          {/* Summary Strip */}
          <div className="flex flex-wrap gap-2 px-6 py-3 bg-blue-50 border-b border-blue-100 text-xs font-semibold text-blue-700">
            {[
              `⚡ ${quotation.systemCapacity} kWp DC`,
              `🔄 ${quotation.systemType}`,
              `🏠 ${quotation.premisesType}`,
              quotation.panelType,
              quotation.panelMake,
            ].map((tag) => (
              <span key={tag} className="bg-white border border-blue-200 rounded-full px-3 py-1">{tag}</span>
            ))}
          </div>

          {/* To: Customer Block */}
          <div className="px-6 py-4 flex flex-wrap gap-6 justify-between">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Prepared For</p>
              <p className="font-extrabold text-gray-900 text-lg">{quotation.customerName}</p>
              {quotation.customerAddress && <p className="text-gray-600 text-sm">{quotation.customerAddress}</p>}
              {quotation.location && <p className="text-gray-500 text-sm flex items-center gap-1"><MapPin size={12} />{quotation.location}</p>}
              <div className="flex flex-wrap gap-4 mt-2">
                {quotation.customerPhone && (
                  <a href={`tel:${quotation.customerPhone}`} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold">
                    <Phone size={13} /> {quotation.customerPhone}
                  </a>
                )}
                {quotation.customerEmail && (
                  <a href={`mailto:${quotation.customerEmail}`} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold">
                    <Mail size={13} /> {quotation.customerEmail}
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Valid Until</p>
              <p className="font-bold text-red-600 text-base">{formatDate(quotation.validUntilDate)}</p>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  quotation.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  quotation.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                  quotation.status === 'Viewed' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>● {quotation.status}</span>
              </div>
            </div>
          </div>

          {approved && (
            <div className="bg-green-500 text-white text-center py-3 font-bold flex items-center justify-center gap-2">
              <CheckCircle size={20} /> QUOTATION APPROVED — Our team will contact you soon!
            </div>
          )}
        </div>

        {/* ═══ BILL OF MATERIALS ═══ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">List of Major Equipment & Proposed Vendors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="bg-blue-600 text-white text-xs">
  <th className="text-center py-2.5 px-3 w-8">S.No</th>
  <th className="text-left py-2.5 px-3">Item</th>
  <th className="text-left py-2.5 px-3">Make / Spec</th>
  <th className="text-left py-2.5 px-3">Warranty</th>
  <th className="text-center py-2.5 px-3">Qty</th>
  {hasBoqPricing && <th className="text-right py-2.5 px-3">Rate (₹)</th>}
  {hasBoqPricing && <th className="text-right py-2.5 px-3">Amount (₹)</th>}
</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {bomRows.map((row: any, i: number) => (
  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}>
    <td className="py-2.5 px-3 text-center font-semibold text-gray-400 text-xs">{i + 1}</td>
    <td className="py-2.5 px-3 font-semibold text-gray-900">{row.item}</td>
    <td className="py-2.5 px-3 text-gray-600 text-xs leading-relaxed">{row.spec}</td>
    <td className="py-2.5 px-3 text-green-700 text-xs font-medium">{row.warranty}</td>
    <td className="py-2.5 px-3 text-center font-bold text-gray-700 text-xs">{row.qty}</td>
    {hasBoqPricing && <td className="py-2.5 px-3 text-right text-gray-600 text-xs">₹{(row.unitRate || 0).toLocaleString('en-IN')}</td>}
    {hasBoqPricing && <td className="py-2.5 px-3 text-right font-semibold text-gray-900 text-xs">₹{(row.amount || 0).toLocaleString('en-IN')}</td>}
  </tr>
                ))}
              </tbody>
              {hasBoqPricing && (
  <tfoot>
    <tr className="bg-blue-50 border-t-2 border-blue-200">
      <td colSpan={5} className="py-2.5 px-3 text-right font-bold text-gray-700 text-sm">BOQ Total:</td>
      <td className="py-2.5 px-3 text-right font-bold text-blue-700 text-sm">
        ₹{bomRows.reduce((sum: number, r: any) => sum + (r.amount || 0), 0).toLocaleString('en-IN')}
      </td>
    </tr>
  </tfoot>
)}
            </table>
          </div>
        </div>

        {/* ═══ COMMERCIAL OFFER ═══ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-base">💰 Commercial Offer</h2>
          </div>
          <div className="px-5 pb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 font-semibold">Description</th>
                  <th className="text-right py-2 font-semibold">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="py-3 text-gray-700">1. Project Cost (Offered Price)</td>
                  <td className="py-3 text-right font-semibold">₹{quotation.baseCost.toLocaleString('en-IN')}/-</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="py-3 text-gray-700">2. GST ({quotation.gstPercentage}%)<br /><span className="text-xs text-gray-400">5% on Supply + 18% on Installation (as per Govt. clause)</span></td>
                  <td className="py-3 text-right font-semibold">₹{quotation.gstAmount.toLocaleString('en-IN')}/-</td>
                </tr>
                <tr className="border-b border-gray-100 font-bold">
                  <td className="py-3 text-gray-900">3. Grand Total (To be Paid)</td>
                  <td className="py-3 text-right text-gray-900 text-base">₹{quotation.totalCost.toLocaleString('en-IN')}/-</td>
                </tr>
                {quotation.subsidyAmount > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-green-700 font-semibold">4. MNRE/PM Surya Ghar Subsidy</td>
                    <td className="py-3 text-right text-green-700 font-bold">− ₹{quotation.subsidyAmount.toLocaleString('en-IN')}/-</td>
                  </tr>
                )}
                <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                  <td className="py-4 px-4 font-bold text-base rounded-bl-xl">Effective Cost After Subsidy</td>
                  <td className="py-4 px-4 text-right font-extrabold text-2xl rounded-br-xl">₹{quotation.finalAmount.toLocaleString('en-IN')}/-</td>
                </tr>
              </tbody>
            </table>
          </div>
          {quotation.loanAvailable && (
            <div className="mx-5 mb-4 mt-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-700 font-semibold">
              💳 Loan Available — EMI at {quotation.loanInterestRate}% p.a. Contact us for details.
            </div>
          )}
        </div>

        {/* ═══ PAYMENT SCHEDULE ═══ */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b border-gray-100">💳 Payment Schedule</h2>
          <p className="text-xs text-gray-500 mb-3">Payment in favour of <span className="font-bold text-gray-800">{quotation.organizationName}</span></p>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Advance with Purchase Order', pct: quotation.advancePercentage || 70, color: 'bg-blue-50 border-blue-200 text-blue-800' },
              { label: 'Before Material Despatch', pct: quotation.preDispatchPercentage || 20, color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
              { label: 'Before Grid Synchronization', pct: quotation.preGridPercentage || 10, color: 'bg-green-50 border-green-200 text-green-800' },
            ].map((p) => (
              <div key={p.label} className={`flex justify-between items-center px-4 py-3 rounded-xl border ${p.color}`}>
                <span className="font-semibold">{p.label}</span>
                <span className="font-bold text-lg">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ TERMS & CONDITIONS ═══ */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b border-gray-100">📄 Terms & Conditions</h2>
          <ol className="space-y-1.5 text-sm text-gray-700 list-decimal list-inside leading-relaxed">
            <li>GST for Supply (5%) is included. GST for Installation (18%) is included as per government clause.</li>
            <li>Payment Schedule: {quotation.paymentTerms || '70% Advance with PO, 20% before Despatch, 10% before Grid synchronization'}.</li>
            <li>Operational Maintenance, Commissioning, Erection & Grid connectivity included for {quotation.maintenanceYears || 5} years as per CREDA norms.</li>
            <li>Transportation is included up to site.</li>
            <li>Project cost is based on current market prices; may vary during procurement.</li>
            <li>In case of delayed payment, 18% p.a. interest shall be applicable on overdue amounts.</li>
            <li>All back-to-back OEM warranties will be provided.</li>
            <li>Solar Panels: 30 Years Performance Warranty | Inverter: As per OEM | BOS: 5 Years.</li>
            <li>Adjustment of CSPDCL bills is subject to government policy. {quotation.organizationName} shall not be responsible for the same.</li>
            <li>Subjected to Raipur Jurisdiction.</li>
            {quotation.termsAndConditions && !quotation.termsAndConditions.toLowerCase().includes('standard') && (
              <li>{quotation.termsAndConditions}</li>
            )}
          </ol>
        </div>

        {/* ═══ COMPANY CREDENTIALS FOOTER ═══ */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b border-gray-100">
            🏢 {quotation.organizationName} — Company Details
          </h2>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
            {quotation.companyAddress && (
              <div className="flex gap-2"><span className="font-semibold text-gray-800 w-28 shrink-0">Address:</span><span>{quotation.companyAddress}</span></div>
            )}
            {quotation.companyPhone && (
              <div className="flex gap-2"><span className="font-semibold text-gray-800 w-28 shrink-0">Phone:</span><a href={`tel:${quotation.companyPhone}`} className="text-blue-600">{quotation.companyPhone}</a></div>
            )}
            {quotation.companyEmail && (
              <div className="flex gap-2"><span className="font-semibold text-gray-800 w-28 shrink-0">Email:</span><a href={`mailto:${quotation.companyEmail}`} className="text-blue-600">{quotation.companyEmail}</a></div>
            )}
            {quotation.companyGst && (
              <div className="flex gap-2"><span className="font-semibold text-gray-800 w-28 shrink-0">GSTIN:</span><span className="font-mono">{quotation.companyGst}</span></div>
            )}
            {quotation.companyUdyam && (
              <div className="flex gap-2"><span className="font-semibold text-gray-800 w-28 shrink-0">UDYAM:</span><span className="font-mono">{quotation.companyUdyam}</span></div>
            )}
            {quotation.companyCspdclReg && (
              <div className="flex gap-2"><span className="font-semibold text-gray-800 w-28 shrink-0">CSPDCL Reg:</span><span>{quotation.companyCspdclReg}</span></div>
            )}
          </div>
          {/* Bank Details */}
          {quotation.companyBankName && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-700 mb-1.5">Bank Details (Payment in favour of {quotation.organizationName})</p>
              <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-1 text-xs">
                <span className="text-gray-500">Bank:</span><span className="font-semibold">{quotation.companyBankName}</span>
                <span className="text-gray-500">Account No:</span><span className="font-mono font-semibold">{quotation.companyAccountNumber}</span>
                <span className="text-gray-500">IFSC:</span><span className="font-mono font-semibold">{quotation.companyIfsc}</span>
              </div>
            </div>
          )}
        </div>

        {/* ═══ SHARE ═══ */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-3">📤 Share This Quotation</h2>
          <div className="flex gap-3 flex-wrap">
            <a
              href={`https://wa.me/${quotation.customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${quotation.customerName},\n\nPlease find your Solar Installation Quotation:\n🔗 ${window.location.href}\n\nCapacity: ${quotation.systemCapacity} kWp\nFinal Amount: ₹${quotation.finalAmount.toLocaleString('en-IN')}\nValid Until: ${formatDate(quotation.validUntilDate)}\n\n- ${quotation.organizationName}`)}`}
              target="_blank"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a
              href={`mailto:${quotation.customerEmail}?subject=Solar Quotation - ${quotation.referenceNumber}&body=Dear ${quotation.customerName},%0D%0A%0D%0AKindly find your quotation at:%0D%0A${window.location.href}%0D%0A%0D%0AAmount: Rs.${quotation.finalAmount.toLocaleString('en-IN')}%0D%0AValid Until: ${formatDate(quotation.validUntilDate)}%0D%0A%0D%0ARegards,%0D%0A${quotation.organizationName}`}
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
        <div className="text-center text-gray-400 text-xs pb-8 space-y-1">
          <p className="font-semibold text-gray-600">{quotation.organizationName}</p>
          {quotation.companyAddress && <p>{quotation.companyAddress}</p>}
          {quotation.companyPhone && <p>📞 {quotation.companyPhone}</p>}
          <p className="mt-2">Generated on {formatDate(quotation.createdAt)} · Ref: {quotation.referenceNumber}</p>
          <p className="text-gray-300">Powered by Solar Arrow</p>
        </div>

      </div>
    </div>
  );
}
