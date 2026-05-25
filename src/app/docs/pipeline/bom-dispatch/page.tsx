import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'BOM & Dispatch · Solar Arrow Docs',
  description:
    'Learn how the BOM & Dispatch page in Solar Arrow works — managing material lists and dispatches for approved projects.',
};



export default function Page() {
  return (
    <DocsLayout currentPath="/docs/pipeline/bom-dispatch">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">BOM &amp; Dispatch page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The BOM &amp; Dispatch page tracks materials required and dispatched for each project,
              ensuring the site team has exactly what they need.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Owners, Admins, Store</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Bill of Materials (BOM)</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">planning</span>
              </header>
              <p className="text-[13px] text-slate-600">Once registration is complete, the project moves to <code className="font-mono text-xs text-blue-600 font-bold">bom-pending</code>.</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs">bomStatus</code>: Tracks from <code className="font-mono text-xs font-bold">draft</code> to <code className="font-mono text-xs font-bold">generated</code> and <code className="font-mono text-xs font-bold text-green-600">approved</code>.</li>
                <li><code className="font-mono text-xs">items</code>: Capture quantity of Panels, Inverters, Structures, DCDB/ACDB, and Cables.</li>
                <li><code className="font-mono text-xs">allocatedStock</code>: Deducts from virtual inventory if enabled.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Dispatch Tracking</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">logistics</span>
              </header>
              <p className="text-[13px] text-slate-600">Monitor movement via <code className="font-mono text-xs text-blue-600 font-bold">dispatchStatus</code>:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs font-bold text-blue-600">pending</code>: Material ready but at the store.</li>
                <li><code className="font-mono text-xs font-bold text-orange-600">in_transit</code>: Vehicle is on the way to site.</li>
                <li><code className="font-mono text-xs font-bold text-green-600">delivered</code>: Material received at site, ready for installation.</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Internal Handover</h2>
            <p className="text-[13px] text-slate-600">When dispatch hits <code className="font-mono text-xs font-bold text-green-600">delivered</code>, the project status automatically updates to <code className="font-mono text-xs text-blue-600 font-bold">installation-pending</code>.</p>
          </section>
    </DocsLayout>
  );
}
