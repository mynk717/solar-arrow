import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Installation Dashboard · Solar Arrow Docs',
  description:
    'Guide for Installation teams in Solar Arrow — tracking progress, serial numbers, and WCR submission.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/roles/installation">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Installation dashboard &amp; workflow</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Installation team manages the physical execution of the project. This role focuses on site work, material utilization, and final WCR submission.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Installation Team</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 5–7 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Active Installations</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">pipeline</span>
              </header>
              <p className="text-[13px] text-slate-600">Your dashboard tracks projects through physical execution stages:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs text-blue-600 font-bold">installation-pending</code>: Scheduled but not yet started.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">installation-in-progress</code>: Work is currently happening at the site.</li>
                <li><code className="font-mono text-xs text-blue-600 font-bold">installation-completed</code>: Physical work finished, awaiting WCR.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Permissions</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">access</span>
              </header>
              <p className="text-[13px] text-slate-600">Users with the <code className="font-mono text-xs font-bold text-orange-600">installation</code> role have:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">View:</strong> Installation, Enquiries, Kanban, and Dashboard.</li>
                <li><strong className="text-slate-900">Edit:</strong> Installation and WCR fields.</li>
                <li><strong className="text-slate-900">Capture:</strong> <code className="font-mono text-xs">pvModuleSerialNumbers</code>, Inverter serials, and Meter readings.</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Work Completion Report (WCR)</h2>
            <p className="text-[13px] text-slate-600">The WCR is the final technical handover. You must complete a checklist before the project can move to inspection.</p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2 text-[12px]">
              <li className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> <code className="font-mono text-xs">panelsInstalled</code></li>
              <li className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> <code className="font-mono text-xs">wiringComplete</code></li>
              <li className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> <code className="font-mono text-xs">earthingDone</code></li>
              <li className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> <code className="font-mono text-xs">systemTested</code></li>
            </ul>
          </section>
    </DocsLayout>
  );
}