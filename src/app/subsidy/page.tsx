// src/app/subsidy/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { IndianRupee, Clock, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

const demoSubsidies = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    registrationId: 'CSPDCL-2026-001',
    systemCost: 250000,
    subsidyAmount: 78000,
    subsidyStatus: 'applied',
    applicationDate: new Date('2026-01-20'),
    approvalDate: null,
    disbursementDate: null,
    bankAccount: 'XXXX-XXXX-1234',
    remarks: null,
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    registrationId: 'CSPDCL-2026-002',
    systemCost: 150000,
    subsidyAmount: 78000,
    subsidyStatus: 'approved',
    applicationDate: new Date('2026-01-18'),
    approvalDate: new Date('2026-01-22'),
    disbursementDate: null,
    bankAccount: 'XXXX-XXXX-5678',
    remarks: 'Approved by MNRE. Pending disbursement.',
  },
  {
    id: 'ENQ-003',
    customerName: 'Amit Patel',
    capacity: '10 kW',
    registrationId: 'CSPDCL-2026-003',
    systemCost: 500000,
    subsidyAmount: 94000,
    subsidyStatus: 'disbursed',
    applicationDate: new Date('2026-01-15'),
    approvalDate: new Date('2026-01-19'),
    disbursementDate: new Date('2026-01-23'),
    bankAccount: 'XXXX-XXXX-9012',
    remarks: 'Subsidy disbursed successfully',
  },
];

export default function SubsidyPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [subsidies, setSubsidies] = useState(demoSubsidies);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setSubsidies(demoSubsidies);
      setLoading(false);
    } else if (status === 'authenticated') {
      setSubsidies(demoSubsidies);
      setLoading(false);
    }
  }, [status]);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Update subsidy status for ${id} to ${newStatus}`);
  };

  const applied = subsidies.filter(s => s.subsidyStatus === 'applied');
  const approved = subsidies.filter(s => s.subsidyStatus === 'approved');
  const disbursed = subsidies.filter(s => s.subsidyStatus === 'disbursed');

  const totalApplied = applied.reduce((sum, s) => sum + s.subsidyAmount, 0);
  const totalApproved = approved.reduce((sum, s) => sum + s.subsidyAmount, 0);
  const totalDisbursed = disbursed.reduce((sum, s) => sum + s.subsidyAmount, 0);

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
            Subsidy Management {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">Track MNRE subsidy applications and disbursements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Applied</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{applied.length}</p>
                <p className="text-sm text-gray-500 mt-1">₹{(totalApplied / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-blue-500 text-white p-3 rounded-lg">
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{approved.length}</p>
                <p className="text-sm text-gray-500 mt-1">₹{(totalApproved / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Disbursed</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{disbursed.length}</p>
                <p className="text-sm text-gray-500 mt-1">₹{(totalDisbursed / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-lg">
                <IndianRupee size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-medium opacity-90">Total Subsidy Value</p>
            <p className="text-3xl font-bold mt-2">₹{((totalApplied + totalApproved + totalDisbursed) / 100000).toFixed(2)}L</p>
            <p className="text-xs mt-1 opacity-75">{subsidies.length} applications</p>
          </div>
        </div>

        {/* Applications Under Review */}
        {applied.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={24} className="text-blue-600" />
              Applications Under Review
            </h2>
            <div className="space-y-4">
              {applied.map(subsidy => (
                <div key={subsidy.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{subsidy.customerName}</h3>
                      <p className="text-sm text-gray-600">{subsidy.registrationId} • {subsidy.capacity}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied: {subsidy.applicationDate.toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      Under Review
                    </span>
                  </div>

                  <div className="bg-white rounded p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">System Cost:</p>
                        <p className="font-medium text-gray-900">₹{subsidy.systemCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Subsidy Amount:</p>
                        <p className="font-medium text-green-600 text-lg">₹{subsidy.subsidyAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Bank Account:</p>
                        <p className="font-medium text-gray-900">{subsidy.bankAccount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(subsidy.id, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(subsidy.id, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved - Pending Disbursement */}
        {approved.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle size={24} className="text-green-600" />
              Approved - Pending Disbursement
            </h2>
            <div className="space-y-4">
              {approved.map(subsidy => (
                <div key={subsidy.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{subsidy.customerName}</h3>
                      <p className="text-sm text-gray-600">{subsidy.registrationId} • {subsidy.capacity}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Approved: {subsidy.approvalDate?.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{subsidy.subsidyAmount.toLocaleString()}</p>
                      <span className="text-xs text-gray-600">{subsidy.bankAccount}</span>
                    </div>
                  </div>

                  {subsidy.remarks && (
                    <div className="bg-white rounded p-3 mb-4">
                      <p className="text-sm text-gray-700 italic">{subsidy.remarks}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(subsidy.id, 'disbursed')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1"
                  >
                    <IndianRupee size={16} />
                    Mark as Disbursed
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disbursed */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <IndianRupee size={24} className="text-blue-600" />
              Disbursed Subsidies
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Registration ID</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Capacity</th>
                <th className="text-right py-3 px-6 font-semibold text-gray-700">Subsidy Amount</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Applied Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Disbursed Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Bank Account</th>
              </tr>
            </thead>
            <tbody>
              {disbursed.map(subsidy => (
                <tr key={subsidy.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-gray-700">{subsidy.customerName}</td>
                  <td className="py-3 px-6 font-medium text-gray-700">{subsidy.registrationId}</td>
                  <td className="py-3 px-6 text-gray-700">{subsidy.capacity}</td>
                  <td className="py-3 px-6 text-right font-bold text-green-600">
                    ₹{subsidy.subsidyAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">{subsidy.applicationDate.toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{subsidy.disbursementDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-sm font-mono text-gray-700">{subsidy.bankAccount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
