import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leads · Solar Arrow Docs',
  description:
    'Learn how the Leads page in Solar Arrow works — capturing new opportunities and preparing them for enquiries and surveys.',
};

export default function Page() {
  return (
    <>
      <section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Leads page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Leads page is the entry point of your solar pipeline. Every new opportunity starts
              here before it becomes an enquiry, survey, and eventually an installation.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Owners, Admins, Sales</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Lead Stages &amp; Status</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">lifecycle</span>
              </header>
              <p className="text-[13px] text-slate-600">Track every potential customer using the real system statuses:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs text-blue-600 font-bold">new</code>: Just received, not yet assigned.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">assigned</code>: Allotted to a telecaller or sales rep.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">contacted</code>: First discussion held.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">qualified</code>: Ready to move to the main Enquiry pipeline.</li>
                <li><code className="font-mono text-xs text-red-600 font-bold">lost</code>: Customer not proceeding.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who manages leads?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">roles</span>
              </header>
              <p className="text-[13px] text-slate-600">Permissions are based on the <code className="font-mono text-xs font-bold text-orange-600">assignedTo</code> field.</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs">lead-provider</code>: Can only create/add leads.</li>
                <li><code className="font-mono text-xs">telecaller</code>: Can edit details and record follow-ups.</li>
                <li><code className="font-mono text-xs">sales</code>: Can qualify and convert leads.</li>
              </ul>
            </article>
          </section>

          <section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Key Terminology</h2>
            <div className="grid gap-4 md:grid-cols-2 text-[12px]">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Conversion</p>
                <p className="text-slate-600">When status becomes <code className="font-mono text-xs font-bold">converted</code>, it creates a new Enquiry record.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Activity Log</p>
                <p className="text-slate-600">Every status change and call note is recorded in the <code className="font-mono text-xs">LeadActivity</code> timeline.</p>
              </div>
            </div>
          </section>
    </>
  );
}
