// src/app/docs/pipeline/payments/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payments · Solar Arrow Docs',
  description:
    'Learn how the Payments page in Solar Arrow works — tracking customer payments linked to installations and subsidies.',
};

export default function PaymentsPipelinePage() {
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
            Payments
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
              <a href="/docs/pipeline/installation" className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Installation</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">15</small>
              </a>
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Payments</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">16</small>
              </div>
              <a href="/docs/pipeline/liaison" className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Liaison &amp; WCR</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">17</small>
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
            <h1 className="text-2xl font-semibold tracking-tight">Payments page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Payments page tracks money collected from the customer for each project, including
              advances, milestones, and final balances.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners, Admins, Accounts
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* What Payments shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you see on the Payments page</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Each row is a project with its billing and payment status summarized in one place.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Total quotation amount and any applicable subsidy portion.</li>
                <li>Amounts invoiced, collected, and remaining balance.</li>
                <li>Status such as &quot;Advance pending&quot;, &quot;Partially paid&quot;, &quot;Paid&quot;.</li>
              </ul>
            </article>

            {/* Access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access Payments?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Payments are usually managed by accounts and owners, with admins monitoring for their
                branches.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: financial view across all projects.</li>
                <li>Admins: branch-wise payments for their operations.</li>
                <li>Accounts role: record receipts and verify balances.</li>
              </ul>
            </article>
          </section>

          {/* Recording payments & tracking status */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Recording a payment */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Recording a payment</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  receipt
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Whenever the customer pays an advance or installment, record it so balances stay
                accurate.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Open the project entry</p>
                    <p className="text-slate-600">
                      Find the project in Payments or via search and open its details panel.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Add a new payment</p>
                    <p className="text-slate-600">
                      Enter amount, date, payment mode (cash, bank, UPI), and reference number if any.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Tracking balances */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Tracking balances and closing payments</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  status
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Solar Arrow helps you see which projects are fully paid and which still have
                outstanding amounts.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Use filters to see &quot;balance pending&quot; projects for follow-up.</li>
                <li>Mark bills as &quot;Paid&quot; when the final amount is received.</li>
                <li>
                  Coordinate with the subsidy tracking page to ensure customer and subsidy portions
                  are both accounted for.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}