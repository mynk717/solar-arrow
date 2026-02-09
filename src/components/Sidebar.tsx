// src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  TrendingUp,
  Kanban,
  Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Kanban', href: '/kanban', icon: Kanban },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'ConEnq', href: '/enquiries', icon: FileText },
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

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < 10) {
          // Always show at top
          setShowHeader(true);
        } else if (currentScrollY > lastScrollY) {
          // Scrolling down - hide
          setShowHeader(false);
        } else {
          // Scrolling up - show
          setShowHeader(true);
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);
      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [lastScrollY]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Don't show sidebar on login/onboard/setup pages
  if (['/login', '/onboard', '/setup'].includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Mobile Header - Fixed Top Bar with scroll hide/show */}
<div className={`
  lg:hidden fixed left-0 right-0 bg-white border-b border-gray-200 
  px-4 py-3 flex items-center justify-between z-50 shadow-sm
  transition-transform duration-300 ease-in-out
  ${showHeader ? 'top-0 translate-y-0' : '-top-20 -translate-y-full'}
`}>
        {/* Logo/Title on Left */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <img src="/SA_logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Solar Arrow</h1>
        </Link>

        {/* Menu Icon on Right */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Add spacing for fixed header on mobile */}
      <div className="lg:hidden h-14" />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 
          w-72 lg:w-64 
          bg-gradient-to-b from-blue-600 to-blue-800 
          text-white 
          transform transition-transform duration-300 ease-in-out 
          overflow-y-auto overflow-x-hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          // PWA safe area support for iOS notch
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header with Logo - Desktop Only */}
        <Link href="/dashboard" className="hidden lg:block">
          <div className="p-6 sticky top-0 bg-blue-600 z-10 hover:bg-blue-700 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="bg-blue-500 rounded-lg w-12 h-12 p-2 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/SA_logo.png" 
                  alt="Solar Arrow Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold truncate">Solar Arrow</h1>
                <p className="text-blue-200 text-xs mt-0.5">CSPDCL Dashboard</p>
              </div>
            </div>
          </div>
        </Link>

        {/* User Info - Mobile Only */}
        {session?.user && (
          <div className="lg:hidden px-6 py-3 bg-blue-700/30 border-b border-blue-500/30">
            <p className="text-sm font-medium truncate">{session.user.name}</p>
            <p className="text-xs text-blue-200 truncate">{session.user.email}</p>
            <span className="inline-block mt-1 text-xs bg-blue-500 px-2 py-0.5 rounded-full">
              {session.user.role || 'User'}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="pb-24 pt-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-6 py-3.5 
                  transition-all duration-200
                  touch-manipulation
                  active:scale-98
                  ${
                    isActive
                      ? 'bg-blue-700 border-l-4 border-white font-semibold'
                      : 'hover:bg-blue-700/50 active:bg-blue-700/70'
                  }
                `}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}

          {/* Admin-only Project Tracker Link */}
          {/* Admin-only Links */}
{(session?.user?.accountType === 'admin' && 
  (session?.user?.role === 'admin' || session?.user?.role === 'owner')) && (
  <div className="border-t border-blue-500 mt-2">
    <Link
      href="/settings/users"
      className={`
        flex items-center gap-3 px-6 py-3.5 
        transition-all duration-200
        touch-manipulation
        active:scale-98
        ${
          pathname === '/settings/users'
            ? 'bg-blue-700 border-l-4 border-white font-semibold'
            : 'hover:bg-blue-700/50 active:bg-blue-700/70'
        }
      `}
    >
      <Users size={20} className="flex-shrink-0" />
      <span className="text-sm">User Management</span>
      <span className="ml-auto bg-yellow-500 text-blue-900 text-xs px-2 py-0.5 rounded-full font-semibold">
        Admin
      </span>
    </Link>

    <Link
      href="/settings/roles"
      className={`
        flex items-center gap-3 px-6 py-3.5 
        transition-all duration-200
        touch-manipulation
        active:scale-98
        ${
          pathname === '/settings/roles'
            ? 'bg-blue-700 border-l-4 border-white font-semibold'
            : 'hover:bg-blue-700/50 active:bg-blue-700/70'
        }
      `}
    >
      <Shield size={20} className="flex-shrink-0" />
      <span className="text-sm">Roles & Departments</span>
      <span className="ml-auto bg-yellow-500 text-blue-900 text-xs px-2 py-0.5 rounded-full font-semibold">
        Admin
      </span>
    </Link>

    <Link
      href="/admin/tracker"
      className={`
        flex items-center gap-3 px-6 py-3.5 
        transition-all duration-200
        touch-manipulation
        active:scale-98
        ${
          pathname === '/admin/tracker'
            ? 'bg-blue-700 border-l-4 border-white font-semibold'
            : 'hover:bg-blue-700/50 active:bg-blue-700/70'
        }
      `}
    >
      <TrendingUp size={20} className="flex-shrink-0" />
      <span className="text-sm">Project Tracker</span>
      <span className="ml-auto bg-yellow-500 text-blue-900 text-xs px-2 py-0.5 rounded-full font-semibold">
        Admin
      </span>
    </Link>
  </div>
)}
        </nav>

        {/* Footer */}
        {/* Footer */}
<div className="p-6 bg-blue-900/50 backdrop-blur border-t border-blue-500/30 mb-20 lg:mb-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-200">© 2026 Solar Arrow</p>
              <p className="text-xs text-blue-300 mt-1">v1.0.0</p>
            </div>
            {/* PWA Install Indicator */}
            {typeof window !== 'undefined' && 
             window.matchMedia('(display-mode: standalone)').matches && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                PWA
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
