// src/app/docs/pipeline/liaison/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liaison & WCR · Solar Arrow Docs',
  description:
    'Learn how the Liaison & WCR page in Solar Arrow works — managing government liaison, net metering, and WCR within one stage.',
};

export default function LiaisonPipelinePage() {
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
            Liaison &amp; WCR
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
              <a href="/docs/pipeline/payments" className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Payments</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">16</small>
              </a>
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Liaison &amp; WCR</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">17</small>
              </div>
              <a href="/docs/pipeline/subsidy" className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>PM Surya Ghar Subsidy</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">18</small>
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
            <h1 className="text-2xl font-semibold tracking-tight">Liaison &amp; WCR page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Liaison &amp; WCR page tracks government liaison work, net metering applications,
              and Work Completion Reports (WCR) after installation is complete.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners, Admins, Liaison / Accounts
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* What Liaison & WCR shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you see on Liaison &amp; WCR</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Each row is an installed project whose documents and approvals are moving through
                government or DISCOM processes.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Application numbers for net metering or related approvals.</li>
                <li>Key dates like application submitted, inspection completed, WCR issued.</li>
                <li>Status such as &quot;File prep&quot;, &quot;Submitted&quot;, &quot;WCR received&quot;, &quot;Net meter installed&quot;.</li>
              </ul>
            </article>

            {/* Access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access Liaison &amp; WCR?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                This stage is mainly used by liaison staff and accounts, with owners and admins
                monitoring overall progress.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: see all projects and their liaison/WCR position.</li>
                <li>Liaison role: update steps as visits, inspections, and approvals happen.</li>
                <li>Accounts: coordinate with subsidy and payment stages where required.</li>
              </ul>
            </article>
          </section>

          {/* Progress through liaison/WCR */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Starting liaison after installation */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Starting liaison after installation</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  start
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Once installation is complete, begin liaison work to get approvals and metering
                done.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Verify that installation status is &quot;Completed&quot; and payments are on track.</li>
                <li>Create or update the liaison entry with application details and required docs.</li>
              </ul>
            </article>

            {/* Recording WCR and net metering */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Recording WCR and net meter status</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  completion
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                As the DISCOM or authority completes inspections and installs the net meter,
                update the record so the project can move to final subsidy steps.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Set status to &quot;WCR received&quot; when the Work Completion Report is issued.</li>
                <li>Log net meter installation and synchronized date.</li>
                <li>Confirm final status so subsidy tracking reflects that the system is live.</li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}