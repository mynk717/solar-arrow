'use client';

import { useState, useEffect } from 'react';
import { Download, Smartphone, Share, Plus, X, Check } from 'lucide-react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (typeof window === 'undefined') return false;
      
      // Check display mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check iOS standalone
      const isIOSStandalone = (window.navigator as any).standalone === true;
      // Check if launched from home screen
      const isInstalled = isStandalone || isIOSStandalone;
      
      setIsInstalled(isInstalled);
      return isInstalled;
    };

    if (checkInstalled()) return;

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS) {
      // iOS doesn't support beforeinstallprompt, show manual instructions
      setShowIOSInstructions(true);
      return;
    }

    // Android/Desktop Chrome - Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Save to localStorage to persist across reloads
      localStorage.setItem('pwa-installable', 'true');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-installable');
      localStorage.setItem('pwa-installed', 'true');
    };

    // Check localStorage for installability
    if (localStorage.getItem('pwa-installable') === 'true' && !localStorage.getItem('pwa-installed')) {
      setIsInstallable(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallModal(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      localStorage.setItem('pwa-installed', 'true');
    }
  };

  // Don't show anything if already installed
  if (isInstalled) return null;

  // iOS Instructions Modal
  if (showIOSInstructions && showInstallModal) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Smartphone className="text-blue-600" size={24} />
                Install Solar Arrow
              </h3>
              <button 
                onClick={() => setShowInstallModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-3">
                Install this app on your iPhone for quick access:
              </p>
              
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Tap the <Share size={16} className="inline mx-1" /> <strong>Share</strong> button
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      (Bottom toolbar in Safari)
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Scroll and tap <Plus size={16} className="inline mx-1" /> <strong>"Add to Home Screen"</strong>
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Tap <strong>"Add"</strong> in the top-right
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800 flex items-center gap-2">
                <Check size={16} className="text-green-600" />
                The app icon will appear on your home screen
              </p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Instructions Modal
  if (!showIOSInstructions && showInstallModal && !deferredPrompt) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Install Solar Arrow</h3>
              <button 
                onClick={() => setShowInstallModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-800 mb-3">
                To install this app:
              </p>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Open this page in <strong>Chrome</strong> or <strong>Edge</strong> browser</li>
                <li>Look for the install icon in the address bar</li>
                <li>Or tap the menu (⋮) and select "Install app"</li>
              </ol>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Floating Install Button
  return (
    <>
      {(isInstallable || showIOSInstructions) && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm transition-all hover:scale-105 active:scale-95 z-40 animate-bounce"
        >
          <Download size={20} />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      {showInstallModal && (showIOSInstructions || !deferredPrompt) && (
        <div onClick={() => setShowInstallModal(false)} />
      )}
    </>
  );
}
