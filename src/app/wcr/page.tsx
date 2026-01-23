// src/app/wcr/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileCheck, Download, Upload, Loader2, Camera, CheckCircle } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

const demoWCRs = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    registrationId: 'CSPDCL-2026-001',
    installationDate: new Date('2026-01-20'),
    installedBy: 'Tech Team A',
    wcrStatus: 'pending',
    wcrSubmittedDate: null,
    wcrApprovedDate: null,
    photos: [],
    checklist: {
      panelsInstalled: true,
      invertorInstalled: true,
      wiringComplete: true,
      earthingDone: true,
      safetyMeasures: true,
      systemTested: false,
      customerBriefed: false,
    },
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    registrationId: 'CSPDCL-2026-002',
    installationDate: new Date('2026-01-18'),
    installedBy: 'Tech Team B',
    wcrStatus: 'submitted',
    wcrSubmittedDate: new Date('2026-01-19'),
    wcrApprovedDate: null,
    photos: ['site_before.jpg', 'panels_installed.jpg', 'inverter_setup.jpg', 'site_after.jpg'],
    checklist: {
      panelsInstalled: true,
      invertorInstalled: true,
      wiringComplete: true,
      earthingDone: true,
      safetyMeasures: true,
      systemTested: true,
      customerBriefed: true,
    },
  },
  {
    id: 'ENQ-003',
    customerName: 'Amit Patel',
    capacity: '10 kW',
    registrationId: 'CSPDCL-2026-003',
    installationDate: new Date('2026-01-15'),
    installedBy: 'Tech Team A',
    wcrStatus: 'approved',
    wcrSubmittedDate: new Date('2026-01-16'),
    wcrApprovedDate: new Date('2026-01-17'),
    photos: ['site_before.jpg', 'panels_installed.jpg', 'inverter_setup.jpg', 'site_after.jpg', 'meter_setup.jpg'],
    checklist: {
      panelsInstalled: true,
      invertorInstalled: true,
      wiringComplete: true,
      earthingDone: true,
      safetyMeasures: true,
      systemTested: true,
      customerBriefed: true,
    },
  },
];

export default function WCRPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [wcrs, setWcrs] = useState(demoWCRs);
  const [loading, setLoading] = useState(false);
  const [selectedWCR, setSelectedWCR] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setWcrs(demoWCRs);
      setLoading(false);
    } else if (status === 'authenticated') {
      setWcrs(demoWCRs);
      setLoading(false);
    }
  }, [status]);

  const handleSubmitWCR = (id: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Submit WCR for ${id}`);
  };

  const handleApproveWCR = (id: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Approve WCR for ${id}`);
  };

  const handleUploadPhotos = (id: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Upload photos for ${id}`);
  };

  const pending = wcrs.filter(w => w.wcrStatus === 'pending');
  const submitted = wcrs.filter(w => w.wcrStatus === 'submitted');
  const approved = wcrs.filter(w => w.wcrStatus === 'approved');

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
            Work Completion Report {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">Installation completion documentation & approval</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending WCR</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pending.length}</p>
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
                <p className="text-3xl font-bold text-yellow-600 mt-2">{submitted.length}</p>
              </div>
              <div className="bg-yellow-500 text-white p-3 rounded-lg">
                <FileCheck size={24} />
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

        {/* Pending WCR */}
        {pending.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Submission</h2>
            <div className="space-y-4">
              {pending.map(wcr => (
                <div key={wcr.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{wcr.customerName}</h3>
                      <p className="text-sm text-gray-600">{wcr.registrationId} • {wcr.capacity}</p>
                      <p className="text-sm text-gray-600">Installed by: {wcr.installedBy}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Installation Date: {wcr.installationDate.toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedWCR(wcr)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Complete WCR
                    </button>
                  </div>

                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Checklist Status:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(wcr.checklist).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${value ? 'bg-green-500' : 'bg-gray-300'}`}>
                            {value && <CheckCircle size={16} className="text-white" />}
                          </div>
                          <span className={value ? 'text-gray-700' : 'text-gray-400'}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submitted - Under Review */}
        {submitted.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Under Review</h2>
            <div className="space-y-4">
              {submitted.map(wcr => (
                <div key={wcr.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{wcr.customerName}</h3>
                      <p className="text-sm text-gray-600">{wcr.registrationId} • {wcr.capacity}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted: {wcr.wcrSubmittedDate?.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveWCR(wcr.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedWCR(wcr)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera size={16} className="text-blue-600" />
                      <p className="text-sm font-medium text-gray-700">Photos: {wcr.photos.length}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {wcr.photos.slice(0, 4).map((photo, idx) => (
                        <div key={idx} className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                          {idx + 1}
                        </div>
                      ))}
                      {wcr.photos.length > 4 && (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                          +{wcr.photos.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved WCRs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Approved WCRs</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Registration ID</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Installation Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Submitted</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Approved</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approved.map(wcr => (
                <tr key={wcr.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-gray-700">{wcr.customerName}</td>
                  <td className="py-3 px-6 font-medium text-gray-700">{wcr.registrationId}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{wcr.installationDate.toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{wcr.wcrSubmittedDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{wcr.wcrApprovedDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-6">
                    <button
                      onClick={() => isDemoMode ? showDemoAlert() : alert('Download WCR')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* WCR Details Modal */}
        {selectedWCR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Work Completion Report</h2>
                  <button
                    onClick={() => setSelectedWCR(null)}
                    className="text-gray-600 hover:text-gray-900 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{selectedWCR.customerName} • {selectedWCR.registrationId}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Installation Checklist */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Installation Checklist</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedWCR.checklist).map(([key, value]: [string, any]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input type="checkbox" checked={value} readOnly className="rounded" />
                        <span className="text-gray-700">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">Installation Photos</h3>
                    <button
                      onClick={() => handleUploadPhotos(selectedWCR.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Upload size={14} />
                      Upload More
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedWCR.photos.map((photo: string, idx: number) => (
                      <div key={idx} className="aspect-square bg-gray-200 rounded flex items-center justify-center text-gray-600">
                        <Camera size={32} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedWCR.wcrStatus === 'pending' && (
                  <button
                    onClick={() => handleSubmitWCR(selectedWCR.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg"
                  >
                    Submit WCR for Approval
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
