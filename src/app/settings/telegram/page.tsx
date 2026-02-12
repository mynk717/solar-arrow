// src/app/settings/telegram/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, Check, Send, Link as LinkIcon, RefreshCw } from 'lucide-react';

export default function TelegramSettingsPage() {
  const { data: session } = useSession();
  const [groupChatId, setGroupChatId] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [userChatId, setUserChatId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAdmin = ['owner', 'admin'].includes(session?.user?.role || '');
  const userEmail = session?.user?.email;

  // Generate connection link for user
  const connectionLink = `https://t.me/SolarArrowBot?start=connect_${userEmail}`;

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await fetch('/api/settings/telegram');
      if (response.ok) {
        const data = await response.json();
        setGroupChatId(data.groupChatId || '');
        setUserChatId(data.userChatId || '');
        setIsConnected(!!data.userChatId);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function saveGroupChatId() {
    if (!groupChatId) {
      alert('Please enter a group chat ID');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/settings/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupChatId }),
      });

      if (response.ok) {
        alert('✅ Group chat ID saved successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      alert('❌ Failed to save group chat ID');
    } finally {
      setSaving(false);
    }
  }

  async function testGroupNotification() {
    setTesting(true);
    try {
      const response = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'group' }),
      });

      if (response.ok) {
        alert('✅ Test message sent to group! Check your Telegram.');
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      alert('❌ Failed to send test message');
    } finally {
      setTesting(false);
    }
  }

  async function testPersonalNotification() {
    setTesting(true);
    try {
      const response = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'personal' }),
      });

      if (response.ok) {
        alert('✅ Test message sent to your Telegram! Check your DM.');
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      alert('❌ Failed to send test message. Make sure you connected your Telegram first.');
    } finally {
      setTesting(false);
    }
  }

  function copyConnectionLink() {
    navigator.clipboard.writeText(connectionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Telegram Connection Flow Component
function TelegramConnectFlow({ userEmail, onConnected }: { userEmail: string; onConnected: () => void }) {
    const [verificationCode, setVerificationCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [checking, setChecking] = useState(false);
  
    const generateCode = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/telegram/verify-code');
        const data = await response.json();
        
        if (response.ok) {
          setVerificationCode(data.code);
        } else {
          alert('Failed to generate code. Please try again.');
        }
      } catch (error) {
        alert('Error generating code. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    const copyCode = () => {
      if (verificationCode) {
        navigator.clipboard.writeText(verificationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };
  
    const checkConnection = async () => {
      setChecking(true);
      try {
        const response = await fetch('/api/settings/telegram');
        const data = await response.json();
        
        if (data.userChatId) {
          onConnected();
          alert('✅ Successfully connected!');
        } else {
          alert('Not connected yet. Please send the code to the bot in Telegram.');
        }
      } catch (error) {
        alert('Error checking connection.');
      } finally {
        setChecking(false);
      }
    };
  
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-900 font-semibold mb-2">Not Connected</p>
          <p className="text-sm text-yellow-800">
            Follow the steps below to connect your Telegram account.
          </p>
        </div>
  
        {/* Step-by-step instructions */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-4">📖 Connection Steps</h3>
          
          <ol className="space-y-4">
            {/* Step 1 */}
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-2">Generate Your Verification Code</p>
                {!verificationCode ? (
                  <button
                    onClick={generateCode}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Code'}
                  </button>
                ) : (
                  <div className="bg-white border-2 border-blue-400 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">Your verification code:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-3xl font-bold text-blue-600 tracking-widest">
                        {verificationCode}
                      </code>
                      <button
                        onClick={copyCode}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">⏱️ Expires in 10 minutes</p>
                  </div>
                )}
              </div>
            </li>
  
            {/* Step 2 */}
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-2">Open Telegram & Find the Bot</p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Open Telegram app on your phone/computer</li>
                  <li>Search for: <code className="bg-blue-100 px-2 py-1 rounded font-mono">@SolarArrowBot</code></li>
                  <li>Click "Start" to begin conversation</li>
                </ul>
                <a
                  href="https://t.me/SolarArrowBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium mt-2"
                >
                  <LinkIcon size={16} />
                  Open in Telegram
                </a>
              </div>
            </li>
  
            {/* Step 3 */}
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-2">Send Your Code to the Bot</p>
                <p className="text-sm text-blue-800">
                  Copy the 6-digit code from Step 1 and send it as a message to @SolarArrowBot
                </p>
              </div>
            </li>
  
            {/* Step 4 */}
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </span>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-2">Verify Connection</p>
                <button
                  onClick={checkConnection}
                  disabled={checking || !verificationCode}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
                  {checking ? 'Checking...' : 'Check Connection Status'}
                </button>
              </div>
            </li>
          </ol>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Telegram Notifications</h1>

      {/* Admin Section - Organization Group */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📱 Organization Group</h2>
          <p className="text-gray-700 mb-4">
            Connect your organization's Telegram group to receive team notifications.
          </p>

          <div className="space-y-4">
          <div>
  <label className="block text-sm font-bold text-gray-900 mb-2">
    Group Chat ID or Invite Link
  </label>
  <input
    type="text"
    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium"
    placeholder="-1001234567890 or https://t.me/+AbCdEfG..."
    value={groupChatId}
    onChange={(e) => setGroupChatId(e.target.value)}
  />
  <p className="text-xs text-gray-600 mt-2">
    💡 <strong>Easy way:</strong> Add @SolarArrowBot to your group → Send any message → Bot will reply with the Chat ID → Copy and paste it here
  </p>
  <p className="text-xs text-gray-600 mt-1">
    Or paste your group invite link (e.g., https://t.me/+AbCdEfG...)
  </p>
</div>


            <div className="flex gap-3">
              <button
                onClick={saveGroupChatId}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Group ID'}
              </button>
              {groupChatId && (
                <button
                  onClick={testGroupNotification}
                  disabled={testing}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={18} />
                  {testing ? 'Sending...' : 'Test Notification'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

     {/* User Section - Personal Notifications */}
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4">🔔 Personal Notifications</h2>
  <p className="text-gray-700 mb-4">
    Connect your personal Telegram account to receive direct messages for lead assignments and updates.
  </p>

  {isConnected ? (
    <div className="space-y-4">
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-900 font-bold mb-2">
          <Check size={20} />
          Connected
        </div>
        <p className="text-sm text-green-800">
          Your Telegram is connected. You'll receive personal notifications.
        </p>
      </div>

      <button
        onClick={testPersonalNotification}
        disabled={testing}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
      >
        <Send size={18} />
        {testing ? 'Sending...' : 'Test Personal Notification'}
      </button>
    </div>
  ) : (
    <TelegramConnectFlow userEmail={userEmail!} onConnected={() => setIsConnected(true)} />
  )}
</div>


      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mt-6">
        <h3 className="font-bold text-blue-900 mb-3">📖 How It Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Click "Connect Telegram Now" button</li>
          <li>You'll be redirected to @SolarArrowBot on Telegram</li>
          <li>Click "Start" in the bot chat</li>
          <li>Your Telegram will be automatically connected!</li>
          <li>Come back here and test the notification</li>
        </ol>
      </div>
    </div>
  );
}
