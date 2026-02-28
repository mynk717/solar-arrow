'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard, FileText, Kanban, IndianRupee, Settings, PhoneCall
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role;
  const isAdminOrOwner =
    (session?.user as any)?.accountType === 'admin' ||
    (session?.user as any)?.accountType === 'owner' ||
    role === 'admin' || role === 'owner';

  const userCanView: string[] =
    (session?.user?.permissions as any)?.canView ?? [];

  const canSee = (path: string) =>
    isAdminOrOwner || userCanView.includes(path);

  const tabs = [
    { href: '/dashboard',  label: 'Home',     icon: LayoutDashboard, show: true },
    { href: '/leads',      label: 'Leads',    icon: PhoneCall,       show: canSee('/leads') },
    { href: '/enquiries',  label: 'ConEnq',   icon: FileText,        show: canSee('/enquiries') },
    { href: '/kanban',     label: 'Kanban',   icon: Kanban,          show: true },
    { href: '/payments',   label: 'Payments', icon: IndianRupee,     show: canSee('/payments') || canSee('/payment') },
    { href: '/settings',   label: 'Settings', icon: Settings,        show: true },
  ].filter(t => t.show).slice(0, 5); // max 5 tabs

  // Don't show on auth pages
  if (['/login', '/onboard', '/setup'].some(p => pathname?.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className={`grid h-16`} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map(tab => {
          const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-semibold leading-tight ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
