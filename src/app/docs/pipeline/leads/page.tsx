// src/app/docs/pipeline/leads/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leads · Solar Arrow Docs',
  description:
    'Learn how the Leads page in Solar Arrow works — capturing new opportunities and preparing them for enquiries and surveys.',
};

export default function LeadsPipelinePage() {
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
            Leads
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
              Overview
            </div>
            <nav className="flex flex-col gap-1 text-[13px]">
              <a
                href="/docs"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Welcome &amp; Overview</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  01
                </small>
              </a>
              <a
                href="/docs/getting-started"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Getting Started</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  02
                </small>
              </a>
            </nav>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-700/10 via-slate-500/40 to-slate-700/10" />

          <div>
            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Pipelines
            </div>
            <nav className="flex flex-col gap-1 text-[13px]">
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Leads</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  09
                </small>
              </div>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Enquiries</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
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
            <h1 className="text-2xl font-semibold tracking-tight">Leads page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Leads page is the entry point of your solar pipeline. Every new opportunity starts
              here before it becomes an enquiry, survey, and eventually an installation.
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
            {/* Main card: what the Leads page shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you see on the Leads page</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                The Leads list shows all potential customers who have shown interest in solar but
                have not yet reached the survey or quotation stage.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Lead table with customer name, contact, location, and source.</li>
                <li>Status column so you can see new, in-contact, or closed leads.</li>
                <li>Actions to edit, update status, or convert a lead into an enquiry.</li>
              </ul>
            </article>

            {/* Right card: who can access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access Leads?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Access depends on your account type and role. Owners and admins generally see all
                leads, while sales users see only leads assigned to them or their branch.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: see all leads across all branches.</li>
                <li>Admins: see leads for their branches, with permission to reassign and update.</li>
                <li>Sales: see leads they are responsible for, as configured by the admin.</li>
              </ul>
            </article>
          </section>

          {/* Second row: adding new leads + next steps */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Adding new leads */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Adding a new lead</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  create
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                You can add leads manually when you receive calls, walk-ins, or WhatsApp enquiries
                from customers.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Click &quot;Add Lead&quot;</p>
                    <p className="text-slate-600">
                      Open the new lead form from the top-right button on the Leads page.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Fill in basic details</p>
                    <p className="text-slate-600">
                      Enter customer name, phone number, location, and where the lead came from
                      (walk-in, reference, social media, etc.).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Assign to a branch or sales user</p>
                    <p className="text-slate-600">
                      Choose the responsible branch and sales person so the right team can follow up.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Moving leads forward */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Moving a lead to the next stage</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  progress
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Once a customer is interested and basic discussion is complete, the lead should move
                forward in the pipeline.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>
                  Update the lead status to reflect progress (for example, &quot;Interested&quot; or
                  &quot;Survey requested&quot;).
                </li>
                <li>
                  Convert the lead to an enquiry or create a survey request so the technical team can
                  visit the site.
                </li>
                <li>
                  Close the lead as &quot;Lost&quot; if the customer is not proceeding, to keep
                  counts accurate.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}