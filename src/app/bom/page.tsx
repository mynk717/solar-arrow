// src/app/bom/page.tsx - FIX the statusColor type error
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useBOM } from '@/lib/useBOM';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Download,
  AlertCircle,
} from 'lucide-react';

export default function BOMPage() {
  const { data: session } = useSession();
  const { boms, loading, refetch } = useBOM();
  const [filterEnquiry, setFilterEnquiry] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Group BOMs by enquiryId
  const groupedBOMs = boms.reduce((acc: any, bom) => {
    if (!acc[bom.enquiryId]) {
      acc[bom.enquiryId] = {
        enquiryId: bom.enquiryId,
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
    const matchesEnquiry = !filterEnquiry || bom.enquiryId.toLowerCase().includes(filterEnquiry.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bom.dispatchStatus === filterStatus;
    return matchesEnquiry && matchesStatus;
  });

  // Stats
  const totalBOMs = bomList.length;
  const pendingDispatch = bomList.filter((b: any) => b.dispatchStatus === 'pending').length;
  const dispatched = bomList.filter((b: any) => b.dispatchStatus === 'dispatched').length;
  const delivered = bomList.filter((b: any) => b.dispatchStatus === 'delivered').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bill of Materials</h1>
          <p className="text-gray-600 mt-1">Manage BOMs, dispatch, and material tracking</p>
        </div>
        <button
          onClick={() => window.location.href = '/bom/create'}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Create BOM
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Package />} label="Total BOMs" value={totalBOMs} color="blue" />
        <StatCard icon={<Clock />} label="Pending Dispatch" value={pendingDispatch} color="yellow" />
        <StatCard icon={<Truck />} label="Dispatched" value={dispatched} color="orange" />
        <StatCard icon={<CheckCircle />} label="Delivered" value={delivered} color="green" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by Enquiry ID..."
            value={filterEnquiry}
            onChange={(e) => setFilterEnquiry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Dispatch</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
          </select>
          <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* BOM List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading BOMs...</div>
        ) : filteredBOMs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No BOMs found</div>
        ) : (
          filteredBOMs.map((bom: any) => (
            <BOMCard key={bom.enquiryId} bom={bom} onUpdate={refetch} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={colorClasses[color as keyof typeof colorClasses]}>{icon}</div>
        <span className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>{value}</span>
      </div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}

function BOMCard({ bom, onUpdate }: any) {
  const [expanded, setExpanded] = useState(false);

  // FIX: Properly type the statusColor mapping
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      pending: 'yellow',
      dispatched: 'blue',
      delivered: 'green',
    };
    return statusColors[status] || 'gray';
  };

  const getStatusBgClass = (status: string): string => {
    const bgClasses: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      dispatched: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return bgClasses[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{bom.enquiryId}</h3>
          <p className="text-sm text-gray-600">Generated: {new Date(bom.generatedDate).toLocaleDateString('en-IN')}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgClass(bom.dispatchStatus)}`}>
          {bom.dispatchStatus}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-gray-700">
          <strong>{bom.items.length}</strong> line items
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {expanded ? 'Hide' : 'View'} Items
          </button>
          {bom.dispatchStatus === 'pending' && (
            <button
              onClick={() => {/* Open dispatch modal */}}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Mark Dispatched
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 border-t pt-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">S.No</th>
                <th className="px-4 py-2 text-left">Section</th>
                <th className="px-4 py-2 text-left">Particular</th>
                <th className="px-4 py-2 text-left">UOM</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {bom.items.map((item: any) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.sno}</td>
                  <td className="px-4 py-2">{item.section}</td>
                  <td className="px-4 py-2">{item.particular}</td>
                  <td className="px-4 py-2">{item.uom}</td>
                  <td className="px-4 py-2 text-right">{item.qty}</td>
                  <td className="px-4 py-2 text-gray-600">{item.rem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
