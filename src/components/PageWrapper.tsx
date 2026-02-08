// src/components/PageWrapper.tsx
'use client';

import { useDemoMode } from '@/contexts/DemoContext';
import { useEnquiries } from '@/lib/useEnquiries';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

interface PageWrapperProps {
  children: (data: { 
    enquiries: any[]; 
    loading: boolean; 
    error: string | null;
    isDemoMode: boolean;
  }) => ReactNode;
  filterFn?: (enquiries: any[]) => any[];
  title?: string;
}

export function PageWrapper({ children, filterFn, title }: PageWrapperProps) {
  const { enquiries, loading, error } = useEnquiries();
  const { isDemoMode } = useDemoMode();
  const router = useRouter();

  const filteredData = filterFn ? filterFn(enquiries) : enquiries;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {title || 'data'}...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isDemoMode) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-red-900 mb-2">Error Loading Data</h3>
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={() => router.push('/settings')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isDemoMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <p className="font-semibold text-yellow-900">Demo Mode</p>
              <p className="text-sm text-yellow-800">
                You're viewing sample data. 
                <button 
                  onClick={() => router.push('/settings')}
                  className="ml-1 underline hover:text-yellow-900"
                >
                  Connect your Google Sheet
                </button> to see real data.
              </p>
            </div>
          </div>
        </div>
      )}
      {children({ 
        enquiries: filteredData, 
        loading, 
        error,
        isDemoMode 
      })}
    </>
  );
}
