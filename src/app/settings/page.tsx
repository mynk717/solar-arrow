// src/app/settings/page.tsx (IMPROVED VERSION)
'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Settings, Database, CheckCircle, LogOut, Copy, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface SheetConfig {
  sheetId: string;
  sheetName: string;
  organizationDomain: string;
  updatedAt: string;
  updatedBy: string;
  configured: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [config, setConfig] = useState<SheetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'expired' | 'unknown'>('unknown');

  // Load config on mount
  useEffect(() => {
    if (session) {
      loadConfig();
      checkTokenStatus();
    }
  }, [session]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/sheets/save-config');
      const data = await response.json();

      if (data.configured) {
        setConfig(data);
        setSheetId(data.sheetId);
        setSheetName(data.sheetName);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const checkTokenStatus = async () => {
    try {
      // Simple test to check if token is valid
      const response = await fetch('/api/test-token');
      if (response.ok) {
        setTokenStatus('valid');
      } else {
        setTokenStatus('expired');
      }
    } catch (error) {
      setTokenStatus('unknown');
    }
  };

  const handleCopyTemplate = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/sheets/copy-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Solar Arrow Data - ${new Date().toLocaleDateString()}` })
      });

      const data = await response.json();

      if (response.ok) {
        setSheetId(data.sheetId!);
        setMessage({ type: 'success', text: 'Template copied! Opening your new sheet...' });

        // Save the new sheet config
        await saveConfig(data.sheetId!, sheetName);

        // Open the new sheet
        window.open(data.sheetUrl, '_blank');
      } else {
        if (data.error?.includes('authentication')) {
          setMessage({ 
            type: 'error', 
            text: 'Authentication expired. Please sign out and sign in again.' 
          });
          setTokenStatus('expired');
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to copy template' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while copying template' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (id?: string, name?: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/sheets/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: id || sheetId,
          sheetName: name || sheetName
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
        await loadConfig(); // Reload to show updated info
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsLoading(true);
    setMessage({ type: 'success', text: 'Refreshing authentication...' });

    // Sign out and back in to refresh token
    await signOut({ redirect: false });
    await signIn('google');
  };

  // Not signed in
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings size={32} />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Connect your Google account to get started</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Database size={64} className="mx-auto text-blue-600 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Google Sheets
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Sign in with your Google account to create and manage your Solar Arrow data in Google Sheets.
          </p>
          <button
            onClick={() => signIn('google')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Signed in
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings size={32} />
            Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your Google Sheets integration</p>
        </div>
        <button
          onClick={() => signOut()}
          className="text-red-600 hover:text-red-700 flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          {session?.user?.image && (
            <img src={session.user.image} alt={session.user.name || 'User'} className="w-16 h-16 rounded-full" />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{session?.user?.name}</h2>
            <p className="text-gray-600">{session?.user?.email}</p>
            <div className="mt-2 flex items-center gap-4">
              <span className={`inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full \${
                tokenStatus === 'valid' 
                  ? 'text-green-700 bg-green-50' 
                  : tokenStatus === 'expired'
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-700 bg-gray-50'
              }`}>
                {tokenStatus === 'valid' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {tokenStatus === 'valid' ? 'Connected to Google' : tokenStatus === 'expired' ? 'Connection Expired' : 'Checking...'}
              </span>
              {tokenStatus === 'expired' && (
                <button
                  onClick={handleRefreshToken}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Refresh Connection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Connection Status */}
      {config && config.configured && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-green-900 mb-2">📊 Currently Connected</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">Sheet Name:</span>
                  <code className="bg-green-100 px-2 py-1 rounded text-green-900">{config.sheetName}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">Sheet ID:</span>
                  <code className="bg-green-100 px-2 py-1 rounded text-green-900 text-xs">{config.sheetId.substring(0, 20)}...</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">Last Updated:</span>
                  <span className="text-green-900">{new Date(config.updatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">Updated By:</span>
                  <span className="text-green-900">{config.updatedBy}</span>
                </div>
              </div>
              <a
                href={`https://docs.google.com/spreadsheets/d/\${config.sheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 mt-3 font-medium"
              >
                <ExternalLink size={16} />
                Open Sheet in Google
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Token Expired Warning */}
      {tokenStatus === 'expired' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">Authentication Expired</h3>
              <p className="text-red-800 mb-3">
                Your Google authentication has expired. You need to re-authenticate to continue using Google Sheets.
              </p>
              <button
                onClick={handleRefreshToken}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                <RefreshCw size={16} className="inline mr-2" />
                Re-authenticate Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the form... */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Database size={24} />
          {config?.configured ? 'Change Connected Sheet' : 'Google Sheets Setup'}
        </h2>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Start</h3>
          <p className="text-gray-700 mb-4">
            Copy our pre-configured template to get started instantly. All columns and formatting are already set up!
          </p>
          <button
            onClick={handleCopyTemplate}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Copy size={20} />
            {isLoading ? 'Copying Template...' : 'Create from Template'}
          </button>
        </div>

        {/* Manual Configuration */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Or use an existing sheet</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Google Sheet ID
              </label>
              <input
                type="text"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Found in the URL: docs.google.com/spreadsheets/d/<strong>SHEET_ID</strong>/edit
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sheet Name
              </label>
              <input
                type="text"
                placeholder="Sheet1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                The name of the tab in your spreadsheet (default: "Sheet1")
              </p>
            </div>

            {sheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/\${sheetId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <ExternalLink size={16} />
                Open Sheet
              </a>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg \${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={() => saveConfig()}
            disabled={isLoading || !sheetId}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? 'Saving...' : config?.configured ? 'Update Configuration' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="font-bold text-gray-900 mb-3">💡 Need Help?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><strong>Quick Start:</strong> Click "Create from Template" for instant setup</li>
          <li><strong>Existing Sheet:</strong> Paste your Sheet ID and click Save</li>
          <li><strong>Connection Issues:</strong> Click "Refresh Connection" if you see expired status</li>
          <li><strong>Access:</strong> You automatically have access to sheets you create</li>
        </ul>
      </div>
    </div>
  );
}