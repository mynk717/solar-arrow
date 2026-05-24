import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Demo · Solar Arrow Docs',
  description:
    'Information about Solar Arrow pricing models, demo access, and enterprise customization.',
};

export default function Page() {
  return (
    <><section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Pricing &amp; plans</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              Solar Arrow is available as a managed service for solar vendors. We offer flexible plans based on your monthly project volume.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Potential Customers</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 3–5 minutes</span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Standard Plan</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">small teams</span>
              </header>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">Up to 10 users:</strong> Perfect for single-branch offices.</li>
                <li><strong className="text-slate-900">Full Pipeline:</strong> From Lead to Subsidy tracking.</li>
                <li><strong className="text-slate-900">Google Sheets Backup:</strong> Included.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Enterprise Plan</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">growth</span>
              </header>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">Unlimited Users:</strong> For companies with many branches.</li>
                <li><strong className="text-slate-900">Telegram Bot:</strong> Real-time alerts for the whole team.</li>
                <li><strong className="text-slate-900">Custom Reports:</strong> Built specifically for your workflows.</li>
              </ul>
            </article>
          </section>

          <section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Request a Demo</h2>
            <p className="text-[13px] text-slate-600">Want to see Solar Arrow in action with your real data? Contact our team for a 1:1 walkthrough and a 14-day free trial.</p>
            <div className="mt-4">
              <a href="mailto:hello@mktgdime.com" className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-700 active:scale-95">Contact Sales</a>
            </div>
          </section>
  );
}

