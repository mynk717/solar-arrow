// src/app/settings/roles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, Building, Plus, Edit2, Trash2, Users, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Department {
  id: string;
  name: string;
  description: string;
  userCount: number;
  createdAt: string;
}

interface Role {
  name: string;
  permissions: {
    [key: string]: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
  userCount: number;
}

export default function RolesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'departments' | 'roles'>('roles');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);

  // Only admin/owner can access
  useEffect(() => {
    if (session && session.user?.role !== 'admin' && session.user?.role !== 'owner') {
      router.push('/unauthorized');
    }
  }, [session, router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [deptRes, rolesRes] = await Promise.all([
        fetch('/api/settings/departments'),
        fetch('/api/settings/roles'),
      ]);

      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData.departments || []);
      } else {
        console.error('Failed to fetch departments');
        setDepartments([]);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData.roles || []);
      } else {
        console.error('Failed to fetch roles');
        setRoles([]);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      setError('Failed to load data. Please try again.');
      setDepartments([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (deptData: Partial<Department>) => {
    try {
      const response = await fetch('/api/settings/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add department');
      }

      await fetchData();
      setShowAddDeptModal(false);
      alert('✅ Department added successfully!');
    } catch (error: any) {
      console.error('Failed to add department', error);
      alert(`❌ ${error.message}`);
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    if (!confirm('Delete this department? Users will be unassigned.')) return;

    try {
      const response = await fetch('/api/settings/departments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId: deptId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete department');
      }

      await fetchData();
      alert('✅ Department deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete department', error);
      alert(`❌ ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={32} className="text-blue-600" />
            Roles & Departments
          </h1>
          <p className="text-gray-600 mt-2">Manage organizational structure and permissions</p>
        </div>
        <button
          onClick={fetchData}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'roles'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="inline mr-2" size={20} />
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'departments'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building className="inline mr-2" size={20} />
          Departments
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">System Roles</h2>
            <p className="text-gray-600 text-sm">
              Pre-configured roles with different permission levels. Custom roles coming soon.
            </p>
          </div>

          {roles.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Shield size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No roles configured</p>
              <p className="text-sm text-gray-500">Using default system roles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {roles.map(role => (
                <RoleCard key={role.name} role={role} />
              ))}
            </div>
          )}

          {/* Role Descriptions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Role Hierarchy</h3>
            <div className="space-y-3">
              <RoleDescription
                name="Owner"
                description="Full system access. Can manage all settings, users, and data. Only one owner per organization."
                color="purple"
              />
              <RoleDescription
                name="Admin"
                description="Comprehensive access to manage users, settings, and all modules. Cannot modify owner account."
                color="blue"
              />
              <RoleDescription
                name="Editor"
                description="Can create and edit enquiries, surveys, payments, and installations. Cannot manage users or settings."
                color="green"
              />
              <RoleDescription
                name="Viewer"
                description="Read-only access to all data. Cannot create, edit, or delete anything."
                color="gray"
              />
            </div>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Departments</h2>
              <p className="text-gray-600 text-sm mt-1">Organize your team into departments</p>
            </div>
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              Add Department
            </button>
          </div>

          {departments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Building size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No departments yet</p>
              <p className="text-sm text-gray-500">Create your first department to organize your team</p>
              <button
                onClick={() => setShowAddDeptModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add First Department
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map(dept => (
                <div key={dept.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building size={24} className="text-blue-600" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteDepartment(dept.id)}
                        title="Delete Department"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{dept.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dept.description}</p>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={16} />
                    <span className="text-sm">{dept.userCount} members</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Created {new Date(dept.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <AddDepartmentModal
          onClose={() => setShowAddDeptModal(false)}
          onSubmit={handleAddDepartment}
        />
      )}
    </div>
  );
}

function RoleCard({ role }: { role: Role }) {
  const [expanded, setExpanded] = useState(false);

  const colorMap: Record<string, string> = {
    owner: 'text-purple-600',
    admin: 'text-blue-600',
    editor: 'text-green-600',
    viewer: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={24} className={colorMap[role.name] || 'text-blue-600'} />
            <h3 className="font-bold text-gray-900 text-lg capitalize">{role.name}</h3>
            <span className="text-sm text-gray-600">({role.userCount} users)</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {expanded ? 'Hide' : 'View'} Permissions
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Module Permissions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(role.permissions).map(([module, perms]) => (
              <div key={module} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2 capitalize">{module}</h5>
                <div className="space-y-1 text-sm">
                  <PermissionRow label="View" granted={perms.view} />
                  <PermissionRow label="Create" granted={perms.create} />
                  <PermissionRow label="Edit" granted={perms.edit} />
                  <PermissionRow label="Delete" granted={perms.delete} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RoleDescription({ name, description, color }: { name: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="flex gap-3">
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorMap[color]} h-fit`}>
        {name}
      </span>
      <p className="text-gray-700 text-sm flex-1">{description}</p>
    </div>
  );
}

function PermissionRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {granted ? '✓' : '✗'}
      </span>
    </div>
  );
}

function AddDepartmentModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a department name');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Department</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., Sales, Engineering, Operations"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={3}
              placeholder="Brief description of the department (optional)"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
            >
              Add Department
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
