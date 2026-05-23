// src/app/docs/analytics/reports/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports & Analytics · Solar Arrow Docs',
  description:
    'Learn how to use Solar Arrow reports to track team performance and project conversion rates.',
};

const DOCS_NAV = [
  { group: 'Overview', items: [
    { label: 'Welcome & Overview', href: '/docs', id: '01' },
    { label: 'Getting Started', href: '/docs/getting-started', id: '02' },
    { label: 'Login & Accounts', href: '/docs/login-accounts', id: '03' },
  ]},
  { group: 'Pipelines', items: [
    { label: 'Leads', href: '/docs/pipeline/leads', id: '04' },
    { label: 'Enquiries', href: '/docs/pipeline/enquiries', id: '05' },
    { label: 'Survey', href: '/docs/pipeline/survey', id: '06' },
    { label: 'Quotation', href: '/docs/pipeline/quotation', id: '07' },
    { label: 'Registration', href: '/docs/pipeline/registration', id: '08' },
    { label: 'BOM & Dispatch', href: '/docs/pipeline/bom-dispatch', id: '09' },
    { label: 'Liaison', href: '/docs/pipeline/liaison', id: '10' },
    { label: 'Installation', href: '/docs/pipeline/installation', id: '11' },
    { label: 'Payments', href: '/docs/pipeline/payments', id: '12' },
    { label: 'Subsidy', href: '/docs/pipeline/subsidy', id: '13' },
  ]},
  { group: 'Roles', items: [
    { label: 'Owner & Admin', href: '/docs/roles/owner-admin', id: '14' },
    { label: 'Sales', href: '/docs/roles/sales', id: '15' },
    { label: 'Surveyor', href: '/docs/roles/survey', id: '16' },
    { label: 'Installation', href: '/docs/roles/installation', id: '17' },
    { label: 'Accounts', href: '/docs/roles/accounts', id: '18' },
  ]},
  { group: 'Integrations', items: [
    { label: 'Google Sheets', href: '/docs/integrations/google-sheets', id: '19' },
    { label: 'Redis & Telegram', href: '/docs/integrations/redis-telegram', id: '20' },
    { label: 'PWA Mobile', href: '/docs/integrations/pwa-mobile', id: '21' },
    { label: 'Google OAuth', href: '/docs/integrations/google-oauth', id: '22' },
  ]},
  { group: 'Analytics', items: [
    { label: 'Reports', href: '/docs/analytics/reports', id: '23', active: true },
  ]},
  { group: 'Settings', items: [
    { label: 'Organization & Branches', href: '/docs/settings/organization-branches', id: '24' },
    { label: 'Users & Permissions', href: '/docs/settings/users-permissions', id: '25' },
  ]},
  { group: 'Pricing', items: [
    { label: 'Pricing Demo', href: '/docs/pricing-demo', id: '26' },
  ]},
  { group: 'FAQ', items: [
    { label: 'FAQ', href: '/docs/faq', id: '27' },
  ]},
];

export default function AnalyticsReportsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed,#f5f5f7)] text-slate-900">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[conic-gradient(from_210deg,#ffedd5,#fed7aa,#fb923c,#f97316,#ffedd5)] shadow-md shadow-orange-500/40">
            <span className="text-xs font-extrabold text-white">SA</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight">Solar Arrow</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">User guide</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-600">Reports</span>
          <span>v1.0 · 27 pages</span>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 md:grid-cols-[260px,minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-900/60 bg-slate-950 px-3 py-4 text-slate-100 md:flex md:flex-col md:gap-4 overflow-y-auto max-h-[calc(100vh-56px)]">
          {DOCS_NAV.map((group) => (
            <div key={group.group}>
              <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">{group.group}</div>
              <nav className="flex flex-col gap-1 text-[13px]">
                {group.items.map((item) => (
                  <a key={item.href} href={item.href} className={`flex items-center justify-between rounded-md px-2 py-1.5 transition-all ${item.active ? 'bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 text-slate-50 shadow-sm shadow-black/40' : 'text-slate-200 hover:bg-slate-800/70'}`}>
                    <span>{item.label}</span>
                    <small className={`text-[10px] uppercase tracking-[0.14em] ${item.active ? 'text-slate-300' : 'text-slate-500'}`}>{item.id}</small>
                  </a>
                ))}
              </nav>
              <div className="my-3 h-px bg-gradient-to-r from-slate-700/10 via-slate-500/40 to-slate-700/10" />
            </div>
          ))}
        </aside>

        <main className="max-w-5xl px-4 py-6 md:px-6">
          <section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Data &amp; reporting</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              Transform your pipeline data into actionable insights. Solar Arrow provides built-in charts and tables to monitor your business health.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Owners, Admins</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 5–7 minutes</span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Conversion Reports</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">sales</span>
              </header>
              <p className="text-[13px] text-slate-600">Track how effectively your team moves leads through the funnel.</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">Lead to Enquiry:</strong> Measures initial qualification success.</li>
                <li><strong className="text-slate-900">Enquiry to Survey:</strong> Tracks technical team responsiveness.</li>
                <li><strong className="text-slate-900">Survey to Quote:</strong> Measures sales speed.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Operations Reports</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">execution</span>
              </header>
              <p className="text-[13px] text-slate-600">Monitor bottlenecks in the physical execution of projects.</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">Pending BOMs:</strong> Lists projects waiting for material lists.</li>
                <li><strong className="text-slate-900">Installation Queue:</strong> Active sites and their <code className="font-mono text-xs">installationStatus</code>.</li>
                <li><strong className="text-slate-900">WCR Ageing:</strong> How long projects take from completion to technical handover.</li>
              </ul>
            </article>
          </section>

          <section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Exporting Data</h2>
            <p className="text-[13px] text-slate-600">Every report table in Solar Arrow comes with an "Export to CSV" button for users with the <code className="font-mono text-xs font-bold text-orange-600">canExport</code> permission. This allows you to perform custom deep-dives in Excel or other tools.</p>
          </section>
        </main>
      </div>
    </div>
  );
}
