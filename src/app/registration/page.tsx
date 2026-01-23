// src/app/registration/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileCheck, Upload, Loader2, CheckCircle, Clock } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';
import StatusBadge from '@/components/StatusBadge';

const demoRegistrations = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    area: 'Shankar Nagar',
    registrationId: 'CSPDCL-2026-001',
    registrationDate: new Date('2026-01-15'),
    vendorName: 'Hope Energy',
    status: 'approved',
    documents: ['aadhar.pdf', 'electricity_bill.pdf', 'roof_ownership.pdf'],
    approvalDate: new Date('2026-01-18'),
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    area: 'Civil Lines',
    registrationId: 'CSPDCL-2026-002',
    registrationDate: new Date('2026-01-20'),
    vendorName: 'Hope Energy',
    status: 'pending',
    documents: ['aadhar.pdf', 'electricity_bill.pdf'],
    approvalDate: null,
  },
  {
    id: 'ENQ-003',
    customerName: 'Amit Patel',
    capacity: '10 kW',
    area: 'Telibandha',
    registrationId: null,
    registrationDate: null,
    vendorName: 'Hope Energy',
    status: 'not_registered',
    documents: [],
    approvalDate: null,
  },
];

export default function RegistrationPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [registrations, setRegistrations] = useState(demoRegistrations);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setRegistrations(demoRegistrations);
      setLoading(false);
    } else if (status === 'authenticated') {
      setRegistrations(demoRegistrations);
      setLoading(false);
    }
  }, [status]);

  const handleRegister = (enquiryId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Registering ${enquiryId} with CSPDCL`);
  };

  const handleUploadDoc = (enquiryId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Upload document for ${enquiryId}`);
  };

  const notRegistered = registrations.filter(r => r.status === 'not_registered');
  const pending = registrations.filter(r => r.status === 'pending');
  const approved = registrations.filter(r => r.status === 'approved');

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
            CSPDCL Registration {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">Register solar installations with CSPDCL</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Registration</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{notRegistered.length}</p>
              </div>
              <div className="bg-red-500 text-white p-3 rounded-lg">
                <FileCheck size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Under Review</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pending.length}</p>
              </div>
              <div className="bg-yellow-500 text-white p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{approved.length}</p>
              </div>
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Registration */}
        {notRegistered.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Registration</h2>
            <div className="space-y-4">
              {notRegistered.map(reg => (
                <div key={reg.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{reg.id} - {reg.customerName}</h3>
                      <p className="text-sm text-gray-600">{reg.area} • {reg.capacity}</p>
                    </div>
                    <button
                      onClick={() => handleRegister(reg.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Register with CSPDCL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Under Review */}
        {pending.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Under Review</h2>
            <div className="space-y-4">
              {pending.map(reg => (
                <div key={reg.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{reg.registrationId}</h3>
                      <p className="text-sm text-gray-600">{reg.customerName} • {reg.capacity}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Registered: {reg.registrationDate?.toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                      Under Review
                    </span>
                  </div>

                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {reg.documents.map((doc, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {doc}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleUploadDoc(reg.id)}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Upload size={14} />
                      Upload Additional Document
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Approved Registrations</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Registration ID</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Capacity</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Registered Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Approved Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {approved.map(reg => (
                <tr key={reg.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 font-medium text-gray-900">{reg.registrationId}</td>
                  <td className="py-3 px-6 text-gray-900">{reg.customerName}</td>
                  <td className="py-3 px-6 text-gray-700">{reg.capacity}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{reg.registrationDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{reg.approvalDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-6">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      Approved
                    </span>
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
