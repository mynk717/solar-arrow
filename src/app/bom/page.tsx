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
  const [selectedBOM, setSelectedBOM] = useState<any>(null);

  // Group BOMs by enquiryId
  const groupedBOMs = boms.reduce((acc: any, bom) => {
    if (!acc[bom.enquiryId]) {
      acc[bom.enquiryId] = {
        enquiryId: bom.enquiryId,
        customerName: bom.customerName,
        systemCapacity: bom.systemCapacity,
        bomStatus: bom.bomStatus,
        dispatchStatus: bom.dispatchStatus,
        generatedDate: bom.bomGeneratedDate,
        items: [],
      };
    }
    acc[bom.enquiryId].items.push(bom);
    return acc;
  }, {});

  const bomList = Object.values(groupedBOMs);

  // Filter
  const filteredBOMs = bomList.filter((bom: any) => {
    const matchesEnquiry = !filterEnquiry || 
      bom.enquiryId.toLowerCase().includes(filterEnquiry.toLowerCase()) ||
      bom.customerName?.toLowerCase().includes(filterEnquiry.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bom.dispatchStatus === filterStatus;
    return matchesEnquiry && matchesStatus;
  });

  // Stats
  const totalBOMs = bomList.length;
  const pendingDispatch = bomList.filter((b: any) => b.dispatchStatus === 'pending').length;
  const dispatched = bomList.filter((b: any) => b.dispatchStatus === 'dispatched').length;
  const delivered = bomList.filter((b: any) => b.dispatchStatus === 'delivered').length;

  const handleMarkDispatched = (bom: any) => {
    setSelectedBOM(bom);
    setShowDispatchModal(true);
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
          filteredBOMs.map((bom: any) => (
            <BOMCard 
              key={bom.enquiryId} 
              bom={bom} 
              onMarkDispatched={() => handleMarkDispatched(bom)}
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

function BOMCard({ bom, onMarkDispatched, onRefetch }: any) {
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
              Generated: {new Date(bom.generatedDate).toLocaleDateString('en-IN')}
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

      {/* Actions - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200">
        <p className="text-slate-800 font-medium text-sm md:text-base">
          <strong className="text-slate-900">{bom.items.length}</strong> line items
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors"
          >
            <Eye size={16} className="inline mr-1" />
            {expanded ? 'Hide' : 'View'} Items
          </button>
          {bom.dispatchStatus === 'pending' && (
            <button
              onClick={onMarkDispatched}
              className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              <Send size={16} className="inline mr-1" />
              Mark Dispatched
            </button>
          )}
        </div>
      </div>

      {/* Expanded Table - Mobile Scrollable */}
      {expanded && (
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
                {bom.items.map((item: any, idx: number) => (
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
      const response = await fetch('/api/bom/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: bom.enquiryId,
          ...formData,
          dispatchDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to mark as dispatched');

      alert('BOM marked as dispatched successfully!');
      onSuccess();
    } catch (error: any) {
      alert(error.message);
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
