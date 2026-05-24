import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PWA & Mobile Use · Solar Arrow Docs',
  description:
    'How to use Solar Arrow as a Progressive Web App on Android and iOS for field surveys and installation tracking.',
};

export default function Page() {
  return (
    <><section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Mobile use &amp; PWA</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              Solar Arrow is built to be used on the go. While it works in any browser, installing it as a Progressive Web App (PWA) provides the best field experience.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Field Staff</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 3–5 minutes</span>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">How to install</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">setup</span>
              </header>
              <div className="mt-3 space-y-3 text-[12px] text-slate-700">
                <div>
                  <p className="font-bold text-slate-900">Android (Chrome):</p>
                  <p className="text-slate-600">Tap the three dots (⋮) and select "Install App" or "Add to Home Screen".</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">iOS (Safari):</p>
                  <p className="text-slate-600">Tap the Share icon (↑) and select "Add to Home Screen".</p>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Field Features</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">usage</span>
              </header>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">Quick Upload:</strong> Take site photos directly from the app.</li>
                <li><strong className="text-slate-900">Push Updates:</strong> Receive alerts even when the browser is closed.</li>
                <li><strong className="text-slate-900">Standalone:</strong> Runs in a clean, full-screen mode without address bars.</li>
              </ul>
            </article>
          </section>

          <section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Offline Capability</h2>
            <p className="text-[13px] text-slate-600">The PWA caches core assets so the app loads instantly even on weak 3G/4G connections commonly found on rooftops. However, a live connection is still required to save data to the cloud.</p>
          </section>
  );
}

