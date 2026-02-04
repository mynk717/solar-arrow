// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardCheck,
  FileCheck,
  DollarSign,
  Package,
  Truck,
  Wrench,
  Scale,
  CheckSquare,
  IndianRupee,
  Settings,
  Menu,
  X,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Enquiries', href: '/enquiries', icon: FileText },
  { name: 'Survey', href: '/survey', icon: ClipboardCheck },
  { name: 'Quotation', href: '/quotation', icon: FileCheck },
  { name: 'Registration', href: '/registration', icon: Scale },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'BOM', href: '/bom', icon: Package },
  { name: 'Dispatch', href: '/dispatch', icon: Truck },
  { name: 'Installation', href: '/installation', icon: Wrench },
  { name: 'Liaison', href: '/liaison', icon: Scale },
  { name: 'WCR', href: '/wcr', icon: CheckSquare },
  { name: 'Subsidy', href: '/subsidy', icon: IndianRupee },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Don't show sidebar on login/onboard/setup pages
  if (['/login', '/onboard', '/setup'].includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header with Logo - Clickable */}
        <Link href="/" className="block">
          <div className="p-6 sticky top-0 bg-blue-600 z-10 hover:bg-blue-700 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="bg-blue-500 rounded-lg w-12 h-12 p-2 flex items-center justify-center">
                <img 
                  src="/SA_logo.png" 
                  alt="Solar Arrow Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Solar Arrow</h1>
                <p className="text-blue-200 text-xs mt-0.5">CSPDCL Dashboard</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="pb-20">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-700 border-l-4 border-white'
                    : 'hover:bg-blue-700/50'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}

          {/* Admin-only Project Tracker Link */}
          {session?.user?.role === 'admin' || session?.user?.role === 'owner' ? (
            <Link
              href="/admin/tracker"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 transition-colors border-t border-blue-500 mt-2 ${
                pathname === '/admin/tracker'
                  ? 'bg-blue-700 border-l-4 border-white'
                  : 'hover:bg-blue-700/50'
              }`}
            >
              <TrendingUp size={20} />
              <span className="text-sm">Project Tracker</span>
              <span className="ml-auto bg-yellow-500 text-blue-900 text-xs px-2 py-0.5 rounded-full font-semibold">
                Admin
              </span>
            </Link>
          ) : null}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-blue-900/50 backdrop-blur">
          <p className="text-xs text-blue-200">© 2026 Solar Arrow</p>
          <p className="text-xs text-blue-300 mt-1">v1.0.0</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
