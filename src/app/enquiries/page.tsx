// src/app/enquiries/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Enquiry, EnquiryStatus } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import {
  Search, Filter, Plus, Eye, Loader2, RefreshCcw,
  UserPlus, ChevronRight, SlidersHorizontal, X
} from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';
import DemoBanner from '@/components/DemoBanner';
import { demoEnquiries } from '@/lib/demoData';
import { useDemoMode } from '@/contexts/DemoContext';

const ALL_STATUSES = [
  { value: 'all',                          label: 'All Status' },
  { value: 'new',                          label: 'New' },
  { value: 'survey-pending',               label: 'Survey Pending' },
  { value: 'survey-scheduled',             label: 'Survey Scheduled' },
  { value: 'survey-completed',             label: 'Survey Completed' },
  { value: 'survey-rejected',              label: 'Survey Rejected' },
  { value: 'quotation-sent',               label: 'Quotation Sent' },
  { value: 'quotation-approved',           label: 'Quotation Approved' },
  { value: 'quotation-rejected',           label: 'Quotation Rejected' },
  { value: 'payment-pending',              label: 'Payment Pending' },
  { value: 'payment-partial',              label: 'Payment Partial (70%)' },
  { value: 'payment-complete',             label: 'Payment Complete' },
  { value: 'registration-pending',         label: 'Registration Pending' },
  { value: 'registration-submitted',       label: 'Registration Submitted' },
  { value: 'registration-approved',        label: 'Registration Approved' },
  { value: 'registration-rejected',        label: 'Registration Rejected' },
  { value: 'bom-pending',                  label: 'BOM Pending' },
  { value: 'bom-created',                  label: 'BOM Created' },
  { value: 'dispatch-pending',             label: 'Dispatch Pending' },
  { value: 'dispatched',                   label: 'Dispatched' },
  { value: 'delivered',                    label: 'Delivered' },
  { value: 'installation-pending',         label: 'Installation Pending' },
  { value: 'installation-scheduled',       label: 'Installation Scheduled' },
  { value: 'installation-in-progress',     label: 'Installation In Progress' },
  { value: 'installation-completed',       label: 'Installation Completed' },
  { value: 'installation-rework-required', label: 'Rework Required' },
  { value: 'wcr-pending',                  label: 'WCR Pending' },
  { value: 'wcr-submitted',                label: 'WCR Submitted' },
  { value: 'wcr-approved',                 label: 'WCR Approved' },
  { value: 'wcr-rejected',                 label: 'WCR Rejected' },
  { value: 'inspection-pending',           label: 'Inspection Pending' },
  { value: 'inspection-scheduled',         label: 'Inspection Scheduled' },
  { value: 'inspection-completed',         label: 'Inspection Completed' },
  { value: 'inspection-approved',          label: 'Inspection Approved' },
  { value: 'inspection-rejected',          label: 'Inspection Rejected' },
  { value: 'grid-sync-pending',            label: 'Grid Sync Pending' },
  { value: 'grid-synced',                  label: 'Grid Synced' },
  { value: 'active',                       label: 'Active' },
  { value: 'cancelled',                    label: 'Cancelled' },
  { value: 'on-hold',                      label: 'On Hold' },
] as const;


