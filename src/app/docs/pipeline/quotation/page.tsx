// src/app/docs/pipeline/quotation/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quotation · Solar Arrow Docs',
  description:
    'Learn how the Quotation page in Solar Arrow works — preparing, sharing, and tracking solar quotations linked to surveys and enquiries.',
};

export default function QuotationPipelinePage() {
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
            Quotation
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
              <div className="flex items-center justify-between rounded-md bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 px-2 py-1.5 text-slate-50 shadow-sm shadow-black/40">
                <span>Quotation</span>
                <small className="text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  12
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
            <h1 className="text-2xl font-semibold tracking-tight">Quotation page</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Quotation page holds all proposals sent to customers, linked to their surveys and
              enquiries. It helps you track offered prices, versions, and customer decisions.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners, Admins, Accounts, Sales
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Main card: what Quotation shows */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you see on the Quotation page</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Each row on the Quotation page represents a quote shared with a customer for a
                specific system size and configuration.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Customer and project details (name, address, capacity, type).</li>
                <li>Quoted amount, taxes, and basic commercial terms.</li>
                <li>Status such as &quot;Draft&quot;, &quot;Sent&quot;, &quot;Approved&quot;, or &quot;Rejected&quot;.</li>
              </ul>
            </article>

            {/* Right card: who can access */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who can access Quotation?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Quotation access is typically limited to owners, admins, and accounts or sales users
                who handle pricing.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Owners: see all quotations and their status.</li>
                <li>Admins: see quotations for their branches and can edit or resend them.</li>
                <li>Accounts / Sales: see and manage quotations assigned to them or their team.</li>
              </ul>
            </article>
          </section>

          {/* Second row: creating & sharing quotations */}
          <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Creating a quotation */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Creating a quotation</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  create
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Quotations are usually created after the survey is complete so that design and pricing
                are based on accurate roof data.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Open the linked enquiry or survey</p>
                    <p className="text-slate-600">
                      Start from the enquiry or survey that corresponds to this project so key
                      details carry over.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      Use the &quot;Create quotation&quot; or similar action
                    </p>
                    <p className="text-slate-600">
                      Fill in system size, price per kW, any discounts, and payment terms.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Save as draft or mark ready to send</p>
                    <p className="text-slate-600">
                      Keep drafts internal until they are checked by the owner or admin; then mark
                      them as ready to share with the customer.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Sharing and approvals */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Sharing quotations and tracking approvals</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  sharing
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Once a quotation is ready, it needs to reach the customer in a clear, professional
                format and be tracked until approval or rejection.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>
                  Generate a shareable quotation link or PDF as per your Solar Arrow setup and send
                  it via WhatsApp, email, or SMS.
                </li>
                <li>
                  Update the status to &quot;Sent&quot; once the customer has received the proposal.
                </li>
                <li>
                  When the customer agrees, mark the quotation as &quot;Approved&quot; so the
                  project can move forward to registration and installation.
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}