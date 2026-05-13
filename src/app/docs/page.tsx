// src/app/docs/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Overview · Solar Arrow Docs',
  description:
    'High-level overview of Solar Arrow — what it does, who it is for, and how the solar pipeline flows from lead to subsidy.',
};

export default function DocsOverviewPage() {
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
            Overview
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
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Welcome &amp; Overview</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  01
                </small>
              </div>
              <a
                href="/docs/getting-started"
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70"
              >
                <span>Getting Started</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  02
                </small>
              </a>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Login &amp; Accounts</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  03
                </small>
              </div>
            </nav>
          </div>

          <div className="h-px bg-gradient-to-r from-slate-700/10 via-slate-500/40 to-slate-700/10" />

          <div>
            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Pipelines
            </div>
            <nav className="flex flex-col gap-1 text-[13px]">
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Leads</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  04
                </small>
              </div>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Enquiries</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  05
                </small>
              </div>
              <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-200 hover:bg-slate-800/70">
                <span>Survey</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  06
                </small>
              </div>
              {/* Continue later for all 27 labels */}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="max-w-5xl px-4 py-6 md:px-6">
          <section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Solar Arrow · Docs
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to Solar Arrow
            </h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              Solar Arrow is a solar business management platform for Indian vendors. It tracks every
              project from first lead to subsidy disbursement so your team always knows what to do
              next.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: All roles
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 3–4 minutes
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Best next: Getting Started
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* What Solar Arrow covers */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What Solar Arrow covers</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  end‑to‑end pipeline
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Use Solar Arrow to manage the full lifecycle of a rooftop solar project: from
                capturing leads, tracking enquiries and surveys, sending quotations, to installation,
                liaison, and subsidy tracking.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700">
                  Leads → Enquiries → Survey
                </span>
                <span className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700">
                  Quotation → Registration
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  Installation → Payments → Subsidy
                </span>
              </div>
            </article>

            {/* Who it is for */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who is Solar Arrow for?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  audience
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Solar Arrow is designed for solar vendors and installation companies working with
                rooftop solar projects in India, including CSPDCL empaneled vendors.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Solar companies managing multiple residential or commercial projects</li>
                <li>Teams that want a single view of all active systems and their current stage</li>
                <li>Owners who need visibility from lead to PM Surya Ghar subsidy claim</li>
              </ul>
            </article>
          </section>

          {/* Second row: roles + how to use docs */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Roles */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">How different roles use Solar Arrow</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  roles
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Each role sees a focused dashboard so team members work only on the pages they need.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owner &amp; Admin: full visibility across all pipelines and reports</li>
                <li>Sales: leads and enquiries</li>
                <li>Survey: scheduled site surveys and updates</li>
                <li>Installation: project installation tasks and status</li>
                <li>Accounts: quotations, payments, and subsidy documentation</li>
              </ul>
            </article>

            {/* How to use this guide */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">How to use this guide</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  navigation
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Use the sidebar to jump to the page that matches what you are doing right now in your
                workflow.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Start here if you are new</p>
                    <p className="text-slate-600">
                      Read this overview and then follow the Getting Started page to set up your
                      account and branches.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Jump to your role</p>
                    <p className="text-slate-600">
                      Use the role-specific pages (Owner, Admin, Sales, Survey, Installation,
                      Accounts) to see what you can do in Solar Arrow.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Follow the pipeline stages</p>
                    <p className="text-slate-600">
                      When working on a project, move through the pipeline pages in order: leads,
                      enquiries, survey, quotation, registration, installation, payments, and
                      subsidy.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}