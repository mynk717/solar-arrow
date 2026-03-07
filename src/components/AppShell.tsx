// src/components/AppShell.tsx
'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import PWAInstaller from '@/components/PWAInstaller';

// Exact paths — no sidebar/shell
const PUBLIC_EXACT = ['/', '/login', '/onboard'];

// Prefix paths — no sidebar for these and all their sub-routes
const PUBLIC_PREFIXES = ['/q/', '/privacy', '/terms', '/unauthorized'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublicPage =
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      </div>
      <Footer />
      <BottomNav />
      <PWAInstaller />
    </div>
  );
}
