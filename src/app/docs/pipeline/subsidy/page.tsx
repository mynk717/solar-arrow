import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subsidy Pipeline · Solar Arrow Docs',
  description:
    'Guide to the Subsidy pipeline in Solar Arrow — managing PM Surya Ghar claims and final disbursement.',
};

export default function Page() {
  return (
    <><section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Subsidy management</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The final stage of the solar journey. This module tracks the PM Surya Ghar subsidy application from submission to disbursement.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Accounts, Liaison, Owners</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Workflow Statuses</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">lifecycle</span>
              </header>
              <p className="text-[13px] text-slate-600">Monitor subsidy progress via real system states:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs text-blue-600 font-bold">subsidy-pending</code>: Inspection approved, ready for portal claim.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">subsidy-disbursed</code>: Final funds received by the customer/vendor.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Financial Tracking</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">data</span>
              </header>
              <p className="text-[13px] text-slate-600">Capture these fields to close the project:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs">subsidyAmount</code>: Total expected benefit.</li>
                <li><code className="font-mono text-xs">subsidyStatus</code>: <code className="font-mono text-xs">pending</code>, <code className="font-mono text-xs">approved</code>, <code className="font-mono text-xs">disbursed</code>.</li>
                <li><code className="font-mono text-xs">finalDisbursementDate</code>: Project closure date.</li>
              </ul>
            </article>
          </section>

          <section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Project Completion</h2>
            <p className="text-[13px] text-slate-600">A project is only considered <code className="font-mono text-xs font-bold text-green-600">active</code> (fully complete) once both the <code className="font-mono text-xs font-bold">subsidyStatus</code> and <code className="font-mono text-xs font-bold">paymentStatus</code> are finalized.</p>
          </section>
  );
}

