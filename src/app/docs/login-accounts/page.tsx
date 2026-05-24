import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Login & Accounts · Solar Arrow Docs',
  description:
    'How to log in to Solar Arrow, understand account types, and fix common login issues.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/login-accounts">
<section className="mb-6 flex flex-col gap-2">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
          Solar Arrow · Docs
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Login &amp; account basics</h1>
        <p className="max-w-2xl text-[13px] text-slate-600">
          Learn how to access Solar Arrow, what each account type can see, and how to fix the
          most common login problems.
        </p>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
            Audience: All users
          </span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
            Time to read: 4–6 minutes
          </span>
        </div>
      </section>
<section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
        {/* Left card: how to log in */}
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">How to log in</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              login flow
            </span>
          </header>
          <p className="text-[13px] text-slate-600">
            Solar Arrow is a web-based application. Your admin or owner shares the login URL and
            your account details with you.
          </p>
          <div className="mt-3 flex flex-col gap-2 text-[12px]">
            <div className="flex items-start gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                1
              </div>
              <div>
                <p className="font-medium text-slate-800">Open the login page</p>
                <p className="text-slate-600">
                  Visit your team's Solar Arrow URL (for example, sa.mktgdime.com/login) in
                  Chrome or any modern browser.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                2
              </div>
              <div>
                <p className="font-medium text-slate-800">Enter your credentials</p>
                <p className="text-slate-600">
                  Use the email and password provided by your admin, or sign in with Google if
                  your organization uses Google login.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[11px] font-semibold text-orange-600">
                3
              </div>
              <div>
                <p className="font-medium text-slate-800">You are redirected to your dashboard</p>
                <p className="text-slate-600">
                  After a successful login, Solar Arrow sends you to the dashboard that matches
                  your role and permissions.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Right card: account types */}
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Account types</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              access levels
            </span>
          </header>
          <p className="text-[13px] text-slate-600">
            Every user in Solar Arrow has an account type that controls how much of the system
            they can see and manage.
          </p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <li>
              <strong className="font-semibold">owner</strong>: full control, can see all pages,
              manage settings, users, and billing.
            </li>
            <li>
              <strong className="font-semibold">admin</strong>: manages day-to-day operations,
              users, and branches, with access to almost all pages.
            </li>
            <li>
              <strong className="font-semibold">user</strong>: focused access based on role
              (sales, surveyor, installation, accounts).
            </li>
          </ul>
          <p className="mt-2 text-[12px] text-slate-600">
            Your exact dashboard and side menu depend on both your account type and role
            assignment.
          </p>
        </article>
      </section>
<section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.1fr),minmax(0,1.4fr)]">
        {/* Roles vs permissions */}
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Role vs account type</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              access model
            </span>
          </header>
          <p className="text-[13px] text-slate-600">
            In addition to account type, each user also has a role that maps to their daily work
            in the solar pipeline.
          </p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <li>Sales: can work on leads and prospects.</li>
            <li>Surveyor: sees surveys assigned to them and related details.</li>
            <li>Installation: focuses on installation tasks and status.</li>
            <li>Accounts: manages quotations, payments, and subsidy paperwork.</li>
          </ul>
          <p className="mt-2 text-[12px] text-slate-600">
            Owners and admins override these limits and can see everything, while other users are
            restricted to the pages and tasks assigned to them.
          </p>
        </article>

        {/* Common login issues */}
        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">Common login issues</h2>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              troubleshooting
            </span>
          </header>
          <p className="text-[13px] text-slate-600">
            If you cannot log in, check these common issues before contacting support.
          </p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            <li>
              Make sure you are on the correct Solar Arrow URL shared by your organization, not a
              bookmarked test link.
            </li>
            <li>
              Confirm that your account is active and that you have the correct email and
              password.
            </li>
            <li>
              If using Google login, ensure you are signed into the right Google account in your
              browser.
            </li>
          </ul>
          <p className="mt-2 text-[12px] text-slate-600">
            If the login page shows an "unauthorized" or "no access" message
            after signing in, contact your owner or admin so they can check your role and page
            permissions.
          </p>
        </article>
      </section>
    </DocsLayout>
  );
}