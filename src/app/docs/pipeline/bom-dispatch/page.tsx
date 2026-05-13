// src/app/docs/pipeline/bom-dispatch/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BOM & Dispatch · Solar Arrow Docs',
  description:
    'Learn how the BOM & Dispatch page in Solar Arrow works — managing material lists and dispatches for approved projects.',
};

export default function BomDispatchPipelinePage() {
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
            BOM &amp; Dispatch
          </span>
          <span>v1.0 · 27 pages</span>
        </div>
      </header>

      {/* Layout */}
      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 md:grid-cols-[260px,minmax(0,1fr)]">
        {/* Sidebar (short excerpt) */}
        <aside className="hidden border-r border-slate-900/60 bg-slate-950 px-3 py-4 text-slate-100 md:flex md:flex-col md:gap-4">
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Pipelines
            </div>
            <nav className="flex flex-col gap-1 text-[13px]">
              <a href="/docs/pipeline/registration" className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Registration</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">13</small>
              </a>
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>BOM &amp; Dispatch</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">14</small>
              </div>
              <a href="/docs/pipeline/installation" className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Installation</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">15</small>
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
            <h1 className="text-2xl font-semibold tracking-tight">BOM &amp; Dispatch page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The BOM &amp; Dispatch page tracks materials required and dispatched for each project,
              so installation teams have the right items at the right time.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners, Admins, Store / Dispatch
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* What BOM & Dispatch shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you see on BOM &amp; Dispatch</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Each row is a project that needs material planning and dispatch for installation.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Project and customer reference, capacity, and branch.</li>
                <li>Bill of Materials summary (modules, inverters, structure, cable, etc.).</li>
                <li>Dispatch status such as &quot;Pending&quot;, &quot;Partially dispatched&quot;, &quot;Complete&quot;.</li>
              </ul>
            </article>

            {/* Access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access BOM &amp; Dispatch?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                This page is typically used by owners, admins, and any store or dispatch role that
                prepares material for installation.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: see all projects and their material status.</li>
                <li>Admins: manage BOM and dispatch for their branches.</li>
                <li>Store / Dispatch: update what has been packed and sent.</li>
              </ul>
            </article>
          </section>

          {/* Creating & updating BOM/Dispatch */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Creating BOM from quotation/registration */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Creating a BOM for a project</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  from quotation
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                After registration, a project needs a finalized Bill of Materials (BOM) to plan stock
                and dispatch.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Open the project in Registration</p>
                    <p className="text-slate-600">
                      Start from the registered project so capacity and design details are pre-filled.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Create or edit the BOM</p>
                    <p className="text-slate-600">
                      Specify modules, inverters, structures, cable lengths, protections, and any
                      extras required at the site.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Updating dispatch status */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Updating dispatch status</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  dispatch
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                As materials leave the store, update the dispatch status so the installation team and
                management have clear visibility.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Record dispatch date and vehicle or transporter details.</li>
                <li>Mark partial or full dispatch based on what has been sent.</li>
                <li>
                  Once all required material is dispatched, set status to &quot;Complete&quot; so
                  installation can be scheduled confidently.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}