// src/app/admin/users/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users, UserPlus, Trash2, Edit2, Shield, Loader2,
  Eye, EyeOff, CheckCircle, XCircle, Key, RefreshCw
} from 'lucide-react';

const ROLES = [
  'owner',
  'admin',
  'lead-provider',
  'telecaller',
  'sales',
  'surveyor',
  'accounts',
  'liaison',
  'registration',
  'quotation',
  'payment',
  'bom',
  'dispatch',
  'installation',
  'subsidy',
];

const PAGES = [
  { path: '/leads',        name: 'Leads' },
  { path: '/enquiries',    name: 'Enquiries' },
  { path: '/survey',       name: 'Survey' },
  { path: '/installation', name: 'Installation' },
  { path: '/payment',      name: 'Payments' },
  { path: '/quotation',    name: 'Quotation' },
  { path: '/registration', name: 'Registration' },
  { path: '/bom',          name: 'BOM' },
  { path: '/dispatch',     name: 'Dispatch' },
  { path: '/liaison',      name: 'Liaison' },
  { path: '/subsidy',      name: 'Subsidy' },
  { path: '/kanban',       name: 'Kanban' },
];

type User = {
  id?: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  branchId?: string;
  branchName?: string;
  permissions?: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
    canExport: boolean;
    canAssign: boolean;
  };
};

const defaultPermissions = {
  canView: [] as string[],
  canEdit: [] as string[],
  canDelete: [] as string[],
  canExport: false,
  canAssign: false,
};

