import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Redis & Telegram Integration · Solar Arrow Docs',
  description:
    'Learn how Solar Arrow uses Redis for caching and Telegram for real-time team notifications.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/integrations/redis-telegram">
<section className="mb-6 flex flex-col gap-2">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
        <h1 className="text-2xl font-semibold tracking-tight">Redis &amp; Telegram integrations</h1>
        <p className="max-w-2xl text-[13px] text-slate-600">
          Solar Arrow leverages Redis for high-performance data handling and Telegram for instant team alerts on lead conversion and status changes.
        </p>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Admins, DevOps</span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 4–6 minutes</span>
        </div>
      </section>
<section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Redis Caching</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">performance</span>
          </header>
          <p className="text-[13px] text-slate-600">Redis acts as an intermediary for Google Sheets data to ensure the app feels snappy even with large datasets.</p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <li><strong className="text-slate-900">Session Store:</strong> Manages secure user sessions.</li>
            <li><strong className="text-slate-900">Rate Limiting:</strong> Protects APIs from abuse.</li>
            <li><strong className="text-slate-900">Metadata Cache:</strong> Stores branch and role lists for instant loading.</li>
          </ul>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Telegram Alerts</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">notifications</span>
          </header>
          <p className="text-[13px] text-slate-600">The app sends automated messages to your team's Telegram groups via a dedicated Bot.</p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <li><strong className="text-slate-900">New Lead:</strong> Instant alert when a lead is captured.</li>
            <li><strong className="text-slate-900">Conversion:</strong> Notifies admins when a lead becomes an enquiry.</li>
            <li><strong className="text-slate-900">Survey Done:</strong> Alerts the accounts team to prepare a quote.</li>
          </ul>
        </article>
      </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
        <h2 className="text-sm font-semibold mb-2">Configuration</h2>
        <p className="text-[13px] text-slate-600">To enable these, the following environment variables are required in your backend:</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 text-[11px]">
          <div className="bg-slate-900 p-2 rounded-md font-mono text-slate-300">UPSTASH_REDIS_REST_URL=...</div>
          <div className="bg-slate-900 p-2 rounded-md font-mono text-slate-300">TELEGRAM_BOT_TOKEN=...</div>
        </div>
      </section>
    </DocsLayout>
  );
}