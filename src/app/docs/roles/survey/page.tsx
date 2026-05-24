import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Surveyor Dashboard · Solar Arrow Docs',
  description:
    'Guide for Surveyors in Solar Arrow — managing site visits, technical surveys, and report submission.',
};

export default function Page() {
  return (
    <><section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Surveyor dashboard &amp; workflow</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              As a Surveyor, you handle the technical feasibility of projects. You see site visits assigned to you and submit detailed reports for approval.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Surveyors</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Assigned Surveys</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">task list</span>
              </header>
              <p className="text-[13px] text-slate-600">Your dashboard shows projects where you are the allotted surveyor (<code className="font-mono text-xs font-bold text-orange-600">surveyorEmail</code>).</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="font-semibold text-slate-900">Awaiting Visit:</strong> Projects with status <code className="font-mono text-xs text-blue-600 font-bold">survey-scheduled</code>.</li>
                <li><strong className="font-semibold text-slate-900">Pending Review:</strong> Surveys you have submitted but aren't yet approved.</li>
                <li><strong className="font-semibold text-slate-900">Approved/Rejected:</strong> Final verdict from Admin/Owner.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Field Permissions</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">access</span>
              </header>
              <p className="text-[13px] text-slate-600">Users with the <code className="font-mono text-xs font-bold text-orange-600">surveyor</code> role have:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">View:</strong> Survey, Enquiries, Kanban, and Dashboard.</li>
                <li><strong className="text-slate-900">Edit:</strong> Survey details for assigned enquiries only.</li>
                <li><strong className="text-slate-900">Actions:</strong> Upload photos, capture load details, and cable sizing.</li>
              </ul>
            </article>
          </section>

          <section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Submitting a Report</h2>
            <p className="text-[13px] text-slate-600">A complete survey report requires technical data and visual evidence.</p>
            <div className="mt-3 grid gap-4 md:grid-cols-3 text-[12px]">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Electricals</p>
                <p className="text-slate-600">Capture <code className="font-mono text-xs">sanctionedLoad</code>, Phase, and Transformer details.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Structure</p>
                <p className="text-slate-600">Select <code className="font-mono text-xs">installationSurface</code> and roof type.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">Evidence</p>
                <p className="text-slate-600">Upload mandatory <code className="font-mono text-xs">surveyPhotos</code> of the roof and meter.</p>
              </div>
            </div>
          </section>
  );
}

