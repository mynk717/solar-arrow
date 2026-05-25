import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Registration · Solar Arrow Docs',
  description:
    'Learn how the Registration page in Solar Arrow works — confirming approved quotations and registering projects before installation.',
};



export default function Page() {
  return (
    <DocsLayout currentPath="/docs/pipeline/registration">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Registration page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Registration page records approved projects that are officially moving ahead. It
              connects quotation approval to internal and DISCOM-facing registration steps.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Owners, Admins, Accounts</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Workflow Statuses</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">lifecycle</span>
              </header>
              <p className="text-[13px] text-slate-600">Track project registration using these system states:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs text-blue-600 font-bold">registration-pending</code>: Approved quote, awaiting portal entry.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">registration-completed</code>: Application submitted to DISCOM/PMSG.</li>
                <li><code className="font-mono text-xs text-orange-600 font-bold">bom-pending</code>: Registered project ready for material planning.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Technical Fields</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">data</span>
              </header>
              <p className="text-[13px] text-slate-600">The Registration record tracks DISCOM details:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs">consumerNumber</code> (BP Number).</li>
                <li><code className="font-mono text-xs">pmsgApplicationId</code>: Portal reference.</li>
                <li><code className="font-mono text-xs">discomName</code>: (e.g., CSPDCL).</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Internal Handover</h2>
            <p className="text-[13px] text-slate-600">Once registration is complete, the project triggers the <code className="font-mono text-xs">Liaison</code> and <code className="font-mono text-xs">BOM</code> pipelines simultaneously.</p>
          </section>
    </DocsLayout>
  );
}
