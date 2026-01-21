'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sheetId, setSheetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const TEMPLATE_URL = 'https://docs.google.com/spreadsheets/d/YOUR_TEMPLATE_ID/copy';

  // Check if already connected
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.email) {
      const stored = localStorage.getItem(`sheetId_${session.user.email}`);
      if (stored) {
        // Already connected, redirect to dashboard
        router.push('/');
      }
    }
  }, [session, status, router]);

  const handleConnect = async () => {
    if (!sheetId.trim()) {
      setError('Please enter a Sheet ID');
      return;
    }

    if (!session?.user?.email) {
      setError('No user session found. Please sign in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save to localStorage
      localStorage.setItem(`sheetId_${session.user.email}`, sheetId.trim());
      
      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      setError('Failed to save sheet ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyTemplate = () => {
    window.open(TEMPLATE_URL, '_blank');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connect Your Google Sheet
          </h1>
          <p className="text-gray-600">
            Set up your workspace in 2 simple steps
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Copy Our Template
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Click the button below to create a copy of our pre-configured template
                </p>
                <button
                  onClick={copyTemplate}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={18} />
                      Template Opened!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy Template
                    </>
                  )}
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Paste Your Sheet ID
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Copy the ID from your sheet's URL and paste it below
                </p>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-xs text-gray-500 mb-1">Your Sheet URL:</p>
                  <code className="text-xs text-gray-800">
                    https://docs.google.com/spreadsheets/d/
                    <span className="bg-yellow-200">1AbC...XyZ</span>/edit
                  </code>
                </div>

                <input
                  type="text"
                  value={sheetId}
                  onChange={(e) => setSheetId(e.target.value)}
                  placeholder="Paste your Sheet ID here"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none mb-3"
                />

                {error && (
                  <p className="text-red-600 text-sm mb-3">{error}</p>
                )}

                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Connecting...
                    </span>
                  ) : (
                    'Connect Sheet & Start'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Make sure your Google Sheet is accessible with your Google account. 
            The sheet must have the same structure as our template.
          </p>
        </div>
      </div>
    </div>
  );
}
