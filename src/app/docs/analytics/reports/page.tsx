import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Reports & Analytics · Solar Arrow Docs',
  description: 'Learn how to use Solar Arrow reports to track team performance and project conversion rates.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/analytics/reports">
<section className="mb-6 flex flex-col gap-2">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
        <h1 className="text-2xl font-semibold tracking-tight">Data &amp; reporting</h1>
        <p className="max-w-2xl text-[13px] text-slate-600">
          Transform your pipeline data into actionable insights. Solar Arrow provides built-in charts and tables to monitor your business health.
        </p>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Owners, Admins</span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 5–7 minutes</span>
        </div>
      </section>
<section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Conversion Reports</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">sales</span>
          </header>
          <p className="text-[13px] text-slate-600">Track how effectively your team moves leads through the funnel.</p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <li><strong className="text-slate-900">Lead to Enquiry:</strong> Measures initial qualification success.</li>
            <li><strong className="text-slate-900">Enquiry to Survey:</strong> Tracks technical team responsiveness.</li>
            <li><strong className="text-slate-900">Survey to Quote:</strong> Measures sales speed.</li>
          </ul>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Operations Reports</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">execution</span>
          </header>
          <p className="text-[13px] text-slate-600">Monitor bottlenecks in the physical execution of projects.</p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <li><strong className="text-slate-900">Pending BOMs:</strong> Lists projects waiting for material lists.</li>
            <li><strong className="text-slate-900">Installation Queue:</strong> Active sites and their <code className="font-mono text-xs">installationStatus</code>.</li>
            <li><strong className="text-slate-900">WCR Ageing:</strong> How long projects take from completion to technical handover.</li>
          </ul>
        </article>
      </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
        <h2 className="text-sm font-semibold mb-2">Exporting Data</h2>
        <p className="text-[13px] text-slate-600">Every report table in Solar Arrow comes with an "Export to CSV" button for users with the <code className="font-mono text-xs font-bold text-orange-600">canExport</code> permission. This allows you to perform custom deep-dives in Excel or other tools.</p>
      </section>
    </DocsLayout>
  );
}