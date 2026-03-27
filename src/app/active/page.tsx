// src/app/active/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Zap, Search, MapPin, Phone, Calendar, IndianRupee, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ActiveEnquiry {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  capacity: string;
  gridSyncDate?: string;
  meterNumber?: string;
  subsidyStatus?: string;
  allottedUser?: string;
  status: string;
}

export default function ActiveSystemsPage() {
  const { data: session } = useSession();
  const [enquiries, setEnquiries] = useState<ActiveEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchActive = async (force = false) => {
    try {
      const res = await fetch(`/api/enquiries${force ? '?refresh=true' : ''}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const active = (Array.isArray(data) ? data : []).filter((e: any) => e.status === 'active');
      setEnquiries(active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchActive(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return enquiries;
    const q = search.toLowerCase();
    return enquiries.filter(e =>
      e.customerName?.toLowerCase().includes(q) ||
      e.id?.toLowerCase().includes(q) ||
      e.area?.toLowerCase().includes(q) ||
      e.phone?.includes(q) ||
      e.meterNumber?.toLowerCase().includes(q)
    );
  }, [enquiries, search]);

  const totalKW = enquiries.reduce((s, e) => s + (Number(e.capacity) || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Zap className="animate-pulse h-10 w-10 text-green-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">Active Systems</p>
              <p className="text-xs text-gray-400">{enquiries.length} live · {totalKW.toFixed(1)} kW total</p>
            </div>
          </div>
          <button
            onClick={() => { setRefreshing(true); fetchActive(true); }}
            disabled={refreshing}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition"
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, area, meter..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 px-4 py-3">
        {[
          { label: 'Live Systems', value: enquiries.length, color: 'text-green-600' },
          { label: 'Total kW', value: totalKW.toFixed(1), color: 'text-yellow-500' },
          { label: 'Showing', value: filtered.length, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-3 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="px-4 pb-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium">No active systems found</p>
          </div>
        ) : (
          filtered.map(e => (
            <Link
              key={e.id}
              href={`/enquiries/${e.id}`}
              className="block bg-white rounded-2xl border border-gray-200 hover:border-green-400 hover:shadow-sm transition p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-gray-900">{e.customerName}</p>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">{e.id}</p>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-300 flex-shrink-0">
                  ⚡ Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Zap size={12} className="text-yellow-500 flex-shrink-0" />
                  <span className="font-semibold">{e.capacity} kW</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium truncate">{e.area || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Phone size={12} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium">{e.phone}</span>
                </div>
                {e.gridSyncDate && (
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Calendar size={12} className="text-green-500 flex-shrink-0" />
                    <span className="font-medium">
                      {new Date(e.gridSyncDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {e.meterNumber && (
                  <div className="flex items-center gap-1.5 text-gray-700 col-span-2">
                    <IndianRupee size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="font-medium">Meter: {e.meterNumber}</span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
