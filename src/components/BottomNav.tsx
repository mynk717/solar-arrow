'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard, FileText, IndianRupee, Settings, PhoneCall,
  ClipboardCheck, Wrench, Zap, CheckSquare, MoreHorizontal, X,Users, Package, Scale,
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMore, setShowMore] = useState(false);

  const role = session?.user?.role;
  const isAdminOrOwner =
    (session?.user as any)?.accountType === 'admin' ||
    (session?.user as any)?.accountType === 'owner' ||
    role === 'admin' || role === 'owner';

  const userCanView: string[] =
    (session?.user?.permissions as any)?.canView ?? [];

  const canSee = (path: string) =>
    isAdminOrOwner || userCanView.includes(path);

  const allTabs = [
    { key: 'home',     href: '/dashboard',    label: 'Home',    icon: LayoutDashboard, show: true },
    { key: 'leads',    href: '/leads',         label: 'Leads',   icon: PhoneCall,       show: canSee('/leads') },
    { key: 'enq',      href: '/enquiries',     label: 'ConEnq',  icon: FileText,        show: canSee('/enquiries') },
    { key: 'payments', href: '/payments',      label: 'Payment', icon: IndianRupee,     show: canSee('/payments') || canSee('/payment') },
    { key: 'survey',   href: '/survey',        label: 'Survey',  icon: ClipboardCheck,  show: canSee('/survey') },
    { key: 'quotation',href: '/quotation',     label: 'Quotation',icon: FileText,       show: canSee('/quotation') },
    { key: 'reg',      href: '/registration',  label: 'Reg',     icon: Scale,           show: canSee('/registration') },
    { key: 'bom',      href: '/bom',           label: 'BOM',     icon: Package,         show: canSee('/bom') },
    { key: 'install',  href: '/installation',  label: 'Install', icon: Wrench,          show: canSee('/installation') },
    { key: 'liaison',  href: '/liaison',       label: 'Liaison', icon: Zap,             show: canSee('/liaison') },
    { key: 'wcr',      href: '/wcr',           label: 'WCR',     icon: CheckSquare,     show: canSee('/wcr') },
    { key: 'subsidy',  href: '/subsidy',       label: 'Subsidy', icon: IndianRupee,     show: canSee('/subsidy') },
    // Admin-only
    { key: 'users',    href: '/admin/users',   label: 'Users',   icon: Users,           show: isAdminOrOwner },
    { key: 'settings', href: '/settings',      label: 'Settings',icon: Settings,        show: true },
  ].filter(t => t.show);


  const primaryTabs = allTabs.slice(0, 4);
  const moreTabs    = allTabs.slice(4);

  // Don't show on auth pages
  if (['/login', '/onboard', '/setup'].some(p => pathname?.startsWith(p))) return null;

  const totalCols = primaryTabs.length + (moreTabs.length > 0 ? 1 : 0);

  return (
    <>
            <nav
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}>
          {primaryTabs.map(tab => {
            const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                  isActive ? 'text-blue-600 scale-105' : 'text-gray-400'
                }`}  
              >
                                {isActive && (
                  <span className="absolute top-0 inset-x-1/4 h-0.5 rounded-full bg-blue-500"
                    style={{ boxShadow: '0 0 6px rgba(59,130,246,0.8)' }} />
                )}
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold leading-tight">{tab.label}</span>
              </Link>
            );
          })}

          {moreTabs.length > 0 && (
            <button
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center justify-center gap-0.5 text-gray-400"
            >
              <MoreHorizontal size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-semibold leading-tight">More</span>
            </button>
          )}
        </div>
      </nav>

      {/* More Sheet */}
      {showMore && (
        <div className="fixed inset-0 z-[60] sm:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMore(false)} />

          {/* Sheet */}
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-xl">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">More</span>
              <button onClick={() => setShowMore(false)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Menu items */}
            <div className="p-3 grid grid-cols-4 gap-2 pb-8">
              {moreTabs.map(tab => {
                const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
                return (
                  <button
                    key={tab.key}
                    onClick={() => { setShowMore(false); window.location.href = tab.href; }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                    <span className="text-[10px] font-semibold leading-tight text-center">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
