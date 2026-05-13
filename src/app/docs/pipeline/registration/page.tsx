// src/app/docs/pipeline/registration/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registration · Solar Arrow Docs',
  description:
    'Learn how the Registration page in Solar Arrow works — confirming approved quotations and registering projects before installation.',
};

export default function RegistrationPipelinePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed,#fed7aa)] text-slate-900">
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
            Registration
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
              <a
                href="/docs/pipeline/survey"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Survey</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  11
                </small>
              </a>
              <a
                href="/docs/pipeline/quotation"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Quotation</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  12
                </small>
              </a>
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Registration</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  13
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
            <h1 className="text-2xl font-semibold tracking-tight">Registration page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Registration page records approved projects that are officially moving ahead. It
              connects quotation approval to internal and DISCOM-facing registration steps.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners, Admins, Accounts
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Main card: what Registration shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you see on the Registration page</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Each row represents a project that has moved beyond quotation and is now in official
                registration with the customer and utility.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Customer and project details (capacity, category, branch).</li>
                <li>Registration number / application ID, if applicable.</li>
                <li>Status such as &quot;Documents pending&quot;, &quot;Submitted&quot;, &quot;Approved&quot;.</li>
              </ul>
            </article>

            {/* Right card: who can access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access Registration?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Registration is usually handled by owners, admins, or accounts staff who deal with
                formal applications and paperwork.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: see all registered projects and their statuses.</li>
                <li>Admins: manage registrations for their branches.</li>
                <li>Accounts / Liaison roles: update statuses as documents move through approval.</li>
              </ul>
            </article>
          </section>

          {/* Second row: creating & updating registrations */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Creating a registration from quotation */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Creating a registration from a quotation</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  from quotation
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                After a customer approves a quotation, the project should be registered so that
                installation and liaison work can start.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Open the approved quotation</p>
                    <p className="text-slate-600">
                      Start from the quotation that the customer has accepted so details stay linked.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Use the &quot;Create registration&quot; or similar action
                    </p>
                    <p className="text-slate-600">
                      Fill in registration-specific fields like application number, DISCOM category,
                      and requested load.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Save and track status</p>
                    <p className="text-slate-600">
                      Mark the initial status (for example, &quot;Documents pending&quot;) to show
                      the team what remains.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Updating registration progress */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Updating registration progress</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  progress
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                As documents are submitted and approvals come in, update the registration so everyone
                knows where the project stands.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Record when documents are collected from the customer and submitted to DISCOM.</li>
                <li>
                  Update status to &quot;Submitted&quot; and later &quot;Approved&quot; when
                  confirmation is received.
                </li>
                <li>
                  Add notes for any re-submission or clarification requested by authorities so future
                  follow-ups are easier.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}