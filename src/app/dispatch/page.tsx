// src/app/dispatch/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Truck, 
  Package, 
  MapPin, 
  Loader2, 
  Calendar,
  Building2,
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit2,
  Save,
  X
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

interface DispatchItem {
  id: string;
  enquiryId: string;
  customerName: string;
  phone?: string;
  capacity: string;
  address: string;
  district?: string;
  registrationId: string;
  applicationNumber?: string;
  status: 'ready_for_dispatch' | 'dispatched' | 'delivered' | 'cancelled';
  materials: string[];
  bomId?: string;
  
  // Dispatch Details
  dispatchDate?: Date;
  dispatchedBy?: string;
  trackingNumber?: string;
  transportCompany?: string;
  transportContact?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  
  // Delivery Details
  expectedDelivery?: Date;
  deliveredDate?: Date;
  deliveredTo?: string;
  deliveryNotes?: string;
  
  // Installation Team
  installationTeam?: string;
  installationScheduledDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
}

const demoDispatches: DispatchItem[] = [
  {
    id: 'DISP-001',
    enquiryId: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    phone: '9876543210',
    capacity: '5 kW',
    address: '123, Shankar Nagar, Raipur',
    district: 'Raipur',
    registrationId: 'CSPDCL-2026-001',
    applicationNumber: 'NP/23813/2022',
    status: 'ready_for_dispatch',
    materials: ['16x Solar Panels (330W)', '1x Inverter (5kW)', '1x Mounting Structure', 'AC/DC Cables', 'Junction Box', 'Earthing Kit'],
    bomId: 'BOM-001',
    installationTeam: 'Tech Team A',
    installationScheduledDate: new Date('2026-02-10'),
    createdAt: new Date('2026-01-25'),
    createdBy: 'Store Manager',
  },
  {
    id: 'DISP-002',
    enquiryId: 'ENQ-002',
    customerName: 'Priya Sharma',
    phone: '9876543211',
    capacity: '3 kW',
    address: '456, Civil Lines, Raipur',
    district: 'Raipur',
    registrationId: 'CSPDCL-2026-002',
    applicationNumber: 'NP/71635/2023',
    status: 'dispatched',
    materials: ['10x Solar Panels (330W)', '1x Inverter (3kW)', '1x Mounting Structure', 'AC/DC Cables', 'Junction Box', 'Earthing Kit'],
    bomId: 'BOM-002',
    dispatchDate: new Date('2026-02-05'),
    dispatchedBy: 'Ramesh Store Manager',
    trackingNumber: 'TRACK12345',
    transportCompany: 'XYZ Transport Ltd',
    transportContact: '9876543212',
    vehicleNumber: 'CG 04 AB 1234',
    driverName: 'Suresh Kumar',
    driverContact: '9876543213',
    expectedDelivery: new Date('2026-02-08'),
    installationTeam: 'Tech Team B',
    installationScheduledDate: new Date('2026-02-09'),
    createdAt: new Date('2026-02-04'),
    updatedAt: new Date('2026-02-05'),
  },
  {
    id: 'DISP-003',
    enquiryId: 'ENQ-003',
    customerName: 'Amit Patel',
    phone: '9876543214',
    capacity: '10 kW',
    address: '789, Telibandha, Raipur',
    district: 'Raipur',
    registrationId: 'CSPDCL-2026-003',
    applicationNumber: 'NP/1128878/2024',
    status: 'delivered',
    materials: ['30x Solar Panels (330W)', '2x Inverter (5kW)', '1x Mounting Structure', 'AC/DC Cables', 'Junction Boxes', 'Earthing Kit'],
    bomId: 'BOM-003',
    dispatchDate: new Date('2026-01-28'),
    dispatchedBy: 'Ramesh Store Manager',
    trackingNumber: 'TRACK12344',
    transportCompany: 'ABC Logistics',
    transportContact: '9876543215',
    vehicleNumber: 'CG 04 CD 5678',
    driverName: 'Rakesh Verma',
    driverContact: '9876543216',
    expectedDelivery: new Date('2026-01-30'),
    deliveredDate: new Date('2026-01-30'),
    deliveredTo: 'Amit Patel (Self)',
    deliveryNotes: 'All materials delivered in good condition',
    installationTeam: 'Tech Team C',
    installationScheduledDate: new Date('2026-02-01'),
    createdAt: new Date('2026-01-27'),
    updatedAt: new Date('2026-01-30'),
  },
];

