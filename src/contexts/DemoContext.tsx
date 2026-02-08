'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface DemoContextType {
  isDemoMode: boolean;
  setIsDemoMode: (value: boolean) => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  setIsDemoMode: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSheetConnection = async () => {
      if (status === 'loading') return;

      // ✅ If not authenticated, use demo mode
      if (status === 'unauthenticated') {
        setIsDemoMode(true);
        setIsChecking(false);
        return;
      }

      // ✅ If authenticated, check if sheet is configured
      if (session?.user?.organizationId) {
        try {
          const response = await fetch('/api/settings');
          const data = await response.json();

          // ✅ If NO sheet configured, use demo mode
          if (!data.sheetId) {
            setIsDemoMode(true);
          } else {
            setIsDemoMode(false);
          }
        } catch (error) {
          console.error('Failed to check sheet config:', error);
          setIsDemoMode(true); // Fallback to demo
        }
      }

      setIsChecking(false);
    };

    checkSheetConnection();
  }, [session, status]);

  // ✅ Don't render children until we've checked
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DemoContext.Provider value={{ isDemoMode, setIsDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemoMode = () => useContext(DemoContext);
