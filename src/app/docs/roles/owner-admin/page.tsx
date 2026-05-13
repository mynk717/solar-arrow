// src/app/docs/roles/owner-admin/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Owner & Admin Dashboard · Solar Arrow Docs',
  description:
    'Understand the Owner and Admin dashboard in Solar Arrow — full visibility across all pipelines, reports, and settings.',
};

export default function OwnerAdminDashboardPage() {
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
            Owner &amp; Admin Dashboard
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
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Owner &amp; Admin Dashboard</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  04
                </small>
              </div>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Sales Dashboard</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  05
                </small>
              </div>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Survey Dashboard</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  06
                </small>
              </div>
              {/* Installation / Accounts dashboards will come later */}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="max-w-5xl px-4 py-6 md:px-6">
          <section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Solar Arrow · Docs
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Owner &amp; Admin dashboard overview
            </h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Owner and Admin dashboard provides full visibility across all pipelines, helping
              you monitor every project stage, team workload, and key metrics in one place.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners &amp; Admins
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Main card: what you see */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What appears on this dashboard</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                When you log in as an owner or admin, the dashboard shows a summary of all active
                projects and key stages in your solar pipeline.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Top cards with counts for leads, enquiries, surveys, and installations.</li>
                <li>Quick view of upcoming surveys or installations due.</li>
                <li>Shortcuts to important pages like Leads, Survey, Installation, and Reports.</li>
              </ul>
            </article>

            {/* Right card: who gets this view */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who sees this dashboard?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                The Owner and Admin dashboard is only available to users with the highest access
                levels in your organization.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owner: can always see this dashboard, regardless of branch.</li>
                <li>Admin: sees this view for the branches they manage.</li>
                <li>Other roles: are redirected to their own role-specific dashboards instead.</li>
              </ul>
              <p className="mt-2 text-[12px] text-slate-600">
                If an admin cannot see this dashboard, ask the owner to confirm their account type
                and role.
              </p>
            </article>
          </section>

          {/* Second row: key actions + tips */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Key actions */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Key actions from this page</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  actions
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Use the Owner/Admin dashboard as your daily control center.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Open the Leads page to assign new enquiries to sales or survey teams.</li>
                <li>Jump to Survey to see pending site visits and update statuses.</li>
                <li>Review projects stuck at quotation, registration, or subsidy stages.</li>
              </ul>
              <p className="mt-2 text-[12px] text-slate-600">
                From here you can also access Settings, Users, and Branches to adjust how your team
                works in Solar Arrow.
              </p>
            </article>

            {/* Tips */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Tips for owners &amp; admins</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  best practices
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                A few habits make this dashboard much more powerful.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Check the dashboard at least once daily to spot bottlenecks early.</li>
                <li>
                  Keep user roles and branches up to date so counts and task lists stay accurate.
                </li>
                <li>
                  Use the Reports section regularly to track conversions from lead to installation
                  and subsidy.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}