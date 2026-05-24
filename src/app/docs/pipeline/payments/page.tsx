import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Payments Pipeline · Solar Arrow Docs',
  description:
    'Guide to the Payments pipeline in Solar Arrow — tracking customer payments, UTR references, and bank disbursements.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/pipeline/payments">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Payments tracking</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              This module ensures all financial transactions related to a project are recorded and verified.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Accounts, Owners</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Workflow Statuses</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">lifecycle</span>
              </header>
              <p className="text-[13px] text-slate-600">Track payment status using these system states:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs text-blue-600 font-bold">payment-pending</code>: Quote approved, awaiting initial deposit.</li>
                <li><code className="font-mono text-xs text-green-600 font-bold">payment-received</code>: Money confirmed in organization bank account.</li>
                <li><code className="font-mono text-xs text-orange-600 font-bold">payment-disbursed</code>: Vendor or supplier payments made.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Financial Data</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">records</span>
              </header>
              <p className="text-[13px] text-slate-600">The Payments module captures:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs">initialPayment</code>: Advance amount.</li>
                <li><code className="font-mono text-xs">paymentUTR</code>: Unique Transaction Reference.</li>
                <li><code className="font-mono text-xs">paymentDate</code>: When the money hit the bank.</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Reconciliation</h2>
            <p className="text-[13px] text-slate-600">Use the Payments dashboard to reconcile <code className="font-mono text-xs">totalQuotedAmount</code> against <code className="font-mono text-xs">totalReceivedAmount</code>. The system highlights projects with outstanding balances automatically.</p>
          </section>
    </DocsLayout>
  );
}