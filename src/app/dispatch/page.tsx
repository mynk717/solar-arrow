// src/app/dispatch/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Truck, Package, MapPin, Loader2 } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

const demoDispatches = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    address: '123, Shankar Nagar, Raipur',
    registrationId: 'CSPDCL-2026-001',
    status: 'ready_for_dispatch',
    materials: ['16x Solar Panels', '1x Inverter', 'Mounting Structure', 'Cables & Accessories'],
    dispatchDate: null,
    trackingNumber: null,
    transportCompany: null,
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    address: '456, Civil Lines, Raipur',
    registrationId: 'CSPDCL-2026-002',
    status: 'dispatched',
    materials: ['10x Solar Panels', '1x Inverter', 'Mounting Structure', 'Cables & Accessories'],
    dispatchDate: new Date('2026-01-22'),
    trackingNumber: 'TRACK12345',
    transportCompany: 'XYZ Transport Ltd',
    expectedDelivery: new Date('2026-01-25'),
  },
  {
    id: 'ENQ-003',
    customerName: 'Amit Patel',
    capacity: '10 kW',
    address: '789, Telibandha, Raipur',
    registrationId: 'CSPDCL-2026-003',
    status: 'delivered',
    materials: ['30x Solar Panels', '1x Inverter', 'Mounting Structure', 'Cables & Accessories'],
    dispatchDate: new Date('2026-01-18'),
    trackingNumber: 'TRACK12344',
    transportCompany: 'ABC Logistics',
    expectedDelivery: new Date('2026-01-21'),
    deliveredDate: new Date('2026-01-21'),
  },
];

export default function DispatchPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [dispatches, setDispatches] = useState(demoDispatches);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setDispatches(demoDispatches);
      setLoading(false);
    } else if (status === 'authenticated') {
      setDispatches(demoDispatches);
      setLoading(false);
    }
  }, [status]);

  const handleDispatch = (id: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Mark ${id} as dispatched`);
  };

  const readyForDispatch = dispatches.filter(d => d.status === 'ready_for_dispatch');
  const dispatched = dispatches.filter(d => d.status === 'dispatched');
  const delivered = dispatches.filter(d => d.status === 'delivered');

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
            Dispatch Management {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">Track material dispatch and delivery</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ready for Dispatch</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{readyForDispatch.length}</p>
              </div>
              <div className="bg-blue-500 text-white p-3 rounded-lg">
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
              <div className="bg-yellow-500 text-white p-3 rounded-lg">
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
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <MapPin size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Ready for Dispatch */}
        {readyForDispatch.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package size={24} className="text-blue-600" />
              Ready for Dispatch
            </h2>
            <div className="space-y-4">
              {readyForDispatch.map(dispatch => (
                <div key={dispatch.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{dispatch.id} - {dispatch.customerName}</h3>
                      <p className="text-sm text-gray-600">{dispatch.capacity} • {dispatch.registrationId}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                        <MapPin size={14} />
                        {dispatch.address}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDispatch(dispatch.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Truck size={18} />
                      Mark as Dispatched
                    </button>
                  </div>

                  <div className="bg-white rounded p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Materials to Dispatch:</p>
                    <ul className="space-y-1">
                      {dispatch.materials.map((mat, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {mat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Transit */}
        {dispatched.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Truck size={24} className="text-yellow-600" />
              In Transit
            </h2>
            <div className="space-y-4">
              {dispatched.map(dispatch => (
                <div key={dispatch.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{dispatch.customerName}</h3>
                      <p className="text-sm text-gray-600">{dispatch.registrationId}</p>
                    </div>
                    <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                      In Transit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Tracking Number:</p>
                      <p className="font-medium text-gray-900">{dispatch.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Transport Company:</p>
                      <p className="font-medium text-gray-900">{dispatch.transportCompany}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dispatch Date:</p>
                      <p className="font-medium text-gray-900">{dispatch.dispatchDate?.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expected Delivery:</p>
                      <p className="font-medium text-gray-900">{dispatch.expectedDelivery?.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin size={14} />
                      {dispatch.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivered */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Delivered</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Registration ID</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Dispatch Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Delivered Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Tracking</th>
              </tr>
            </thead>
            <tbody>
              {delivered.map(dispatch => (
                <tr key={dispatch.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-gray-700">{dispatch.customerName}</td>
                  <td className="py-3 px-6 font-medium text-gray-700">{dispatch.registrationId}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{dispatch.dispatchDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{dispatch.deliveredDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-sm font-mono text-blue-600">{dispatch.trackingNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
