// src/app/liaison/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Clock, CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

const demoLiaisons = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    registrationId: 'CSPDCL-2026-001',
    installationDate: new Date('2026-01-20'),
    liaisonStage: 'inspection_pending',
    inspectionOfficer: 'Ramesh Verma',
    inspectionDate: new Date('2026-01-23'),
    inspectionNotes: null,
    inspectionStatus: null,
    meterInstallationDate: null,
    netMeteringAgreement: false,
    gridSyncDate: null,
    documents: ['installation_report.pdf', 'safety_certificate.pdf'],
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    registrationId: 'CSPDCL-2026-002',
    installationDate: new Date('2026-01-18'),
    liaisonStage: 'inspection_approved',
    inspectionOfficer: 'Suresh Kumar',
    inspectionDate: new Date('2026-01-21'),
    inspectionNotes: 'All safety measures verified. Installation quality good.',
    inspectionStatus: 'approved',
    meterInstallationDate: new Date('2026-01-24'),
    netMeteringAgreement: true,
    gridSyncDate: null,
    documents: ['installation_report.pdf', 'safety_certificate.pdf', 'inspection_approval.pdf'],
  },
  {
    id: 'ENQ-003',
    customerName: 'Amit Patel',
    capacity: '10 kW',
    registrationId: 'CSPDCL-2026-003',
    installationDate: new Date('2026-01-15'),
    liaisonStage: 'grid_synced',
    inspectionOfficer: 'Prakash Jain',
    inspectionDate: new Date('2026-01-18'),
    inspectionNotes: 'System verified and approved',
    inspectionStatus: 'approved',
    meterInstallationDate: new Date('2026-01-20'),
    netMeteringAgreement: true,
    gridSyncDate: new Date('2026-01-22'),
    documents: ['installation_report.pdf', 'safety_certificate.pdf', 'inspection_approval.pdf', 'net_metering_agreement.pdf'],
  },
];

export default function LiaisonPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [liaisons, setLiaisons] = useState(demoLiaisons);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLiaisons(demoLiaisons);
      setLoading(false);
    } else if (status === 'authenticated') {
      setLiaisons(demoLiaisons);
      setLoading(false);
    }
  }, [status]);

  const handleRecordInspection = (id: string, approved: boolean) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Recording inspection for ${id}: ${approved ? 'Approved' : 'Rejected'}`);
  };

  const handleUploadDocument = (id: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Upload document for ${id}`);
  };

  const inspectionPending = liaisons.filter(l => l.liaisonStage === 'inspection_pending');
  const inspectionApproved = liaisons.filter(l => l.liaisonStage === 'inspection_approved');
  const gridSynced = liaisons.filter(l => l.liaisonStage === 'grid_synced');

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
            Liaison & Grid Synchronization {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">CSPDCL inspection, net metering & grid sync</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Awaiting Inspection</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{inspectionPending.length}</p>
              </div>
              <div className="bg-yellow-500 text-white p-3 rounded-lg">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Inspection Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{inspectionApproved.length}</p>
              </div>
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Grid Synced</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{gridSynced.length}</p>
              </div>
              <div className="bg-blue-500 text-white p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Awaiting Inspection */}
        {inspectionPending.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={24} className="text-yellow-600" />
              Awaiting CSPDCL Inspection
            </h2>
            <div className="space-y-4">
              {inspectionPending.map(liaison => (
                <div key={liaison.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{liaison.customerName}</h3>
                      <p className="text-sm text-gray-600">{liaison.registrationId} • {liaison.capacity}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Installation Completed: {liaison.installationDate.toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                      Inspection Pending
                    </span>
                  </div>

                  <div className="bg-white rounded p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Inspection Officer:</p>
                        <p className="font-medium text-gray-900">{liaison.inspectionOfficer}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Scheduled Date:</p>
                        <p className="font-medium text-gray-900">{liaison.inspectionDate.toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Documents Submitted:</p>
                      <div className="flex flex-wrap gap-2">
                        {liaison.documents.map((doc, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRecordInspection(liaison.id, true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={16} />
                      Approve Inspection
                    </button>
                    <button
                      onClick={() => handleRecordInspection(liaison.id, false)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleUploadDocument(liaison.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm"
                    >
                      <Upload size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspection Approved - Pending Net Metering */}
        {inspectionApproved.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle size={24} className="text-green-600" />
              Inspection Approved - Net Metering Pending
            </h2>
            <div className="space-y-4">
              {inspectionApproved.map(liaison => (
                <div key={liaison.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{liaison.customerName}</h3>
                      <p className="text-sm text-gray-600">{liaison.registrationId} • {liaison.capacity}</p>
                    </div>
                    <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      Approved
                    </span>
                  </div>

                  <div className="bg-white rounded p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Inspection Date:</p>
                        <p className="font-medium text-gray-900">{liaison.inspectionDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Inspector:</p>
                        <p className="font-medium text-gray-900">{liaison.inspectionOfficer}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Meter Installation:</p>
                        <p className="font-medium text-gray-900">{liaison.meterInstallationDate?.toLocaleDateString() || 'Pending'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Net Metering Agreement:</p>
                        <p className={`font-medium ${liaison.netMeteringAgreement ? 'text-green-600' : 'text-red-600'}`}>
                          {liaison.netMeteringAgreement ? '✓ Signed' : '✗ Pending'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-700 italic">{liaison.inspectionNotes}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => isDemoMode ? showDemoAlert() : alert('Schedule meter installation')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
                    >
                      Schedule Meter Installation
                    </button>
                    <button
                      onClick={() => handleUploadDocument(liaison.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm flex items-center gap-1"
                    >
                      <Upload size={16} />
                      Documents
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid Synced - Active Systems */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle size={24} className="text-blue-600" />
              Grid Synchronized - Active Systems
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Registration ID</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Capacity</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Inspection Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Grid Sync Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {gridSynced.map(liaison => (
                <tr key={liaison.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6">{liaison.customerName}</td>
                  <td className="py-3 px-6 font-medium">{liaison.registrationId}</td>
                  <td className="py-3 px-6">{liaison.capacity}</td>
                  <td className="py-3 px-6 text-sm">{liaison.inspectionDate.toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-sm">{liaison.gridSyncDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-6">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      Active
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
