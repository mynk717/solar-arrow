import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Getting Started · Solar Arrow Docs',
  description:
    'Step-by-step guide to get your solar business live on Solar Arrow — from first login to creating your first lead.',
};



export default function Page() {
  return (
    <DocsLayout currentPath="/docs/getting-started">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Solar Arrow · Docs
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Getting started with Solar Arrow
            </h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              This guide walks a new solar vendor from first login to creating their first lead,
              setting up branches, and inviting team members by role.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners &amp; Admins
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 5–7 minutes
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Prerequisite: Demo access or active account
              </span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Left card: main steps */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Step 1 — Log in to Solar Arrow</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  authentication
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Open the Solar Arrow login page in your browser. Use the demo credentials shared with
                you or your organization&apos;s Google account, depending on how your access was set
                up.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Go to the login URL</p>
                    <p className="text-slate-600">
                      Visit the official Solar Arrow link your team uses (for example,
                      sa.mktgdime.com/login).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Sign in with your account</p>
                    <p className="text-slate-600">
                      Use the credentials provided by your admin. Owners and admins should log in
                      first to complete organization setup before inviting other users.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Right card: prerequisites */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What you need before you start</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  checklist
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Before you configure Solar Arrow for your business, keep these details handy.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Basic organization details (name, GST, primary contact)</li>
                <li>Branch locations you operate in (city / area names)</li>
                <li>List of team members and their roles (owner, admin, sales, surveyor, installation, accounts)</li>
                <li>Access to your Google account used for Sheets (if your setup uses Google Sheets as backend)</li>
              </ul>
            </article>
          </section>
<section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Step 2 — Set up organization &amp; branches</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  admin setup
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                After logging in as owner or admin, complete your organization profile and add any
                branches you operate from.
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[12px]">
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Fill organization details</p>
                    <p className="text-slate-600">
                      Add your official business name, contact number, and address so they appear on
                      quotations and internal reports.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Create branches</p>
                    <p className="text-slate-600">
                      Add each city or office you operate from. Later, users can be linked to
                      specific branches and see only relevant leads.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Step 3 — Invite your team</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  roles &amp; access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Once the base setup is ready, add users for each function in your solar pipeline.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Sales: manage leads and prospects</li>
                <li>Surveyor: handle on-site survey tasks and updates</li>
                <li>Installation: track installation progress and WCR</li>
                <li>Accounts: manage quotations, payments, and subsidy paperwork</li>
              </ul>
              <p className="mt-2 text-[12px] text-slate-600">
                Owners and admins can see everything. Other roles only see the pages and tasks
                assigned to them.
              </p>
            </article>
          </section>
    </DocsLayout>
  );
}
