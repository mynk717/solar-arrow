// src/app/docs/roles/sales/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sales Dashboard · Solar Arrow Docs',
  description:
    'Understand the Sales dashboard in Solar Arrow — how sales users work with leads and enquiries.',
};

export default function SalesDashboardPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed,#f5f5f7)] text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[conic-gradient(from_210deg,#ffedd5,#fed7aa,#fb923c,#f97316,#ffedd5)] shadow-md shadow-orange-500/40">
            <span className="text-xs font-extrabold text-white">SA</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight">Solar Arrow</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              User guide
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-600">
            Sales Dashboard
          </span>
          <span>v1.0 · 27 pages</span>
        </div>
      </header>

      {/* Layout */}
      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 md:grid-cols-[260px,minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden border-r border-slate-900/60 bg-slate-950 px-3 py-4 text-slate-100 md:flex md:flex-col md:gap-4">
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Overview
            </div>
            <nav className="flex flex-col gap-1 text-[13px]">
              <a
                href="/docs"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Welcome &amp; Overview</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  01
                </small>
              </a>
              <a
                href="/docs/getting-started"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Getting Started</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  02
                </small>
              </a>
              <a
                href="/docs/login-accounts"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Login &amp; Accounts</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  03
                </small>
              </a>
            </nav>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-700/10 via-slate-500/40 to-slate-700/10" />

          <div>
            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Roles
            </div>
            <nav className="flex flex-col gap-1 text-[13px]">
              <a
                href="/docs/roles/owner-admin"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Owner &amp; Admin Dashboard</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  04
                </small>
              </a>
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Sales Dashboard</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  05
                </small>
              </div>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Survey Dashboard</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  06
                </small>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="max-w-5xl px-4 py-6 md:px-6">
          <section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Solar Arrow · Docs
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Sales dashboard</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Sales dashboard is where sales users track new leads and ongoing enquiries, so
              nothing drops between the cracks before survey or quotation.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Sales users
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 3–5 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Main card: what is on this dashboard */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What appears on the Sales dashboard</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                When you log in as a sales user, the dashboard focuses on lead and enquiry work
                only.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Cards summarizing new, in-progress, and closed leads.</li>
                <li>Quick list of enquiries that need follow-up calls or updates.</li>
                <li>Shortcuts to open the Leads and Enquiries pages directly.</li>
              </ul>
            </article>

            {/* Right card: who gets this view */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who sees the Sales dashboard?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                This dashboard appears when your account type is &quot;user&quot; and your role is
                set to sales (or a similar sales-focused role).
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Sales team members assigned to handle new leads and enquiries.</li>
                <li>Telecallers or marketing staff who pre-qualify leads.</li>
              </ul>
              <p className="mt-2 text-[12px] text-slate-600">
                Owners and admins may see more widgets or a different dashboard view with extra
                controls.
              </p>
            </article>
          </section>

          {/* Second row: daily workflow + tips */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Daily workflow */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Daily workflow for Sales</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  routine
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                A simple daily routine keeps your lead pipeline moving smoothly.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Check new leads</p>
                    <p className="text-slate-600">
                      Open the Leads list and review any new entries created today or yesterday.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Update enquiry status</p>
                    <p className="text-slate-600">
                      For each ongoing enquiry, record call outcomes and move qualified leads toward
                      survey scheduling.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Flag leads needing admin support</p>
                    <p className="text-slate-600">
                      If a case needs special pricing or escalation, mark it clearly and inform the
                      admin or owner.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Tips */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Tips for Sales users</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  best practices
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                To keep the pipeline clear and accurate, follow these practices.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Always update lead status after each call or visit.</li>
                <li>Close lost or duplicate leads to keep counts clean.</li>
                <li>Use notes or comments to record important customer details.</li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}