// src/app/docs/pipeline/installation/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Installation · Solar Arrow Docs',
  description:
    'Learn how the Installation page in Solar Arrow works — tracking on-site work from start to commissioning.',
};

export default function InstallationPipelinePage() {
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
            Installation
          </span>
          <span>v1.0 · 27 pages</span>
        </div>
      </header>

      {/* Layout */}
      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 md:grid-cols-[260px,minmax(0,1fr)]">
        {/* Sidebar excerpt */}
        <aside className="hidden border-r border-slate-900/60 bg-slate-950 px-3 py-4 text-slate-100 md:flex md:flex-col md:gap-4">
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Pipelines
            </div>
            <nav className="flex flex-col gap-1 text-[13px]">
              <a href="/docs/pipeline/bom-dispatch" className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>BOM &amp; Dispatch</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">14</small>
              </a>
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Installation</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">15</small>
              </div>
              <a href="/docs/pipeline/payments" className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Payments</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">16</small>
              </a>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="max-w-5xl px-4 py-6 md:px-6">
          <section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Solar Arrow · Docs
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Installation page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Installation page tracks on-site work from the day the team reaches the site to
              final commissioning of the system.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners, Admins, Installation
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* What Installation shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you see on the Installation page</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Each row represents a project currently under installation or completed recently.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Customer and project details, capacity, and branch.</li>
                <li>Installation start date, target completion date, and assigned team.</li>
                <li>Status such as &quot;Scheduled&quot;, &quot;In progress&quot;, &quot;Completed&quot;.</li>
              </ul>
            </article>

            {/* Access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access Installation?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Installation is mainly used by the site team and management monitoring project
                progress.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: see all ongoing and completed installations.</li>
                <li>Admins: installations for their branches with ability to adjust dates and teams.</li>
                <li>Installation role: only the projects assigned to their team.</li>
              </ul>
            </article>
          </section>

          {/* Scheduling & completion */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Scheduling installation */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Scheduling an installation</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  schedule
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                After materials are ready, schedule installation and assign the team that will execute
                the work.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Open the project</p>
                    <p className="text-slate-600">
                      From Registration or BOM &amp; Dispatch, jump into the project you are ready to
                      install.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Set installation dates and team</p>
                    <p className="text-slate-600">
                      Choose start date, target completion date, and assign the installation team or
                      contractor.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Completing installation */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Marking installation complete</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  completion
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                After the system is installed and tested, update the status so payment and liaison
                work can proceed.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Confirm that all BOM items are installed and functioning.</li>
                <li>Record commissioning date and basic performance checks.</li>
                <li>
                  Change the status to &quot;Completed&quot; so Accounts and Liaison know they can
                  move ahead with bills and net metering.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}