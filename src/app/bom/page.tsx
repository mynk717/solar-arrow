// src/app/bom/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Package, Download, Loader2, CheckCircle } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

const demoBOMs = [
  {
    id: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    registrationId: 'CSPDCL-2026-001',
    materials: [
      { item: 'Solar Panels (330W)', quantity: 16, unit: 'units', unitPrice: 8500, total: 136000 },
      { item: 'Inverter (5kW)', quantity: 1, unit: 'unit', unitPrice: 45000, total: 45000 },
      { item: 'Mounting Structure', quantity: 1, unit: 'set', unitPrice: 35000, total: 35000 },
      { item: 'AC/DC Cables', quantity: 1, unit: 'set', unitPrice: 12000, total: 12000 },
      { item: 'Junction Box', quantity: 1, unit: 'unit', unitPrice: 3000, total: 3000 },
      { item: 'Earthing Kit', quantity: 1, unit: 'set', unitPrice: 5000, total: 5000 },
      { item: 'Installation Labor', quantity: 1, unit: 'set', unitPrice: 14000, total: 14000 },
    ],
    totalCost: 250000,
    status: 'approved',
    createdAt: new Date('2026-01-18'),
  },
  {
    id: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    registrationId: 'CSPDCL-2026-002',
    materials: [
      { item: 'Solar Panels (330W)', quantity: 10, unit: 'units', unitPrice: 8500, total: 85000 },
      { item: 'Inverter (3kW)', quantity: 1, unit: 'unit', unitPrice: 28000, total: 28000 },
      { item: 'Mounting Structure', quantity: 1, unit: 'set', unitPrice: 20000, total: 20000 },
      { item: 'AC/DC Cables', quantity: 1, unit: 'set', unitPrice: 8000, total: 8000 },
      { item: 'Junction Box', quantity: 1, unit: 'unit', unitPrice: 2000, total: 2000 },
      { item: 'Earthing Kit', quantity: 1, unit: 'set', unitPrice: 3000, total: 3000 },
      { item: 'Installation Labor', quantity: 1, unit: 'set', unitPrice: 4000, total: 4000 },
    ],
    totalCost: 150000,
    status: 'pending',
    createdAt: new Date('2026-01-21'),
  },
];

export default function BOMPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [boms, setBoms] = useState(demoBOMs);
  const [loading, setLoading] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setBoms(demoBOMs);
      setLoading(false);
    } else if (status === 'authenticated') {
      setBoms(demoBOMs);
      setLoading(false);
    }
  }, [status]);

  const handleDownloadBOM = (bomId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    alert(`Downloading BOM for ${bomId}`);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bill of Materials {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">Manage material requirements for installations</p>
        </div>

        {/* BOM List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {boms.map(bom => (
            <div key={bom.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{bom.customerName}</h3>
                  <p className="text-sm text-gray-600">{bom.registrationId} • {bom.capacity}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {bom.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  bom.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {bom.status === 'approved' ? 'Approved' : 'Pending'}
                </span>
              </div>

              {/* Material Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={18} className="text-blue-600" />
                  <p className="font-semibold text-gray-900">Materials Required:</p>
                </div>
                <div className="space-y-2">
                  {bom.materials.slice(0, 3).map((mat, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{mat.item}</span>
                      <span className="text-gray-900 font-medium">
                        {mat.quantity} {mat.unit}
                      </span>
                    </div>
                  ))}
                  {bom.materials.length > 3 && (
                    <p className="text-xs text-gray-500 italic">
                      +{bom.materials.length - 3} more items
                    </p>
                  )}
                </div>
              </div>

              {/* Total Cost */}
              <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-lg">
                <span className="font-semibold text-gray-900">Total Cost:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{bom.totalCost.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBOM(bom)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDownloadBOM(bom.id)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm flex items-center gap-1"
                >
                  <Download size={16} />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BOM Details Modal */}
        {selectedBOM && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Bill of Materials</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedBOM.customerName} • {selectedBOM.registrationId}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBOM(null)}
                    className="text-gray-600 hover:text-gray-900 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBOM.materials.map((mat: any, idx: number) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="py-3 px-4">{mat.item}</td>
                        <td className="py-3 px-4 text-right">
                          {mat.quantity} {mat.unit}
                        </td>
                        <td className="py-3 px-4 text-right">₹{mat.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          ₹{mat.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50 font-bold">
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-right">Total:</td>
                      <td className="py-4 px-4 text-right text-lg text-blue-600">
                        ₹{selectedBOM.totalCost.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
