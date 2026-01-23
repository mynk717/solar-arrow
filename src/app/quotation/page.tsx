// src/app/quotation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Download, Send, Loader2, Plus } from 'lucide-react';
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      setQuotations(demoQuotations);
      setLoading(false);
    } else if (status === 'authenticated') {
      setQuotations(demoQuotations);
      setLoading(false);
    }
  }, [status]);

  const handleGeneratePDF = (quotId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Generating PDF for ${quotId}`);
  };

  const handleSendEmail = (quotId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Sending quotation ${quotId} via email`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <DemoBanner />
      <div className="p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quotations {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">Generate and send quotations to customers</p>
          </div>
          <button
            onClick={() => isDemoMode ? showDemoAlert() : alert('Create new quotation')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            New Quotation
          </button>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              {quotations.map(quot => (
                <tr key={quot.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">{quot.id}</td>
                  <td className="py-4 px-6 text-gray-700">{quot.customerName}</td>
                  <td className="py-4 px-6 text-gray-700">{quot.capacity}</td>
                  <td className="py-4 px-6 text-green-600">₹{quot.systemCost.toLocaleString()}</td>
                  <td className="py-4 px-6 text-green-600">₹{quot.subsidyAmount.toLocaleString()}</td>
                  <td className="py-4 px-6 font-bold text-green-700">₹{quot.finalCost.toLocaleString()}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{quot.validTill.toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={quot.status as any} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGeneratePDF(quot.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleSendEmail(quot.id)}
                        className="text-green-600 hover:text-green-700"
                        title="Send Email"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
