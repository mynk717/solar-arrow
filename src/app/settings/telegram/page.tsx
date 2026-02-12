// src/app/settings/telegram/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, Check, Send, Link as LinkIcon } from 'lucide-react';

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
                Group Chat ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium"
                placeholder="-1001234567890"
                value={groupChatId}
                onChange={(e) => setGroupChatId(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-2">
                💡 Add @SolarArrowBot to your group, send a message, then visit:{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  https://api.telegram.org/bot{'{TOKEN}'}/getUpdates
                </code>
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
          <div className="space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-yellow-900 font-semibold mb-2">Not Connected</p>
              <p className="text-sm text-yellow-800">
                Click the link below to connect your Telegram account.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Connection Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={connectionLink}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-mono text-sm bg-gray-50"
                />
                <button
                  onClick={copyConnectionLink}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <a
              href={connectionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              <LinkIcon size={20} />
              Connect Telegram Now
            </a>
          </div>
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
    