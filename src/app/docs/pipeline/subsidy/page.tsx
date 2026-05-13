// src/app/docs/pipeline/subsidy/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PM Surya Ghar Subsidy · Solar Arrow Docs',
  description:
    'Learn how the PM Surya Ghar Subsidy page in Solar Arrow works — tracking subsidy applications and payouts for rooftop solar projects.',
};

export default function SubsidyPipelinePage() {
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
            PM Surya Ghar Subsidy
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
              <a href="/docs/pipeline/liaison" className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Liaison &amp; WCR</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">17</small>
              </a>
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>PM Surya Ghar Subsidy</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">18</small>
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
            <h1 className="text-2xl font-semibold tracking-tight">
              PM Surya Ghar Subsidy page
            </h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Subsidy page tracks each project&apos;s PM Surya Ghar subsidy application, from
              submission to final payout, alongside the customer&apos;s payments.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners, Admins, Accounts / Liaison
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* What Subsidy shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">
                  What you see on the PM Surya Ghar Subsidy page
                </h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Each row represents a completed installation that is eligible for subsidy and has (or
                will have) a subsidy application.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Customer details, project capacity, and basic eligibility info.</li>
                <li>Subsidy application ID, dates, and current stage.</li>
                <li>Subsidy amount expected and payout status such as &quot;Applied&quot;, &quot;Approved&quot;, &quot;Paid&quot;.</li>
              </ul>
            </article>

            {/* Access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access Subsidy?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Subsidy tracking is typically handled by accounts and liaison staff, with owners and
                admins monitoring overall status and cash flow.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: see subsidy position for all completed projects.</li>
                <li>Accounts: reconcile subsidy amounts with customer billing.</li>
                <li>Liaison role: update application and payout stages.</li>
              </ul>
            </article>
          </section>

          {/* Application & payout tracking */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Recording subsidy applications */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Recording subsidy applications</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  application
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                When a project is ready and all documents are in place, record the subsidy
                application so it can be tracked to completion.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Note application date, portal reference number, and scheme category.</li>
                <li>Set the initial status to &quot;Applied&quot; or your equivalent.</li>
              </ul>
            </article>

            {/* Tracking approvals and payouts */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Tracking approvals and payouts</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  payout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                As the subsidy moves through review and payment, update the record so owners always
                know expected and realized amounts.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Change status to &quot;Approved&quot; when the portal confirms sanction.</li>
                <li>Record the date and amount when subsidy is credited.</li>
                <li>
                  Coordinate with Payments to ensure total inflow (customer + subsidy) matches the
                  planned commercial structure.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}