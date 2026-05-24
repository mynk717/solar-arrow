import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Installation Pipeline · Solar Arrow Docs',
  description:
    'Guide to the Installation pipeline in Solar Arrow — physical execution, checklists, and handover.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/pipeline/installation">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Installation pipeline</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              This stage manages the physical construction and handover of the solar project.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Installation Team, Project Managers</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 5–7 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Workflow Statuses</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">lifecycle</span>
              </header>
              <p className="text-[13px] text-slate-600">Physical progress is tracked via:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs text-blue-600 font-bold">installation-pending</code>: Material delivered to site, team assigned.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">installation-in-progress</code>: Panels, structures, or wiring being fixed.</li>
                <li><code className="font-mono text-xs text-green-600 font-bold">installation-completed</code>: Physical work finished, awaiting WCR check.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Work Completion (WCR)</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">handover</span>
              </header>
              <p className="text-[13px] text-slate-600">The WCR fields are mandatory for handover:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs font-bold">wcrStatus</code>: <code className="font-mono text-xs">pending</code>, <code className="font-mono text-xs">submitted</code>, <code className="font-mono text-xs">approved</code>.</li>
                <li><code className="font-mono text-xs">pvModuleSerialNumbers</code>: Scanned serials for all panels.</li>
                <li><code className="font-mono text-xs">installationPhotos</code>: Final proof of work.</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Internal Handover</h2>
            <p className="text-[13px] text-slate-600">When <code className="font-mono text-xs font-bold">wcrStatus</code> hits <code className="font-mono text-xs font-bold text-green-600">approved</code>, the project moves to the <code className="font-mono text-xs text-blue-600 font-bold">inspection-pending</code> stage in the Liaison pipeline.</p>
          </section>
    </DocsLayout>
  );
}