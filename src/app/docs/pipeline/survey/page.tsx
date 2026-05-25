import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Survey Pipeline · Solar Arrow Docs',
  description:
    'Detailed guide on how the Survey pipeline works — scheduling site visits, technical requirements, and approval logic.',
};



export default function Page() {
  return (
    <DocsLayout currentPath="/docs/pipeline/survey">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Survey pipeline &amp; logic</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The survey stage captures critical technical data. It bridges the gap between customer interest and physical installation.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Surveyors, Admins</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 5–7 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Scheduled Visits</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">workflow</span>
              </header>
              <p className="text-[13px] text-slate-600">System terminology for site visits:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="font-semibold text-slate-900">Queue:</strong> <code className="font-mono text-xs">scheduledEnquiries</code> are fetched from <code className="font-mono text-xs">/api/enquiries</code> where status is <code className="font-mono text-xs text-orange-600 font-bold">survey-scheduled</code>.</li>
                <li><strong className="font-semibold text-slate-900">Filtering:</strong> Surveyors only see projects where <code className="font-mono text-xs">e.surveyedBy</code> matches their email.</li>
                <li><strong className="font-semibold text-slate-900">Input:</strong> Technical data like <code className="font-mono text-xs">sanctionedLoad</code> and <code className="font-mono text-xs">installationSurface</code> must be captured.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Approval Logic</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">rules</span>
              </header>
              <p className="text-[13px] text-slate-600">How the system determines survey status:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-green-700">Approved:</strong> Triggered when <code className="font-mono text-xs">surveyApproved === true</code> or exactly <code className="font-mono text-xs">"TRUE"</code>.</li>
                <li><strong className="text-red-700">Rejected:</strong> If <code className="font-mono text-xs">surveyNotes</code> starts with or contains the word <code className="font-mono text-xs">"rejected"</code> (case-insensitive).</li>
                <li><strong className="text-orange-700">Pending Review:</strong> Surveys submitted but not yet matching approved/rejected logic.</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Technical Details Captured</h2>
            <div className="grid gap-2 md:grid-cols-4 text-[10px]">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold">Load: sanctionedLoad</div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold">Surface: installationSurface</div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold">Cable: panelToDcdbLength</div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-bold">Structure: structureStyle</div>
            </div>
          </section>
    </DocsLayout>
  );
}
