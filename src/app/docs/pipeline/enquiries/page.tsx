// src/app/docs/pipeline/enquiries/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enquiries · Solar Arrow Docs',
  description:
    'Learn how the Enquiries page in Solar Arrow works — managing conversations after a lead shows interest and before survey or quotation.',
};

export default function EnquiriesPipelinePage() {
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
            Enquiries
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
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Enquiries</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  10
                </small>
              </div>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Survey</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
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
            <h1 className="text-2xl font-semibold tracking-tight">Enquiries page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Enquiries page tracks serious conversations after a lead has been contacted. This is
              where you decide whether to move forward to survey and quotation.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners, Admins, Sales
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Main card: what Enquiries shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you see on the Enquiries page</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Enquiries are leads that have moved beyond basic interest into active discussion,
                follow-up, and basic qualification.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Table with customer details, project type, and expected capacity.</li>
                <li>
                  Status such as &quot;New enquiry&quot;, &quot;Follow-up scheduled&quot;, or
                  &quot;Waiting for customer&quot;.
                </li>
                <li>Next-step hints, for example &quot;Move to Survey&quot; or &quot;Prepare quotation&quot;.</li>
              </ul>
            </article>

            {/* Right card: who can access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access Enquiries?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Access is similar to the Leads page, but may be restricted further depending on how
                your organization sets roles and permissions.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: see all enquiries across the organization.</li>
                <li>Admins: see enquiries for their branches and can reassign them.</li>
                <li>Sales: see enquiries assigned to them or their team.</li>
              </ul>
            </article>
          </section>

          {/* Second row: converting leads + next steps */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Converting leads to enquiries */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Converting a lead into an enquiry</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  from leads
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                When a lead becomes serious enough to discuss system size, budget, or site visit, it
                should be converted into an enquiry.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Open the lead in the Leads page</p>
                    <p className="text-slate-600">
                      Find the lead you&apos;ve been talking to and open its details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Use the &quot;Convert to enquiry&quot; action</p>
                    <p className="text-slate-600">
                      This creates a linked enquiry record and carries over key details like contact,
                      location, and notes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Add any missing information</p>
                    <p className="text-slate-600">
                      Fill in project type, approximate capacity, and any special customer
                      requirements.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Moving enquiries forward */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Moving an enquiry to Survey or Quotation</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  progress
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Once you have enough information and customer interest, the enquiry should move into
                survey or quotation.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>
                  If a site visit is needed, create or link a survey so the survey team can schedule
                  a visit.
                </li>
                <li>
                  For small standard systems where you already have enough details, you may move
                  directly toward quotation as per your internal process.
                </li>
                <li>
                  Close the enquiry as &quot;Not interested&quot; or &quot;On hold&quot; if the
                  customer is not ready to proceed.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}