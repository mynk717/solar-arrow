//  src/app/payments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Enquiry, PaymentType } from '@/lib/types';
import { IndianRupee, CheckCircle, Clock, Loader2, Filter } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

// Demo payment data
const demoPayments: Enquiry[] = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh@example.com',
    address: '123 Civil Lines',
    area: 'Civil Lines',
    capacity: '5',
    panelTag: 'RTS',
    paymentType: 'Direct',
    status: 'active',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-20'),
    registrationId: 'CSPDCL-2026-001',
    estimatedCost: 250000,
    initialPayment: 125000,
    paymentDate: new Date('2026-01-20'),
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Patel',
    phone: '+91 98765 43211',
    email: 'priya@example.com',
    address: '456 Pandri',
    area: 'Pandri',
    capacity: '3',
    panelTag: 'RTS',
    paymentType: 'Direct',
    status: 'payment_pending',
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-01-18'),
    registrationId: 'CSPDCL-2026-002',
    estimatedCost: 180000,
  },
  {
    id: 'ENQ-003',
    customerName: 'Amit Patel',
    phone: '+91 98765 43212',
    email: 'amit@example.com',
    address: '789 Telibandha',
    area: 'Telibandha',
    capacity: '10',
    panelTag: 'Commercial',
    paymentType: 'Subsidy + Direct',
    status: 'active',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-18'),
    registrationId: 'CSPDCL-2026-003',
    estimatedCost: 500000,
    initialPayment: 250000,
    paymentDate: new Date('2026-01-15'),
    paymentMethod: 'Online',
    subsidyAmount: 94000,
    subsidyStatus: 'approved',
  },
];

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState<PaymentType | 'all'>('all');

  useEffect(() => {
    const fetchData = async () => {
      // Use demo data if not authenticated
      if (status === 'unauthenticated') {
        setEnquiries(demoPayments);
        setLoading(false);
        return;
      }

      // Try API if authenticated
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/enquiries');
          if (!response.ok) throw new Error('API failed');
          
          const data = await response.json();
          const enquiriesWithDates = data.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
            paymentDate: e.paymentDate ? new Date(e.paymentDate) : undefined,
          }));
          
          setEnquiries(enquiriesWithDates);
        } catch (err) {
          console.log('Using demo data');
          setEnquiries(demoPayments);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status]);

  const handleRecordPayment = (id: string) => {
    if (isDemoMode || status === 'unauthenticated') {
      showDemoAlert();
      return;
    }
    alert(`Record payment for ${id}`);
  };

  const pending = enquiries.filter(e => !e.paymentDate && e.registrationId);
  const paid = enquiries.filter(e => e.paymentDate);
  
  const totalPending = pending.reduce((sum, e) => sum + (e.estimatedCost || 0), 0);
  const totalReceived = paid.reduce((sum, e) => sum + (e.initialPayment || 0), 0);
  const totalSubsidy = enquiries.reduce((sum, e) => sum + (e.subsidyAmount || 0), 0);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Payment Management {(isDemoMode || status === 'unauthenticated') && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">Track payments and subsidy disbursement</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{pending.length}</p>
                <p className="text-sm text-gray-500 mt-1">₹{(totalPending / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-orange-500 text-white p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Paid</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{paid.length}</p>
                <p className="text-sm text-gray-500 mt-1">₹{(totalReceived / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Subsidy</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">₹{(totalSubsidy / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-blue-500 text-white p-3 rounded-lg">
                <IndianRupee size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-medium opacity-90">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">₹{((totalPending + totalReceived) / 100000).toFixed(2)}L</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center gap-4">
          <Filter size={20} className="text-gray-600" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg text-gray-900"
          >
            <option value="all">All Payment Types</option>
            <option value="Direct">Direct</option>
            <option value="Subsidy + Direct">Subsidy + Direct</option>
            <option value="Bank Loan">Bank Loan</option>
          </select>
        </div>

        {/* Pending Payments */}
        {pending.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <Clock size={24} className="inline text-orange-600 mr-2" />
              Awaiting Payment ({pending.length})
            </h2>
            <div className="space-y-4">
              {pending.map(e => (
                <div key={e.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-700">{e.customerName}</h3>
                      <p className="text-sm text-gray-600">{e.registrationId} • {e.capacity} kW</p>
                    </div>
                    <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs">
                      Pending
                    </span>
                  </div>
                  <div className="bg-white rounded p-4 mb-4">
                    <p className="text-gray-700">Total Cost:</p>
                    <p className="font-bold text-2xl text-green-600 mt-2">₹{e.estimatedCost?.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleRecordPayment(e.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                  >
                    <CheckCircle size={16} className="inline mr-1" />
                    Record Payment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Received */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <CheckCircle size={24} className="inline text-green-600 mr-2" />
              Payment Received ({paid.length})
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-gray-900">Customer</th>
                <th className="text-left py-3 px-6 text-gray-900">Registration ID</th>
                <th className="text-left py-3 px-6 text-gray-900">Panel</th>
                <th className="text-right py-3 px-6 text-gray-900">Amount</th>
                <th className="text-left py-3 px-6 text-gray-900">Date</th>
                <th className="text-left py-3 px-6 text-gray-900">Method</th>
              </tr>
            </thead>
            <tbody>
              {paid.map(e => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-6 text-gray-700">{e.customerName}</td>
                  <td className="py-3 px-6 font-mono text-sm text-gray-700">{e.registrationId}</td>
                  <td className="py-3 px-6">
                    <span className={`px-2 py-1 rounded text-xs ${
                      e.panelTag === 'RTS' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {e.panelTag}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right font-bold text-green-600">
                    ₹{e.initialPayment?.toLocaleString()}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">{e.paymentDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{e.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