export default function UsersManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [permUser, setPermUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Access control
  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-2 text-gray-600">Only owners and admins can manage users.</p>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncUsers() {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/sync-users', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ Synced ${data.synced} users from Google Sheet`);
        await loadUsers();
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg('❌ Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  async function handleDeleteUser(user: User) {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        setMsg(`✅ ${user.name} deleted`);
        setUsers(prev => prev.filter(u => u.email !== user.email));
      } else {
        const d = await res.json();
        setMsg(`❌ ${d.error}`);
      }
    } catch {
      setMsg('❌ Delete failed');
    }
  }

  async function handleToggleActive(user: User) {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, isActive: !user.isActive }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.email === user.email ? { ...u, isActive: !u.isActive } : u));
        setMsg(`✅ ${user.name} ${!user.isActive ? 'activated' : 'deactivated'}`);
      }
    } catch {
      setMsg('❌ Update failed');
    }
  }

  async function handleSavePermissions(user: User, perms: typeof defaultPermissions) {
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, permissions: perms }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.email === user.email ? { ...u, permissions: perms } : u));
        setMsg(`✅ Permissions saved for ${user.name}`);
        setPermUser(null);
      }
    } catch {
      setMsg('❌ Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">User Management</p>
              <p className="text-xs text-gray-400">{users.length} members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncUsers}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition"
            >
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Sync
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition"
            >
              <UserPlus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>


      {/* Flash message */}
      {msg && (
        <div className={`mx-4 mt-4 p-3 rounded-xl text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg}
          <button className="float-right font-bold" onClick={() => setMsg('')}>×</button>
        </div>
      )}

      {/* Users List */}
      <div className="p-4 space-y-3">
        {users.map(user => (
          <div key={user.email} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                  <button
      onClick={() => router.push(`/admin/users/${encodeURIComponent(user.email)}`)}
      className="font-bold text-gray-900 hover:text-blue-600 hover:underline transition-colors text-left"
    >
      {user.name}
    </button>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'sales' ? 'bg-green-100 text-green-800' :
                      user.role === 'surveyor' ? 'bg-orange-100 text-orange-800' :
                      user.role === 'installation' ? 'bg-indigo-100 text-indigo-800' :
                      user.role === 'accounts' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                    {!user.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPermUser(user)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                  title="Edit Permissions"
                >
                  <Shield size={16} />
                </button>
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                  title="Edit User"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setResetUser(user)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-xl transition"
                  title="Reset Password"
                >
                  <Key size={16} />
                </button>
                <button
                  onClick={() => handleToggleActive(user)}
                  className={`p-2 rounded-xl transition ${user.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                  title={user.isActive ? 'Deactivate' : 'Activate'}
                >
                  {user.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </button>
                {user.role !== 'owner' && (
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Permissions summary */}
            {user.permissions && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                {user.permissions.canView?.slice(0, 4).map(p => (
                  <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    👁 {p.replace('/', '')}
                  </span>
                ))}
                {(user.permissions.canView?.length || 0) > 4 && (
                  <span className="text-xs text-gray-400">+{(user.permissions.canView?.length || 0) - 4} more</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newUser) => {
            setUsers(prev => [newUser, ...prev]);
            setShowAddModal(false);
            setMsg(`✅ ${newUser.name} added successfully`);
          }}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={(updated) => {
            setUsers(prev => prev.map(u => u.email === updated.email ? { ...u, ...updated } : u));
            setEditingUser(null);
            setMsg(`✅ ${updated.name} updated`);
          }}
        />
      )}

      {/* Permissions Modal */}
      {permUser && (
        <PermissionsModal
          user={permUser}
          saving={saving}
          onClose={() => setPermUser(null)}
          onSave={(perms) => handleSavePermissions(permUser, perms)}
        />
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onSuccess={() => {
            setResetUser(null);
            setMsg(`✅ Password reset for ${resetUser.name}`);
          }}
        />
      )}
    </div>
  );
}

// ── Add User Modal ─────────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (u: User) => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'sales' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add user');
      onSuccess({ ...form, isActive: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
          <p className="text-sm text-gray-500 mt-1">User will login with email + password</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
            <input
              required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
              placeholder="Rahul Sharma"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
            <input
              required type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
              placeholder="rahul@hopeenergy.com"
            />
                    <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">Role *</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: ROLES.includes(form.role) ? '' : 'sales' })}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                {ROLES.includes(form.role) ? '+ Custom role' : '← Pick from list'}
              </button>
            </div>
            {ROLES.includes(form.role) ? (
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
              >
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            ) : (
              <input
                required
                type="text"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g. site-engineer, finance, hr"
                className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
              />
            )}
            <p className="text-xs text-gray-400 mt-1">Custom roles need permissions set manually after creating.</p>
          </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
            <div className="relative">
              <input
                required type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 pr-12"
                placeholder="Min 8 characters"
                minLength={8}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? 'Adding...' : 'Add User'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit User Modal ────────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: (u: Partial<User>) => void }) {
  const [form, setForm] = useState({ name: user.name, role: user.role });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...form }),
      });
      if (res.ok) onSuccess(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">Role</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: ROLES.includes(form.role) ? '' : user.role })}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                {ROLES.includes(form.role) ? '+ Custom role' : '← Pick from list'}
              </button>
            </div>
            {ROLES.includes(form.role) ? (
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
              >
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g. site-engineer, finance, hr"
                className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
              />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Permissions Modal ──────────────────────────────────────────────────────────
function PermissionsModal({ user, saving, onClose, onSave }: {
  user: User; saving: boolean;
  onClose: () => void;
  onSave: (perms: typeof defaultPermissions) => void;
}) {
  const [perms, setPerms] = useState<typeof defaultPermissions>({
    canView: [...(user.permissions?.canView || [])],
    canEdit: [...(user.permissions?.canEdit || [])],
    canDelete: [...(user.permissions?.canDelete || [])],
    canExport: user.permissions?.canExport || false,
    canAssign: user.permissions?.canAssign || false,
  });

  function toggle(type: 'canView' | 'canEdit' | 'canDelete', path: string) {
    setPerms(prev => {
      const arr = [...prev[type]];
      const idx = arr.indexOf(path);
      if (idx > -1) arr.splice(idx, 1);
      else arr.push(path);
      return { ...prev, [type]: arr };
    });
  }

  function applyRoleDefaults() {
    const roleDefaults: Record<string, string[]> = {
      'lead-provider': ['/leads'],
      telecaller:      ['/leads'],
      sales:           ['/leads', '/enquiries', '/quotation'],
      surveyor:        ['/survey', '/enquiries'],
      liaison:         ['/liaison', '/enquiries'],
      registration:    ['/registration', '/enquiries'],
      quotation:       ['/quotation', '/enquiries'],
      payment:         ['/payment', '/enquiries'],
      accounts:        ['/payment', '/enquiries', '/subsidy'],
      bom:             ['/bom', '/enquiries'],
      dispatch:        ['/dispatch', '/enquiries'],
      installation:    ['/installation', '/bom', '/dispatch', '/enquiries'],
      subsidy:         ['/subsidy', '/enquiries'],
      admin:           PAGES.map(p => p.path),
      owner:           PAGES.map(p => p.path),
    };
    // Custom roles get empty permissions — admin sets manually
    const pages = roleDefaults[user.role] ?? [];
    const isPrivileged = user.role === 'admin' || user.role === 'owner';
    setPerms({
      canView: pages,
      canEdit: pages,
      canDelete: [],
      canExport: isPrivileged,
      canAssign: isPrivileged || user.role === 'sales',
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Permissions — {user.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{user.email} · {user.role}</p>
            </div>
            <button onClick={applyRoleDefaults}
              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition">
              Apply Role Defaults
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Global toggles */}
          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={perms.canExport}
                onChange={e => setPerms({ ...perms, canExport: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Can Export Data</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={perms.canAssign}
                onChange={e => setPerms({ ...perms, canAssign: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Can Assign Tasks</span>
            </label>
          </div>

          {/* Page permissions table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-3 pr-4 font-bold text-gray-600 w-1/3">Page</th>
                  <th className="text-center py-3 px-3 font-bold text-gray-600">👁 View</th>
                  <th className="text-center py-3 px-3 font-bold text-gray-600">✏️ Edit</th>
                  <th className="text-center py-3 px-3 font-bold text-gray-600">🗑 Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PAGES.map(page => (
                  <tr key={page.path} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-800">{page.name}</td>
                    <td className="py-3 px-3 text-center">
                      <input type="checkbox"
                        checked={perms.canView.includes(page.path)}
                        onChange={() => toggle('canView', page.path)}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input type="checkbox"
                        checked={perms.canEdit.includes(page.path)}
                        onChange={() => toggle('canEdit', page.path)}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer" />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input type="checkbox"
                        checked={perms.canDelete.includes(page.path)}
                        onChange={() => toggle('canDelete', page.path)}
                        className="w-4 h-4 rounded text-red-500 cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-gray-100">
          <button onClick={() => onSave(perms)} disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
          <button onClick={onClose}
            className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Modal ───────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Min 8 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">{user.name} · {user.email}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                required type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 pr-12"
                placeholder="Min 8 characters"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
