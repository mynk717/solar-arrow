// src/app/docs/pipeline/survey/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Survey · Solar Arrow Docs',
  description:
    'Learn how the Survey page in Solar Arrow works — scheduling, completing, and updating site surveys before quotation and design.',
};

export default function SurveyPipelinePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed,#f5f5f7)] text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[conic-gradient(from_210deg,#ffedd5,#fed7aa,#fb923c,#f97316,#ffedd5)] shadow-md shadow-orange-500/40">
            <span className="text-xs font-extrabold text-white">SA</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight">Solar Arrow</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              User guide
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-600">
            Survey
          </span>
          <span>v1.0 · 27 pages</span>
        </div>
      </header>

      {/* Layout */}
      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 md:grid-cols-[260px,minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden border-r border-slate-900/60 bg-slate-950 px-3 py-4 text-slate-100 md:flex md:flex-col md:gap-4">
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Pipelines
            </div>
            <nav className="flex flex-col gap-1 text-[13px]">
              <a
                href="/docs/pipeline/leads"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Leads</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  09
                </small>
              </a>
              <a
                href="/docs/pipeline/enquiries"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Enquiries</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  10
                </small>
              </a>
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Survey</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  11
                </small>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="max-w-5xl px-4 py-6 md:px-6">
          <section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Solar Arrow · Docs
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Survey page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Survey page tracks on-site surveys for rooftop solar projects. It connects sales
              enquiries with technical site visits so quotations are based on real measurements.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners, Admins, Survey
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Main card: what Survey shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you see on the Survey page</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Each row on the Survey page represents a scheduled or completed site visit linked to
                a customer enquiry.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Customer name, address, and contact details for the visit.</li>
                <li>Survey date, assigned survey user, and branch.</li>
                <li>Status such as &quot;Pending&quot;, &quot;Scheduled&quot;, &quot;In Progress&quot;, or &quot;Done&quot;.</li>
              </ul>
            </article>

            {/* Right card: who can access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access Survey?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Owners and admins see all surveys, while survey users see only tasks assigned to
                them.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: full view of all surveys across branches.</li>
                <li>Admins: surveys for their branches, with power to reassign or reschedule.</li>
                <li>Survey role: only surveys linked to that specific survey user.</li>
              </ul>
            </article>
          </section>

          {/* Second row: creating & completing surveys */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Creating a survey from enquiry */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Creating a survey from an enquiry</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  from enquiry
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                When an enquiry is ready for a site visit, it should generate a survey task for the
                field team.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Open the enquiry details</p>
                    <p className="text-slate-600">
                      In the Enquiries page, open the enquiry you want to move to survey.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Use the &quot;Create survey&quot; or equivalent action
                    </p>
                    <p className="text-slate-600">
                      This creates a linked survey record and copies customer details, address, and
                      branch.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Assign a survey user and date</p>
                    <p className="text-slate-600">
                      Choose the survey engineer and planned survey date so they see it on their
                      dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Completing a survey */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Completing and updating a survey</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  completion
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                After visiting the site, the survey user should update the record so design and
                quotation can proceed with correct information.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Enter roof measurements, structure type, and any shading or obstacles.</li>
                <li>Upload or link photos as per your organization&apos;s process.</li>
                <li>
                  Change the status to &quot;Done&quot; (or equivalent) so the quotation or design
                  team knows the site is ready.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}