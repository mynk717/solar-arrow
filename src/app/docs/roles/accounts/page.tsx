import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Accounts Dashboard · Solar Arrow Docs',
  description:
    'Guide for Accounts users in Solar Arrow — managing quotations, payments, and subsidy documentation.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/roles/accounts">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Accounts dashboard &amp; workflow</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Accounts team manages the financial health of the project, including quotations, customer payments, and subsidy disbursements.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Accounts Team</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 5–7 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Financial Pipelines</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">access</span>
              </header>
              <p className="text-[13px] text-slate-600">Your dashboard provides dedicated views for financial tracking:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">Payments:</strong> Track <code className="font-mono text-xs text-blue-600 font-bold">payment-pending</code> vs <code className="font-mono text-xs text-green-600 font-bold">payment-received</code>.</li>
                <li><strong className="text-slate-900">Subsidy:</strong> Monitor <code className="font-mono text-xs text-orange-600 font-bold">subsidy-pending</code> and record <code className="font-mono text-xs text-green-600 font-bold">subsidy-disbursed</code>.</li>
                <li><strong className="text-slate-900">Quotations:</strong> Manage draft and approved project costs.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Permissions</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">access</span>
              </header>
              <p className="text-[13px] text-slate-600">Users with the <code className="font-mono text-xs font-bold text-orange-600">accounts</code> role have:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">View:</strong> Payments, Subsidy, Enquiries, Kanban, and Dashboard.</li>
                <li><strong className="text-slate-900">Edit:</strong> Payment and Subsidy fields.</li>
                <li><strong className="text-slate-900">Verify:</strong> Record <code className="font-mono text-xs">paymentUTR</code> and verify bank disbursements.</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Payment Verification</h2>
            <p className="text-[13px] text-slate-600">When a customer pays, capture the following to ensure the project stays active:</p>
            <div className="mt-3 grid gap-4 md:grid-cols-3 text-center text-[11px]">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><p className="font-bold text-slate-700">Amount</p><code className="text-[10px]">initialPayment</code></div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><p className="font-bold text-slate-700">Method</p><code className="text-[10px]">paymentMethod</code></div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100"><p className="font-bold text-slate-700">Reference</p><code className="text-[10px]">paymentUTR</code></div>
            </div>
          </section>
    </DocsLayout>
  );
}