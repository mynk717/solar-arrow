// src/app/dashboard/page.tsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, ClipboardCheck, ClipboardList, Users,
  Wrench, FileText, CreditCard, Clock, CheckCircle,
  XCircle, MapPin, Calendar, Edit, Loader2, TrendingUp,
  AlertCircle, Zap
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

type Role = 'owner' | 'admin' | 'sales' | 'surveyor' | 'installation' | 'accounts';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role as Role;

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<any[]>([]);
const [followups, setFollowups] = useState<any[]>([]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetches: Promise<any>[] = [fetch('/api/enquiries').then(r => r.json())];

    fetches.push(
      fetch(`/api/enquiries/${session.user.email}/timeline`).then(r => r.json()),
      fetch('/api/followups').then(r => r.json())
    );

    // surveys come from enquiries — filter locally, no separate API needed


    Promise.all(fetches)
    .then(([enqData, timelineData, followupsData]) => {  // ✅ Destructure ALL 3
      const enqs = Array.isArray(enqData) ? enqData : [];
      setEnquiries(enqs);
      
      // ✅ Set timeline and followups
      setTimeline(timelineData?.timeline || []);
      setFollowups(Array.isArray(followupsData) ? followupsData : []);
      
      // derive surveys from enquiries
      const surveyRows = enqs.filter((e: any) => e.surveyedBy || e.surveyDate);
      setSurveys(surveyRows);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  

    // Poll every 60s so tasks auto-disappear when status changes
    const interval = setInterval(() => {
      fetch('/api/enquiries').then(r => r.json()).then(d => setEnquiries(Array.isArray(d) ? d : []));
    }, 60_000);
    return () => clearInterval(interval);
  }, [status, role, session?.user?.email]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  const email = session?.user?.email || '';
  const name = session?.user?.name?.split(' ')[0] || 'there';

  // ── Derived data per role ──────────────────────────────────────────────────

  // SURVEYOR: tasks assigned to them still in survey-scheduled
  const myPendingSurveys = enquiries.filter(
    e => e.surveyedBy === email && e.status === 'survey-scheduled'
  );

  // SALES: enquiries assigned to them
  const myEnquiries = enquiries.filter(e => e.leadAssignedTo === email);
  const myActiveEnquiries = myEnquiries.filter(e =>
    ['new', 'active', 'survey-pending'].includes(e.status)
  );
  const myFollowups = myEnquiries.filter(e => {
    if (!e.nextActionDate) return false;
    const d = new Date(e.nextActionDate);
    const today = new Date();
    return d <= today;
  });

  // INSTALLATION: jobs assigned to them
  const myInstallJobs = enquiries.filter(e =>
    e.installationSupervisor === email &&
    ['survey-completed', 'payment-received'].includes(e.status)
  );
  const myActiveJobs = myInstallJobs.filter(e => e.status !== 'installation-completed');

  // ACCOUNTS: payment pending records
  const paymentPending = enquiries.filter(e => e.paymentStatus === 'pending');
  const paymentVerified = enquiries.filter(e => e.paymentStatus === 'verified');

  // ADMIN/OWNER: full stats
  const adminStats = {
    totalEnquiries: enquiries.length,
    active: enquiries.filter(e => ['new', 'active'].includes(e.status)).length,
    surveyScheduled: enquiries.filter(e => e.status === 'survey-scheduled').length,
    surveyCompleted: enquiries.filter(e => e.status === 'survey-completed').length,
    paymentReceived: enquiries.filter(e => e.status === 'payment-received').length,
    installCompleted: enquiries.filter(e => e.status === 'installation-completed').length,
    pendingApprovals: surveys.filter(s => !s.surveyApproved && !(s.surveyNotes || '').toLowerCase().includes('rejected')).length,
    blocked: enquiries.filter(e => e.isBlocked === true || e.isBlocked === 'TRUE').length,
  };

  // ✅ My pending tasks (FOLLOWUPS assigned to me)
const myPendingFollowups = followups.filter((f: any) => 
  f.userId === email && 
  f.status === 'pending' && 
  new Date(f.nextFollowupDate || '1970-01-01') <= new Date()
);

// ✅ My recent activity (ACTIVITY_LOG where I acted)
const myRecentActivity = timeline.filter((a: any) => 
  a.userId === email && 
  new Date(a.timestamp) > new Date(Date.now() - 7*24*60*60*1000)
);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-5">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {name} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5 capitalize">{role} · {email}</p>
      </div>

      <div className="p-4 space-y-6">

        {/* ════════════════════════════════════════════
            SURVEYOR DASHBOARD
        ════════════════════════════════════════════ */}
        {role === 'surveyor' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Pending Visits" value={myPendingSurveys.length} color="orange" icon={Clock} />
              <StatBox label="My Surveys" value={surveys.filter(s => s.surveyorEmail === email).length} color="blue" icon={ClipboardCheck} />
            </div>

           {/* Task List */}
<Section title={`My Tasks (${myPendingFollowups.length})`} icon={Clock} iconColor="text-orange-500">
  {myPendingFollowups.length === 0 ? (
    <EmptyState icon={CheckCircle} message="No pending tasks!" />
  ) : (
    myPendingFollowups.slice(0, 5).map((task: any) => (
      <TaskCard
        key={task.followupId}
        id={task.enquiryId}
        title={enquiries.find(e => e.id === task.enquiryId)?.customerName || 'Customer'}
        subtitle={`${task.followupType} • ${task.followupNotes?.slice(0, 50)}...`}
        date={task.followupDate}
        onAction={() => router.push(`/enquiries/${task.enquiryId}`)}
        actionLabel="View Enquiry"
      />
    ))
  )}
</Section>

{/* Recent Activity */}
<Section title={`Recent Activity (${myRecentActivity.length})`} icon={TrendingUp} iconColor="text-blue-500">
  {myRecentActivity.slice(0, 3).map((activity: any, i: number) => (
    <div key={i} className="p-3 bg-gray-50 rounded-xl text-sm">
      <div className="font-medium">{activity.action}</div>
      <div className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</div>
    </div>
  ))}
</Section>



            <QuickLink label="View All Surveys" href="/survey" icon={ClipboardCheck} />
          </>
        )}

        {/* ════════════════════════════════════════════
            SALES DASHBOARD
        ════════════════════════════════════════════ */}
        {role === 'sales' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="My Enquiries" value={myEnquiries.length} color="blue" icon={ClipboardList} />
              <StatBox label="Active" value={myActiveEnquiries.length} color="green" icon={TrendingUp} />
              <StatBox label="Follow-ups Due" value={myFollowups.length} color="red" icon={AlertCircle} />
              <StatBox label="Total Pipeline" value={enquiries.length} color="purple" icon={Users} />
            </div>

            <Section title="Follow-ups Due Today" icon={AlertCircle} iconColor="text-red-500">
              {myFollowups.length === 0 ? (
                <EmptyState icon={CheckCircle} message="No follow-ups due. Good work!" />
              ) : (
                myFollowups.slice(0, 5).map(enq => (
                  <TaskCard
                    key={enq.id}
                    id={enq.id}
                    title={enq.customerName}
                    subtitle={`${enq.area} · ${enq.status}`}
                    date={enq.nextActionDate}
                    onAction={() => router.push(`/enquiries/${enq.id}`)}
                    actionLabel="View Enquiry"
                    actionColor="bg-green-600"
                  />
                ))
              )}
            </Section>

            <QuickLink label="View All Enquiries" href="/enquiries" icon={ClipboardList} />
          </>
        )}

        {/* ════════════════════════════════════════════
            INSTALLATION DASHBOARD
        ════════════════════════════════════════════ */}
        {role === 'installation' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Active Jobs" value={myActiveJobs.length} color="blue" icon={Wrench} />
              <StatBox label="Total Assigned" value={myInstallJobs.length} color="green" icon={Zap} />
            </div>

            <Section title="Pending Installation Jobs" icon={Wrench} iconColor="text-blue-500">
              {myActiveJobs.length === 0 ? (
                <EmptyState icon={CheckCircle} message="No active installation jobs." />
              ) : (
                myActiveJobs.map(job => (
                  <TaskCard
                    key={job.id}
                    id={job.id}
                    title={job.customerName}
                    subtitle={`${job.area} · ${job.capacity}kW · ${job.status}`}
                    date={job.installationScheduledDate}
                    onAction={() => router.push(`/installation/${job.id}`)}
                    actionLabel="View Job"
                    actionColor="bg-indigo-600"
                  />
                ))
              )}
            </Section>

            <QuickLink label="View All Jobs" href="/installation" icon={Wrench} />
          </>
        )}

        {/* ════════════════════════════════════════════
            ACCOUNTS DASHBOARD
        ════════════════════════════════════════════ */}
        {role === 'accounts' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Pending Payments" value={paymentPending.length} color="red" icon={CreditCard} />
              <StatBox label="Verified" value={paymentVerified.length} color="green" icon={CheckCircle} />
            </div>

            <Section title="Pending Payment Verification" icon={CreditCard} iconColor="text-red-500">
              {paymentPending.length === 0 ? (
                <EmptyState icon={CheckCircle} message="All payments verified!" />
              ) : (
                paymentPending.slice(0, 5).map(enq => (
                  <TaskCard
                    key={enq.id}
                    id={enq.id}
                    title={enq.customerName}
                    subtitle={`₹${enq.initialPayment?.toLocaleString('en-IN') || '—'} · ${enq.paymentMethod || '—'}`}
                    date={enq.paymentDate}
                    onAction={() => router.push(`/payment/${enq.id}`)}
                    actionLabel="Verify Payment"
                    actionColor="bg-emerald-600"
                  />
                ))
              )}
            </Section>

            <QuickLink label="View All Payments" href="/payment" icon={CreditCard} />
          </>
        )}

        {/* ════════════════════════════════════════════
            ADMIN / OWNER DASHBOARD
        ════════════════════════════════════════════ */}
        {(role === 'admin' || role === 'owner') && (
          <>
            {/* Full Pipeline Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Total Enquiries" value={adminStats.totalEnquiries} color="blue" icon={ClipboardList} />
              <StatBox label="Active" value={adminStats.active} color="green" icon={TrendingUp} />
              <StatBox label="Survey Scheduled" value={adminStats.surveyScheduled} color="orange" icon={Calendar} />
              <StatBox label="Survey Completed" value={adminStats.surveyCompleted} color="teal" icon={ClipboardCheck} />
              <StatBox label="Payment Received" value={adminStats.paymentReceived} color="purple" icon={CreditCard} />
              <StatBox label="Installed" value={adminStats.installCompleted} color="green" icon={Wrench} />
              <StatBox label="Pending Approvals" value={adminStats.pendingApprovals} color="yellow" icon={Clock} />
              <StatBox label="Blocked" value={adminStats.blocked} color="red" icon={AlertCircle} />
            </div>

            {/* Pending Survey Approvals */}
            <Section title="Surveys Awaiting Approval" icon={Clock} iconColor="text-yellow-500">
              {surveys.filter(s => !s.surveyApproved && !(s.surveyNotes || '').toLowerCase().includes('rejected')).length === 0 ? (
                <EmptyState icon={CheckCircle} message="No surveys pending approval." />
              ) : (
                surveys
                  .filter(s => !s.surveyApproved && !(s.surveyNotes || '').toLowerCase().includes('rejected'))
                  .slice(0, 5)
                  .map(s => (
                    <TaskCard
                      key={s.enquiryId}
                      id={s.enquiryId}
                      title={`Survey by ${s.surveyorName}`}
                      subtitle={`${s.projectType} · ${s.installationSurface} · ${s.sanctionedLoad}kW`}
                      date={s.surveyDate}
                      onAction={() => router.push(`/survey/${s.enquiryId}`)}
                      actionLabel="Review"
                      actionColor="bg-yellow-600"
                    />
                  ))
              )}
            </Section>

            {/* Quick Nav */}
            <div className="grid grid-cols-2 gap-3">
              <QuickLink label="Enquiries" href="/enquiries" icon={ClipboardList} />
              <QuickLink label="Surveys" href="/survey" icon={ClipboardCheck} />
              <QuickLink label="Installation" href="/installation" icon={Wrench} />
              <QuickLink label="Payments" href="/payment" icon={CreditCard} />
              {role === 'owner' && <QuickLink label="Users" href="/users" icon={Users} />}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ── Shared UI Components ───────────────────────────────────────────────────────

const colorMap: Record<string, string> = {
  blue:   'bg-blue-50 border-blue-200 text-blue-800',
  green:  'bg-green-50 border-green-200 text-green-800',
  orange: 'bg-orange-50 border-orange-200 text-orange-800',
  red:    'bg-red-50 border-red-200 text-red-800',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
  teal:   'bg-teal-50 border-teal-200 text-teal-800',
};

function StatBox({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
  return (
    <div className={`${colorMap[color]} border-2 rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} />
        <p className="text-xs font-bold opacity-80">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, iconColor, children }: { title: string; icon: any; iconColor: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
        <Icon size={18} className={iconColor} />
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function TaskCard({ id, title, subtitle, date, onAction, actionLabel, actionColor = 'bg-blue-600' }: {
  id: string; title: string; subtitle: string; date?: string;
  onAction: () => void; actionLabel: string; actionColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-mono font-bold text-blue-600">{id}</span>
      </div>
      <p className="font-bold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
        <MapPin size={12} /> {subtitle}
      </p>
      {date && (
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
          <Calendar size={12} />
          {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}
      <button
        onClick={onAction}
        className={`mt-3 w-full ${actionColor} text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition`}
      >
        <Edit size={14} />
        {actionLabel}
      </button>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
      <Icon className="mx-auto h-10 w-10 text-gray-300 mb-2" />
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}

function QuickLink({ label, href, icon: Icon }: { label: string; href: string; icon: any }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-3 w-full font-bold text-gray-800 active:scale-95 transition hover:border-blue-300"
    >
      <Icon size={20} className="text-blue-600" />
      {label}
    </button>
  );
}
