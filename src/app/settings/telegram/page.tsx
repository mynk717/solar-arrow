// src/app/settings/telegram/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, Check, Send, Link as LinkIcon, RefreshCw, ExternalLink } from 'lucide-react';

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

export default function TelegramSettingsPage() {
  const { data: session } = useSession();
  const [groupChatId, setGroupChatId] = useState('');
  const [userChatId, setUserChatId] = useState('');
  const [isGroupConnected, setIsGroupConnected] = useState(false);
  const [isUserConnected, setIsUserConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const isAdmin = ['owner', 'admin'].includes(session?.user?.role || '');
  const userEmail = session?.user?.email;

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
        setIsGroupConnected(!!data.groupChatId);
        setIsUserConnected(!!data.userChatId);
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
    const trimmed = groupChatId.trim();
    if (!trimmed.startsWith('-')) {
      alert('❌ Invalid Chat ID!\n\nGroup Chat IDs must start with a minus sign (-).\n\nExample: -5142278285\n\nPlease check and re-enter the correct Chat ID.');
      return;
    }
    if (!/^-\d+$/.test(trimmed)) {
      alert('❌ Invalid Chat ID format!\n\nChat ID should only contain numbers after the minus sign.\n\nExample: -5142278285');
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
        setIsGroupConnected(true);
        alert('✅ Group chat ID saved successfully!');
        loadSettings(); // Refresh settings
      } else {
        const data = await response.json();
        alert(`❌ Failed to save: ${data.error || 'Unknown error'}`);
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

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message || 'Test message sent to group! Check your Telegram.'}`);
      } else {
        alert(`❌ ${data.error || 'Failed to send test message'}\n\n${data.debug?.suggestion || ''}`);
      }
    } catch (error) {
      alert('❌ Network error. Please try again.');
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

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message || 'Test message sent! Check your Telegram DM.'}`);
      } else {
        alert(`❌ ${data.error || 'Failed to send test message'}`);
      }
    } catch (error) {
      alert('❌ Network error. Please try again.');
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Telegram Notifications</h1>

      {/* Admin Section - Organization Group */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📱 Organization Group
            {isGroupConnected && (
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                Connected
              </span>
            )}
          </h2>
          <p className="text-gray-700 mb-4">
            Connect your organization's Telegram group to receive team notifications for lead assignments, status updates, and more.
          </p>

          {isGroupConnected ? (
            // ✅ Connected State
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-900 font-bold mb-2">
                  <Check size={20} />
                  Group Connected
                </div>
                <p className="text-sm text-green-800">
                  <strong>Chat ID:</strong> <code className="bg-green-100 px-2 py-1 rounded">{groupChatId}</code>
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Team notifications will be sent to this group.
                </p>
              </div>

              <div className="flex gap-3">
              <button
                  onClick={testGroupNotification}
                  disabled={testing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  <Send size={18} />
                  {testing ? 'Sending...' : 'Test Notification'}
                </button>
              <button
  onClick={async () => {
    if (confirm('This will disconnect the group. You can reconnect with a new Chat ID.')) {
      try {
        const res = await fetch('/api/settings/telegram', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'group' }),
        });
        if (res.ok) {
          setIsGroupConnected(false);
          setGroupChatId('');
        } else {
          alert('❌ Failed to disconnect group.');
        }
      } catch {
        alert('❌ Network error.');
      }
    }
  }}
  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-bold"
>
  Change Group
</button>
                <a
                  href="https://t.me/SolarArrowBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2"
                >
                  <ExternalLink size={18} />
                  Open Bot
                </a>
              </div>
            </div>
          ) : (
            // ❌ Not Connected State
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-4">📖 Setup Instructions</h3>
                
                <ol className="space-y-3 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <strong>Add bot to your group:</strong>
                      <p className="text-xs mt-1">Search for <code className="bg-blue-100 px-2 py-1 rounded font-mono">@SolarArrowBot</code> in Telegram and add it to your organization group</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <strong>Get the Chat ID:</strong>
                      <p className="text-xs mt-1">Send any message in the group. The bot will reply with the Chat ID</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <strong>Paste and save below</strong>
                    </div>
                  </li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Group Chat ID
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="-5142278285"
                  value={groupChatId}
                  onChange={(e) => setGroupChatId(e.target.value.trim())}
                />
                <p className="text-xs text-gray-600 mt-2">
                  💡 The Chat ID starts with a minus sign (e.g., -5142278285)
                </p>
              </div>

              <button
                onClick={saveGroupChatId}
                disabled={saving || !groupChatId.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Connect Group'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Section - Personal Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          🔔 Personal Notifications
          {isUserConnected && (
            <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              Connected
            </span>
          )}
        </h2>
        <p className="text-gray-700 mb-4">
          Connect your personal Telegram to receive direct messages when leads are assigned to you.
        </p>

        {isUserConnected ? (
          // ✅ Connected State
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-900 font-bold mb-2">
                <Check size={20} />
                Connected
              </div>
              <p className="text-sm text-green-800">
                Your Telegram is connected. You'll receive personal notifications for assigned leads.
              </p>
              <p className="text-xs text-green-700 mt-1">
                <strong>Chat ID:</strong> <code className="bg-green-100 px-2 py-1 rounded">{userChatId}</code>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={testPersonalNotification}
                disabled={testing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={18} />
                {testing ? 'Sending...' : 'Test Personal Notification'}
              </button>

              <button
  onClick={async () => {
    if (confirm('This will disconnect your current Telegram. You will need to reconnect via verification code.')) {
      try {
        const res = await fetch('/api/settings/telegram', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'personal' }),
        });
        if (res.ok) {
          setIsUserConnected(false);
          setUserChatId('');
        } else {
          alert('❌ Failed to disconnect.');
        }
      } catch {
        alert('❌ Network error.');
      }
    }
  }}
  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-bold"
>
  Disconnect & Reconfigure
</button>

            </div>
          </div>
        ) : (
          // ❌ Not Connected State
          <TelegramConnectFlow 
            userEmail={userEmail!} 
            onConnected={() => {
              setIsUserConnected(true);
              loadSettings();
            }} 
          />
        )}
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="font-bold text-gray-900 mb-3">💡 Need Help?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><strong>Bot not responding?</strong> Make sure @SolarArrowBot is added to your group</li>
          <li><strong>Chat ID not showing?</strong> Send any message in the group after adding the bot</li>
          <li><strong>Test fails?</strong> Verify the Chat ID is correct and starts with a minus sign</li>
          <li><strong>Personal connection?</strong> Follow the 4-step verification code process above</li>
        </ul>
      </div>
    </div>
  );
}