// ── Assign Modal (inline, same pattern as leads) ──────────────────────────────
function AssignEnquiryModal({
  enquiryIds, users, onClose, onAssign,
}: {
  enquiryIds: string[];
  users: any[];
  onClose: () => void;
  onAssign: (email: string, name: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAssign() {
    if (!selected) return;
    const user = users.find(u => u.email === selected);
    setSaving(true);
    await onAssign(selected, user?.name || selected);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-900">Assign Enquir{enquiryIds.length > 1 ? 'ies' : 'y'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{enquiryIds.length} selected</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
          >
            <option value="">Select user...</option>
            {users.map(u => (
              <option key={u.email} value={u.email}>{u.name} ({u.role})</option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              onClick={handleAssign}
              disabled={!selected || saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {saving ? 'Assigning...' : 'Assign'}
            </button>
            <button onClick={onClose} className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EnquiriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDemoMode } = useDemoMode();

  const role = session?.user?.role;
  const email = session?.user?.email || '';
  const isAdminOrOwner = role === 'admin' || role === 'owner';

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Selection for bulk assign
  const [selected, setSelected] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<'createdAt' | 'customerName' | 'capacity'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchData = useCallback(async () => {
    if (isDemoMode) {
      setEnquiries(demoEnquiries as any);
      setLoading(false);
      return;
    }
    if (status !== 'authenticated') return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/enquiries');
      if (!res.ok) throw new Error('Failed to fetch enquiries');
      const data = await res.json();
      const withDates = data.map((e: any) => ({
        ...e,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
        surveyDate: e.surveyDate ? new Date(e.surveyDate) : undefined,
        paymentDate: e.paymentDate ? new Date(e.paymentDate) : undefined,
        installationDate: e.installationDate ? new Date(e.installationDate) : undefined,
      }));
      setEnquiries(withDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [status, isDemoMode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch users for assign modal (admin/owner only)
  useEffect(() => {
    if (!isAdminOrOwner) return;
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers((Array.isArray(data) ? data : []).filter((u: any) => u.isActive)))
      .catch(() => {});
  }, [isAdminOrOwner]);

    // Filter — non-admins see enquiries in their permitted stages OR personally assigned
    const statusToPermKey: Record<string, string> = {
      new: '/enquiries',
      'survey-pending': '/survey', 'survey-scheduled': '/survey',
      'survey-completed': '/survey', 'survey-rejected': '/survey',
      'quotation-sent': '/quotation', 'quotation-approved': '/quotation', 'quotation-rejected': '/quotation',
      'payment-pending': '/payments', 'payment-partial': '/payments',
      'payment-complete': '/payments', 'payment-received': '/payments',
      'registration-pending': '/registration', 'registration-submitted': '/registration',
      'registration-approved': '/registration', 'registration-rejected': '/registration',
      'bom-pending': '/bom', 'bom-created': '/bom',
      'dispatch-pending': '/bom', 'dispatched': '/bom', 'delivered': '/bom',
      'installation-pending': '/installation', 'installation-scheduled': '/installation',
      'installation-in-progress': '/installation', 'installation-completed': '/installation',
      'installation-rework-required': '/installation',
      'wcr-pending': '/wcr', 'wcr-submitted': '/wcr', 'wcr-approved': '/wcr', 'wcr-rejected': '/wcr',
      'inspection-pending': '/liaison', 'inspection-scheduled': '/liaison',
      'inspection-completed': '/liaison', 'inspection-approved': '/liaison',
      'inspection-rejected': '/liaison', 'meter-installation-pending': '/liaison',
      'meter-installed': '/liaison', 'grid-sync-pending': '/liaison', 'grid-synced': '/liaison',
      'subsidy-pending': '/subsidy', 'subsidy-applied': '/subsidy',
      'subsidy-approved': '/subsidy', 'subsidy-disbursed': '/subsidy',
    };
  
    const userCanView: string[] =
      (session?.user?.permissions as any)?.canView ?? [];
  
    const myEnquiries = isAdminOrOwner
      ? enquiries
      : enquiries.filter(e => {
          if (e.allottedUser === email || e.surveyedBy === email) return true;
          const requiredPath = statusToPermKey[e.status];
          return !!requiredPath && userCanView.includes(requiredPath);
        });
  

  const filtered = myEnquiries.filter(e => {
    const matchSearch =
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'createdAt') cmp = a.createdAt.getTime() - b.createdAt.getTime();
    else if (sortField === 'customerName') cmp = a.customerName.localeCompare(b.customerName);
    else if (sortField === 'capacity') cmp = a.capacity - b.capacity;
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  async function handleAssign(toEmail: string, toName: string) {
    try {
      await Promise.all(
        selected.map(id =>
          fetch(`/api/enquiries/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              allottedUser: toEmail,
              lastEditedBy: session?.user?.email,
            }),
          })
        )
      );
  
      // Optimistic UI update
      setEnquiries(prev =>
        prev.map(e =>
          selected.includes(e.id) ? { ...e, allottedUser: toEmail } : e
        )
      );
  
      setSelected([]);
      setShowAssignModal(false);
  
      // Bust server cache so next refresh reflects the change
      await fetch('/api/enquiries');
    } catch (err) {
      console.error('Assign failed:', err);
    }
  }  

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Enquiries {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{sorted.length} enquiries</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdminOrOwner && selected.length > 0 && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
              >
                <UserPlus size={15} />
                <span className="hidden sm:inline">Assign</span> ({selected.length})
              </button>
            )}
            <button onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
              <SlidersHorizontal size={18} className="text-gray-600" />
            </button>
            <button onClick={fetchData}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
              <RefreshCcw size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => !isDemoMode && setShowForm(true)}
              disabled={isDemoMode}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold transition"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* Search always visible */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search name, ID or phone..."
            className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm text-gray-900"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="col-span-2 sm:col-span-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              {ALL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value as any)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="createdAt">Date</option>
              <option value="customerName">Name</option>
              <option value="capacity">Capacity</option>
            </select>
            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        )}
      </div>

      {/* EnquiryForm Modal */}
      {showForm && !isDemoMode && (
        <EnquiryForm
          onClose={() => setShowForm(false)}
          onSubmit={async (newEnq) => {
            setShowForm(false);
            await fetchData(); // ← refetch from real API instead of optimistic update
          }}          
        />
      )}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* Cards list — mobile first */}
      <div className="p-4 space-y-3">
        {paginated.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No enquiries found</div>
        ) : paginated.map(enq => (
          <div
            key={enq.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
          >
            <div className="flex items-start gap-3">
              {/* Checkbox for bulk assign */}
              {isAdminOrOwner && (
                <input
                  type="checkbox"
                  checked={selected.includes(enq.id)}
                  onChange={() => toggleSelect(enq.id)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 flex-shrink-0 cursor-pointer"
                />
              )}

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                {enq.customerName?.[0]?.toUpperCase()}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{enq.customerName}</p>
                    <p className="text-xs text-gray-500">{enq.id} · {enq.phone}</p>
                  </div>
                  <StatusBadge status={enq.status} />
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                  <span>{enq.area}</span>
                  <span>{enq.capacity} kW</span>
                  {enq.allottedUser && (
                    <span className="text-indigo-600">👤 {enq.allottedUser.split('@')[0]}</span>
                  )}
                  <span>{enq.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                </div>
              </div>

              {/* View button */}
              <button
                onClick={() => router.push(`/enquiries/${enq.id}`)}
                className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 pb-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignEnquiryModal
          enquiryIds={selected}
          users={users}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
