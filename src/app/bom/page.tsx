'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBOM } from '@/lib/useBOM';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Plus,
  Download,
  Eye,
  Send,
} from 'lucide-react';

export default function BOMPage() {
  const router = useRouter();
  const { boms, loading, refetch } = useBOM();
  const [filterEnquiry, setFilterEnquiry] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false); // NEW
  const [selectedBOM, setSelectedBOM] = useState<any>(null);

  // Parse materialsJSON for each BOM
  const parsedBOMs = boms.map((bom) => {
    let materials: any[] = [];
    try {
      const parsed = JSON.parse(bom.materialsJSON || '{"items":[]}');
      materials = parsed.items || [];
    } catch (e) {
      console.error('Failed to parse materialsJSON:', e);
    }
    return { ...bom, materials };
  });

  // Filter
  const filteredBOMs = parsedBOMs.filter((bom) => {
    const matchesEnquiry = !filterEnquiry || 
      bom.enquiryId.toLowerCase().includes(filterEnquiry.toLowerCase()) ||
      bom.customerName?.toLowerCase().includes(filterEnquiry.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bom.dispatchStatus === filterStatus;
    return matchesEnquiry && matchesStatus;
  });

  // Stats
  const totalBOMs = parsedBOMs.length;
  const pendingDispatch = parsedBOMs.filter((b) => b.dispatchStatus === 'pending').length;
  const dispatched = parsedBOMs.filter((b) => b.dispatchStatus === 'dispatched').length;
  const delivered = parsedBOMs.filter((b) => b.dispatchStatus === 'delivered').length;

  const handleMarkDispatched = (bom: any) => {
    setSelectedBOM(bom);
    setShowDispatchModal(true);
  };

  // NEW: Add delivery handler
  const handleMarkDelivered = (bom: any) => {
    setSelectedBOM(bom);
    setShowDeliveryModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header - Mobile First */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Bill of Materials</h1>
            <p className="text-slate-700 mt-1 text-sm md:text-base">
              Manage BOMs, dispatch, and material tracking
            </p>
          </div>
          <button
            onClick={() => router.push('/bom/create')}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 font-semibold shadow-lg w-full sm:w-auto"
          >
            <Plus size={20} />
            Create BOM
          </button>
        </div>
      </div>

      {/* Stats - Mobile First Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatCard icon={<Package size={24} />} label="Total BOMs" value={totalBOMs} color="blue" />
        <StatCard icon={<Clock size={24} />} label="Pending" value={pendingDispatch} color="yellow" />
        <StatCard icon={<Truck size={24} />} label="Dispatched" value={dispatched} color="orange" />
        <StatCard icon={<CheckCircle size={24} />} label="Delivered" value={delivered} color="green" />
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <input
            type="text"
            placeholder="Search by Enquiry ID or Customer..."
            value={filterEnquiry}
            onChange={(e) => setFilterEnquiry(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm md:text-base"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm md:text-base"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Dispatch</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
          </select>
          <button className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-4 py-2.5 rounded-lg hover:bg-slate-200 font-medium text-sm md:text-base">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* BOM List - Mobile Optimized */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-600 bg-white rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="font-medium">Loading BOMs...</p>
          </div>
        ) : filteredBOMs.length === 0 ? (
          <div className="text-center py-16 text-slate-600 bg-white rounded-xl">
            <Package size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium text-lg">No BOMs found</p>
            <p className="text-slate-500 text-sm mt-2">Create your first BOM to get started</p>
          </div>
        ) : (
          filteredBOMs.map((bom) => (
            <BOMCard 
              key={bom.bomId || bom.enquiryId} 
              bom={bom} 
              onMarkDispatched={() => handleMarkDispatched(bom)}
              onMarkDelivered={() => handleMarkDelivered(bom)} // NEW: Pass handler
              onRefetch={refetch}
            />
          ))
        )}
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && selectedBOM && (
        <DispatchModal
          bom={selectedBOM}
          onClose={() => {
            setShowDispatchModal(false);
            setSelectedBOM(null);
          }}
          onSuccess={() => {
            setShowDispatchModal(false);
            setSelectedBOM(null);
            refetch();
          }}
        />
      )}

      {/* NEW: Delivery Modal */}
      {showDeliveryModal && selectedBOM && (
        <DeliveryModal
          bom={selectedBOM}
          onClose={() => {
            setShowDeliveryModal(false);
            setSelectedBOM(null);
          }}
          onSuccess={() => {
            setShowDeliveryModal(false);
            setSelectedBOM(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}


function StatCard({ icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    orange: 'text-orange-600 bg-orange-50',
    green: 'text-green-600 bg-green-50',
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || 'text-slate-600 bg-slate-50';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className={`p-2 rounded-lg ${bgClass}`}>{icon}</div>
        <span className={`text-xl md:text-2xl font-bold ${bgClass.split(' ')[0]}`}>{value}</span>
      </div>
      <div className="text-slate-700 text-xs md:text-sm font-medium">{label}</div>
    </div>
  );
}

function BOMCard({ bom, onMarkDispatched, onMarkDelivered, onRefetch }: any) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBgClass = (status: string): string => {
    const bgClasses: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      dispatched: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return bgClasses[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">{bom.enquiryId}</h3>
          {bom.customerName && (
            <p className="text-sm md:text-base text-slate-700 font-medium mt-1">{bom.customerName}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="text-xs md:text-sm text-slate-600">
              Generated: {new Date(bom.bomGeneratedDate).toLocaleDateString('en-IN')}
            </p>
            {bom.systemCapacity && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                {bom.systemCapacity}
              </span>
            )}
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold ${getStatusBgClass(bom.dispatchStatus)} whitespace-nowrap`}>
          {bom.dispatchStatus.toUpperCase()}
        </span>
      </div>

      {/* NEW: Dispatch Details - Show when dispatched/delivered */}
      {(bom.dispatchStatus === 'dispatched' || bom.dispatchStatus === 'delivered') && (
        bom.vehicleNumber || bom.driverName || bom.trackingNumber || bom.dispatchDate
      ) && (
        <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
            <Truck size={14} />
            Dispatch Information
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {bom.vehicleNumber && (
              <div>
                <span className="text-blue-700">Vehicle:</span>
                <span className="text-blue-900 font-medium ml-1">{bom.vehicleNumber}</span>
              </div>
            )}
            {bom.driverName && (
              <div>
                <span className="text-blue-700">Driver:</span>
                <span className="text-blue-900 font-medium ml-1">{bom.driverName}</span>
              </div>
            )}
            {bom.driverContact && (
              <div>
                <span className="text-blue-700">Contact:</span>
                <span className="text-blue-900 font-medium ml-1">{bom.driverContact}</span>
              </div>
            )}
            {bom.trackingNumber && (
              <div>
                <span className="text-blue-700">Tracking:</span>
                <span className="text-blue-900 font-medium ml-1">{bom.trackingNumber}</span>
              </div>
            )}
            {bom.dispatchDate && (
              <div>
                <span className="text-blue-700">Dispatched:</span>
                <span className="text-blue-900 font-medium ml-1">
                  {new Date(bom.dispatchDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {bom.expectedDeliveryDate && (
              <div>
                <span className="text-blue-700">Expected:</span>
                <span className="text-blue-900 font-medium ml-1">
                  {new Date(bom.expectedDeliveryDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW: Delivery Details - Show when delivered */}
      {bom.dispatchStatus === 'delivered' && (bom.deliveredTo || bom.actualDeliveryDate) && (
        <div className="mb-4 bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
            <CheckCircle size={14} />
            Delivery Information
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {bom.actualDeliveryDate && (
              <div>
                <span className="text-green-700">Delivered On:</span>
                <span className="text-green-900 font-medium ml-1">
                  {new Date(bom.actualDeliveryDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {bom.deliveredTo && (
              <div>
                <span className="text-green-700">Delivered To:</span>
                <span className="text-green-900 font-medium ml-1">{bom.deliveredTo}</span>
              </div>
            )}
            {bom.deliveryNotes && (
              <div className="col-span-2">
                <span className="text-green-700">Notes:</span>
                <span className="text-green-900 font-medium ml-1">{bom.deliveryNotes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions - Mobile First */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200">
  <p className="text-slate-800 font-medium text-sm md:text-base">
    <strong className="text-slate-900">{bom.materials?.length || 0}</strong> line items
    {/* DEBUG: Show current status */}
    <span className="ml-2 text-xs text-red-600 font-mono">
      (Status: {bom.dispatchStatus})
    </span>
  </p>
  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
    <button
      onClick={() => setExpanded(!expanded)}
      className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors"
    >
      <Eye size={16} className="inline mr-1" />
      {expanded ? 'Hide' : 'View'} Items
    </button>
    
    {/* DEBUG: Always show both buttons with conditions */}
    {bom.dispatchStatus === 'pending' && (
      <button
        onClick={onMarkDispatched}
        className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
      >
        <Send size={16} className="inline mr-1" />
        Mark Dispatched
      </button>
    )}
    
    {bom.dispatchStatus === 'dispatched' && (
      <button
        onClick={onMarkDelivered}
        className="flex-1 sm:flex-initial px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
      >
        <CheckCircle size={16} className="inline mr-1" />
        Mark Delivered
      </button>
    )}

    {/* DEBUG: Show if status is delivered */}
    {bom.dispatchStatus === 'delivered' && (
      <span className="flex-1 sm:flex-initial px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-sm flex items-center justify-center">
        <CheckCircle size={16} className="inline mr-1" />
        Delivered ✓
      </span>
    )}

    {/* DEBUG: If no button shows, display raw status */}
    {bom.dispatchStatus !== 'pending' && 
     bom.dispatchStatus !== 'dispatched' && 
     bom.dispatchStatus !== 'delivered' && (
      <span className="text-xs text-red-600">
        Unknown status: "{bom.dispatchStatus}"
      </span>
    )}
  </div>
</div>


      {/* Expanded Table - Mobile Scrollable */}
      {expanded && bom.materials && bom.materials.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full text-xs md:text-sm min-w-[600px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2.5 text-left font-bold text-slate-800">#</th>
                  <th className="px-3 py-2.5 text-left font-bold text-slate-800">Section</th>
                  <th className="px-3 py-2.5 text-left font-bold text-slate-800">Particular</th>
                  <th className="px-3 py-2.5 text-left font-bold text-slate-800">UOM</th>
                  <th className="px-3 py-2.5 text-right font-bold text-slate-800">Qty</th>
                  <th className="px-3 py-2.5 text-left font-bold text-slate-800">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {bom.materials.map((item: any, idx: number) => (
                  <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-slate-900 font-medium">{item.sno || idx + 1}</td>
                    <td className="px-3 py-2.5 text-slate-800">{item.section}</td>
                    <td className="px-3 py-2.5 text-slate-900 font-medium">{item.particular}</td>
                    <td className="px-3 py-2.5 text-slate-700 uppercase">{item.uom}</td>
                    <td className="px-3 py-2.5 text-right text-slate-900 font-semibold">{item.qty}</td>
                    <td className="px-3 py-2.5 text-slate-600">{item.rem || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}



function DispatchModal({ bom, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    expectedDeliveryDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch('/api/bom/update-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: bom.enquiryId,
          dispatchStatus: 'dispatched',
          ...formData,
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark as dispatched');
      }
  
      const result = await response.json();
      console.log('✅ Dispatch result:', result);
      
      alert('✅ BOM marked as dispatched successfully!');
      
      // Force immediate refetch
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      onSuccess();
    } catch (error: any) {
      console.error('Dispatch error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Mark as Dispatched</h2>
          <p className="text-slate-600 text-sm mt-1">{bom.enquiryId} - {bom.customerName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Tracking Number
            </label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              placeholder="Enter tracking number"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              placeholder="e.g., CG04AB1234"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Driver Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              placeholder="Enter driver name"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Driver Contact <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.driverContact}
              onChange={(e) => setFormData({ ...formData, driverContact: e.target.value })}
              placeholder="Enter contact number"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={formData.expectedDeliveryDate}
              onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 font-semibold transition-colors"
            >
              {loading ? 'Processing...' : 'Confirm Dispatch'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-200 text-slate-800 py-3 rounded-xl hover:bg-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeliveryModal({ bom, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deliveredTo: '',
    deliveryNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/bom/update-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: bom.enquiryId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark as delivered');
      }

      alert('✅ Materials marked as delivered successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Delivery error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Mark as Delivered</h2>
          <p className="text-slate-600 text-sm mt-1">{bom.enquiryId} - {bom.customerName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Delivered To <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.deliveredTo}
              onChange={(e) => setFormData({ ...formData, deliveredTo: e.target.value })}
              placeholder="e.g., Site Manager, Customer Name"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Delivery Notes
            </label>
            <textarea
              value={formData.deliveryNotes}
              onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
              placeholder="Any notes about the delivery..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:bg-slate-400 font-semibold transition-colors"
            >
              {loading ? 'Processing...' : 'Confirm Delivery'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-200 text-slate-800 py-3 rounded-xl hover:bg-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
