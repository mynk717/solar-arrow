// src/app/bom/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Package, 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Send,
  Truck,
  ClipboardList,
  Bell
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

interface BOMItem {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  returned?: number; // Track returned quantity
  returnedDate?: Date;
}

interface BOM {
  id: string;
  enquiryId: string;
  customerName: string;
  capacity: string;
  registrationId: string;
  applicationNumber?: string;
  materials: BOMItem[];
  totalCost: number;
  status: 'pending' | 'approved' | 'dispatched' | 'installed';
  bomTriggered: boolean;
  bomTriggerDate?: Date;
  bomStoreManagerNotified: boolean;
  bomStoreManager?: string;
  storeManagerChatId?: string; // For Telegram notification
  bomMaterialReturned: boolean;
  bomReturnDate?: Date;
  bomReturnedBy?: string;
  bomReturnNotes?: string;
  paymentStatus?: string;
  paymentAccountVerified?: boolean;
  installationTeam?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const demoBOMs: BOM[] = [
  {
    id: 'BOM-001',
    enquiryId: 'ENQ-001',
    customerName: 'Rajesh Kumar',
    capacity: '5 kW',
    registrationId: 'CSPDCL-2026-001',
    applicationNumber: 'NP/23813/2022',
    materials: [
      { id: 'MAT-001', item: 'Solar Panels (330W)', quantity: 16, unit: 'units', unitPrice: 8500, total: 136000, returned: 2 },
      { id: 'MAT-002', item: 'Inverter (5kW)', quantity: 1, unit: 'unit', unitPrice: 45000, total: 45000 },
      { id: 'MAT-003', item: 'Mounting Structure', quantity: 1, unit: 'set', unitPrice: 35000, total: 35000 },
      { id: 'MAT-004', item: 'AC/DC Cables', quantity: 1, unit: 'set', unitPrice: 12000, total: 12000, returned: 0.5 },
      { id: 'MAT-005', item: 'Junction Box', quantity: 1, unit: 'unit', unitPrice: 3000, total: 3000 },
      { id: 'MAT-006', item: 'Earthing Kit', quantity: 1, unit: 'set', unitPrice: 5000, total: 5000 },
      { id: 'MAT-007', item: 'Installation Labor', quantity: 1, unit: 'set', unitPrice: 14000, total: 14000 },
    ],
    totalCost: 250000,
    status: 'installed',
    bomTriggered: true,
    bomTriggerDate: new Date('2026-01-20'),
    bomStoreManagerNotified: true,
    bomStoreManager: 'Ramesh Store Manager',
    bomMaterialReturned: true,
    bomReturnDate: new Date('2026-02-05'),
    bomReturnedBy: 'Installation Team A',
    bomReturnNotes: '2 panels and cable excess returned',
    paymentStatus: 'received',
    paymentAccountVerified: true,
    installationTeam: 'Tech Team A',
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-02-05'),
  },
  {
    id: 'BOM-002',
    enquiryId: 'ENQ-002',
    customerName: 'Priya Sharma',
    capacity: '3 kW',
    registrationId: 'CSPDCL-2026-002',
    applicationNumber: 'NP/71635/2023',
    materials: [
      { id: 'MAT-008', item: 'Solar Panels (330W)', quantity: 10, unit: 'units', unitPrice: 8500, total: 85000 },
      { id: 'MAT-009', item: 'Inverter (3kW)', quantity: 1, unit: 'unit', unitPrice: 28000, total: 28000 },
      { id: 'MAT-010', item: 'Mounting Structure', quantity: 1, unit: 'set', unitPrice: 20000, total: 20000 },
      { id: 'MAT-011', item: 'AC/DC Cables', quantity: 1, unit: 'set', unitPrice: 8000, total: 8000 },
      { id: 'MAT-012', item: 'Junction Box', quantity: 1, unit: 'unit', unitPrice: 2000, total: 2000 },
      { id: 'MAT-013', item: 'Earthing Kit', quantity: 1, unit: 'set', unitPrice: 3000, total: 3000 },
      { id: 'MAT-014', item: 'Installation Labor', quantity: 1, unit: 'set', unitPrice: 4000, total: 4000 },
    ],
    totalCost: 150000,
    status: 'approved',
    bomTriggered: true,
    bomTriggerDate: new Date('2026-01-21'),
    bomStoreManagerNotified: true,
    bomStoreManager: 'Ramesh Store Manager',
    bomMaterialReturned: false,
    paymentStatus: 'received',
    paymentAccountVerified: true,
    installationTeam: 'Tech Team B',
    createdAt: new Date('2026-01-21'),
  },
];

export default function BOMPage() {
  const { data: session, status } = useSession();
  const { isDemoMode, showDemoAlert } = useDemoMode();
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [processingReturn, setProcessingReturn] = useState(false);

  useEffect(() => {
    fetchBOMs();
  }, [status]);

  const fetchBOMs = async () => {
    if (status === 'unauthenticated') {
      setBoms(demoBOMs);
      setLoading(false);
      return;
    }

    if (status === 'authenticated') {
      try {
        setLoading(true);
        const response = await fetch('/api/bom');
        if (!response.ok) throw new Error('Failed to fetch BOMs');
        const data = await response.json();
        
        // Convert date strings to Date objects
        const bomsWithDates = data.map((bom: any) => ({
          ...bom,
          bomTriggerDate: bom.bomTriggerDate ? new Date(bom.bomTriggerDate) : undefined,
          bomReturnDate: bom.bomReturnDate ? new Date(bom.bomReturnDate) : undefined,
          createdAt: new Date(bom.createdAt),
          updatedAt: bom.updatedAt ? new Date(bom.updatedAt) : undefined,
          materials: bom.materials?.map((mat: any) => ({
            ...mat,
            returnedDate: mat.returnedDate ? new Date(mat.returnedDate) : undefined,
          })) || [],
        }));
        
        setBoms(bomsWithDates);
      } catch (error) {
        console.error('Error fetching BOMs:', error);
        // Fallback to demo data
        setBoms(demoBOMs);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNotifyStoreManager = async (bomId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }

    try {
      const response = await fetch('/api/bom/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bomId }),
      });

      if (!response.ok) throw new Error('Failed to notify store manager');
      
      alert('Store manager notified successfully via Telegram!');
      fetchBOMs(); // Refresh data
    } catch (error) {
      console.error('Error notifying store manager:', error);
      alert('Failed to send notification');
    }
  };

  const handleMarkReturned = async () => {
    if (!selectedBOM || isDemoMode) {
      if (isDemoMode) showDemoAlert();
      return;
    }

    try {
      setProcessingReturn(true);
      const response = await fetch('/api/bom/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bomId: selectedBOM.id,
          enquiryId: selectedBOM.enquiryId,
          returnNotes,
          returnedBy: selectedBOM.installationTeam,
        }),
      });

      if (!response.ok) throw new Error('Failed to mark materials as returned');
      
      alert('Materials marked as returned successfully!');
      setShowReturnModal(false);
      setReturnNotes('');
      fetchBOMs(); // Refresh data
    } catch (error) {
      console.error('Error marking return:', error);
      alert('Failed to update return status');
    } finally {
      setProcessingReturn(false);
    }
  };

  const handleDownloadBOM = (bomId: string) => {
    if (isDemoMode) {
      showDemoAlert();
      return;
    }
    window.open(`/api/bom/${bomId}/download`, '_blank');
  };

  const filteredBOMs = boms.filter(bom => {
    if (filterStatus === 'all') return true;
    return bom.status === filterStatus;
  });

  const statusCounts = {
    all: boms.length,
    pending: boms.filter(b => b.status === 'pending').length,
    approved: boms.filter(b => b.status === 'approved').length,
    dispatched: boms.filter(b => b.status === 'dispatched').length,
    installed: boms.filter(b => b.status === 'installed').length,
  };

  const pendingReturns = boms.filter(b => 
    b.status === 'installed' && !b.bomMaterialReturned
  ).length;

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
            Bill of Materials {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">
            Manage material requirements and track returns for installations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total BOMs</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
              </div>
              <ClipboardList className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <AlertCircle className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dispatched</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.dispatched}</p>
              </div>
              <Truck className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Returns</p>
                <p className="text-2xl font-bold text-red-600">{pendingReturns}</p>
              </div>
              <Package className="text-red-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'dispatched', 'installed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs">
                  ({statusCounts[status as keyof typeof statusCounts]})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* BOM List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBOMs.map(bom => (
            <div key={bom.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{bom.customerName}</h3>
                  <p className="text-sm text-gray-600">
                    {bom.applicationNumber || bom.registrationId} • {bom.capacity}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Enquiry: {bom.enquiryId}
                  </p>
                  {bom.installationTeam && (
                    <p className="text-xs text-blue-600 mt-1">
                      Team: {bom.installationTeam}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bom.status === 'approved' ? 'bg-green-100 text-green-800' :
                    bom.status === 'dispatched' ? 'bg-blue-100 text-blue-800' :
                    bom.status === 'installed' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bom.status.charAt(0).toUpperCase() + bom.status.slice(1)}
                  </span>
                  
                  {bom.bomMaterialReturned && (
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded flex items-center gap-1">
                      <CheckCircle size={12} />
                      Materials Returned
                    </span>
                  )}
                </div>
              </div>

              {/* Trigger Info */}
              {bom.bomTriggered && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Bell size={16} className="text-blue-600 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <p className="text-blue-900 font-medium">BOM Triggered</p>
                      <p className="text-blue-700 mt-1">
                        {bom.bomTriggerDate?.toLocaleDateString()} • 
                        Store Manager: {bom.bomStoreManager || 'Not assigned'}
                      </p>
                      {bom.bomStoreManagerNotified && (
                        <p className="text-green-700 mt-1 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Notified via Telegram
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Material Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={18} className="text-blue-600" />
                  <p className="font-semibold text-gray-900">Materials Required:</p>
                </div>
                <div className="space-y-2">
                  {bom.materials.slice(0, 3).map((mat, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {mat.item}
                        {mat.returned !== undefined && mat.returned > 0 && (
                          <span className="ml-2 text-xs text-green-600">
                            ({mat.returned} returned)
                          </span>
                        )}
                      </span>
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

              {/* Return Info */}
              {bom.bomMaterialReturned && bom.bomReturnDate && (
                <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                  <p className="text-xs text-green-900 font-medium mb-1">
                    Materials Returned: {bom.bomReturnDate.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-green-700">
                    By: {bom.bomReturnedBy || 'Unknown'}
                  </p>
                  {bom.bomReturnNotes && (
                    <p className="text-xs text-green-700 mt-1 italic">
                      Notes: {bom.bomReturnNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Total Cost */}
              <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-lg">
                <span className="font-semibold text-gray-900">Total Cost:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{bom.totalCost.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBOM(bom)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDownloadBOM(bom.id)}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm flex items-center gap-1 transition-colors"
                  >
                    <Download size={16} />
                    PDF
                  </button>
                </div>

                {/* Additional Actions */}
                <div className="flex gap-2">
                  {bom.bomTriggered && !bom.bomStoreManagerNotified && (
                    <button
                      onClick={() => handleNotifyStoreManager(bom.id)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                      <Send size={16} />
                      Notify Store Manager
                    </button>
                  )}

                  {bom.status === 'installed' && !bom.bomMaterialReturned && (
                    <button
                      onClick={() => {
                        setSelectedBOM(bom);
                        setShowReturnModal(true);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                      <Package size={16} />
                      Mark Materials Returned
                    </button>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>Created: {bom.createdAt.toLocaleDateString()}</p>
                {bom.updatedAt && (
                  <p>Updated: {bom.updatedAt.toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBOMs.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No BOMs found matching your criteria</p>
          </div>
        )}

        {/* BOM Details Modal */}
        {selectedBOM && !showReturnModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Bill of Materials</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedBOM.customerName} • {selectedBOM.applicationNumber || selectedBOM.registrationId}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      BOM ID: {selectedBOM.id} • Enquiry: {selectedBOM.enquiryId}
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
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Returned</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBOM.materials.map((mat: BOMItem, idx: number) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="py-3 px-4 text-gray-700">{mat.item}</td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {mat.quantity} {mat.unit}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {mat.returned !== undefined && mat.returned > 0 ? (
                            <span className="text-green-600 font-medium">
                              {mat.returned} {mat.unit}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">₹{mat.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-700">
                          ₹{mat.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50 font-bold">
                    <tr>
                      <td colSpan={4} className="py-4 px-4 text-right">Total:</td>
                      <td className="py-4 px-4 text-right text-lg text-blue-600">
                        ₹{selectedBOM.totalCost.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Additional Info */}
                {selectedBOM.bomMaterialReturned && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">Return Information</h3>
                    <div className="space-y-1 text-sm text-green-800">
                      <p><span className="font-medium">Return Date:</span> {selectedBOM.bomReturnDate?.toLocaleDateString()}</p>
                      <p><span className="font-medium">Returned By:</span> {selectedBOM.bomReturnedBy}</p>
                      {selectedBOM.bomReturnNotes && (
                        <p><span className="font-medium">Notes:</span> {selectedBOM.bomReturnNotes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && selectedBOM && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Mark Materials as Returned</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBOM.customerName} • {selectedBOM.enquiryId}
                </p>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Notes <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter any notes about returned materials (e.g., '2 panels excess, 1 cable roll partial')..."
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-900">
                    <strong>Note:</strong> This will mark all materials as returned. 
                    Make sure the installation team has collected and verified all excess materials.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setReturnNotes('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={processingReturn}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMarkReturned}
                    disabled={processingReturn}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingReturn ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Confirm Return
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
