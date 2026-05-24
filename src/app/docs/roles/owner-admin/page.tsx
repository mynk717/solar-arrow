import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Owner & Admin Dashboard · Solar Arrow Docs',
  description:
    'Understand the Owner and Admin dashboard in Solar Arrow — full visibility across all pipelines, reports, and settings.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/roles/owner-admin">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              Solar Arrow · Docs
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Owner &amp; Admin dashboard overview
            </h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              The Owner and Admin dashboard provides full visibility across all pipelines, helping
              you monitor every project stage, team workload, and key metrics in one place.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Audience: Owners &amp; Admins
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                Time to read: 4–6 minutes
              </span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Main card: what you see */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">What appears on this dashboard</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  layout
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                When you log in as an <code className="font-mono text-xs font-bold text-orange-600">owner</code> or <code className="font-mono text-xs font-bold text-orange-600">admin</code>, the dashboard shows a summary of all active
                projects and key stages in your solar pipeline.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Top cards with counts for leads, enquiries, surveys, and installations.</li>
                <li>Quick view of upcoming surveys or installations due.</li>
                <li>Shortcuts to important pages like Leads, Survey, Installation, and Reports.</li>
              </ul>
            </article>

            {/* Right card: who gets this view */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Who sees this dashboard?</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  access
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                The Owner and Admin dashboard is only available to users with the highest access
                levels in your organization.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs font-bold text-orange-600">owner</code>: can always see this dashboard, regardless of branch.</li>
                <li><code className="font-mono text-xs font-bold text-orange-600">admin</code>: sees this view for the branches they manage.</li>
                <li>Other roles: are redirected to their own role-specific dashboards instead.</li>
              </ul>
            </article>
          </section>
<section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            {/* Key actions */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Key actions from this page</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  actions
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                Use the Owner/Admin dashboard as your daily control center.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Open the Leads page to assign new enquiries to sales or survey teams.</li>
                <li>Jump to Survey to see pending site visits and update statuses.</li>
                <li>Review projects stuck at quotation, registration, or subsidy stages.</li>
              </ul>
              <p className="mt-2 text-[12px] text-slate-600">
                From here you can also access Settings, Users, and Branches to adjust how your team
                works in Solar Arrow.
              </p>
            </article>

            {/* Tips */}
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Tips for owners &amp; admins</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  best practices
                </span>
              </header>
              <p className="text-[13px] text-slate-600">
                A few habits make this dashboard much more powerful.
              </p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li>Check the dashboard at least once daily to spot bottlenecks early.</li>
                <li>
                  Keep user roles and branches up to date so counts and task lists stay accurate.
                </li>
                <li>
                  Use the Reports section regularly to track conversions from lead to installation
                  and subsidy.
                </li>
              </ul>
            </article>
          </section>
    </DocsLayout>
  );
}