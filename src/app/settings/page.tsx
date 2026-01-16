'use client';

import { useState, useEffect } from 'react';
import { Settings, Database, CheckCircle, AlertCircle, RefreshCw, Save, TestTube } from 'lucide-react';

interface SheetConfig {
  sheetId: string;
  sheetName: string;
  serviceAccountEmail: string;
  privateKey: string;
  isConnected: boolean;
  lastSync?: Date;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SheetConfig>({
    sheetId: '',
    sheetName: 'Sheet1',
    serviceAccountEmail: '',
    privateKey: '',
    isConnected: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/sheet-config');
      if (response.ok) {
        const data = await response.json();
        setConfig({
          ...data,
          privateKey: '', // Don't show full private key for security
          lastSync: data.lastSync ? new Date(data.lastSync) : undefined
        });
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId: config.sheetId,
          sheetName: config.sheetName,
          serviceAccountEmail: config.serviceAccountEmail,
          privateKey: config.privateKey
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setTestResult({
          success: true,
          message: `✅ Connection successful! Found ${result.rowCount} rows with ${result.columnCount} columns.`
        });
        setConfig(prev => ({ ...prev, isConnected: true }));
      } else {
        setTestResult({
          success: false,
          message: `❌ Connection failed: ${result.error}`
        });
        setConfig(prev => ({ ...prev, isConnected: false }));
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      setConfig(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const response = await fetch('/api/settings/sheet-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        setSaveMessage('✅ Configuration saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const error = await response.json();
        setSaveMessage(`❌ Failed to save: ${error.message}`);
      }
    } catch (error) {
      setSaveMessage(`❌ Save error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings size={32} />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure your Google Sheets connection and application settings</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Database size={24} />
                Google Sheets Connection
              </h2>
              {config.isConnected ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle size={20} />
                  <span className="font-semibold">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  <AlertCircle size={20} />
                  <span className="font-semibold">Not Connected</span>
                </div>
              )}
            </div>

            {config.lastSync && (
              <p className="text-sm text-gray-600 mb-4">
                Last synced: {config.lastSync.toLocaleString()}
              </p>
            )}

            {/* Configuration Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Google Sheet ID *
                </label>
                <input
                  type="text"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  value={config.sheetId}
                  onChange={(e) => setConfig({ ...config, sheetId: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Found in the URL: docs.google.com/spreadsheets/d/<strong>[SHEET_ID]</strong>/edit
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sheet Name *
                </label>
                <input
                  type="text"
                  placeholder="Sheet1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  value={config.sheetName}
                  onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The name of the tab/sheet in your Google Spreadsheet (default: Sheet1)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Account Email *
                </label>
                <input
                  type="email"
                  placeholder="service-account@project-id.iam.gserviceaccount.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  value={config.serviceAccountEmail}
                  onChange={(e) => setConfig({ ...config, serviceAccountEmail: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  From your Google Cloud service account JSON file
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Private Key *
                </label>
                <textarea
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;Your private key here...&#10;-----END PRIVATE KEY-----"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-mono text-sm"
                  rows={4}
                  value={config.privateKey}
                  onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Private key from your service account JSON file (stored securely)
                </p>
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div className={`p-4 rounded-lg ${
                  testResult.success 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {testResult.message}
                </div>
              )}

              {/* Save Message */}
              {saveMessage && (
                <div className={`p-4 rounded-lg ${
                  saveMessage.startsWith('✅') 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {saveMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={testConnection}
                  disabled={isTesting || !config.sheetId || !config.serviceAccountEmail || !config.privateKey}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <TestTube size={20} />
                      Test Connection
                    </>
                  )}
                </button>

                <button
                  onClick={saveConfig}
                  disabled={isSaving || !config.sheetId || !config.serviceAccountEmail}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Setup Instructions Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">📖 Setup Instructions</h3>
            <ol className="space-y-3 text-blue-800">
              <li className="flex gap-3">
                <span className="font-bold">1.</span>
                <div>
                  <strong>Create Google Cloud Project:</strong> Go to{' '}
                  <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">
                    Google Cloud Console
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">2.</span>
                <div>
                  <strong>Enable Google Sheets API:</strong> Search for "Google Sheets API" and enable it
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">3.</span>
                <div>
                  <strong>Create Service Account:</strong> Go to IAM & Admin → Service Accounts → Create Service Account
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">4.</span>
                <div>
                  <strong>Download JSON Credentials:</strong> Click on the service account → Keys → Add Key → Create New Key (JSON)
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">5.</span>
                <div>
                  <strong>Share Your Google Sheet:</strong> Open your Google Sheet and share it with the service account email (Editor access)
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">6.</span>
                <div>
                  <strong>Copy Credentials:</strong> Copy the values from JSON file and paste them in the form above
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">7.</span>
                <div>
                  <strong>Test & Save:</strong> Click "Test Connection" to verify, then "Save Configuration"
                </div>
              </li>
            </ol>
          </div>

          {/* Sheet Structure Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-yellow-900 mb-4">⚠️ Required Sheet Structure</h3>
            <p className="text-yellow-800 mb-3">
              Your Google Sheet must have these exact column headers in row 1:
            </p>
            <div className="bg-white rounded-lg p-4 overflow-x-auto">
              <code className="text-xs text-gray-800 whitespace-pre">
{`id, customerName, phone, email, address, area, capacity, status,
createdAt, updatedAt, surveyDate, surveyedBy, surveyNotes, surveyApproved,
registrationId, registrationDate, vendorName, estimatedCost, initialPayment,
paymentDate, paymentMethod, dispatchDate, installationDate, installedBy,
inspectionDate, inspectionOfficer, inspectionApproved, activationDate`}
              </code>
            </div>
            <p className="text-yellow-800 mt-3 text-sm">
              💡 Tip: Import the CSV file we provided to get the correct structure automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
