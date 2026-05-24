// src/components/DocsLayout.tsx
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  id: string;
  active?: boolean;
}

const DOCS_NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Overview', items: [
    { label: 'Welcome & Overview', href: '/docs', id: '01' },
    { label: 'Getting Started', href: '/docs/getting-started', id: '02' },
    { label: 'Login & Accounts', href: '/docs/login-accounts', id: '03' },
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

export default function DocsLayout({ children, currentPath }: { children: React.ReactNode, currentPath: string }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fff7ed,#f5f5f7)] text-slate-900 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-slate-900/10 bg-slate-950 text-slate-100 overflow-y-auto h-screen sticky top-0 px-3 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-6 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[conic-gradient(from_210deg,#ffedd5,#fed7aa,#fb923c,#f97316,#ffedd5)]">
              <span className="text-xs font-extrabold text-white">SA</span>
            </div>
            <span className="text-lg font-bold">Solar Arrow</span>
        </div>
        {DOCS_NAV.map((group) => (
          <div key={group.group} className="mb-4">
            <div className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-500 px-2">{group.group}</div>
            <nav className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 transition-all text-[13px] ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500/20 via-orange-500/25 to-orange-500/25 text-slate-50 shadow-sm'
                        : 'text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <span>{item.label}</span>
                    <small className={`text-[10px] uppercase tracking-[0.14em] ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{item.id}</small>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </aside>
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
