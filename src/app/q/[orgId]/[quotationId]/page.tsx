// src/app/q/[orgId]/[quotationId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, Download, Share2, Loader2, AlertCircle, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import type { Quotation } from '@/lib/quotations';
import { formatCurrency } from '@/lib/quotations';
import QRCode from 'qrcode';

export default function PublicQuotationPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const orgId = params.orgId as string;
  const quotationId = params.quotationId as string;
  const token = searchParams.get('token');

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    fetchQuotation();
  }, [orgId, quotationId, token]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotations/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, quotationId, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load quotation');
      }

      setQuotation(data.quotation);

      // Generate QR code
      const url = window.location.href;
      const qr = await QRCode.toDataURL(url);
      setQrCode(qr);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this quotation?')) {
      return;
    }

    setApproving(true);
    try {
      const response = await fetch('/api/quotations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          quotationId,
          token,
          customerName: quotation?.customerName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve');
      }

      setApproved(true);
      alert('✅ ' + data.message);
    } catch (err: any) {
      alert('❌ ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Solar Quotation - ${quotation?.quotationId}`,
        text: `Solar installation quotation for ${quotation?.systemCapacity}kW system`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('✅ Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-600">Please check the link or contact support.</p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return null;
  }

  const isApproved = quotation.status === 'Approved' || approved;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Solar Installation Quotation</h1>
          <p className="text-blue-100">Quotation ID: {quotation.quotationId}</p>
          <p className="text-sm text-blue-200 mt-1">Reference: {quotation.referenceNumber}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Approval Banner */}
        {isApproved && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-600" size={32} />
            <div>
              <h3 className="font-bold text-green-900">Quotation Approved</h3>
              <p className="text-sm text-green-800">Thank you! Our team will contact you shortly.</p>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="font-semibold text-gray-900">{quotation.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <Phone size={16} />
                {quotation.customerPhone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <Mail size={16} />
                {quotation.customerEmail}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={16} />
                {quotation.location}
              </p>
            </div>
          </div>
        </div>

        {/* System Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">System Capacity</p>
              <p className="text-2xl font-bold text-blue-600">{quotation.systemCapacity} kW</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">System Type</p>
              <p className="text-2xl font-bold text-green-600">{quotation.systemType}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Premises</p>
              <p className="text-2xl font-bold text-purple-600">{quotation.premisesType}</p>
            </div>
          </div>
        </div>

        {/* Component Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Components & Specifications</h2>

          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Item</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Make/Specification</th>
                <th className="text-center py-3 px-4 font-bold text-gray-900">Qty</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Warranty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4 font-medium">Solar Panels ({quotation.panelWattage}Wp)</td>
                <td className="py-3 px-4">{quotation.panelMake}</td>
                <td className="py-3 px-4 text-center">{quotation.panelQuantity}</td>
                <td className="py-3 px-4">{quotation.panelWarranty}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Inverter ({quotation.inverterCapacity}kVA)</td>
                <td className="py-3 px-4">{quotation.inverterMake} - {quotation.inverterModel}</td>
                <td className="py-3 px-4 text-center">{quotation.inverterQuantity}</td>
                <td className="py-3 px-4">{quotation.inverterWarranty}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Mounting Structure</td>
                <td className="py-3 px-4">{quotation.structureType} - {quotation.structureMake}</td>
                <td className="py-3 px-4 text-center">1 Set</td>
                <td className="py-3 px-4">{quotation.structureWarranty}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Balance of System</td>
                <td className="py-3 px-4">{quotation.bosItems}</td>
                <td className="py-3 px-4 text-center">1 Set</td>
                <td className="py-3 px-4">{quotation.bosWarranty}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Cables & Wiring</td>
                <td className="py-3 px-4">{quotation.cableMake}</td>
                <td className="py-3 px-4 text-center">As per site</td>
                <td className="py-3 px-4">{quotation.cableWarranty}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Earthing System</td>
                <td className="py-3 px-4">{quotation.earthingType}</td>
                <td className="py-3 px-4 text-center">{quotation.earthingQuantity}</td>
                <td className="py-3 px-4">{quotation.earthingWarranty}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Lightning Arrestor</td>
                <td className="py-3 px-4">{quotation.lightningArrestorType}</td>
                <td className="py-3 px-4 text-center">{quotation.lightningArrestorQuantity}</td>
                <td className="py-3 px-4">{quotation.lightningArrestorWarranty}</td>
              </tr>
              <tr className="bg-green-50">
                <td className="py-3 px-4 font-medium">O&M Service</td>
                <td className="py-3 px-4">{quotation.companyName}</td>
                <td className="py-3 px-4 text-center">-</td>
                <td className="py-3 px-4 font-bold text-green-600">{quotation.maintenanceYears} Years</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">Base Cost</span>
              <span className="font-semibold text-gray-900">{formatCurrency(quotation.baseCost)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">GST @ {quotation.gstPercentage}%</span>
              <span className="font-semibold text-gray-900">{formatCurrency(quotation.gstAmount)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium text-gray-900">Total Cost (including GST)</span>
              <span className="font-bold text-gray-900">{formatCurrency(quotation.totalCost)}</span>
            </div>
            {quotation.subsidyAmount > 0 && (
              <div className="flex justify-between items-center py-2 border-b text-green-600">
                <span className="font-medium">Government Subsidy</span>
                <span className="font-bold">- {formatCurrency(quotation.subsidyAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-4 bg-blue-50 rounded-lg px-4">
              <span className="text-lg font-bold text-gray-900">Final Amount</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(quotation.finalAmount)}</span>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-bold text-gray-900 mb-1">Payment Terms:</p>
            <p className="text-sm text-gray-800">{quotation.paymentTerms}</p>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{quotation.companyName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">GST Number</p>
              <p className="font-mono font-semibold text-gray-900">{quotation.companyGst}</p>
            </div>
            <div>
              <p className="text-gray-600">Udyam Registration</p>
              <p className="font-mono font-semibold text-gray-900">{quotation.companyUdyam}</p>
            </div>
            <div>
              <p className="text-gray-600">CSPDCL Registration</p>
              <p className="font-mono font-semibold text-gray-900">{quotation.companyCspdclReg}</p>
            </div>
            <div>
              <p className="text-gray-600">Contact</p>
              <p className="font-semibold text-gray-900">{quotation.companyPhone}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {!isApproved && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {approving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Approve Quotation
                </>
              )}
            </button>
          )}
          <button
            onClick={handleShare}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            Share
          </button>
        </div>

        {/* QR Code */}
        {qrCode && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Scan to view on mobile:</p>
            <img src={qrCode} alt="QR Code" className="mx-auto" width={150} height={150} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Valid until: {new Date(quotation.validUntilDate).toLocaleDateString('en-IN')}</p>
          <p className="mt-2">Generated by {quotation.companyName}</p>
        </div>
      </div>
    </div>
  );
}