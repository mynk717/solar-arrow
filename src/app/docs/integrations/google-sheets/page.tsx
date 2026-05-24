import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google Sheets Integration · Solar Arrow Docs',
  description:
    'Learn how Solar Arrow synchronizes with Google Sheets for real-time data backup and external reporting.',
};

export default function Page() {
  return (
    <><section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Google Sheets integration</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              Solar Arrow uses Google Sheets as a powerful, real-time backend and backup tool. Every change in the app is mirrored to your chosen sheet.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Admins, Owners</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 5–7 minutes</span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">How sync works</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">mechanism</span>
              </header>
              <p className="text-[13px] text-slate-600">The app connects via the <code className="font-mono text-xs">Google Sheets API</code> using service account credentials.</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">One-way sync:</strong> App → Sheet (Default).</li>
                <li><strong className="text-slate-900">Real-time:</strong> Updates happen instantly when a form is saved.</li>
                <li><strong className="text-slate-900">Mapping:</strong> Field names in the app match column headers in the sheet exactly.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Setup</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">config</span>
              </header>
              <p className="text-[13px] text-slate-600">To enable sync, go to Settings and provide:</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><code className="font-mono text-xs">spreadsheetId</code>: Found in the Google Sheet URL.</li>
                <li><code className="font-mono text-xs">sheetName</code>: (e.g., "Leads" or "Enquiries").</li>
              </ul>
            </article>
          </section>

          <section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Benefits</h2>
            <p className="text-[13px] text-slate-600">Using Google Sheets allows you to use external tools like PowerBI, Looker Studio, or simple Excel formulas to create custom reports outside of Solar Arrow.</p>
          </section>
  );
}

