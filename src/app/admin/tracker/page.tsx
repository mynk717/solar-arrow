// src/app/admin/tracker/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Clock, AlertCircle, CheckCircle, XCircle, Users,
  Search, Download, MessageSquare, ExternalLink,
  ChevronDown, ChevronUp, X, RefreshCw,
  Zap, FileText, Building, CreditCard, Wrench,
  ClipboardCheck, BadgeDollarSign, MapPin
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StageInfo {
  name: string;
  done: boolean;
  date?: string;
  icon: React.ReactNode;
}

interface ProjectTrackerData {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  capacity: number;
  status: string;
  currentStage: string;
  daysInStage: number;
  isOverdue: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  applicationNumber?: string;
  lastFollowupDate?: string;
  nextActionDate?: string;
  // All stage dates
  surveyDate?: string;
  surveyApproved?: boolean;
  applicationNumber2?: string;      // gov portal reg
  consumerRegistrationNumber?: string;
  paymentDate?: string;
  paymentStatus?: string;
  quotationDate?: string;
  quotationAmount?: number;
  installationCompletedDate?: string;
  inspectionDate?: string;
  inspectionApproved?: boolean;
  subsidyDisbursedDate?: string;
  subsidyAmount?: number;
  subsidyStatus?: string;
  loanRequired?: boolean;
  loanStatus?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'Survey',       icon: <MapPin size={13} />,            color: 'bg-sky-500' },
  { key: 'Registration', icon: <Building size={13} />,          color: 'bg-purple-500' },
  { key: 'Payment',      icon: <CreditCard size={13} />,        color: 'bg-yellow-500' },
  { key: 'Quotation',    icon: <FileText size={13} />,          color: 'bg-orange-500' },
  { key: 'Installation', icon: <Wrench size={13} />,            color: 'bg-blue-500' },
  { key: 'Inspection',   icon: <ClipboardCheck size={13} />,    color: 'bg-indigo-500' },
  { key: 'Subsidy',      icon: <BadgeDollarSign size={13} />,   color: 'bg-green-500' },
];

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800 border-red-300',
  high:   'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low:    'bg-gray-100 text-gray-700 border-gray-300',
};

const STAGE_COLOR: Record<string, string> = {
  Survey:       'bg-sky-100 text-sky-800',
  Registration: 'bg-purple-100 text-purple-800',
  Payment:      'bg-yellow-100 text-yellow-800',
  Quotation:    'bg-orange-100 text-orange-800',
  Installation: 'bg-blue-100 text-blue-800',
  Inspection:   'bg-indigo-100 text-indigo-800',
  Subsidy:      'bg-green-100 text-green-800',
};

function safeDate(d?: string) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString('en-IN'); } catch { return null; }
}

function daysAgo(d?: string) {
  if (!d) return null;
  try {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    return diff;
  } catch { return null; }
}

