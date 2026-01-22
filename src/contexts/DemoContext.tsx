// src/contexts/DemoContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface DemoContextType {
  isDemoMode: boolean;
  showDemoAlert: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const isDemoMode = status === 'unauthenticated';
  const [showAlert, setShowAlert] = useState(false);

  const showDemoAlert = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, showDemoAlert }}>
      {children}
      
      {/* Demo Mode Alert */}
      {showAlert && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium">Demo Mode: Sign in to save changes</p>
        </div>
      )}
    </DemoContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoProvider');
  }
  return context;
}
