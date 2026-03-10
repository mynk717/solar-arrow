// src/components/TourLauncher.tsx
'use client';
import { startDashboardTour } from './AppTour';
import { usePathname } from 'next/navigation';
import { startLeadsTour } from './AppTour';
import { Map } from 'lucide-react';

export function TourLauncher() {
  const pathname = usePathname();

  const handleTour = () => {
    if (pathname === '/dashboard') startDashboardTour();
    else if (pathname === '/leads') startLeadsTour();
  };

  return (
    <button
      onClick={handleTour}
      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 
                 text-blue-700 rounded-xl text-sm font-semibold border border-blue-200 transition"
    >
      <Map size={15} />
      Take a Tour
    </button>
  );
}
