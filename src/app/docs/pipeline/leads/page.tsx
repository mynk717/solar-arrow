import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Leads · Solar Arrow Docs',
  description: 'Learn how the Leads page in Solar Arrow works — capturing new opportunities and preparing them for enquiries and surveys.',
};

const LEAD_STATUSES = [
  { status: 'new', label: 'New', desc: 'Just received, not yet assigned.' },
  { status: 'assigned', label: 'Assigned', desc: 'Allotted to a telecaller or sales rep.' },
  { status: 'contacted', label: 'Contacted', desc: 'First discussion held.' },
  { status: 'qualified', label: 'Qualified', desc: 'Ready to move to the main Enquiry pipeline.' },
  { status: 'lost', label: 'Lost', desc: 'Customer not proceeding.' },
];

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/pipeline/leads">
      <section className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Leads page</h1>
        <p className="max-w-2xl text-[13px] text-slate-600">The Leads page is the entry point of your solar pipeline. Every new opportunity starts here before it becomes an enquiry, survey, and eventually an installation.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
          <h2 className="text-sm font-semibold mb-2">Lead Stages & Status</h2>
          <ul className="space-y-1.5 text-[12px] text-slate-700">
            {LEAD_STATUSES.map(s => <li key={s.status}><code className="font-mono text-xs font-bold">{s.status}</code>: {s.desc}</li>)}
          </ul>
        </article>
      </section>
    </DocsLayout>
  );
}
