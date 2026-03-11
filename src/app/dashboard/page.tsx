// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, FileText, ClipboardCheck, DollarSign, Wrench, Zap,
  TrendingUp, ArrowRight, Loader2, FileCheck, Package, Truck,
  Scale, CheckSquare, IndianRupee, Kanban, PhoneCall,
  AlertTriangle, Bell, BellRing, CheckCircle2, Clock,
  ShieldAlert, UserCheck, Send, X, ChevronRight,
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';
import { TourLauncher } from '@/components/TourLauncher';


// ─── Types ────────────────────────────────────────────────────────────────────
type Enquiry = {
  id: string;
  customerName: string;
  area: string;
  capacity: string;
  status: string;
  isBlocked: boolean | string;
  allottedUser: string;
  surveyedBy: string;
  surveyApproved: boolean | string;
  surveyCompletedDate: string;
  quotationAmount: string;
  quotationDate: string;
  paymentDate: string;
  initialPayment: string;
  installationCompletedDate: string;
  applicationNumber: string;
  consumerRegistrationNumber: string;
  inspectionDate: string;
  wcrSubmitted: boolean | string;
  subsidy: string;
  subsidyStatus: string;
  nextActionDate: string;
  priority: string;
  blockedReason: string;
  bomCreated: boolean | string;
  dispatchDate: string;
  gridSyncDate: string;
};

type Poke = {
  id: string;
  from: string;
  fromName: string;
  to: string;
  enquiryId: string;
  customerName: string;
  message: string;
  timestamp: string;
  read: boolean;
};

type Activity = {
  logId: string;
  enquiryId: string;
  userId: string;
  action: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
};

type FollowUp = {
  followupId: string;
  enquiryId: string;
  userId: string;
  followupDate: string;
  followupType: string;
  followupNotes: string;
  outcome: string;
  nextFollowupDate: string;
  status: string;
};

// ─── Demo Data ────────────────────────────────────────────────────────────────
const demoStats = {
  leads: 12,
  new: 8,
  surveyPending: 5,
  surveyCompleted: 4,
  paymentReceived: 3,
  installations: 2,
  active: 1,
  blocked: 1,
  totalQuotedValue: 2800000,
  overdue: 3,
  bom: 3,
  dispatch: 2,
};



// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDemoMode } = useDemoMode();

  const role = session?.user?.role;
  const email = session?.user?.email || '';
  const name = session?.user?.name || '';

  const isAdminOrOwner =
    session?.user?.accountType === 'admin' ||
    session?.user?.accountType === 'owner' ||
    role === 'admin' || role === 'owner';

  // Shape from admin panel: { canView: ['/leads', '/survey'], canEdit: [...] }
  const userPerms = isAdminOrOwner
    ? null
    : (session?.user?.permissions as { canView?: string[] } | null);

  const canSee = (path: string) =>
    isAdminOrOwner || (Array.isArray(userPerms?.canView) && userPerms!.canView.includes(path));

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [pokes, setPokes] = useState<Poke[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState(demoStats);
  const [loading, setLoading] = useState(true);
  const [showPokeModal, setShowPokeModal] = useState(false);
  const [pokeTarget, setPokeTarget] = useState<{ enquiryId: string; to: string; customerName: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState({
    priorityActions: false,
    myTasks: false,
    recentActivity: true,   // collapsed by default — it's the longest
  });
  const toggle = (key: keyof typeof collapsed) =>
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));



  const today = new Date().toISOString().split('T')[0];

  // ── Fetch all data ──
  const fetchData = useCallback(async () => {
    if (status !== 'authenticated') { setLoading(false); return; }
    try {
      // ── Fixed: always fetch all 7, separate admin-only users fetch ──
      const [enqRes, leadsRes, bomRes, tasksRes, pokesRes, actsRes, fusRes] =
        await Promise.allSettled([
          fetch('/api/enquiries'),
          fetch('/api/leads'),
          fetch('/api/bom'),
          fetch('/api/tasks'),       // server-side filtered per user
          fetch('/api/pokes'),       // all users see their own pokes
          fetch('/api/activities'),  // server-side filtered per user
          fetch('/api/followups'),   // all users
        ]);

      const ok = (r: PromiseSettledResult<Response>) =>
        r.status === 'fulfilled' && r.value.ok ? r.value : null;

      let enqs: Enquiry[] = [];
      let ldsArr: any[] = [];
      let bomsArr: any[] = [];
      let usersArr: any[] = [];
      let pokesArr: Poke[] = [];
      let actsArr: Activity[] = [];
      let fusArr: FollowUp[] = [];

      if (ok(enqRes)) enqs = await ok(enqRes)!.json();
      if (ok(leadsRes)) ldsArr = await ok(leadsRes)!.json();
      if (ok(bomRes)) {
        const bomJson = await ok(bomRes)!.json();
        bomsArr = Array.isArray(bomJson) ? bomJson : (bomJson.boms ?? []);
        setBoms(bomsArr);
      }
      if (ok(tasksRes)) {
        const tasksJson = await ok(tasksRes)!.json();
        setMyTasks(tasksJson.allTasks ?? []);
      }
      if (ok(pokesRes)) pokesArr = await ok(pokesRes)!.json();
      if (ok(actsRes)) actsArr = (await ok(actsRes)!.json()).slice(0, isAdminOrOwner ? 20 : 10);
      if (ok(fusRes)) {
        const allFUs: FollowUp[] = await ok(fusRes)!.json();
        fusArr = allFUs.filter((f: FollowUp) => f.status === 'pending').slice(0, isAdminOrOwner ? 10 : 8);
      }

      // Admin-only: fetch users separately
      if (isAdminOrOwner) {
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) usersArr = await usersRes.json();
      }

      setEnquiries(enqs);
      setLeads(ldsArr);
      setUsers(usersArr);
      setPokes(pokesArr);
      setActivities(actsArr);
      setFollowups(fusArr);





      // ── CORRECT pipeline counts ──
      // For non-admins, filter to only enquiries assigned to them on visible pages
      const permittedEnqs: Enquiry[] = isAdminOrOwner
        ? enqs
        : enqs.filter((e: Enquiry) => {
          const requiredPerm = (statusToPermKey as Record<string, string>)[e.status];
          // If user can see the page for this status, count it in stats
          return !requiredPerm || (Array.isArray(userPerms?.canView) && userPerms!.canView.includes(requiredPerm));
        });


      const realStats = {
        leads: isAdminOrOwner ? ldsArr.length : ldsArr.filter((l: any) => l.assignedTo === email).length,
        new: permittedEnqs.filter((e: Enquiry) => e.status === 'new').length,
        surveyPending: permittedEnqs.filter((e: Enquiry) => e.status === 'survey-pending').length,
        surveyCompleted: permittedEnqs.filter((e: Enquiry) => e.status === 'survey-completed').length,
        paymentReceived: permittedEnqs.filter((e: Enquiry) => e.status === 'payment-received').length,
        installations: permittedEnqs.filter((e: Enquiry) => e.status === 'installation-completed').length,
        active: permittedEnqs.filter((e: Enquiry) => e.status === 'active').length,
        blocked: permittedEnqs.filter((e: Enquiry) => e.isBlocked === true || e.isBlocked === 'TRUE').length,
        totalQuotedValue: permittedEnqs.reduce((s: number, e: Enquiry) => s + (parseFloat(e.quotationAmount) || 0), 0),
        overdue: permittedEnqs.filter((e: Enquiry) =>
          e.nextActionDate && e.nextActionDate < today && e.status !== 'active'
        ).length,
        bom: isAdminOrOwner
          ? bomsArr.length
          : bomsArr.filter((b: any) => permittedEnqs.some(e => e.id === b.enquiryId)).length,
        dispatch: isAdminOrOwner
          ? bomsArr.filter((b: any) => ['dispatched', 'delivered'].includes(b.dispatchStatus)).length
          : bomsArr.filter((b: any) =>
            ['dispatched', 'delivered'].includes(b.dispatchStatus) &&
            permittedEnqs.some(e => e.id === b.enquiryId)
          ).length,
      };

      setStats(realStats);
    } catch (err) {
      console.error('[Dashboard] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [status, isAdminOrOwner, today, userPerms, email]);
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, fetchData]);

  // ── Poke send ──
  async function sendPoke(enquiryId: string, to: string, customerName: string, message: string) {
    try {
      await fetch('/api/pokes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, enquiryId, customerName, message }),
      });
      setShowPokeModal(false);
      setPokeTarget(null);
      fetchData();
    } catch { /* silent */ }
  }

  // ── Mark pokes read ──
  async function markPokesRead() {
    await fetch('/api/pokes', { method: 'PATCH' });
    setPokes(prev => prev.map(p => ({ ...p, read: true })));
  }

  const unreadPokes = pokes.filter(p => p.to === email && !p.read).length;

  // ── Priority tasks for admin/owner ──
  const priorityEnquiries = enquiries
    .filter(e =>
    (e.priority === 'urgent' || e.priority === 'high' ||
      e.isBlocked === true || e.isBlocked === 'TRUE' ||
      (e.nextActionDate && e.nextActionDate < today && e.status !== 'active') ||
      (e.surveyCompletedDate && (e.surveyApproved === false || e.surveyApproved === 'FALSE'))
    )
    )
    .slice(0, 10);

  // Complete map — every status in statusValidation.ts VALID_TRANSITIONS
  const statusToPermKey: Record<string, string> = {
    // Enquiries base
    new: '/enquiries',
    // Survey
    'survey-pending': '/survey', 'survey-scheduled': '/survey',
    'survey-completed': '/survey', 'survey-rejected': '/survey',
    // Quotation
    'quotation-sent': '/quotation', 'quotation-approved': '/quotation', 'quotation-rejected': '/quotation',
    // Payments
    'payment-pending': '/payments', 'payment-partial': '/payments',
    'payment-complete': '/payments', 'payment-received': '/payments',
    // Registration
    'registration-pending': '/registration', 'registration-submitted': '/registration',
    'registration-approved': '/registration', 'registration-rejected': '/registration',
    // BOM/Dispatch
    'bom-pending': '/bom', 'bom-created': '/bom',
    'dispatch-pending': '/bom', 'dispatched': '/bom', 'delivered': '/bom',
    // Installation
    'installation-pending': '/installation', 'installation-scheduled': '/installation',
    'installation-in-progress': '/installation', 'installation-completed': '/installation',
    'installation-rework-required': '/installation',
    // WCR
    'wcr-pending': '/wcr', 'wcr-submitted': '/wcr', 'wcr-approved': '/wcr', 'wcr-rejected': '/wcr',
    // Liaison/Inspection
    'inspection-pending': '/liaison', 'inspection-scheduled': '/liaison',
    'inspection-completed': '/liaison', 'inspection-approved': '/liaison',
    'inspection-rejected': '/liaison', 'meter-installation-pending': '/liaison',
    'meter-installed': '/liaison', 'grid-sync-pending': '/liaison', 'grid-synced': '/liaison',
    // Subsidy
    'subsidy-pending': '/subsidy', 'subsidy-applied': '/subsidy',
    'subsidy-approved': '/subsidy', 'subsidy-disbursed': '/subsidy',
  };

  if (status === 'loading') return <DashboardSkeleton />;
  if (status === 'unauthenticated') { router.push('/login'); return null; }
  // Wait for permissions to load before rendering for non-admin users
  if (!isAdminOrOwner && userPerms === undefined) return <DashboardSkeleton />;




  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />

      {/* ── Notification Bell (fixed top-right) ── */}
      <div data-tour="bell" className="fixed top-[3.75rem] right-4 z-40 lg:top-4">
        <button
          onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markPokesRead(); }}
          className="relative bg-white border border-gray-200 shadow-md p-2.5 rounded-xl hover:bg-gray-50 transition"
        >
          {unreadPokes > 0
            ? <BellRing size={20} className="text-orange-500 animate-bounce" />
            : <Bell size={20} className="text-gray-500" />
          }
          {unreadPokes > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadPokes}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-bold text-gray-900 text-sm">Notifications</span>
              <button onClick={() => setShowNotifications(false)}><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {pokes.filter(p => p.to === email).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
              ) : (
                pokes.filter(p => p.to === email).map(poke => (
                  <div key={poke.id}
                    className={`px-4 py-3 border-b border-gray-50 ${!poke.read ? 'bg-orange-50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0 mt-0.5">
                        {poke.fromName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{poke.fromName} poked you</p>
                        <p className="text-xs text-gray-600 mt-0.5">{poke.message}</p>
                        <button
                          onClick={() => router.push(`/enquiries/${poke.enquiryId}`)}
                          className="text-xs text-blue-600 font-semibold mt-1"
                        >
                          {poke.customerName} ({poke.enquiryId}) →
                        </button>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(poke.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Activity feed — who poked whom (admin sees all) */}
            {isAdminOrOwner && pokes.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-1">Activity</p>
                {pokes.slice(0, 5).map(p => (
                  <p key={p.id + 'feed'} className="text-xs text-gray-500 mb-0.5">
                    {p.fromName} → {p.to.split('@')[0]} re: {p.enquiryId}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto pt-16 lg:pt-6 overflow-x-hidden">
      {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {session?.user?.role?.charAt(0).toUpperCase() + (session?.user?.role?.slice(1) || '')} · {session?.user?.email}
            {stats.overdue > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-semibold">
                <AlertTriangle size={13} /> {stats.overdue} overdue
              </span>
            )}
          </p>
          <TourLauncher />
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {canSee('/leads') && (
            <div data-tour="kpi-leads"><MetricCard title="New Leads" value={stats.leads} icon={PhoneCall} color="blue" href="/leads" /></div>
          )}
          {canSee('/enquiries') && (
           <div data-tour="kpi-enquiries"><MetricCard title="Active Enquiries" value={stats.new + stats.surveyPending + stats.surveyCompleted} icon={FileText} color="indigo" href="/enquiries" /></div>
          )}
          {isAdminOrOwner && (
            <div data-tour="kpi-live"><MetricCard title="Live Systems" value={stats.active} icon={Zap} color="green" href="/liaison" /></div>
          )}
          {isAdminOrOwner && (
            <div data-tour="kpi-value"><MetricCard title="Pipeline Value" value={`₹${(stats.totalQuotedValue / 100000).toFixed(1)}L`} icon={TrendingUp} color="emerald" /></div>
          )}
        </div>


        {/* ── Blocked Warning Banner ── */}
        {isAdminOrOwner && stats.blocked > 0 && (
          <div
          data-tour="blocked-banner" className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 cursor-pointer hover:bg-red-100 transition"
            onClick={() => router.push('/enquiries?filter=blocked')}
          >
            <ShieldAlert size={18} className="text-red-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700">
              {stats.blocked} enquir{stats.blocked > 1 ? 'ies are' : 'y is'} blocked and need immediate attention
            </p>
            <ChevronRight size={16} className="text-red-400 ml-auto" />
          </div>
        )}

        {/* ── Installation Pipeline ── */}
        {isAdminOrOwner && (
          <div data-tour="pipeline" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              Installation Pipeline
              <span className="ml-auto text-xs font-normal text-gray-400 hidden sm:inline">Each stage is mutually exclusive</span>
            </h2>

            {/* Row 1 — Pre-installation (7 stages) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-2">
              <PipelineStage name="Leads" count={stats.leads} icon={PhoneCall} color="blue" href="/leads" />
              <PipelineStage name="New" count={stats.new} icon={FileText} color="indigo" href="/enquiries" />
              <PipelineStage name="Survey ⏳" count={stats.surveyPending} icon={ClipboardCheck} color="purple" href="/survey" />
              <PipelineStage name="Survey ✅" count={stats.surveyCompleted} icon={FileCheck} color="pink" href="/survey" />
              <PipelineStage name="Payment" count={stats.paymentReceived} icon={DollarSign} color="orange" href="/payments" />
              <PipelineStage name="Installed" count={stats.installations} icon={Wrench} color="teal" href="/installation" />
              <PipelineStage name="Active ⚡" count={stats.active} icon={Zap} color="green" href="/liaison" />
            </div>

            {/* Row 2 — Supporting stages */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <PipelineStage name="Quotation" count={enquiries.filter(e => e.quotationDate).length} icon={FileCheck} color="pink" href="/quotation" />
              <PipelineStage name="Registration" count={enquiries.filter(e => e.applicationNumber || e.consumerRegistrationNumber).length} icon={Scale} color="yellow" href="/registration" />
              <PipelineStage name="BOM" count={stats.bom ?? 0} icon={Package} color="cyan" href="/bom" />
              <PipelineStage name="Dispatch" count={stats.dispatch ?? 0} icon={Truck} color="violet" href="/bom" />
              <PipelineStage name="WCR" count={enquiries.filter(e => e.wcrSubmitted === true || e.wcrSubmitted === 'TRUE').length} icon={CheckSquare} color="rose" href="/wcr" />
              <PipelineStage name="Subsidy" count={enquiries.filter(e => e.subsidyStatus === 'approved' || e.subsidyStatus === 'disbursed').length} icon={IndianRupee} color="fuchsia" href="/subsidy" />
            </div>
          </div>
        )}


        {/* ── ADMIN/OWNER: Priority Tasks + Poke ── */}
        
        { isAdminOrOwner && (loading || priorityEnquiries.length > 0) && (
          <div data-tour="priority-actions" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
            <h2
              className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 cursor-pointer select-none"
              onClick={() => toggle('priorityActions')}
            >
              <AlertTriangle size={16} className="text-amber-500" />
              Priority Actions
              <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                {priorityEnquiries.length}
              </span>
              <ChevronRight
                size={15}
                className={`ml-auto text-gray-400 transition-transform duration-200 ${collapsed.priorityActions ? '' : 'rotate-90'}`}
              />
            </h2>
            {!collapsed.priorityActions && (
              <div className="space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 size={20} className="animate-spin text-amber-400" />
                  </div>
                ) : priorityEnquiries.map(e => {
                  const isOverdue = e.nextActionDate && e.nextActionDate < today;
                  const isBlocked = e.isBlocked === true || e.isBlocked === 'TRUE';
                  const needsSurveyApproval = e.surveyCompletedDate && (e.surveyApproved === false || e.surveyApproved === 'FALSE');
                  const assignedUser = users.find(u => u.email === e.allottedUser);

                  let badge = '';
                  let badgeColor = '';
                  if (isBlocked) { badge = '🔴 Blocked'; badgeColor = 'bg-red-100 text-red-700'; }
                  else if (needsSurveyApproval) { badge = '🟡 Survey Review'; badgeColor = 'bg-yellow-100 text-yellow-700'; }
                  else if (isOverdue) { badge = '🔶 Overdue'; badgeColor = 'bg-orange-100 text-orange-700'; }
                  else if (e.priority === 'urgent') { badge = '⚡ Urgent'; badgeColor = 'bg-purple-100 text-purple-700'; }
                  else { badge = '🔺 High'; badgeColor = 'bg-blue-100 text-blue-700'; }

                  return (
                    <div key={e.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition min-w-0 overflow-hidden">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm truncate">{e.customerName}</span>
                          <span className="text-xs text-gray-400">{e.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeColor}`}>{badge}</span>
                          {e.priority === 'urgent' && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">urgent</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500">{e.area} · {e.capacity}kW</span>
                          {isBlocked && <span className="text-xs text-red-600 truncate max-w-[120px] block">{e.blockedReason}</span>}
                          {isOverdue && e.nextActionDate && (
                            <span className="text-xs text-orange-600">
                              Due {new Date(e.nextActionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          {/* Assigned user */}
                          {e.allottedUser && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <UserCheck size={11} />
                              {assignedUser?.name || e.allottedUser.split('@')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Poke button */}
                        {e.allottedUser && e.allottedUser !== email && (
                          <button
                            onClick={() => {
                              setPokeTarget({ enquiryId: e.id, to: e.allottedUser, customerName: e.customerName });
                              setShowPokeModal(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-semibold transition border border-orange-200"
                            title={`Poke ${assignedUser?.name || e.allottedUser.split('@')[0]}`}
                          >
                            <Send size={11} /> Poke
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/enquiries/${e.id}`)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition border border-blue-200"
                        >
                          View <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── MY TASKS (all roles) ── */}
        { (loading || myTasks.length > 0) && (
          <div data-tour="my-tasks" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
            <h2
              className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 cursor-pointer select-none"
              onClick={() => toggle('myTasks')}
            >
              <Clock size={16} className="text-blue-500" />
              My Tasks
              <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                {myTasks.length}
              </span>
              <ChevronRight
                size={15}
                className={`ml-auto text-gray-400 transition-transform duration-200 ${collapsed.myTasks ? '' : 'rotate-90'}`}
              />
            </h2>
            {!collapsed.myTasks && (
              <div className="space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 size={20} className="animate-spin text-blue-400" />
                  </div>
                ) : myTasks.map(e => {
                  const isOverdue = e.nextActionDate && e.nextActionDate < today;
                  return (
                    <div key={e.taskId ?? e.entityId}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer hover:shadow-sm ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-transparent hover:border-gray-200'
                        }`}
                        onClick={() => router.push(e.href || `/enquiries/${e.entityId}`)}
                        >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm truncate">{e.customerName}</span>
                          <span className="text-xs text-gray-400">{e.entityId}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${e.status === 'survey-pending' ? 'bg-purple-100 text-purple-700' :
                              e.status === 'survey-completed' ? 'bg-pink-100 text-pink-700' :
                                e.status === 'payment-received' ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-700'
                            }`}>{e.status.replace(/-/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{e.area} · {e.capacity}kW</span>
                          {e.nextActionDate && (
                            <span className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
                              {isOverdue ? '⚠ Overdue · ' : '📅 '}
                              {new Date(e.nextActionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* ── My Follow-ups ── */}
        {followups.length > 0 && (
          <div data-tour="followups" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 overflow-hidden">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <PhoneCall size={16} className="text-green-500" />
              Pending Follow-ups
              <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                {followups.length}
              </span>
            </h2>
            <div className="space-y-2">
              {followups.map(fu => (
                <div key={fu.followupId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer transition min-w-0 overflow-hidden"
                  onClick={() => router.push(`/enquiries/${fu.enquiryId}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{fu.enquiryId}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold shrink-0">{fu.followupType}</span>
                      {fu.outcome && <span className="text-xs text-gray-400 truncate max-w-[80px]">{fu.outcome}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 break-words line-clamp-2">{fu.followupNotes}</p>
                    {fu.nextFollowupDate && (
                      <p className="text-xs text-orange-600 font-semibold mt-0.5">
                        📅 Next: {new Date(fu.nextFollowupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Activity ── */}
        {(loading || activities.length > 0) && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
            <h2
              className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 cursor-pointer select-none"
              onClick={() => toggle('recentActivity')}
            >
              <Bell size={16} className="text-purple-500" />
              Recent Activity
              <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                {activities.length}
              </span>
              <ChevronRight
                size={15}
                className={`ml-auto text-gray-400 transition-transform duration-200 ${collapsed.recentActivity ? '' : 'rotate-90'}`}
              />
            </h2>
            {!collapsed.recentActivity && (
              <div className="space-y-1.5">
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 size={20} className="animate-spin text-purple-400" />
                  </div>
                ) : activities.map(act => (
                  <div key={act.logId} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 text-xs font-bold">{act.action[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0 w-0">
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold capitalize">{act.action.replace(/_/g, ' ')}</span>
                        {' on '}<span className="text-blue-600 cursor-pointer" onClick={() => router.push(`/enquiries/${act.enquiryId}`)}>{act.enquiryId}</span>
                        {act.fieldName && ` · ${act.fieldName}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(act.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Surveys Awaiting Approval (admin/owner) ── */}
        {isAdminOrOwner && (() => {
          const pendingApprovals = enquiries.filter(e =>
            e.surveyCompletedDate &&
            (e.surveyApproved === false || e.surveyApproved === 'FALSE') &&
            e.surveyedBy
          );
          if (pendingApprovals.length === 0) return null;
          return (
            <div data-tour="surveys-approval" className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-4 mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ClipboardCheck size={16} className="text-yellow-500" />
                Surveys Awaiting Approval
                <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                  {pendingApprovals.length}
                </span>
              </h2>
              <div className="space-y-2">
                {pendingApprovals.map(e => (
                  <div key={e.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {e.customerName}
                        <span className="ml-2 text-xs text-gray-400">{e.id}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {e.area} · {e.capacity}kW · surveyed by {e.surveyedBy.split('@')[0]}
                        {e.surveyCompletedDate && ` on ${new Date(e.surveyCompletedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/survey?review=${e.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-bold transition flex-shrink-0"
                    >
                      <CheckCircle2 size={12} /> Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Quick Actions ── */}
        <div data-tour="quick-actions" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {canSee('/leads') && (
            <QuickActionCard title="Add New Lead" description="Capture new prospect" icon={PhoneCall} href="/leads" color="blue" />
          )}
          {canSee('/enquiries') && (
            <QuickActionCard title="Create Enquiry" description="Convert lead to enquiry" icon={FileText} href="/enquiries" color="indigo" />
          )}

          <QuickActionCard title="View Kanban" description="Track all stages visually" icon={Kanban} href="/kanban" color="green" />
        </div>


        {/* ── Admin Quick Nav ── */}
        {isAdminOrOwner && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Enquiries', href: '/enquiries', icon: FileText },
              { label: 'Surveys', href: '/survey', icon: ClipboardCheck },
              { label: 'Installation', href: '/installation', icon: Wrench },
              { label: 'Payments', href: '/payment', icon: IndianRupee },
              { label: 'Users', href: '/admin/users', icon: Users },
              { label: 'Kanban', href: '/kanban', icon: Kanban },
              { label: 'WCR', href: '/wcr', icon: CheckSquare },
              { label: 'Subsidy', href: '/subsidy', icon: IndianRupee },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition text-sm font-semibold text-gray-700">
                  <item.icon size={15} className="text-blue-500 flex-shrink-0" />
                  {item.label}
                  <ChevronRight size={13} className="ml-auto text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Poke Modal ── */}
      {showPokeModal && pokeTarget && (
        <PokeModal
          target={pokeTarget}
          senderName={name}
          onSend={(msg) => sendPoke(pokeTarget.enquiryId, pokeTarget.to, pokeTarget.customerName, msg)}
          onClose={() => { setShowPokeModal(false); setPokeTarget(null); }}
        />
      )}
    </div>
  );
}

// ─── Poke Modal ───────────────────────────────────────────────────────────────
function PokeModal({ target, senderName, onSend, onClose }: {
  target: { enquiryId: string; to: string; customerName: string };
  senderName: string;
  onSend: (msg: string) => void;
  onClose: () => void;
}) {
  const [msg, setMsg] = useState('');
  const quickMessages = [
    'Please update the status on this enquiry',
    'Survey approval is pending — please review',
    'Payment follow-up needed',
    'Customer is waiting for a response',
    'Action overdue — please take immediate action',
  ];
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">👉 Poke {target.to.split('@')[0]}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{target.customerName} · {target.enquiryId}</p>
            </div>
            <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Quick message:</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {quickMessages.map(qm => (
              <button key={qm} onClick={() => setMsg(qm)}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${msg === qm ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}>
                {qm}
              </button>
            ))}
          </div>
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Or write a custom message..."
            rows={2}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-400 focus:outline-none resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => msg.trim() && onSend(msg.trim())}
              disabled={!msg.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <Send size={14} /> Send Poke
            </button>
            <button onClick={onClose}
              className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse p-4 max-w-7xl mx-auto pt-16 lg:pt-6">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100" />)}
      </div>
      <div className="h-48 bg-white rounded-2xl border border-gray-100 mb-4" />
      <div className="h-40 bg-white rounded-2xl border border-gray-100" />
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
type MetricColor = 'blue' | 'indigo' | 'green' | 'emerald';
function MetricCard({ title, value, icon: Icon, color, href }: {
  title: string; value: string | number; icon: any; color: MetricColor; href?: string;
}) {
  const colors: Record<MetricColor, string> = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
  };
  return (
    <Link href={href || '#'}>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition cursor-pointer">
        <div className={`bg-gradient-to-br ${colors[color]} text-white p-2.5 rounded-xl inline-flex mb-3`}>
          <Icon size={18} />
        </div>
        <p className="text-gray-500 text-xs font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </Link>
  );
}

// ─── Pipeline Stage ───────────────────────────────────────────────────────────
type PipelineColor = 'gray' | 'blue' | 'purple' | 'indigo' | 'pink' | 'yellow' | 'orange' | 'teal' | 'cyan' | 'violet' | 'fuchsia' | 'rose' | 'green';
function PipelineStage({ name, count, icon: Icon, color, href }: {
  name: string; count: number; icon: any; color: PipelineColor; href: string;
}) {
  const colors: Record<PipelineColor, string> = {
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  };
  return (
    <Link href={href}>
      <div className={`${colors[color]} border rounded-xl p-2.5 sm:p-3 hover:shadow-sm transition cursor-pointer`}>
        <div className="flex items-center justify-between mb-1">
          <Icon size={14} className="flex-shrink-0" />
          <span className="text-lg sm:text-xl font-bold">{count}</span>
        </div>
        <p className="text-xs font-medium truncate leading-tight">{name}</p>
      </div>
    </Link>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────
type QuickActionColor = 'blue' | 'indigo' | 'green';
function QuickActionCard({ title, description, icon: Icon, href, color }: {
  title: string; description: string; icon: any; href: string; color: QuickActionColor;
}) {
  const colors: Record<QuickActionColor, string> = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-green-500 to-green-600',
  };
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition cursor-pointer">
        <div className={`bg-gradient-to-br ${colors[color]} text-white p-2.5 rounded-xl inline-flex mb-3`}>
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
