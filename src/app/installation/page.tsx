// src/app/installation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Enquiry } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { Truck, Wrench, ClipboardCheck, Package, Loader2 } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { demoEnquiries } from '@/lib/demoData';
import { useDemoMode } from '@/contexts/DemoContext';

const installationTeams = ['Tech Team A', 'Tech Team B', 'Tech Team C'];

export default function InstallationPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(demoEnquiries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch enquiries from API or use demo data
  useEffect(() => {
    const fetchData = async () => {
      // If not authenticated, use demo data
      if (status === 'unauthenticated') {
        setEnquiries(demoEnquiries);
        setLoading(false);
        return;
      }

      // If authenticated, fetch real data
      if (status === 'authenticated') {
        try {
          setLoading(true);
          const response = await fetch('/api/enquiries');
          if (!response.ok) throw new Error('Failed to fetch enquiries');
          const data = await response.json();

          // Convert date strings back to Date objects
          const enquiriesWithDates = data.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
            surveyDate: e.surveyDate ? new Date(e.surveyDate) : undefined,
            registrationDate: e.registrationDate ? new Date(e.registrationDate) : undefined,
            paymentDate: e.paymentDate ? new Date(e.paymentDate) : undefined,
            dispatchDate: e.dispatchDate ? new Date(e.dispatchDate) : undefined,
            installationDate: e.installationDate ? new Date(e.installationDate) : undefined,
            inspectionDate: e.inspectionDate ? new Date(e.inspectionDate) : undefined,
            activationDate: e.activationDate ? new Date(e.activationDate) : undefined,
          }));

          setEnquiries(enquiriesWithDates);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [status]);

  // FIXED: Changed underscore to hyphen for all status values
  const readyForDispatch = enquiries.filter(e => e.status === 'payment-received');
  const dispatched = enquiries.filter(e => e.status === 'dispatched' || e.status === 'dispatch-pending');
  const inInstallation = enquiries.filter(e => 
    e.status === 'installation-pending' || (e.dispatchDate && !e.installationDate)
  );
  const installationCompleted = enquiries.filter(e => 
    e.status === 'installation-completed' && e.installationDate
  );
  const awaitingInspection = enquiries.filter(e => e.installationDate && !e.inspectionDate);

  const handleDispatch = (enquiryId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    setEnquiries(prev => prev.map(e => 
      e.id === enquiryId 
        ? { 
            ...e, 
            dispatchDate: new Date(), 
            status: 'dispatched' as any,
            updatedAt: new Date()
          }
        : e
    ));
  };

  const handleInstallation = (enquiryId: string, team: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    setEnquiries(prev => prev.map(e => 
      e.id === enquiryId 
        ? { 
            ...e, 
            installationDate: new Date(), 
            installedBy: team,
            status: 'installation-completed' as any,
            updatedAt: new Date()
          }
        : e
    ));
  };

  const handleInspection = (enquiryId: string, approved: boolean, officer: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    setEnquiries(prev => prev.map(e => 
      e.id === enquiryId 
        ? { 
            ...e, 
            inspectionDate: new Date(), 
            inspectionOfficer: officer,
            inspectionApproved: approved,
            activationDate: approved ? new Date() : undefined,
            status: (approved ? 'active' : 'installation-completed') as any,
            updatedAt: new Date()
          }
        : e
    ));
  };

  // Loading state
  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading installation data...</p>
        </div>
      </div>
    );
  }

  // Error state (only for authenticated users)
  if (error && !isDemoMode) {
    return (
      <div>
        <DemoBanner />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DemoBanner />
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Installation Management {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">
            {isDemoMode 
              ? 'Viewing sample installation data - Sign in to manage real installations'
              : 'Manage dispatch, installation, and inspection process'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard 
            title="Ready for Dispatch" 
            value={readyForDispatch.length} 
            icon={Package} 
            color="bg-blue-500"
            isDemoMode={isDemoMode}
          />
          <StatCard 
            title="Dispatched" 
            value={dispatched.length} 
            icon={Truck} 
            color="bg-purple-500"
            isDemoMode={isDemoMode}
          />
          <StatCard 
            title="In Installation" 
            value={inInstallation.length} 
            icon={Wrench} 
            color="bg-orange-500"
            isDemoMode={isDemoMode}
          />
          <StatCard 
            title="Awaiting Inspection" 
            value={awaitingInspection.length} 
            icon={ClipboardCheck} 
            color="bg-yellow-500"
            isDemoMode={isDemoMode}
          />
          <StatCard 
            title="Completed" 
            value={installationCompleted.filter(e => e.status === 'active').length} 
            icon={ClipboardCheck} 
            color="bg-green-500"
            isDemoMode={isDemoMode}
          />
        </div>

        {/* Ready for Dispatch */}
        {readyForDispatch.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="text-blue-500" size={24} />
              Ready for Dispatch
            </h2>
            <div className="space-y-4">
              {readyForDispatch.map(enquiry => (
                <DispatchCard 
                  key={enquiry.id} 
                  enquiry={enquiry} 
                  onDispatch={handleDispatch}
                  isDemoMode={isDemoMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dispatched & In Installation */}
        {(dispatched.length > 0 || inInstallation.length > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Wrench className="text-orange-500" size={24} />
              Installation in Progress
            </h2>
            <div className="space-y-4">
              {[...dispatched, ...inInstallation].map(enquiry => (
                <InstallationCard 
                  key={enquiry.id} 
                  enquiry={enquiry} 
                  onComplete={handleInstallation}
                  isDemoMode={isDemoMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Awaiting Inspection */}
        {awaitingInspection.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ClipboardCheck className="text-yellow-500" size={24} />
              Awaiting Government Inspection
            </h2>
            <div className="space-y-4">
              {awaitingInspection.map(enquiry => (
                <InspectionCard 
                  key={enquiry.id} 
                  enquiry={enquiry} 
                  onInspect={handleInspection}
                  isDemoMode={isDemoMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Installations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ClipboardCheck className="text-green-500" size={24} />
            Completed & Active Systems
          </h2>
          {installationCompleted.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No completed installations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Capacity</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Dispatch Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Installation Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Installed By</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Inspection</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {installationCompleted.map(enquiry => (
                    <tr key={enquiry.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-700">{enquiry.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{enquiry.customerName}</div>
                          <div className="text-sm text-gray-600">{enquiry.area}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{enquiry.capacity} kW</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {enquiry.dispatchDate?.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {enquiry.installationDate?.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{enquiry.installedBy}</td>
                      <td className="py-3 px-4 text-sm">
                        {enquiry.inspectionApproved ? (
                          <span className="text-green-600">✓ Approved</span>
                        ) : enquiry.inspectionDate ? (
                          <span className="text-red-600">✗ Rejected</span>
                        ) : (
                          <span className="text-yellow-600">⏳ Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={enquiry.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, isDemoMode }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      {isDemoMode && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
          Demo
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function DispatchCard({ enquiry, onDispatch, isDemoMode }: any) {
  const [isDispatching, setIsDispatching] = useState(false);

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-600 mt-1">
            Payment Received: {enquiry.paymentDate?.toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Materials to Dispatch</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Solar Panels: {parseInt(enquiry.capacity) * 3} units (330W each)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Inverter: 1 unit ({enquiry.capacity}kW)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Mounting Structure: Complete set
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Wiring & Accessories: Complete kit
          </li>
        </ul>
      </div>

      {!isDispatching ? (
        <button 
          onClick={() => setIsDispatching(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Truck size={20} />
          Mark as Dispatched
        </button>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Number
            </label>
            <input 
              type="text" 
              placeholder="Enter shipment tracking number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transport Company
            </label>
            <input 
              type="text" 
              placeholder="e.g., Transport Co. Ltd"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Delivery Date
            </label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                onDispatch(enquiry.id);
                setIsDispatching(false);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Confirm Dispatch
            </button>
            <button 
              onClick={() => setIsDispatching(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InstallationCard({ enquiry, onComplete, isDemoMode }: any) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(installationTeams[0]);

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-600 mt-1">
            Dispatched: {enquiry.dispatchDate?.toLocaleDateString()}
          </p>
          <p className="text-sm font-medium text-gray-700 mt-2">{enquiry.address}</p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      {!isCompleting ? (
        <button 
          onClick={() => setIsCompleting(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Wrench size={20} />
          Mark Installation Complete
        </button>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installation Team
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              {installationTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installation Notes
            </label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Enter installation details, any issues, etc."
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                onComplete(enquiry.id, selectedTeam);
                setIsCompleting(false);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Complete Installation
            </button>
            <button 
              onClick={() => setIsCompleting(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InspectionCard({ enquiry, onInspect, isDemoMode }: any) {
  const [isInspecting, setIsInspecting] = useState(false);

  return (
    <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-600 mt-1">
            Installation Completed: {enquiry.installationDate?.toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Installed by: {enquiry.installedBy}
          </p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      {!isInspecting ? (
        <button 
          onClick={() => setIsInspecting(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
        >
          <ClipboardCheck size={20} />
          Record Inspection
        </button>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Officer
            </label>
            <input 
              type="text" 
              placeholder="Officer name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Notes
            </label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={2}
              placeholder="Inspection findings..."
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                onInspect(enquiry.id, true, 'Government Inspector');
                setIsInspecting(false);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              ✓ Approve
            </button>
            <button 
              onClick={() => {
                onInspect(enquiry.id, false, 'Government Inspector');
                setIsInspecting(false);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              ✗ Reject
            </button>
            <button 
              onClick={() => setIsInspecting(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}