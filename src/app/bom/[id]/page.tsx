'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, Truck, Calendar, User, Phone, MapPin, Download } from 'lucide-react';

interface BOMDetail {
  bomId: string;
  enquiryId: string;
  customerName: string;
  systemCapacity: string;
  bomStatus: string;
  dispatchStatus: string;
  bomGeneratedDate: string;
  dispatchDate?: string;
  trackingNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  expectedDeliveryDate?: string;
  items: any[];
}

export default function BOMDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [bom, setBOM] = useState<BOMDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBOMDetail();
  }, [params.id]);

  const fetchBOMDetail = async () => {
    try {
      const response = await fetch('/api/bom');
      if (!response.ok) throw new Error('Failed to fetch BOM');
      
      const data = await response.json();
      
      // Group by enquiryId and find matching one
      const grouped = data.reduce((acc: any, item: any) => {
        if (!acc[item.enquiryId]) {
          acc[item.enquiryId] = {
            bomId: item.bomId || item.id,
            enquiryId: item.enquiryId,
            customerName: item.customerName,
            systemCapacity: item.systemCapacity,
            bomStatus: item.bomStatus,
            dispatchStatus: item.dispatchStatus,
            bomGeneratedDate: item.bomGeneratedDate,
            dispatchDate: item.dispatchDate,
            trackingNumber: item.trackingNumber,
            vehicleNumber: item.vehicleNumber,
            driverName: item.driverName,
            driverContact: item.driverContact,
            expectedDeliveryDate: item.expectedDeliveryDate,
            items: [],
          };
        }
        acc[item.enquiryId].items.push(item);
        return acc;
      }, {});

      const foundBOM = Object.values(grouped).find((b: any) => 
        b.enquiryId === params.id || b.bomId === params.id
      ) as BOMDetail;

      if (foundBOM) {
        setBOM(foundBOM);
      } else {
        throw new Error('BOM not found');
      }
    } catch (error) {
      console.error('Error fetching BOM:', error);
      alert('Failed to load BOM details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading BOM details...</p>
        </div>
      </div>
    );
  }

  if (!bom) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Package size={64} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">BOM Not Found</h2>
          <button
            onClick={() => router.push('/bom')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to BOM List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/bom')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Back to BOM List
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{bom.enquiryId}</h1>
              <p className="text-slate-700 mt-1">{bom.customerName} • {bom.systemCapacity}</p>
            </div>
            <button
              onClick={() => window.open(`/api/bom/${bom.bomId}/download`, '_blank')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold"
            >
              <Download size={20} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-blue-600" size={24} />
              <h3 className="font-bold text-slate-900">BOM Status</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 capitalize">{bom.bomStatus}</p>
            <p className="text-sm text-slate-600 mt-1">
              Generated: {new Date(bom.bomGeneratedDate).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="text-orange-600" size={24} />
              <h3 className="font-bold text-slate-900">Dispatch Status</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 capitalize">{bom.dispatchStatus}</p>
            {bom.dispatchDate && (
              <p className="text-sm text-slate-600 mt-1">
                Dispatched: {new Date(bom.dispatchDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-green-600" size={24} />
              <h3 className="font-bold text-slate-900">Total Items</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{bom.items.length}</p>
            <p className="text-sm text-slate-600 mt-1">Line items</p>
          </div>
        </div>

        {/* Dispatch Details */}
        {bom.dispatchStatus !== 'pending' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Dispatch Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bom.trackingNumber && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-slate-600">Tracking Number</p>
                    <p className="font-semibold text-slate-900">{bom.trackingNumber}</p>
                  </div>
                </div>
              )}
              {bom.vehicleNumber && (
                <div className="flex items-start gap-3">
                  <Truck className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-slate-600">Vehicle Number</p>
                    <p className="font-semibold text-slate-900">{bom.vehicleNumber}</p>
                  </div>
                </div>
              )}
              {bom.driverName && (
                <div className="flex items-start gap-3">
                  <User className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-slate-600">Driver Name</p>
                    <p className="font-semibold text-slate-900">{bom.driverName}</p>
                  </div>
                </div>
              )}
              {bom.driverContact && (
                <div className="flex items-start gap-3">
                  <Phone className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-slate-600">Driver Contact</p>
                    <p className="font-semibold text-slate-900">{bom.driverContact}</p>
                  </div>
                </div>
              )}
              {bom.expectedDeliveryDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-slate-600">Expected Delivery</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(bom.expectedDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Materials Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Materials List</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-800">#</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-800">Section</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-800">Particular</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-800">UOM</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-800">Quantity</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-800">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bom.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">{item.sno || idx + 1}</td>
                    <td className="px-4 py-3 text-slate-800">{item.section}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{item.particular}</td>
                    <td className="px-4 py-3 text-slate-700 uppercase">{item.uom}</td>
                    <td className="px-4 py-3 text-right text-slate-900 font-semibold">{item.qty}</td>
                    <td className="px-4 py-3 text-slate-600">{item.rem || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
