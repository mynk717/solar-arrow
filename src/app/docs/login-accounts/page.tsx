// src/app/docs/login-accounts/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login & Accounts · Solar Arrow Docs',
  description:
    'How to log in to Solar Arrow, understand account types, and fix common login issues.',
};

const DOCS_NAV = [
  { group: 'Overview', items: [
    { label: 'Welcome & Overview', href: '/docs', id: '01' },
    { label: 'Getting Started', href: '/docs/getting-started', id: '02' },
    { label: 'Login & Accounts', href: '/docs/login-accounts', id: '03', active: true },
  ]},
  { group: 'Pipelines', items: [
    { label: 'Leads', href: '/docs/pipeline/leads', id: '04' },
    { label: 'Enquiries', href: '/docs/pipeline/enquiries', id: '05' },
    { label: 'Survey', href: '/docs/pipeline/survey', id: '06' },
    { label: 'Quotation', href: '/docs/pipeline/quotation', id: '07' },
    { label: 'Registration', href: '/docs/pipeline/registration', id: '08' },
    { label: 'BOM & Dispatch', href: '/docs/pipeline/bom-dispatch', id: '09' },
    { label: 'Liaison', href: '/docs/pipeline/liaison', id: '10' },
    { label: 'Installation', href: '/docs/pipeline/installation', id: '11' },
    { label: 'Payments', href: '/docs/pipeline/payments', id: '12' },
    { label: 'Subsidy', href: '/docs/pipeline/subsidy', id: '13' },
  ]},
  { group: 'Roles', items: [
    { label: 'Owner & Admin', href: '/docs/roles/owner-admin', id: '14' },
    { label: 'Sales', href: '/docs/roles/sales', id: '15' },
    { label: 'Surveyor', href: '/docs/roles/survey', id: '16' },
    { label: 'Installation', href: '/docs/roles/installation', id: '17' },
    { label: 'Accounts', href: '/docs/roles/accounts', id: '18' },
  ]},
  { group: 'Integrations', items: [
    { label: 'Google Sheets', href: '/docs/integrations/google-sheets', id: '19' },
    { label: 'Redis & Telegram', href: '/docs/integrations/redis-telegram', id: '20' },
    { label: 'PWA Mobile', href: '/docs/integrations/pwa-mobile', id: '21' },
    { label: 'Google OAuth', href: '/docs/integrations/google-oauth', id: '22' },
  ]},
  { group: 'Analytics', items: [
    { label: 'Reports', href: '/docs/analytics/reports', id: '23' },
  ]},
  { group: 'Settings', items: [
    { label: 'Organization & Branches', href: '/docs/settings/organization-branches', id: '24' },
    { label: 'Users & Permissions', href: '/docs/settings/users-permissions', id: '25' },
  ]},
  { group: 'Pricing', items: [
    { label: 'Pricing Demo', href: '/docs/pricing-demo', id: '26' },
  ]},
  { group: 'FAQ', items: [
    { label: 'FAQ', href: '/docs/faq', id: '27' },
  ]},
];

export default function LoginAccountsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed,#f5f5f7)] text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[conic-gradient(from_210deg,#ffedd5,#fed7aa,#fb923c,#f97316,#ffedd5)] shadow-md shadow-orange-500/40">
            <span className="text-xs font-extrabold text-white">SA</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight">Solar Arrow</span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              User guide
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-600">
            Login &amp; Accounts
          </span>
          <span>v1.0 · 27 pages</span>
        </div>
      </header>

      {/* Layout */}
      <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 md:grid-cols-[260px,minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden border-r border-slate-900/60 bg-slate-950 px-3 py-4 text-slate-100 md:flex md:flex-col md:gap-4 overflow-y-auto max-h-[calc(100vh-56px)]">
          {DOCS_NAV.map((group) => (
            <div key={group.group}>
              <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                {group.group}
              </div>
              <nav className="flex flex-col gap-1 text-[13px]">
                {group.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 transition-all ${
                      item.active
                        ? 'bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 text-slate-50 shadow-sm shadow-black/40'
                        : 'text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <span>{item.label}</span>
                    <small className={`text-[10px] uppercase tracking-[0.14em] ${item.active ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.id}
                    </small>
                  </a>
                ))}
              </nav>
              <div className="my-3 h-px bg-gradient-to-r from-slate-700/10 via-slate-500/40 to-slate-700/10" />
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="max-w-5xl px-4 py-6 md:px-6">
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
                      Visit your team&apos;s Solar Arrow URL (for example, sa.mktgdime.com/login) in
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

          {/* Second row: roles + common issues */}
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
                If the login page shows an &quot;unauthorized&quot; or &quot;no access&quot; message
                after signing in, contact your owner or admin so they can check your role and page
                permissions.
              </p>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
