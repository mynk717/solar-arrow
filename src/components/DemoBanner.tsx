// src/components/DemoBanner.tsx
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Info, LogIn } from 'lucide-react';

export default function DemoBanner() {
  const { status } = useSession();

  if (status !== 'unauthenticated') return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5" />
          <p className="text-sm font-medium">
            🎯 You're viewing a <strong>demo</strong> with sample data. Sign in to manage your real solar projects!
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link
            href="/login"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            href="/onboard"
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-300 transition-colors text-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
