import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liaison Pipeline · Solar Arrow Docs',
  description:
    'Guide to the Liaison pipeline in Solar Arrow — managing DISCOM approvals, grid connectivity, and net metering.',
};

export default function Page() {
  return (
    <><section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Liaison &amp; utility tracking</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Liaison stage handles the formal interactions with the electrical utility (DISCOM). It ensures the grid is ready for the solar system.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Liaison Team, Admins</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Workflow Statuses</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">lifecycle</span>
              </header>
              <p className="text-[13px] text-slate-600">Liaison tasks are tracked via real system states:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs text-blue-600 font-bold">liaison-pre</code>: Feasibility studies and initial DISCOM NOC.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">liaison-grid</code>: Grid connectivity and meter testing.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">inspection-pending</code>: Ready for official site inspection.</li>
                <li><code className="font-mono text-xs text-green-600 font-bold">inspection-approved</code>: Site passed, awaiting final activation.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Utility Data</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">records</span>
              </header>
              <p className="text-[13px] text-slate-600">The Liaison module captures:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs">meterSerialNumber</code>: For the new net meter.</li>
                <li><code className="font-mono text-xs">feederName</code>: DISCOM technical detail.</li>
                <li><code className="font-mono text-xs">dtCode</code>: Distribution Transformer code.</li>
              </ul>
            </article>
          </section>

          <section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Net Metering</h2>
            <p className="text-[13px] text-slate-600">Once physical installation is done, use the Liaison dashboard to record the <code className="font-mono text-xs">netMeterInstalledDate</code>. This is the official "go-live" moment for the customer's billing cycle.</p>
          </section>
  );
}

