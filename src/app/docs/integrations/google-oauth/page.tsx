import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Google OAuth Integration · Solar Arrow Docs',
  description:
    'Learn how Solar Arrow handles secure user authentication via Google OAuth 2.0.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/integrations/google-oauth">
<section className="mb-6 flex flex-col gap-2">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
        <h1 className="text-2xl font-semibold tracking-tight">Google OAuth 2.0 security</h1>
        <p className="max-w-2xl text-[13px] text-slate-600">
          Solar Arrow uses Google OAuth 2.0 to provide a seamless and secure login experience for your team.
        </p>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: All Users</span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 3–5 minutes</span>
        </div>
      </section>
<section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">How it works</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">auth</span>
          </header>
          <p className="text-[13px] text-slate-600">Instead of a separate password, the app validates your identity through your Google account.</p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <li><strong className="text-slate-900">One-click login:</strong> No need to remember new passwords.</li>
            <li><strong className="text-slate-900">Verified Email:</strong> Uses <code className="font-mono text-xs">next-auth</code> to confirm the user email exists in your team's allowed list.</li>
            <li><strong className="text-slate-900">Avatar Sync:</strong> Pulls your Google profile picture for the dashboard.</li>
          </ul>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Admin Controls</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">security</span>
          </header>
          <p className="text-[13px] text-slate-600">Admins must still add the user's email to Solar Arrow before they can log in.</p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <li><strong className="text-slate-900">Allow-list:</strong> Only emails added in <code className="font-mono text-xs">/settings/users</code> can access the system.</li>
            <li><strong className="text-slate-900">Revoke Access:</strong> Deleting a user in the app prevents them from logging in, even with a valid Google account.</li>
          </ul>
        </article>
      </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
        <h2 className="text-sm font-semibold mb-2">Technical Setup</h2>
        <p className="text-[13px] text-slate-600">The integration requires <code className="font-mono text-xs">GOOGLE_CLIENT_ID</code> and <code className="font-mono text-xs">GOOGLE_CLIENT_SECRET</code> to be configured in the Cloud Console and the app's environment file.</p>
      </section>
    </DocsLayout>
  );
}