export default function DispatchPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [dispatches, setDispatches] = useState<DispatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchItem | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Dispatch Form State
  const [dispatchForm, setDispatchForm] = useState({
    trackingNumber: '',
    transportCompany: '',
    transportContact: '',
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    expectedDelivery: '',
  });

  // Delivery Form State
  const [deliveryForm, setDeliveryForm] = useState({
    deliveredTo: '',
    deliveryNotes: '',
  });

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDispatches();
  }, [status]);

  const fetchDispatches = async () => {
    if (status === 'unauthenticated') {
      setDispatches(demoDispatches);
      setLoading(false);
      return;
    }

    if (status === 'authenticated') {
      try {
        setLoading(true);
        const response = await fetch('/api/dispatch');
        if (!response.ok) throw new Error('Failed to fetch dispatches');
        const data = await response.json();
        
        // Convert date strings to Date objects
        const dispatchesWithDates = data.map((disp: any) => ({
          ...disp,
          dispatchDate: disp.dispatchDate ? new Date(disp.dispatchDate) : undefined,
          expectedDelivery: disp.expectedDelivery ? new Date(disp.expectedDelivery) : undefined,
          deliveredDate: disp.deliveredDate ? new Date(disp.deliveredDate) : undefined,
          installationScheduledDate: disp.installationScheduledDate ? new Date(disp.installationScheduledDate) : undefined,
          createdAt: new Date(disp.createdAt),
          updatedAt: disp.updatedAt ? new Date(disp.updatedAt) : undefined,
        }));
        
        setDispatches(dispatchesWithDates);
      } catch (error) {
        console.error('Error fetching dispatches:', error);
        setDispatches(demoDispatches);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkDispatched = async () => {
    if (!selectedDispatch || isDemoMode) {
      if (isDemoMode) showDemoAlert();
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/dispatch/mark-dispatched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatchId: selectedDispatch.id,
          enquiryId: selectedDispatch.enquiryId,
          ...dispatchForm,
        }),
      });

      if (!response.ok) throw new Error('Failed to mark as dispatched');
      
      alert('Marked as dispatched successfully! Installation team has been notified.');
      setShowDispatchModal(false);
      setDispatchForm({
        trackingNumber: '',
        transportCompany: '',
        transportContact: '',
        vehicleNumber: '',
        driverName: '',
        driverContact: '',
        expectedDelivery: '',
      });
      fetchDispatches();
    } catch (error) {
      console.error('Error marking dispatched:', error);
      alert('Failed to update dispatch status');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!selectedDispatch || isDemoMode) {
      if (isDemoMode) showDemoAlert();
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/dispatch/mark-delivered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatchId: selectedDispatch.id,
          enquiryId: selectedDispatch.enquiryId,
          ...deliveryForm,
        }),
      });

      if (!response.ok) throw new Error('Failed to mark as delivered');
      
      alert('Marked as delivered successfully!');
      setShowDeliveryModal(false);
      setDeliveryForm({
        deliveredTo: '',
        deliveryNotes: '',
      });
      fetchDispatches();
    } catch (error) {
      console.error('Error marking delivered:', error);
      alert('Failed to update delivery status');
    } finally {
      setProcessing(false);
    }
  };

  const filteredDispatches = dispatches.filter(disp => {
    if (filterStatus === 'all') return true;
    return disp.status === filterStatus;
  });

  const readyForDispatch = dispatches.filter(d => d.status === 'ready_for_dispatch');
  const dispatched = dispatches.filter(d => d.status === 'dispatched');
  const delivered = dispatches.filter(d => d.status === 'delivered');

  // Check for overdue deliveries
  const overdueDispatches = dispatched.filter(d => 
    d.expectedDelivery && new Date() > d.expectedDelivery
  );

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dispatch Management {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">Track material dispatch and delivery to installation sites</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ready for Dispatch</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{readyForDispatch.length}</p>
              </div>
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Transit</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{dispatched.length}</p>
              </div>
              <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                <Truck size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{delivered.length}</p>
              </div>
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{overdueDispatches.length}</p>
              </div>
              <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        {overdueDispatches.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  {overdueDispatches.length} Overdue Deliveries
                </h3>
                <p className="text-sm text-red-700">
                  The following dispatches have exceeded their expected delivery date. Please contact transport companies.
                </p>
                <div className="mt-2 space-y-1">
                  {overdueDispatches.map(disp => (
                    <p key={disp.id} className="text-sm text-red-800">
                      • {disp.customerName} ({disp.trackingNumber}) - Expected: {disp.expectedDelivery?.toLocaleDateString()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', count: dispatches.length },
              { value: 'ready_for_dispatch', label: 'Ready', count: readyForDispatch.length },
              { value: 'dispatched', label: 'In Transit', count: dispatched.length },
              { value: 'delivered', label: 'Delivered', count: delivered.length },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                <span className="ml-2 text-xs">({filter.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ready for Dispatch */}
        {readyForDispatch.length > 0 && filterStatus === 'all' || filterStatus === 'ready_for_dispatch' ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package size={24} className="text-blue-600" />
              Ready for Dispatch ({readyForDispatch.length})
            </h2>
            <div className="space-y-4">
              {readyForDispatch.map(dispatch => (
                <div key={dispatch.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{dispatch.customerName}</h3>
                      <p className="text-sm text-gray-600">
                        {dispatch.applicationNumber || dispatch.registrationId} • {dispatch.capacity}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Enquiry: {dispatch.enquiryId} • BOM: {dispatch.bomId}
                      </p>
                      {dispatch.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                          <Phone size={14} />
                          {dispatch.phone}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin size={14} />
                        {dispatch.address}
                      </p>
                      {dispatch.installationTeam && (
                        <p className="text-sm text-blue-700 flex items-center gap-1 mt-1">
                          <Building2 size={14} />
                          Installation Team: {dispatch.installationTeam}
                          {dispatch.installationScheduledDate && (
                            <span className="ml-2">
                              (Scheduled: {dispatch.installationScheduledDate.toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDispatch(dispatch);
                        setShowDispatchModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Truck size={18} />
                      Mark as Dispatched
                    </button>
                  </div>

                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Materials to Dispatch:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {dispatch.materials.map((mat, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span>{mat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-gray-500">
                    Created: {dispatch.createdAt.toLocaleDateString()} by {dispatch.createdBy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* In Transit */}
        {dispatched.length > 0 && (filterStatus === 'all' || filterStatus === 'dispatched') ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Truck size={24} className="text-yellow-600" />
              In Transit ({dispatched.length})
            </h2>
            <div className="space-y-4">
              {dispatched.map(dispatch => {
                const isOverdue = dispatch.expectedDelivery && new Date() > dispatch.expectedDelivery;
                
                return (
                  <div 
                    key={dispatch.id} 
                    className={`border rounded-lg p-4 ${
                      isOverdue 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{dispatch.customerName}</h3>
                        <p className="text-sm text-gray-600">
                          {dispatch.applicationNumber || dispatch.registrationId} • {dispatch.capacity}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isOverdue
                            ? 'bg-red-200 text-red-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {isOverdue ? 'Overdue' : 'In Transit'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedDispatch(dispatch);
                            setShowDeliveryModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle size={14} />
                          Mark Delivered
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                      <div className="bg-white rounded p-2">
                        <p className="text-gray-600 text-xs mb-1">Tracking Number</p>
                        <p className="font-medium text-gray-900 font-mono">{dispatch.trackingNumber}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-gray-600 text-xs mb-1">Transport Company</p>
                        <p className="font-medium text-gray-900">{dispatch.transportCompany}</p>
                        {dispatch.transportContact && (
                          <p className="text-xs text-gray-600 mt-1">📞 {dispatch.transportContact}</p>
                        )}
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-gray-600 text-xs mb-1">Vehicle Details</p>
                        <p className="font-medium text-gray-900">{dispatch.vehicleNumber}</p>
                        {dispatch.driverName && (
                          <p className="text-xs text-gray-600 mt-1">
                            {dispatch.driverName} • {dispatch.driverContact}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-white rounded p-2">
                        <p className="text-gray-600 text-xs mb-1">Dispatch Date</p>
                        <p className="font-medium text-gray-900">
                          {dispatch.dispatchDate?.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">By: {dispatch.dispatchedBy}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-gray-600 text-xs mb-1">Expected Delivery</p>
                        <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                          {dispatch.expectedDelivery?.toLocaleDateString()}
                          {isOverdue && <span className="ml-2 text-xs">(Overdue)</span>}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                        <MapPin size={14} />
                        {dispatch.address}
                      </p>
                      {dispatch.installationTeam && (
                        <p className="text-sm text-blue-700">
                          Installation Team: {dispatch.installationTeam}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Delivered */}
        {delivered.length > 0 && (filterStatus === 'all' || filterStatus === 'delivered') ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle size={24} className="text-green-600" />
                Delivered ({delivered.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Application No</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Tracking</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Dispatch Date</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Delivered Date</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Delivered To</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Installation Team</th>
                  </tr>
                </thead>
                <tbody>
                  {delivered.map(dispatch => (
                    <tr key={dispatch.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6">
                        <div>
                          <p className="text-gray-900 font-medium">{dispatch.customerName}</p>
                          <p className="text-xs text-gray-500">{dispatch.capacity}</p>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <p className="font-mono text-sm text-gray-700">
                          {dispatch.applicationNumber || dispatch.registrationId}
                        </p>
                      </td>
                      <td className="py-3 px-6">
                        <p className="font-mono text-sm text-blue-600">{dispatch.trackingNumber}</p>
                        <p className="text-xs text-gray-600">{dispatch.transportCompany}</p>
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-700">
                        {dispatch.dispatchDate?.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 text-sm text-green-700 font-medium">
                        {dispatch.deliveredDate?.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-700">
                        {dispatch.deliveredTo || '-'}
                      </td>
                      <td className="py-3 px-6 text-sm text-blue-700">
                        {dispatch.installationTeam || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Empty State */}
        {filteredDispatches.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No dispatches found matching your criteria</p>
          </div>
        )}

        {/* Dispatch Modal */}
        {showDispatchModal && selectedDispatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Mark as Dispatched</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedDispatch.customerName} • {selectedDispatch.enquiryId}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDispatchModal(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.trackingNumber}
                    onChange={(e) => setDispatchForm({...dispatchForm, trackingNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="TRACK12345"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dispatchForm.transportCompany}
                      onChange={(e) => setDispatchForm({...dispatchForm, transportCompany: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="XYZ Transport Ltd"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport Contact
                    </label>
                    <input
                      type="tel"
                      value={dispatchForm.transportContact}
                      onChange={(e) => setDispatchForm({...dispatchForm, transportContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={dispatchForm.vehicleNumber}
                      onChange={(e) => setDispatchForm({...dispatchForm, vehicleNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="CG 04 AB 1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dispatchForm.expectedDelivery}
                      onChange={(e) => setDispatchForm({...dispatchForm, expectedDelivery: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      value={dispatchForm.driverName}
                      onChange={(e) => setDispatchForm({...dispatchForm, driverName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Suresh Kumar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver Contact
                    </label>
                    <input
                      type="tel"
                      value={dispatchForm.driverContact}
                      onChange={(e) => setDispatchForm({...dispatchForm, driverContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    <strong>Note:</strong> Installation team ({selectedDispatch.installationTeam}) will be notified via Telegram once materials are dispatched.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowDispatchModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMarkDispatched}
                    disabled={processing || !dispatchForm.trackingNumber || !dispatchForm.transportCompany || !dispatchForm.expectedDelivery}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Confirm Dispatch
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Modal */}
        {showDeliveryModal && selectedDispatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Mark as Delivered</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedDispatch.customerName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivered To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.deliveredTo}
                    onChange={(e) => setDeliveryForm({...deliveryForm, deliveredTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Customer Name (Self/Representative)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Notes
                  </label>
                  <textarea
                    value={deliveryForm.deliveryNotes}
                    onChange={(e) => setDeliveryForm({...deliveryForm, deliveryNotes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="All materials delivered in good condition..."
                  />
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-900">
                    <strong>Note:</strong> Installation team will be notified that materials have been delivered and are ready for installation.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeliveryModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMarkDelivered}
                    disabled={processing || !deliveryForm.deliveredTo}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Confirm Delivery
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
