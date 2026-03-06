'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart2, Users, MapPin, Clock, FileCheck,
  TrendingUp, Activity, Download, RefreshCcw, Filter,
} from 'lucide-react';
import { exportCSV, exportPDF } from '@/lib/reportExport';

// ── Report definitions ────────────────────────────────────────────────────────

const REPORTS = [
  { id: 'monthly',    label: 'Monthly Review',     icon: TrendingUp, desc: 'Month-wise enquiry & installation volume' },
  { id: 'pipeline',   label: 'Pipeline Funnel',     icon: Activity,   desc: 'Stage-wise enquiry distribution & bottlenecks' },
  { id: 'team',       label: 'Team Performance',    icon: Users,      desc: 'Installation team speed & productivity' },
  { id: 'aging',      label: 'Liaison Aging',       icon: Clock,      desc: 'Customers waiting too long in liaison' },
  { id: 'area',       label: 'Area Analysis',       icon: MapPin,     desc: 'Business concentration by geography' },
  { id: 'inspection', label: 'Inspection Health',   icon: BarChart2,  desc: 'Inspection pass rate & lag analysis' },
  { id: 'compliance', label: 'Document Compliance', icon: FileCheck,  desc: 'CSPDCL document completion tracker' },
];

const DATE_FIELDS = [
  { value: 'createdAt',                 label: 'Enquiry Created Date' },
  { value: 'installationCompletedDate', label: 'Installation Completed Date' },
];

const STUCK_PRESETS = [7, 15, 30];

const KPI_COLORS = ['blue', 'green', 'yellow', 'red', 'purple'];

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, color = 'blue' }: { label: string; value: any; color?: string }) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    green:  'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red:    'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <div className={`rounded-xl border-2 px-5 py-4 ${colors[color] || colors.blue}`}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold mt-1 opacity-80 uppercase tracking-wide">
        {label.replace(/([A-Z])/g, ' $1').trim()}
      </p>
    </div>
  );
}

// ── Data Table ────────────────────────────────────────────────────────────────

