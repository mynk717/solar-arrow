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
            </article>
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
            </article>
          </section>
    </DocsLayout>
  );
}