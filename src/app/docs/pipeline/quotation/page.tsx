import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Quotation · Solar Arrow Docs',
  description:
    'Learn how the Quotation page in Solar Arrow works — preparing, sharing, and tracking solar quotations linked to surveys and enquiries.',
};



export default function Page() {
  return (
    <DocsLayout currentPath="/docs/pipeline/quotation">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Quotation page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Quotation page holds all proposals sent to customers. It calculates project costs based on survey data and tracks customer approval.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Owners, Admins, Accounts, Sales</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Workflow Statuses</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">lifecycle</span>
              </header>
              <p className="text-[13px] text-slate-600">Quotations move through these key system states:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs text-blue-600 font-bold">quotation-pending</code>: Survey done, price being calculated.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">quotation-approved</code>: Customer agreed to the price and terms.</li>
                <li><code className="font-mono text-xs text-green-600 font-bold">registration-pending</code>: Approved quote ready for CSPDCL/Government portal entry.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Price Calculation</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">data</span>
              </header>
              <p className="text-[13px] text-slate-600">The system calculates totals using:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs">basePricePerKw</code>: Multiplied by capacity.</li>
                <li><code className="font-mono text-xs">gstAmount</code>: Calculated based on item categories.</li>
                <li><code className="font-mono text-xs">netCustomerPayable</code>: Final amount after subsidy deduction.</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Sharing the Proposal</h2>
            <p className="text-[13px] text-slate-600">Solar Arrow generates a professional summary based on the <code className="font-mono text-xs">quotationDetails</code> field. You can share this via the integrated WhatsApp or Email buttons directly from the row actions.</p>
          </section>
    </DocsLayout>
  );
}