function DataTable({ rows }: { rows: Record<string, any>[] }) {
  if (!rows?.length) {
    return (
      <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
        <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium text-slate-500">No data for selected filters</p>
        <p className="text-sm text-slate-400 mt-1">Try adjusting your date range or filters</p>
      </div>
    );
  }

  const headers = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-blue-600 text-white">
            {headers.map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left font-semibold whitespace-nowrap text-xs uppercase tracking-wide"
              >
                {h.replace(/([A-Z])/g, ' $1').trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              {headers.map(h => {
                const val = row[h];
                const isFlag = (h === 'stuck' || h === 'blocked') && val === true;
                return (
                  <td
                    key={h}
                    className={`px-4 py-2.5 whitespace-nowrap ${
                      isFlag ? 'text-red-600 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {typeof val === 'boolean' ? (val ? '⚠️ Yes' : 'No') : String(val ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
        {rows.length} records
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeReport, setActiveReport] = useState('pipeline');
  const [loading, setLoading]           = useState(false);
  const [data, setData]                 = useState<any>(null);
  const [sidebarOpen, setSidebarOpen]   = useState(true);

  // Filters
  const [from, setFrom]           = useState('');
  const [to, setTo]               = useState('');
  const [dateField, setDateField] = useState('createdAt');
  const [area, setArea]           = useState('');
  const [team, setTeam]           = useState('');
  const [stuckDays, setStuckDays] = useState(15);
  const [docStatus, setDocStatus] = useState('');

  // Auth guard — owner + admin only
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (!['owner', 'admin'].includes(role)) router.push('/dashboard');
    }
  }, [status, session, router]);

  const fetchReport = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: activeReport, dateField });
      if (from)              params.set('from', from);
      if (to)                params.set('to', to);
      if (area)              params.set('area', area);
      if (team)              params.set('team', team);
      if (stuckDays)         params.set('stuckDays', String(stuckDays));
      if (docStatus)         params.set('status', docStatus);
      if (force)             params.set('refresh', 'true');

      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch report');
      }
      setData(await res.json());
    } catch (e: any) {
      alert('❌ ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [activeReport, from, to, dateField, area, team, stuckDays, docStatus]);

  // Auto-fetch when switching report type
  useEffect(() => { fetchReport(); }, [activeReport]); // eslint-disable-line

  const reportMeta = REPORTS.find(r => r.id === activeReport)!;

  const handleCSV = () => {
    if (!data?.rows?.length) return;
    exportCSV(activeReport, data.rows);
  };

  const handlePDF = () => {
    if (!data?.rows?.length) return;
    exportPDF(
      reportMeta.label,
      `Date field: ${dateField}${area ? ' · Area: ' + area : ''}${from ? ' · From: ' + from : ''}${to ? ' · To: ' + to : ''}`,
      data.kpis || {},
      data.rows,
      activeReport
    );
  };

  const handleClearFilters = () => {
    setFrom('');
    setTo('');
    setArea('');
    setTeam('');
    setStuckDays(15);
    setDocStatus('');
    setDateField('createdAt');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-200 bg-white border-r border-slate-200 flex flex-col flex-shrink-0`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between min-h-[57px]">
          {sidebarOpen && (
            <span className="font-bold text-slate-900 text-sm">📊 Reports</span>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="text-slate-400 hover:text-slate-700 ml-auto"
            title="Toggle sidebar"
          >
            <Filter size={18} />
          </button>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {REPORTS.map(r => {
            const Icon = r.icon;
            const active = activeReport === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveReport(r.id)}
                title={r.label}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{r.label}</span>}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-slate-200 text-xs text-slate-400">
            Admin & Owner only
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{reportMeta.label}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{reportMeta.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReport(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
            >
              <RefreshCcw size={15} />
              Refresh
            </button>
            <button
              onClick={handleCSV}
              disabled={!data?.rows?.length}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={15} />
              CSV
            </button>
            <button
              onClick={handlePDF}
              disabled={!data?.rows?.length}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={15} />
              PDF
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-end gap-3 flex-shrink-0">

          {/* Date field selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Date Field</label>
            <select
              value={dateField}
              onChange={e => setDateField(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DATE_FIELDS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* From date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* To date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Area</label>
            <input
              type="text"
              placeholder="e.g. Jagdalpur"
              value={area}
              onChange={e => setArea(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 w-36 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Team — only for team performance report */}
          {activeReport === 'team' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Team</label>
              <input
                type="text"
                placeholder="Team name"
                value={team}
                onChange={e => setTeam(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 w-36 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Stuck days — for aging + compliance */}
          {(activeReport === 'aging' || activeReport === 'compliance') && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Stuck Threshold
              </label>
              <div className="flex items-center gap-1">
                {STUCK_PRESETS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setStuckDays(p)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      stuckDays === p
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {p}d
                  </button>
                ))}
                <input
                  type="number"
                  value={stuckDays}
                  min={1}
                  onChange={e => setStuckDays(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Doc status — for compliance report */}
          {activeReport === 'compliance' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Doc Status</label>
              <select
                value={docStatus}
                onChange={e => setDocStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="complete">Fully Complete</option>
                <option value="partial">Partial</option>
                <option value="none">None Submitted</option>
              </select>
            </div>
          )}

          {/* Apply + Clear */}
          <div className="flex gap-2">
            <button
              onClick={() => fetchReport()}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Generating report...</p>
                <p className="text-slate-400 text-sm mt-1">Reading from Google Sheets</p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">

              {/* KPI row */}
              {data.kpis && Object.keys(data.kpis).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                  {Object.entries(data.kpis).map(([label, value], i) => (
                    <KpiCard
                      key={label}
                      label={label}
                      value={value as any}
                      color={KPI_COLORS[i % KPI_COLORS.length]}
                    />
                  ))}
                </div>
              )}

              {/* Data table */}
              <DataTable rows={data.rows || []} />

              {/* Meta info */}
              <p className="text-xs text-slate-400 text-right">
                {data.rows?.length || 0} records ·{' '}
                Date field: {dateField}
                {from ? ` · From: ${from}` : ''}
                {to ? ` → ${to}` : ''}
                {area ? ` · Area: ${area}` : ''}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <p>Select a report from the sidebar to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
