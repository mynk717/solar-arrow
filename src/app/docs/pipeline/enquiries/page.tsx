import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Enquiries · Solar Arrow Docs',
  description:
    'Learn how the Enquiries page in Solar Arrow works — managing conversations after a lead shows interest and before survey or quotation.',
};



export default function Page() {
  return (
    <DocsLayout currentPath="/docs/pipeline/enquiries">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Enquiries page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Enquiries page tracks serious conversations after a lead has been contacted. This is
              where you decide whether to move forward to survey and quotation.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Owners, Admins, Sales</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Enquiry Statuses</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">pipeline</span>
              </header>
              <p className="text-[13px] text-slate-600">Track project progression using real <code className="font-mono text-xs text-blue-600 font-bold">EnquiryStatus</code> values:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs text-blue-600 font-bold">new</code>: Recently converted from lead.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">prospect</code>: In active discussion with sales.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">survey-pending</code>: Ready for a site visit request.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">active</code>: A project that has reached final stages.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Core Details</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">data</span>
              </header>
              <p className="text-[13px] text-slate-600">The Enquiry record captures 120+ fields, starting with:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs">customerName</code> &amp; Contact info.</li>
                <li><code className="font-mono text-xs">capacity</code>: System size in kW.</li>
                <li><code className="font-mono text-xs">branchId</code>: The allotted branch.</li>
                <li><code className="font-mono text-xs">panelTag</code>: Category (RTS, Commercial, etc.).</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Branch Assignment</h2>
            <p className="text-[13px] text-slate-600">Enquiries are filtered by <code className="font-mono text-xs font-bold text-orange-600">branchId</code>. Admins see only their branch's data, while Owners see everything.</p>
            <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[12px]">
              <p className="text-slate-600">To reassign an enquiry, edit the <code className="font-mono text-xs">branchId</code> field in the Enquiry details modal. This ensures the correct local team takes over the survey and installation.</p>
            </div>
          </section>
    </DocsLayout>
  );
}
