'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // ADD THIS
import toast, { Toaster } from 'react-hot-toast'; // ADD THIS
import { Shield, Users, Copy, Check, Plus, Trash2, Edit2, ExternalLink } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  sheetId?: string;
  usersCount: number;
  leadNotifyGroups: string[];
  createdAt: string;
}

interface User {
  email: string;
  name: string;
  role: string;
}

export default function OrganizationPage() {
  const { data: session, status } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState(false);
  const [newChatId, setNewChatId] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
const [newOrgName, setNewOrgName] = useState('');


  const router = useRouter();

useEffect(() => {
  if (session && session.user?.accountType !== 'admin' && session.user?.accountType !== 'owner') {
    router.push('/unauthorized');
  }
}, [session, router]);
  // Load organization data
  useEffect(() => {
    if (status === 'authenticated') {
      loadOrgData();
    }
  }, [status]);

  const loadOrgData = async () => {
    try {
      setLoading(true);
      const [orgRes, usersRes] = await Promise.all([
        fetch('/api/org/info'), // we'll create this
        fetch('/api/settings/users')
      ]);

      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrg(orgData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Failed to load org data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addChatId = async () => {
    if (!newChatId.trim() || !org?.id) return;
    try {
      const response = await fetch('/api/admin/set-lead-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: org.id,
          chatIds: [...org.leadNotifyGroups, newChatId.trim()]
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('✅ Notification group added!');
        loadOrgData();
        setNewChatId('');
        setEditingGroup(false);
      } else {
        toast.error(`❌ ${data.error || 'Failed to add group'}`);
      }
    } catch {
      toast.error('❌ Network error. Please try again.');
    }
  };
  
  const removeChatId = async (chatId: string) => {
    if (!confirm('Remove this chat from lead notifications?')) return;
    try {
      const newGroups = org!.leadNotifyGroups.filter(id => id !== chatId);
      const response = await fetch('/api/admin/set-lead-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: org!.id, chatIds: newGroups })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('✅ Notification group removed.');
        loadOrgData();
      } else {
        toast.error(`❌ ${data.error || 'Failed to remove group'}`);
      }
    } catch {
      toast.error('❌ Network error. Please try again.');
    }
  };
  

  const copyOrgId = () => {
    navigator.clipboard.writeText(org?.id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const saveOrgName = async () => {
    if (!newOrgName.trim() || newOrgName.trim() === org?.name) {
      setEditingName(false);
      return;
    }
    try {
      const response = await fetch('/api/org/info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('✅ Organization name updated!');
        loadOrgData();
        setEditingName(false);
      } else {
        toast.error(`❌ ${data.error || 'Failed to update name'}`);
      }
    } catch {
      toast.error('❌ Network error. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
    <Toaster />
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization</h1>
          <p className="text-gray-600">Manage your organization settings and notification groups</p>
        </div>
      </div>

      {/* Org Card */}
      {org ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">Org ID</label>
    <div className="flex items-center gap-2">
      <code className="bg-gray-100 px-3 py-1.5 rounded-lg font-mono text-sm text-gray-900 font-medium">
        {org.id}
      </code>
      <button
        onClick={copyOrgId}
        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
        title="Copy Org ID"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
      </button>
    </div>
  </div>

  <div>
  <label className="block text-sm font-semibold text-gray-900 mb-2">Organization Name</label>
  {editingName ? (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        value={newOrgName}
        onChange={(e) => setNewOrgName(e.target.value)}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') saveOrgName();
          if (e.key === 'Escape') setEditingName(false);
        }}
        className="px-3 py-1.5 border-2 border-blue-500 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 w-48"
      />
      <button
        onClick={saveOrgName}
        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700"
      >
        Save
      </button>
      <button
        onClick={() => setEditingName(false)}
        className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-300"
      >
        Cancel
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <span className="text-lg font-semibold text-gray-900">{org.name}</span>
      <button
        onClick={() => { setNewOrgName(org.name); setEditingName(true); }}
        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        title="Edit organization name"
      >
        <Edit2 className="h-4 w-4 text-gray-400 hover:text-gray-700" />
      </button>
    </div>
  )}
</div>

  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">Users</label>
    <span className="text-lg font-semibold text-gray-900">{users.length}</span>
  </div>

  {/* ADD THESE TWO NEW CELLS */}
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">Google Sheet</label>
    {org.sheetId ? (
      <a
        href={`https://docs.google.com/spreadsheets/d/${org.sheetId}/edit`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open Sheet
      </a>
    ) : (
      <span className="text-sm text-red-500 font-medium">⚠️ Not configured</span>
    )}
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">Created</label>
    <span className="text-sm text-gray-600">
      {new Date(org.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      })}
    </span>
  </div>
</div>

          {/* Lead Assignment Notifications */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                📢 Lead Assignment Notifications
              </h2>
              <button
                onClick={() => setEditingGroup(!editingGroup)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {editingGroup ? <Edit2 size={16} /> : <Plus size={16} />}
                {editingGroup ? 'Done' : 'Add Group'}
              </button>
            </div>

            {editingGroup ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="-1001234567890"
                    value={newChatId}
                    onChange={(e) => setNewChatId(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <button
                    onClick={addChatId}
                    disabled={!newChatId.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-blue-800 mt-2">
                  Add Telegram group chat IDs (negative numbers for groups)
                </p>
              </div>
            ) : null}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              {org.leadNotifyGroups.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No notification groups</p>
                  <p className="text-sm text-gray-500">Add groups to receive lead assignment notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {org.leadNotifyGroups.map((chatId, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm">
                      <code className="font-mono text-sm text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {chatId}
                      </code>
                      <button
                        onClick={() => removeChatId(chatId)}
                        className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Organization</h2>
          <p className="text-gray-600 mb-6">Organization not configured yet</p>
          <button
  onClick={() => router.push('/onboard')}
  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold"
>
  Setup Organization
</button>
        </div>
      )}
    </div>
  );
}
