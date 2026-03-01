// src/app/admin/users/[email]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Phone, Shield, Clock,
  CheckCircle2, XCircle, FileText, TrendingUp,
  AlertTriangle, Calendar, Send, Loader2, RefreshCw,
  BarChart2, Zap, ClipboardCheck, DollarSign, Wrench,
  Package, CheckSquare, IndianRupee, Activity,
  ChevronDown, ChevronUp, Star, UserCheck, Lock,
  Eye, Edit3, Trash2, Flag
} from 'lucide-react';
import type { Enquiry } from '@/lib/types';
import toast, { Toaster } from 'react-hot-toast'; 

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  email: string;
  name: string;
  role: string;
  department?: string;
  phone?: string;
  isActive: boolean | string;
  createdAt?: string;
  lastLogin?: string;
  organizationId?: string;
  permissions?: {
    canView?: string[];
    canEdit?: string[];
    canDelete?: string[];
    canExport?: boolean;
    canAssign?: boolean;
  };
}

interface ActivityLog {
  logId: string;
  enquiryId: string;
  userId: string;
  action: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d?: string | null) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return '—'; }
}

function fmtDateTime(d?: string | null) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

function timeAgo(d?: string | null) {
  if (!d) return 'Never';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    'survey-pending': 'bg-yellow-100 text-yellow-700',
    'survey-completed': 'bg-green-100 text-green-700',
    'payment-received': 'bg-emerald-100 text-emerald-700',
    'payment-pending': 'bg-red-100 text-red-700',
    'installation-completed': 'bg-teal-100 text-teal-700',
    active: 'bg-green-200 text-green-900',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    sales: 'bg-green-100 text-green-700',
    surveyor: 'bg-yellow-100 text-yellow-700',
    installation: 'bg-orange-100 text-orange-700',
    accounts: 'bg-indigo-100 text-indigo-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${map[role] ?? 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function Section({ title, icon: Icon, color = 'blue', count, children, defaultOpen = true }: {
  title: string; icon: any; color?: string; count?: number;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3.5 border-b ${colors[color] ?? colors.blue}`}
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Icon size={15} />
          {title}
          {count !== undefined && (
            <span className="ml-1 bg-white/60 text-current text-xs px-2 py-0.5 rounded-full font-bold">
              {count}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: any; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-sm">
      <Icon size={20} className={`${color} mx-auto mb-1.5`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Poke Modal ───────────────────────────────────────────────────────────────

function PokeModal({ user, onClose, onSent }: {
  user: UserProfile; onClose: () => void; onSent: () => void;
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch('/api/pokes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          enquiryId: 'general',
          customerName: 'General',
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Send size={18} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Poke {user.name}</h3>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="e.g. Please update your pending enquiries..."
          rows={3}
          autoFocus
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-orange-400 focus:outline-none text-sm resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={send}
            disabled={sending || !message.trim()}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {sending ? 'Sending...' : 'Send Poke'}
          </button>
          <button onClick={onClose} className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page config ──────────────────────────────────────────────────────────────

const PAGES = [
  { path: 'leads', name: 'Leads', icon: User },
  { path: 'enquiries', name: 'Enquiries', icon: FileText },
  { path: 'survey', name: 'Survey', icon: ClipboardCheck },
  { path: 'quotation', name: 'Quotation', icon: FileText },
  { path: 'registration', name: 'Registration', icon: Shield },
  { path: 'payment', name: 'Payments', icon: IndianRupee },
  { path: 'bom', name: 'BOM', icon: Package },
  { path: 'installation', name: 'Installation', icon: Wrench },
  { path: 'liaison', name: 'Liaison', icon: ClipboardCheck },
  { path: 'wcr', name: 'WCR', icon: CheckSquare },
  { path: 'subsidy', name: 'Subsidy', icon: IndianRupee },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const rawEmail = params?.email as string;
  // Next.js encodes @ as %40 in dynamic routes
  const userEmail = decodeURIComponent(rawEmail);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'activity' | 'permissions'>('overview');
  const [showPokeModal, setShowPokeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Guard: admin/owner only
  const isAdminOrOwner =
    session?.user?.accountType === 'admin' ||
    session?.user?.accountType === 'owner' ||
    session?.user?.role === 'admin' ||
    session?.user?.role === 'owner';

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, enqRes, actsRes] = await Promise.allSettled([
        fetch('/api/users'),
        fetch('/api/enquiries'),
        fetch('/api/activities'),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const allUsers: UserProfile[] = await usersRes.value.json();
        const found = allUsers.find(u => u.email === userEmail);
        if (found) setProfile(found);
      }

      if (enqRes.status === 'fulfilled' && enqRes.value.ok) {
        const allEnq: Enquiry[] = await enqRes.value.json();
        setEnquiries(allEnq.filter(e =>
          e.allottedUser === userEmail || e.surveyedBy === userEmail
        ));
      }

      if (actsRes.status === 'fulfilled' && actsRes.value.ok) {
        const allActs: ActivityLog[] = await actsRes.value.json();
        setActivities(allActs.filter(a => a.userId === userEmail).slice(0, 50));
      }
    } catch (err) {
      console.error('User profile fetch error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (!isAdminOrOwner) { router.push('/dashboard'); return; }
    fetchData();
  }, [fetchData, isAdminOrOwner, router]);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const stats = {
    total: enquiries.length,
    active: enquiries.filter(e => e.status === 'active').length,
    completed: enquiries.filter(e =>
      ['installation-completed', 'active', 'wcr-approved', 'subsidy-disbursed'].includes(e.status)
    ).length,
    overdue: enquiries.filter(e => {
      if (!e.nextActionDate || e.status === 'active') return false;
      return new Date(e.nextActionDate).toISOString().split('T')[0] <
        new Date().toISOString().split('T')[0];
    }).length,
    blocked: enquiries.filter(e => e.isBlocked === true || (e.isBlocked as any) === 'TRUE').length,
    totalKW: enquiries.reduce((s, e) => s + (Number(e.capacity) || 0), 0),
  };

  const actionCounts = activities.reduce((acc, a) => {
    acc[a.action] = (acc[a.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading user profile...</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-sm w-full">
        <XCircle size={40} className="text-red-400 mx-auto mb-4" />
        <h2 className="font-bold text-gray-900 mb-2">User Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">{userEmail}</p>
        <button
          onClick={() => router.push('/admin/users')}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold"
        >
          Back to Users
        </button>
      </div>
    </div>
  );

  const isActive = profile.isActive === true || (profile.isActive as any) === 'true' || (profile.isActive as any) === 'TRUE';
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'enquiries', label: `Enquiries (${stats.total})`, icon: FileText },
    { id: 'activity', label: `Activity (${activities.length})`, icon: Activity },
    { id: 'permissions', label: 'Permissions', icon: Shield },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/users')}
            className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-sm">
              {profile.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-gray-900 truncate">{profile.name}</h1>
              <RoleBadge role={profile.role} />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {isActive ? '● Active' : '○ Inactive'}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
          </div>

          <button
            onClick={() => { setRefreshing(true); fetchData(); }}
            disabled={refreshing}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition"
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">

        {/* ── Action Buttons ─────────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowPokeModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition"
          >
            <Send size={14} />
            Poke User
          </button>
          <Link
            href={`/admin/users?edit=${encodeURIComponent(profile.email)}`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition"
          >
            <Edit3 size={14} />
            Edit User
          </Link>
          <Link
            href={`/admin/users?permissions=${encodeURIComponent(profile.email)}`}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition"
          >
            <Shield size={14} />
            Edit Permissions
          </Link>
        </div>

        {/* ── Performance Stats Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Assigned" value={stats.total} icon={FileText} color="text-blue-600" />
          <StatCard label="Total kW" value={`${stats.totalKW.toFixed(1)}`} icon={Zap} color="text-yellow-500" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="text-green-600" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Active" value={stats.active} icon={TrendingUp} color="text-teal-600" />
          <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} color="text-orange-500" />
          <StatCard label="Blocked" value={stats.blocked} icon={Flag} color="text-red-500" />
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex-1 justify-center
                ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <Section title="User Details" icon={User} color="blue">
              <div className="space-y-0">
                {[
                  { label: 'Full Name', value: profile.name, icon: User },
                  { label: 'Email', value: profile.email, icon: Mail },
                  { label: 'Phone', value: profile.phone, icon: Phone },
                  { label: 'Role', value: profile.role, icon: Shield },
                  { label: 'Department', value: profile.department, icon: UserCheck },
                  { label: 'Joined', value: fmtDate(profile.createdAt), icon: Calendar },
                  { label: 'Last Login', value: profile.lastLogin ? `${fmtDateTime(profile.lastLogin)} (${timeAgo(profile.lastLogin)})` : '—', icon: Clock },
                ].map(row => row.value ? (
                  <div key={row.label} className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                    <row.icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-500 w-28 flex-shrink-0">{row.label}</span>
                    <span className="text-sm text-gray-900 font-medium capitalize break-words">{row.value}</span>
                  </div>
                ) : null)}
              </div>
            </Section>

            {/* Performance Summary */}
            <Section title="Performance Summary" icon={BarChart2} color="green">
              <div className="space-y-3">
                {/* Stage breakdown */}
                {[
                  { label: 'In Survey', count: enquiries.filter(e => e.status?.startsWith('survey')).length, color: 'bg-yellow-400' },
                  { label: 'In Quotation', count: enquiries.filter(e => e.status?.startsWith('quotation')).length, color: 'bg-purple-400' },
                  { label: 'In Payment', count: enquiries.filter(e => e.status?.startsWith('payment')).length, color: 'bg-green-400' },
                  { label: 'In Installation', count: enquiries.filter(e => e.status?.startsWith('installation')).length, color: 'bg-blue-400' },
                  { label: 'Active/Done', count: stats.active, color: 'bg-emerald-500' },
                ].filter(s => s.count > 0).map(stage => (
                  <div key={stage.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-28 flex-shrink-0">{stage.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`${stage.color} h-2 rounded-full transition-all`}
                        style={{ width: stats.total > 0 ? `${(stage.count / stats.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-800 w-6 text-right">{stage.count}</span>
                  </div>
                ))}
                {stats.total === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No enquiries assigned yet</p>
                )}

                {/* Top activity */}
                {topAction && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-xs text-gray-600">
                      Most frequent action: <span className="font-bold text-gray-800">{topAction[0]}</span>
                      <span className="text-gray-400"> ({topAction[1]}×)</span>
                    </span>
                  </div>
                )}
              </div>
            </Section>
          </div>
        )}

        {/* ── TAB: ENQUIRIES ────────────────────────────────────────────── */}
        {activeTab === 'enquiries' && (
          <div className="space-y-3">
            {enquiries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <FileText size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No enquiries assigned to this user</p>
              </div>
            ) : (
              <>
                {/* Summary row */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <FileText size={14} className="text-blue-600" />
                  <span className="text-sm text-blue-800 font-semibold">
                    {stats.total} enquiries · {stats.totalKW.toFixed(1)} kW total
                  </span>
                </div>

                {/* Enquiry cards */}
                <div className="space-y-2">
                  {enquiries.map(e => {
                    const isBlocked = e.isBlocked === true || (e.isBlocked as any) === 'TRUE';
                    const isOverdue = e.nextActionDate &&
                      new Date(e.nextActionDate).toISOString().split('T')[0] < new Date().toISOString().split('T')[0] &&
                      e.status !== 'active';
                    return (
                      <Link
                        key={e.id}
                        href={`/enquiries/${e.id}`}
                        className="block bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">{e.customerName}</span>
                              {isBlocked && <AlertTriangle size={12} className="text-red-500" />}
                              {isOverdue && !isBlocked && <Clock size={12} className="text-orange-500" />}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {e.id} · {e.area} · {e.capacity} kW
                            </p>
                            {e.nextActionDate && e.status !== 'active' && (
                              <p className={`text-xs mt-1 font-medium ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
                                Next: {fmtDate(e.nextActionDate as any)}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={e.status} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB: ACTIVITY ─────────────────────────────────────────────── */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <Activity size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No activity recorded yet</p>
              </div>
            ) : (
              <>
                {/* Top actions summary */}
                {Object.keys(actionCounts).length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Action Breakdown</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(actionCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([action, count]) => (
                          <span key={action} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">
                            {action} <span className="text-blue-600 font-bold">×{count}</span>
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Activity feed */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-50">
                    {activities.map((act, i) => (
                      <div key={act.logId || i} className="px-4 py-3 flex gap-3 hover:bg-gray-50 transition">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Activity size={13} className="text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900 capitalize">
                              {act.action?.replace(/-/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {fmtDateTime(act.timestamp)}
                            </span>
                          </div>
                          {act.fieldName && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Field: <span className="font-medium text-gray-700">{act.fieldName}</span>
                              {act.oldValue && act.newValue && (
                                <span className="text-gray-400">
                                  {' '}→ {act.newValue?.slice(0, 40)}
                                </span>
                              )}
                            </p>
                          )}
                          {act.enquiryId && act.enquiryId !== 'general' && (
                            <Link
                              href={`/enquiries/${act.enquiryId}`}
                              className="text-xs text-blue-500 hover:underline mt-0.5 block"
                            >
                              {act.enquiryId}
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB: PERMISSIONS ──────────────────────────────────────────── */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            {/* Global flags */}
            <Section title="Access Flags" icon={Lock} color="indigo">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Can Export Data', value: profile.permissions?.canExport },
                  { label: 'Can Assign Tasks', value: profile.permissions?.canAssign },
                ].map(flag => (
                  <div key={flag.label} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                    {flag.value
                      ? <CheckCircle2 size={16} className="text-green-500" />
                      : <XCircle size={16} className="text-gray-300" />
                    }
                    <span className="text-sm text-gray-700 font-medium">{flag.label}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Page permissions table */}
            <Section title="Page Permissions" icon={Eye} color="blue">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 pr-4 font-bold text-gray-600 text-xs">Page</th>
                      <th className="text-center py-3 px-3 font-bold text-gray-600 text-xs">
                        <Eye size={12} className="inline mr-1" />View
                      </th>
                      <th className="text-center py-3 px-3 font-bold text-gray-600 text-xs">
                        <Edit3 size={12} className="inline mr-1" />Edit
                      </th>
                      <th className="text-center py-3 px-3 font-bold text-gray-600 text-xs">
                        <Trash2 size={12} className="inline mr-1" />Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {PAGES.map(page => {
                      const canView = profile.permissions?.canView?.includes(page.path);
                      const canEdit = profile.permissions?.canEdit?.includes(page.path);
                      const canDelete = profile.permissions?.canDelete?.includes(page.path);
                      return (
                        <tr key={page.path} className="hover:bg-gray-50">
                          <td className="py-3 pr-4 font-medium text-gray-800 text-sm">{page.name}</td>
                          <td className="py-3 px-3 text-center">
                            {canView
                              ? <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                              : <XCircle size={16} className="text-gray-200 mx-auto" />
                            }
                          </td>
                          <td className="py-3 px-3 text-center">
                            {canEdit
                              ? <CheckCircle2 size={16} className="text-blue-500 mx-auto" />
                              : <XCircle size={16} className="text-gray-200 mx-auto" />
                            }
                          </td>
                          <td className="py-3 px-3 text-center">
                            {canDelete
                              ? <CheckCircle2 size={16} className="text-red-500 mx-auto" />
                              : <XCircle size={16} className="text-gray-200 mx-auto" />
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link
                  href={`/admin/users?permissions=${encodeURIComponent(profile.email)}`}
                  className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm transition"
                >
                  <Shield size={14} />
                  Edit Permissions
                </Link>
              </div>
            </Section>
          </div>
        )}

      </div>

      {/* ── Poke Modal ─────────────────────────────────────────────────────── */}
      {showPokeModal && (
        <PokeModal
          user={profile}
          onClose={() => setShowPokeModal(false)}
          onSent={() => {
            setShowPokeModal(false);
            toast.success(`Poke sent to ${profile.name}`);
          }}
        />
      )}
    </div>
  );
}
