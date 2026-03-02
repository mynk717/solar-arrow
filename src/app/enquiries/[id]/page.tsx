// src/app/enquiries/[id]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, MapPin, Zap, Phone, Mail, Home,
  ClipboardCheck, DollarSign, Wrench, Scale, Package,
  CheckSquare, IndianRupee, AlertTriangle, Clock,
  CheckCircle2, XCircle, Edit3, Send, Loader2,
  Calendar, FileText, Shield, TrendingUp, Tag,
  ChevronDown, ChevronUp, RefreshCw, UserCheck,
  Building2, CreditCard, Activity
} from 'lucide-react';
import type { Enquiry, EnquiryStatus } from '@/lib/types';
import { VALID_TRANSITIONS } from '@/lib/statusValidation';


// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineEntry {
  timestamp: string;
  action: string;
  userId: string;
  details: string;
  sheetId?: string;
}

interface FollowUp {
  followupId: string;
  enquiryId: string;
  userId: string;
  followupDate: string;
  followupType: string;
  followupNotes: string;
  outcome: string;
  nextFollowupDate: string;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: unknown) {
  return typeof n === 'number' && isFinite(n)
    ? n.toLocaleString('en-IN')
    : '—';
}

function fmtDate(d?: Date | string | null) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function fmtDateTime(d?: string | null) {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    'survey-pending': 'bg-yellow-100 text-yellow-800',
    'survey-completed': 'bg-green-100 text-green-700',
    'survey-rejected': 'bg-red-100 text-red-700',
    'quotation-sent': 'bg-purple-100 text-purple-800',
    'quotation-approved': 'bg-indigo-100 text-indigo-800',
    'registration-pending': 'bg-orange-100 text-orange-800',
    'registration-submitted': 'bg-amber-100 text-amber-800',
    'payment-pending': 'bg-red-100 text-red-700',
    'payment-received': 'bg-green-100 text-green-700',
    'bom-pending': 'bg-violet-100 text-violet-800',
    'dispatch-pending': 'bg-cyan-100 text-cyan-800',
    dispatched: 'bg-sky-100 text-sky-800',
    'installation-scheduled': 'bg-teal-100 text-teal-800',
    'installation-completed': 'bg-emerald-100 text-emerald-800',
    'wcr-pending': 'bg-pink-100 text-pink-800',
    'wcr-submitted': 'bg-fuchsia-100 text-fuchsia-800',
    'subsidy-pending': 'bg-rose-100 text-rose-800',
    active: 'bg-green-200 text-green-900',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: any }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      {Icon && <Icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />}
      <span className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</span> {/* w-36 → w-28 */}
      <span className="text-sm text-gray-900 font-medium break-all min-w-0 flex-1">{value}</span> {/* break-words → break-all, add min-w-0 flex-1 */}
    </div>
  );
}


// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, color = 'blue', children, defaultOpen = true }: {
  title: string; icon: any; color?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 ${colors[color] ?? colors.blue} border-b`}
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Icon size={16} />
          {title}
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

// ─── Poke Modal ───────────────────────────────────────────────────────────────

function PokeModal({ enquiry, onClose, onSent }: { enquiry: Enquiry; onClose: () => void; onSent: () => void }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim() || !enquiry.allottedUser) return;
    setSending(true);
    try {
      await fetch('/api/pokes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: enquiry.allottedUser,
          enquiryId: enquiry.id,
          customerName: enquiry.customerName,
          message,
        }),
      });
      onSent();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Poke Assignee</h3>
        <p className="text-sm text-gray-500 mb-4">Send a nudge to <span className="font-semibold">{enquiry.allottedUser}</span></p>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="e.g. Please update payment status for this customer..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={send}
            disabled={sending || !message.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sending ? 'Sending...' : 'Send Poke'}
          </button>
          <button onClick={onClose} className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Follow-up Modal ──────────────────────────────────────────────────────

function FollowUpModal({ enquiryId, onClose, onSaved }: { enquiryId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    followupType: 'call',
    followupNotes: '',
    outcome: '',
    nextFollowupDate: '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.followupNotes.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId, ...form }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Add Follow-up</h3>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
          <select
            value={form.followupType}
            onChange={e => setForm({ ...form, followupType: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="call">Phone Call</option>
            <option value="visit">Site Visit</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Notes <span className="text-red-500">*</span></label>
          <textarea
            value={form.followupNotes}
            onChange={e => setForm({ ...form, followupNotes: e.target.value })}
            rows={3}
            placeholder="What happened in this follow-up?"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Outcome</label>
          <input
            value={form.outcome}
            onChange={e => setForm({ ...form, outcome: e.target.value })}
            placeholder="e.g. Interested, callback scheduled"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Next Follow-up Date</label>
          <input
            type="date"
            value={form.nextFollowupDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setForm({ ...form, nextFollowupDate: e.target.value })}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving || !form.followupNotes.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {saving ? 'Saving...' : 'Save Follow-up'}
          </button>
          <button onClick={onClose} className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Update Status Modal ──────────────────────────────────────────────────────

function UpdateStatusModal({ enquiry, onClose, onUpdated }: {
  enquiry: Enquiry;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const allowedNext: EnquiryStatus[] =
  (VALID_TRANSITIONS as Record<string, EnquiryStatus[]>)[enquiry.status] ?? [];
  const [newStatus, setNewStatus] = useState<EnquiryStatus>(
    allowedNext[0] ?? enquiry.status
  );  
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (newStatus === enquiry.status) { onClose(); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/enquiries/${enquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes, updatedAt: new Date().toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      onUpdated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Update Status</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Current: <span className="font-semibold text-blue-700">{enquiry.status}</span>
          </p>
        </div>

        {allowedNext.length === 0 ? (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
            No further transitions available for this status.
          </p>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">New Status</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as EnquiryStatus)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
            >
              {allowedNext.map(s => (
                <option key={s} value={s}>
                  {s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Reason for status change..."
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={save}
            disabled={saving || newStatus === enquiry.status || allowedNext.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {saving ? 'Updating...' : 'Update Status'}
          </button>
          <button onClick={onClose} className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EnquiryDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [activeTab, setActiveTab] = useState<string>('overview');
  const [showPokeModal, setShowPokeModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isAdminOrOwner = !!(
    session?.user?.accountType === 'admin' ||
    session?.user?.accountType === 'owner' ||
    session?.user?.role === 'admin' ||
    session?.user?.role === 'owner'
  );

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [enqRes, timelineRes, followupsRes] = await Promise.allSettled([
        fetch(`/api/enquiries/${id}`),
        fetch(`/api/enquiries/${id}/timeline`),
        fetch(`/api/followups`),
      ]);

      if (enqRes.status === 'fulfilled' && enqRes.value.ok) {
        setEnquiry(await enqRes.value.json());
      } else {
        setError('Enquiry not found');
      }

      if (timelineRes.status === 'fulfilled' && timelineRes.value.ok) {
        const tlJson = await timelineRes.value.json();
        setTimeline(Array.isArray(tlJson) ? tlJson : (tlJson.timeline ?? []));
      }
      

      if (followupsRes.status === 'fulfilled' && followupsRes.value.ok) {
        const allFU: FollowUp[] = await followupsRes.value.json();
        setFollowups(allFU.filter(f => f.enquiryId === id));
      }
    } catch {
      setError('Failed to load enquiry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading enquiry...</p>
      </div>
    </div>
  );

  if (error || !enquiry) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-sm w-full text-center">
        <XCircle size={40} className="text-red-500 mx-auto mb-4" />
        <h2 className="font-bold text-gray-900 mb-2">Enquiry Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">{error ?? 'This enquiry does not exist.'}</p>
        <button onClick={() => router.push('/enquiries')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold">
          Back to Enquiries
        </button>
      </div>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = enquiry.nextActionDate &&
    new Date(enquiry.nextActionDate).toISOString().split('T')[0] < today &&
    enquiry.status !== 'active';
  const isBlocked = enquiry.isBlocked === true || (enquiry.isBlocked as any) === 'TRUE';

  // ── Tabs config ─────────────────────────────────────────────────────────────
  const userCanView: string[] =
  (session?.user?.permissions as any)?.canView ?? [];

const canSeeTab = (path: string) =>
  isAdminOrOwner || userCanView.includes(path);

const tabs = [
  { id: 'overview',     label: 'Overview', icon: User,           show: true },
  { id: 'survey',       label: 'Survey',   icon: ClipboardCheck, show: canSeeTab('/survey') },
  { id: 'payment',      label: 'Payment',  icon: DollarSign,     show: canSeeTab('/payments') || canSeeTab('/payment') },
  { id: 'installation', label: 'Install',  icon: Wrench,         show: canSeeTab('/installation') },
  { id: 'timeline',     label: 'Timeline', icon: Activity,       show: true },
].filter(t => t.show);



  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/enquiries')}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
          <div>
  <div className="flex items-center gap-2">
    <h1 className="text-base font-bold text-gray-900 truncate">{enquiry.customerName}</h1>
    <StatusBadge status={enquiry.status} />
  </div>
  <p className="text-xs text-gray-400 font-mono">{enquiry.id}</p>
</div>
            <p className="text-xs text-gray-500 mt-0.5">
              {enquiry.area} · {enquiry.capacity} kW
              {isBlocked && <span className="ml-2 text-red-600 font-semibold">⚠ Blocked</span>}
              {isOverdue && !isBlocked && <span className="ml-2 text-orange-600 font-semibold">⏰ Overdue</span>}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Blocked warning */}
        {isBlocked && enquiry.blockedReason && (
          <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
            <p className="text-xs text-red-700 font-medium">{enquiry.blockedReason}</p>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">

        {/* ── Action Buttons ──────────────────────────────────────── */}
<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">

{/* Add Follow-up — anyone with enquiry view access */}
{(isAdminOrOwner || userCanView.includes('/enquiries')) && (
  <button
    onClick={() => setShowFollowUpModal(true)}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
  >
    <FileText size={14} />
    Add Follow-up
  </button>
)}

{/* Update Status — anyone with enquiry edit permission */}
{(isAdminOrOwner || userCanView.includes('/enquiries')) && (
  <button
    onClick={() => setShowUpdateStatusModal(true)}
    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
  >
    <CheckCircle2 size={14} />
    Update Status
  </button>
)}

{/* Poke Assignee — only if someone else is assigned */}
{enquiry.allottedUser && enquiry.allottedUser !== session?.user?.email && (
  <button
    onClick={() => setShowPokeModal(true)}
    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
  >
    <Send size={14} />
    Poke Assignee
  </button>
)}

{/* Edit — full field editing, admin/owner only */}
{isAdminOrOwner && (
  <Link
    href={`/enquiries/${enquiry.id}/edit`}
    className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition"
  >
    <Edit3 size={14} />
    Edit
  </Link>
)}

</div>



        {/* ── Quick Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Capacity', value: `${enquiry.capacity} kW`, icon: Zap, color: 'text-blue-600' },
            { label: 'Quoted', value: enquiry.quotationAmount ? `₹${fmt(enquiry.quotationAmount)}` : '—', icon: IndianRupee, color: 'text-green-600' },
            { label: 'Priority', value: enquiry.priority ?? 'medium', icon: Tag, color: enquiry.priority === 'urgent' ? 'text-red-600' : 'text-orange-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-3 text-center shadow-sm">
              <stat.icon size={18} className={`${stat.color} mx-auto mb-1`} />
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto scrollbar-none scroll-smooth">
        {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition justify-center
                ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: OVERVIEW                                                       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <SectionCard title="Customer Details" icon={User} color="blue">
              <InfoRow label="Name" value={enquiry.customerName} icon={User} />
              <InfoRow label="Phone" value={enquiry.phone} icon={Phone} />
              <InfoRow label="Email" value={enquiry.email} icon={Mail} />
              <InfoRow label="Address" value={enquiry.address} icon={Home} />
              <InfoRow label="Area" value={enquiry.area} icon={MapPin} />
              <InfoRow label="Panel Tag" value={enquiry.panelTag} icon={Tag} />
              <InfoRow label="Payment Type" value={enquiry.paymentType} icon={CreditCard} />
            </SectionCard>

            <SectionCard title="Assignment & Tracking" icon={UserCheck} color="indigo">
              <InfoRow label="Assigned To" value={enquiry.allottedUser} icon={UserCheck} />
              <InfoRow label="Priority" value={enquiry.priority} icon={AlertTriangle} />
              <InfoRow label="Next Action" value={fmtDate(enquiry.nextActionDate)} icon={Calendar} />
              <InfoRow label="Last Follow-up" value={fmtDate(enquiry.lastFollowupDate)} icon={Clock} />
              <InfoRow label="Last Edited By" value={enquiry.lastEditedBy} icon={Edit3} />
              <InfoRow label="Created" value={fmtDate(enquiry.createdAt)} icon={Calendar} />
              {isBlocked && <InfoRow label="Blocked Reason" value={enquiry.blockedReason} icon={AlertTriangle} />}
            </SectionCard>

            {/* Vendor / Portal */}
            {(enquiry.vendorName || enquiry.applicationNumber || enquiry.consumerRegistrationNumber) && (
              <SectionCard title="Registration & Portal" icon={Building2} color="orange" defaultOpen={false}>
                <InfoRow label="Vendor" value={enquiry.vendorName} />
                <InfoRow label="App Number" value={enquiry.applicationNumber} />
                <InfoRow label="Consumer Reg #" value={enquiry.consumerRegistrationNumber} />
                <InfoRow label="DISCOM Circle" value={enquiry.discomCircle} />
                <InfoRow label="Feasibility #" value={enquiry.feasibilityApprovalNumber} />
                <InfoRow label="Feasibility Date" value={fmtDate(enquiry.feasibilityApprovalDate)} />
              </SectionCard>
            )}

            {/* Loan */}
            {enquiry.loanRequired && (
              <SectionCard title="Loan Details" icon={IndianRupee} color="rose" defaultOpen={false}>
                <InfoRow label="Bank" value={enquiry.loanBank} />
                <InfoRow label="Branch" value={enquiry.loanBranch} />
                <InfoRow label="Loan Amount" value={enquiry.loanAmount ? `₹${fmt(enquiry.loanAmount)}` : undefined} />
                <InfoRow label="Status" value={enquiry.loanStatus} />
                <InfoRow label="Applied On" value={fmtDate(enquiry.loanApplicationDate)} />
                <InfoRow label="Sanction Date" value={fmtDate(enquiry.loanSanctionDate)} />
                <InfoRow label="1st Tranche" value={enquiry.loanFirstTrancheAmount ? `₹${fmt(enquiry.loanFirstTrancheAmount)}` : undefined} />
                <InfoRow label="2nd Tranche" value={enquiry.loanSecondTrancheAmount ? `₹${fmt(enquiry.loanSecondTrancheAmount)}` : undefined} />
              </SectionCard>
            )}

            {/* Recent Follow-ups */}
            {followups.length > 0 && (
              <SectionCard title={`Follow-ups (${followups.length})`} icon={Clock} color="teal" defaultOpen={false}>
                <div className="space-y-2">
                  {followups.slice(0, 5).map(f => (
                    <div key={f.followupId} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700 capitalize">{f.followupType}</span>
                        <span className="text-xs text-gray-400">{fmtDate(f.followupDate)}</span>
                      </div>
                      <p className="text-sm text-gray-800">{f.followupNotes}</p>
                      {f.outcome && <p className="text-xs text-gray-500 mt-1">Outcome: {f.outcome}</p>}
                      {f.nextFollowupDate && (
                        <p className="text-xs text-blue-600 mt-1">Next: {fmtDate(f.nextFollowupDate)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: SURVEY                                                         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'survey' && (
          <div className="space-y-4">
            <SectionCard title="Survey Details" icon={ClipboardCheck} color="purple">
              <InfoRow label="Survey Date" value={fmtDate(enquiry.surveyDate)} icon={Calendar} />
              <InfoRow label="Surveyed By" value={enquiry.surveyedBy} icon={User} />
              <InfoRow label="Scheduled Date" value={fmtDate(enquiry.surveyScheduledDate)} icon={Calendar} />
              <InfoRow label="Completed Date" value={fmtDate(enquiry.surveyCompletedDate)} icon={Calendar} />
              <InfoRow label="Notes" value={enquiry.surveyNotes} icon={FileText} />
              <InfoRow label="Rejected Reason" value={enquiry.surveyRejectedReason} icon={XCircle} />
              <div className="flex items-start gap-2 py-2">
                <Shield size={14} className="text-gray-400 mt-0.5" />
                <span className="text-xs text-gray-500 w-36 flex-shrink-0">Approved</span>
                {enquiry.surveyApproved
                  ? <span className="flex items-center gap-1 text-green-700 font-semibold text-sm"><CheckCircle2 size={14} /> Yes</span>
                  : <span className="flex items-center gap-1 text-red-600 font-semibold text-sm"><XCircle size={14} /> No</span>
                }
              </div>
            </SectionCard>

            <SectionCard title="System Specifications" icon={Zap} color="blue" defaultOpen={false}>
              <InfoRow label="System Capacity" value={enquiry.systemCapacity ? `${enquiry.systemCapacity} kW` : undefined} />
              <InfoRow label="Panel Make" value={enquiry.panelMake} />
              <InfoRow label="Panel Wattage" value={enquiry.panelWattage ? `${enquiry.panelWattage} W` : undefined} />
              <InfoRow label="Panel Qty" value={enquiry.panelQuantity} />
              <InfoRow label="Inverter Make" value={enquiry.inverterMake} />
              <InfoRow label="Inverter Capacity" value={enquiry.inverterCapacity ? `${enquiry.inverterCapacity} kW` : undefined} />
              <InfoRow label="Structure Type" value={enquiry.structureType} />
              <InfoRow label="Battery Required" value={enquiry.batteryRequired ? 'Yes' : undefined} />
              <InfoRow label="Battery Capacity" value={enquiry.batteryCapacity ? `${enquiry.batteryCapacity} kWh` : undefined} />
            </SectionCard>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: PAYMENT                                                        */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            <SectionCard title="Quotation" icon={FileText} color="indigo">
              <InfoRow label="Quotation ID" value={enquiry.quotationId} />
              <InfoRow label="Quotation Date" value={fmtDate(enquiry.quotationDate)} icon={Calendar} />
              <InfoRow label="Amount" value={enquiry.quotationAmount ? `₹${fmt(enquiry.quotationAmount)}` : undefined} icon={IndianRupee} />
              <InfoRow label="Approved By" value={enquiry.quotationApprovedBy} />
              <InfoRow label="Approved Date" value={fmtDate(enquiry.quotationApprovedDate)} />
              <InfoRow label="Rejected Reason" value={enquiry.quotationRejectedReason} />
            </SectionCard>

            <SectionCard title="Payment" icon={DollarSign} color="green">
              <InfoRow label="Estimated Cost" value={enquiry.estimatedCost ? `₹${fmt(enquiry.estimatedCost)}` : undefined} icon={IndianRupee} />
              <InfoRow label="Initial Payment" value={enquiry.initialPayment ? `₹${fmt(enquiry.initialPayment)}` : undefined} icon={IndianRupee} />
              <InfoRow label="Payment Date" value={fmtDate(enquiry.paymentDate)} icon={Calendar} />
              <InfoRow label="Payment Method" value={enquiry.paymentMethod} icon={CreditCard} />
              <InfoRow label="Payment UTR" value={enquiry.paymentUTR} />
              <InfoRow label="Payment Status" value={enquiry.paymentStatus} />
              <InfoRow label="Verified By" value={enquiry.paymentVerifiedBy} icon={UserCheck} />
              <InfoRow label="Verification Date" value={fmtDate(enquiry.paymentVerificationDate)} />
            </SectionCard>

            <SectionCard title="Subsidy" icon={IndianRupee} color="rose" defaultOpen={false}>
              <InfoRow label="Subsidy Amount" value={enquiry.subsidyAmount ? `₹${fmt(enquiry.subsidyAmount)}` : undefined} />
              <InfoRow label="Status" value={enquiry.subsidyStatus} />
              <InfoRow label="Applied Date" value={fmtDate(enquiry.subsidyAppliedDate)} />
              <InfoRow label="Approved Date" value={fmtDate(enquiry.subsidyApprovedDate)} />
              <InfoRow label="Disbursed Date" value={fmtDate(enquiry.subsidyDisbursedDate)} />
              <InfoRow label="Bank Account" value={enquiry.subsidyBankAccount} />
              <InfoRow label="UTR" value={enquiry.subsidyUTR} />
              <InfoRow label="Rejected Reason" value={enquiry.subsidyRejectionReason} />
            </SectionCard>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: INSTALLATION                                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'installation' && (
          <div className="space-y-4">
            <SectionCard title="Installation" icon={Wrench} color="teal">
              <InfoRow label="Scheduled Date" value={fmtDate(enquiry.installationScheduledDate)} icon={Calendar} />
              <InfoRow label="Start Date" value={fmtDate(enquiry.installationStartDate)} icon={Calendar} />
              <InfoRow label="Completed Date" value={fmtDate(enquiry.installationCompletedDate)} icon={Calendar} />
              <InfoRow label="Team" value={enquiry.installationTeam} icon={User} />
              <InfoRow label="Supervisor" value={enquiry.installationSupervisor} icon={UserCheck} />
              <InfoRow label="Notes" value={enquiry.installationNotes} icon={FileText} />
              <InfoRow label="Panel Serials" value={enquiry.pvModuleSerialNumbers} />
              <InfoRow label="Inverter Serial" value={enquiry.inverterSerialNumber} />
              <InfoRow label="Meter Number" value={enquiry.meterNumber} />
              <InfoRow label="Meter Installed" value={fmtDate(enquiry.meterInstalledDate)} />
              <InfoRow label="Initial Reading" value={enquiry.meterReadingInitial} />
              <div className="flex items-start gap-2 py-2">
                <Shield size={14} className="text-gray-400 mt-0.5" />
                <span className="text-xs text-gray-500 w-36 flex-shrink-0">Earthing Done</span>
                {enquiry.earthingDone
                  ? <span className="flex items-center gap-1 text-green-700 font-semibold text-sm"><CheckCircle2 size={14} /> Yes</span>
                  : <span className="text-sm text-gray-400">Pending</span>
                }
              </div>
              <InfoRow label="Earthing Resistance" value={enquiry.earthingResistance ? `${enquiry.earthingResistance} Ω` : undefined} />
            </SectionCard>

            <SectionCard title="Inspection" icon={Scale} color="orange" defaultOpen={false}>
              <InfoRow label="Scheduled Date" value={fmtDate(enquiry.inspectionScheduledDate)} icon={Calendar} />
              <InfoRow label="Inspection Date" value={fmtDate(enquiry.inspectionDate)} icon={Calendar} />
              <InfoRow label="Officer" value={enquiry.inspectionOfficer} icon={User} />
              <InfoRow label="Status" value={enquiry.inspectionStatus} />
              <InfoRow label="Rejected Reason" value={enquiry.inspectionRejectedReason} />
              <div className="flex items-start gap-2 py-2">
                <Shield size={14} className="text-gray-400 mt-0.5" />
                <span className="text-xs text-gray-500 w-36 flex-shrink-0">Approved</span>
                {enquiry.inspectionApproved
                  ? <span className="flex items-center gap-1 text-green-700 font-semibold text-sm"><CheckCircle2 size={14} /> Yes</span>
                  : <span className="flex items-center gap-1 text-orange-600 text-sm"><Clock size={14} /> Pending</span>
                }
              </div>
            </SectionCard>

            <SectionCard title="Grid Sync & Activation" icon={TrendingUp} color="green" defaultOpen={false}>
              <InfoRow label="Grid Sync Date" value={fmtDate((enquiry as any).gridSyncDate)} icon={Calendar} />
              <InfoRow label="Activation Date" value={fmtDate((enquiry as any).activationDate)} icon={Calendar} />
              <div className="flex items-start gap-2 py-2">
                <Zap size={14} className="text-gray-400 mt-0.5" />
                <span className="text-xs text-gray-500 w-36 flex-shrink-0">System Status</span>
                {enquiry.status === 'active'
                  ? <span className="flex items-center gap-1 text-green-700 font-bold text-sm"><CheckCircle2 size={14} /> ACTIVE</span>
                  : <span className="text-sm text-gray-500 capitalize">{enquiry.status}</span>
                }
              </div>
            </SectionCard>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB: TIMELINE                                                       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            {timeline.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <Activity size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No activity recorded yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <Activity size={16} className="text-blue-600" />
                  <span className="font-semibold text-gray-900 text-sm">Activity Log</span>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                    {timeline.length} entries
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {timeline.map((entry, i) => (
                    <div key={i} className="px-4 py-3 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Activity size={14} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900 capitalize">
                            {entry.action?.replace(/-/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {fmtDateTime(entry.timestamp)}
                          </span>
                        </div>
                        {entry.details && (
                          <p className="text-xs text-gray-600 mt-0.5">{entry.details}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">{entry.userId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showPokeModal && (
        <PokeModal
          enquiry={enquiry}
          onClose={() => setShowPokeModal(false)}
          onSent={() => setShowPokeModal(false)}
        />
      )}
      {showFollowUpModal && (
        <FollowUpModal
          enquiryId={enquiry.id}
          onClose={() => setShowFollowUpModal(false)}
          onSaved={() => {
            setShowFollowUpModal(false);
            fetchData();
          }}
        />
      )}
      {showUpdateStatusModal && (
  <UpdateStatusModal
    enquiry={enquiry}
    onClose={() => setShowUpdateStatusModal(false)}
    onUpdated={() => {
      setShowUpdateStatusModal(false);
      fetchData();
    }}
  />
)}
    </div>
  );
}
