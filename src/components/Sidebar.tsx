'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck, 
  CreditCard, 
  Wrench,
  Menu,
  Settings,
  X,
  Target,
  FileSpreadsheet,
  Network,
  Package,
  Truck,
  FileCheck,
  IndianRupee
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Enquiries', href: '/enquiries', icon: FileText },
  { name: 'Survey Panel', href: '/survey', icon: ClipboardCheck },
  { name: 'Dashboard (Kanban)', href: '/kanban', icon: LayoutDashboard },
  { name: 'Prospects', href: '/prospects', icon: Target },
  { name: 'Leads', href: '/leads', icon: FileText },
  { name: 'Registration', href: '/registration', icon: ClipboardCheck },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Quotation', href: '/quotation', icon: FileSpreadsheet },
  { name: 'Liaison', href: '/liaison', icon: Network },
  { name: 'BOM', href: '/bom', icon: Package },
  { name: 'Dispatch', href: '/dispatch', icon: Truck },
  { name: 'Installation', href: '/installation', icon: Wrench },
  { name: 'WCR', href: '/wcr', icon: FileCheck },
  { name: 'Subsidy', href: '/subsidy', icon: IndianRupee },
  { name: 'Settings', href: '/settings', icon: Settings }, 
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold">☀️ Solar Panel</h1>
          <p className="text-blue-200 text-sm mt-1">CSPDCL Dashboard</p>
        </div>

        <nav className="mt-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-6 py-3 transition-colors
                  ${isActive 
                    ? 'bg-blue-700 border-l-4 border-white' 
                    : 'hover:bg-blue-700/50'
                  }
                `}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-blue-900/50">
          <p className="text-xs text-blue-200">© 2024 Solar Solutions</p>
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