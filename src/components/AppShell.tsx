// src/components/AppShell.tsx
'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import PWAInstaller from '@/components/PWAInstaller';
import TokenAutoRefresh from '@/components/TokenAutoRefresh';


// Exact paths — no sidebar/shell
const PUBLIC_EXACT = ['/', '/login', '/onboard', '/features', '/pricing', '/demo'];

// Prefix paths — no sidebar for these and all their sub-routes
const PUBLIC_PREFIXES = ['/q/', '/privacy', '/terms', '/unauthorized'];

// Paths that use app shell but hide the sidebar (full-width pages)
const NO_SIDEBAR_EXACT = ['/reports'];


export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublicPage =
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    const isNoSidebarPage = NO_SIDEBAR_EXACT.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (isNoSidebarPage) {
    return (
      <>
        <TokenAutoRefresh />
        <div className="flex flex-col min-h-screen bg-gray-50">
          <main className="flex-1 pb-16 sm:pb-0 overflow-x-hidden">{children}</main>
          <Footer />
          <BottomNav />
          <PWAInstaller />
        </div>
      </>
    );
  }

  return (
    <>
      <TokenAutoRefresh />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 pb-16 sm:pb-0 overflow-x-hidden">{children}</main>
        </div>
        <Footer />
        <BottomNav />
        <PWAInstaller />
      </div>
    </>
  );
}