// ─── Stage Pipeline Bar ───────────────────────────────────────────────────────
function StagePipeline({ project }: { project: ProjectTrackerData }) {
  const stageIndex = STAGES.findIndex(s => s.key === project.currentStage);

  return (
    <div className="flex items-center gap-0.5">
      {STAGES.map((stage, i) => {
        const done = i < stageIndex;
        const active = i === stageIndex;
        return (
          <div
            key={stage.key}
            title={stage.key}
            className={`h-2 flex-1 rounded-full transition-all ${
              done    ? 'bg-green-500' :
              active  ? (project.isBlocked ? 'bg-red-500' : project.isOverdue ? 'bg-yellow-500' : 'bg-blue-500') :
              'bg-gray-200'
            }`}
          />
        );
      })}
    </div>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${PRIORITY_COLOR[priority] ?? PRIORITY_COLOR.medium}`}>
      {priority.toUpperCase()}
    </span>
  );
}

// ─── Detail Drawer / Modal ────────────────────────────────────────────────────
function ProjectDetailModal({
  project,
  onClose,
}: {
  project: ProjectTrackerData;
  onClose: () => void;
}) {
  const stageIndex = STAGES.findIndex(s => s.key === project.currentStage);

  const stages: StageInfo[] = [
    {
      name: 'Survey',
      done: !!project.surveyDate,
      date: project.surveyDate,
      icon: <MapPin size={16} />,
    },
    {
      name: 'Registration',
      done: !!project.applicationNumber || !!project.consumerRegistrationNumber,
      date: undefined,
      icon: <Building size={16} />,
    },
    {
      name: 'Payment',
      done: !!project.paymentDate,
      date: project.paymentDate,
      icon: <CreditCard size={16} />,
    },
    {
      name: 'Quotation',
      done: !!project.quotationDate,
      date: project.quotationDate,
      icon: <FileText size={16} />,
    },
    {
      name: 'Installation',
      done: !!project.installationCompletedDate,
      date: project.installationCompletedDate,
      icon: <Wrench size={16} />,
    },
    {
      name: 'Inspection',
      done: !!project.inspectionDate,
      date: project.inspectionDate,
      icon: <ClipboardCheck size={16} />,
    },
    {
      name: 'Subsidy',
      done: !!project.subsidyDisbursedDate,
      date: project.subsidyDisbursedDate,
      icon: <BadgeDollarSign size={16} />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start px-5 py-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">{project.customerName}</h2>
              <PriorityBadge priority={project.priority} />
            </div>
            <p className="text-sm text-gray-500">
              {project.id} · {project.capacity} kW · {project.area}
            </p>
            {project.applicationNumber && (
              <p className="text-xs font-mono text-gray-500 mt-0.5">{project.applicationNumber}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Pipeline Visual */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Project Pipeline</p>
            <div className="flex gap-1 mb-3">
              {STAGES.map((s, i) => (
                <div key={s.key} className="flex-1 text-center">
                  <div className={`h-2 rounded-full ${
                    i < stageIndex ? 'bg-green-500' :
                    i === stageIndex ? (project.isBlocked ? 'bg-red-500' : 'bg-blue-500') :
                    'bg-gray-200'
                  }`} />
                  <p className="text-[9px] text-gray-500 mt-1 hidden sm:block">{s.key}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked Alert */}
          {project.isBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">Blocked</p>
                <p className="text-xs text-red-700">{project.blockedReason || 'No reason provided'}</p>
              </div>
            </div>
          )}

          {/* Stage Checklist */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Stage Checklist</p>
            <div className="space-y-2">
              {stages.map((stage, i) => {
                const isActive = stage.name === project.currentStage;
                return (
                  <div
                    key={stage.name}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      stage.done ? 'bg-green-50 border-green-200' :
                      isActive   ? 'bg-blue-50 border-blue-300' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${
                      stage.done ? 'bg-green-500 text-white' :
                      isActive   ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {stage.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${
                        stage.done ? 'text-green-800' :
                        isActive   ? 'text-blue-800' :
                        'text-gray-500'
                      }`}>
                        {stage.name}
                        {isActive && !stage.done && (
                          <span className="ml-2 text-xs font-normal text-blue-600">
                            · In Progress ({project.daysInStage}d)
                          </span>
                        )}
                      </p>
                      {safeDate(stage.date) && (
                        <p className="text-xs text-gray-500">{safeDate(stage.date)}</p>
                      )}
                      {/* Stage-specific details */}
                      {stage.name === 'Survey' && project.surveyApproved && (
                        <p className="text-xs text-green-600">✓ Approved</p>
                      )}
                      {stage.name === 'Registration' && project.consumerRegistrationNumber && (
                        <p className="text-xs font-mono text-gray-500">{project.consumerRegistrationNumber}</p>
                      )}
                      {stage.name === 'Payment' && project.paymentStatus && (
                        <p className="text-xs text-gray-500">Status: {project.paymentStatus}</p>
                      )}
                      {stage.name === 'Quotation' && project.quotationAmount && (
                        <p className="text-xs text-gray-500">
                          ₹{project.quotationAmount.toLocaleString('en-IN')}
                        </p>
                      )}
                      {stage.name === 'Inspection' && project.inspectionApproved && (
                        <p className="text-xs text-green-600">✓ Approved</p>
                      )}
                      {stage.name === 'Subsidy' && project.subsidyAmount && (
                        <p className="text-xs text-gray-500">
                          ₹{project.subsidyAmount.toLocaleString('en-IN')}
                          {project.subsidyStatus ? ` · ${project.subsidyStatus}` : ''}
                        </p>
                      )}
                    </div>
                    {stage.done && (
                      <CheckCircle size={16} className="text-green-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Follow-up Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Last Follow-up</p>
              <p className="text-sm font-semibold text-gray-900">
                {safeDate(project.lastFollowupDate) ?? '—'}
              </p>
              {project.lastFollowupDate && (
                <p className="text-xs text-gray-500">{daysAgo(project.lastFollowupDate)}d ago</p>
              )}
            </div>
            <div className={`rounded-xl p-3 border ${
              project.nextActionDate && new Date(project.nextActionDate) < new Date()
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-xs text-gray-500 mb-1">Next Action</p>
              <p className={`text-sm font-semibold ${
                project.nextActionDate && new Date(project.nextActionDate) < new Date()
                  ? 'text-red-700'
                  : 'text-gray-900'
              }`}>
                {safeDate(project.nextActionDate) ?? '—'}
              </p>
            </div>
          </div>

          {/* Loan Info */}
          {project.loanRequired && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-purple-800 mb-1">Loan Required</p>
              <p className="text-sm text-purple-700">Status: {project.loanStatus ?? 'Pending'}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 pb-6 pt-2 flex gap-3 border-t border-gray-100">
          <a
            href={`/enquiries/${project.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm"
          >
            <ExternalLink size={16} />
            View Enquiry
          </a>
          <button
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-900 font-bold py-3 rounded-xl text-sm hover:bg-gray-50"
            onClick={onClose}
          >
            <MessageSquare size={16} />
            Add Follow-up
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Project Row (desktop table) ──────────────────────────────────────────────
function ProjectRow({ project, onClick }: { project: ProjectTrackerData; onClick: () => void }) {
  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={onClick}>
      <td className="px-5 py-4">
        <p className="font-semibold text-gray-900 text-sm">{project.customerName}</p>
        <p className="text-xs text-gray-500">{project.capacity} kW · {project.area}</p>
        <p className="text-xs font-mono text-gray-400">{project.applicationNumber ?? project.id}</p>
      </td>
      <td className="px-5 py-4">
        <div className="w-32">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STAGE_COLOR[project.currentStage] ?? 'bg-gray-100 text-gray-700'}`}>
            {project.currentStage}
          </span>
          <div className="mt-2">
            <StagePipeline project={project} />
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        {project.isBlocked ? (
          <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full w-fit">
            <XCircle size={12} /> Blocked
          </span>
        ) : project.isOverdue ? (
          <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full w-fit">
            <AlertCircle size={12} /> Overdue
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
            <CheckCircle size={12} /> On Track
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        <span className={`text-sm font-bold ${project.isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
          {project.daysInStage}d
        </span>
      </td>
      <td className="px-5 py-4">
        <PriorityBadge priority={project.priority} />
      </td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {safeDate(project.lastFollowupDate) ?? <span className="text-gray-400">—</span>}
      </td>
      <td className="px-5 py-4">
        {project.nextActionDate ? (
          <span className={`text-sm font-semibold ${
            new Date(project.nextActionDate) < new Date() ? 'text-red-600' : 'text-gray-700'
          }`}>
            {safeDate(project.nextActionDate)}
          </span>
        ) : <span className="text-gray-400 text-sm">—</span>}
      </td>
      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
        <div className="flex gap-2">
          <a href={`/enquiries/${project.id}`} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50">
            <ExternalLink size={16} />
          </a>
          <button className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50">
            <MessageSquare size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Mobile Project Card ──────────────────────────────────────────────────────
function ProjectCard({ project, onClick }: { project: ProjectTrackerData; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 cursor-pointer active:bg-gray-50"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-gray-900">{project.customerName}</p>
          <p className="text-xs text-gray-500">{project.capacity} kW · {project.area}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <PriorityBadge priority={project.priority} />
          {project.isBlocked ? (
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Blocked</span>
          ) : project.isOverdue ? (
            <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">Overdue</span>
          ) : null}
        </div>
      </div>

      {/* Pipeline */}
      <StagePipeline project={project} />
      <div className="flex justify-between mt-1 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STAGE_COLOR[project.currentStage] ?? 'bg-gray-100 text-gray-700'}`}>
          {project.currentStage}
        </span>
        <span className={`text-xs font-semibold ${project.isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          {project.daysInStage}d in stage
        </span>
      </div>

      {/* Follow-up row */}
      <div className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
        <span>Last: {safeDate(project.lastFollowupDate) ?? '—'}</span>
        <span className={project.nextActionDate && new Date(project.nextActionDate) < new Date() ? 'text-red-600 font-semibold' : ''}>
          Next: {safeDate(project.nextActionDate) ?? '—'}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProjectTracker() {
  const { data: session } = useSession();

  const [projects, setProjects] = useState<ProjectTrackerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectTrackerData | null>(null);

  useEffect(() => { fetchProjectData(); }, []);

  const fetchProjectData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/project-tracker');
      const data = await res.json();
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } catch (err) {
      console.error('Failed to fetch project data:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.customerName.toLowerCase().includes(q) ||
      (p.applicationNumber ?? '').toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.area ?? '').toLowerCase().includes(q);
    const matchStage    = filterStage === 'all' || p.currentStage === filterStage;
    const matchPriority = filterPriority === 'all' || p.priority === filterPriority;
    const matchStatus   =
      filterStatus === 'all' ||
      (filterStatus === 'blocked'  && p.isBlocked) ||
      (filterStatus === 'overdue'  && p.isOverdue && !p.isBlocked) ||
      (filterStatus === 'on-track' && !p.isBlocked && !p.isOverdue);
    return matchSearch && matchStage && matchPriority && matchStatus;
  });

  const metrics = {
    total:    projects.length,
    onTrack:  projects.filter(p => !p.isOverdue && !p.isBlocked).length,
    overdue:  projects.filter(p => p.isOverdue && !p.isBlocked).length,
    blocked:  projects.filter(p => p.isBlocked).length,
  };

  const stageDistrib = STAGES.map(s => ({
    ...s,
    count: projects.filter(p => p.currentStage === s.key).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Clock className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Loading project tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 pt-5 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Tracker</h1>
            <p className="text-sm text-gray-500 mt-0.5">Enquiry → Survey → Registration → Payment → Quotation → Installation → Inspection → Subsidy</p>
          </div>
          <button
            onClick={() => fetchProjectData(true)}
            className="flex items-center gap-1.5 text-blue-600 text-sm font-medium px-3 py-2 border-2 border-blue-200 rounded-xl hover:bg-blue-50"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-4 space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Projects', value: metrics.total,   color: 'border-blue-500',  text: 'text-blue-700',  icon: <Users size={18} className="text-blue-500" /> },
            { label: 'On Track',       value: metrics.onTrack, color: 'border-green-500', text: 'text-green-700', icon: <CheckCircle size={18} className="text-green-500" /> },
            { label: 'Overdue',        value: metrics.overdue, color: 'border-yellow-500',text: 'text-yellow-700',icon: <Clock size={18} className="text-yellow-500" /> },
            { label: 'Blocked',        value: metrics.blocked, color: 'border-red-500',   text: 'text-red-700',   icon: <XCircle size={18} className="text-red-500" /> },
          ].map(m => (
            <div key={m.label} className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${m.color}`}>
              <div className="flex items-center justify-between mb-1">{m.icon}</div>
              <p className={`text-2xl font-bold ${m.text}`}>{m.value}</p>
              <p className="text-xs font-semibold text-gray-600">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Stage Distribution Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Stage Distribution</p>
          <div className="grid grid-cols-7 gap-1">
            {stageDistrib.map(s => (
              <div key={s.key} className="text-center">
                <div className={`h-8 ${s.color} rounded-lg flex items-end justify-center pb-1 text-white text-xs font-bold`}
                  style={{ opacity: s.count === 0 ? 0.25 : 1 }}>
                  {s.count}
                </div>
                <p className="text-[9px] text-gray-500 mt-1 leading-tight">{s.key}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search name, app number, area..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:border-blue-500 focus:outline-none">
              <option value="all">All Stages</option>
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:border-blue-500 focus:outline-none">
              <option value="all">All Status</option>
              <option value="on-track">On Track</option>
              <option value="overdue">Overdue</option>
              <option value="blocked">Blocked</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:border-blue-500 focus:outline-none col-span-2 sm:col-span-1">
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center text-sm text-gray-600 px-1">
          <span>Showing <strong>{filtered.length}</strong> of {metrics.total} projects</span>
          <button className="flex items-center gap-1.5 text-gray-600 font-medium hover:text-gray-900">
            <Download size={15} /> Export
          </button>
        </div>

        {/* Mobile Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No projects match filters</p>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="lg:hidden space-y-3">
              {filtered.map(p => (
                <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    {['Project', 'Stage', 'Status', 'Days', 'Priority', 'Last Follow-up', 'Next Action', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(p => (
                    <ProjectRow key={p.id} project={p} onClick={() => setSelectedProject(p)} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
