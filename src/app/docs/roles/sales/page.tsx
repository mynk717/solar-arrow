import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sales Dashboard · Solar Arrow Docs',
  description:
    'Guide for Sales users in Solar Arrow — managing leads, prospects, and converting them to enquiries.',
};

export default function Page() {
  return (
    <><section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Sales dashboard &amp; workflow</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              As a Sales user, your primary goal is to manage incoming leads, track follow-ups with prospects, and convert them into qualified enquiries.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Sales Team</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Managing Leads</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">workflow</span>
              </header>
              <p className="text-[13px] text-slate-600">The Sales view focuses on the <code className="font-mono text-xs font-bold text-orange-600">/leads</code> and <code className="font-mono text-xs font-bold text-orange-600">/prospects</code> pages.</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="font-semibold text-slate-900">Lead Statuses:</strong> Track leads from <code className="font-mono text-xs text-blue-600 font-bold">new</code>, <code className="font-mono text-xs text-blue-600 font-bold">assigned</code>, to <code className="font-mono text-xs text-blue-600 font-bold">contacted</code>.</li>
                <li><strong className="font-semibold text-slate-900">Follow-ups:</strong> Record call outcomes like <code className="font-mono text-xs text-blue-600 font-bold">interested</code>, <code className="font-mono text-xs text-blue-600 font-bold">callback</code>, or <code className="font-mono text-xs text-blue-600 font-bold">not-interested</code>.</li>
                <li><strong className="font-semibold text-slate-900">Qualification:</strong> Mark leads as <code className="font-mono text-xs text-blue-600 font-bold">qualified</code> once they show genuine purchase intent.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Permissions</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">access</span>
              </header>
              <p className="text-[13px] text-slate-600">Users with the <code className="font-mono text-xs font-bold text-orange-600">sales</code> role have the following defaults:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">View:</strong> Leads, Prospects, Enquiries, Kanban, and Dashboard.</li>
                <li><strong className="text-slate-900">Edit:</strong> Leads and Prospects only.</li>
                <li><strong className="text-slate-900">Delete:</strong> Restricted to Owners/Admins.</li>
              </ul>
            </article>
          </section>

          <section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Conversion to Enquiry</h2>
            <p className="text-[13px] text-slate-600">Once a lead is ready for a site survey or quotation, you must convert it to an Enquiry.</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2 text-[12px]">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">1. Fill key details</p>
                <p className="text-slate-600">Ensure the customer name, phone, area, and estimated capacity are accurate.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 mb-1">2. Hit Convert</p>
                <p className="text-slate-600">The lead status changes to <code className="font-mono text-xs text-green-600 font-bold">converted</code> and a new record appears in the main Enquiries pipeline.</p>
              </div>
            </div>
          </section>
  );
}

