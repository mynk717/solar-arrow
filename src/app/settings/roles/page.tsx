// src/app/settings/roles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, Building, Plus, Edit2, Trash2, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Department {
  id: string;
  name: string;
  description: string;
  userCount: number;
  createdAt: string;
}

interface Role {
  id: string;
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
  const [activeTab, setActiveTab] = useState<'departments' | 'roles'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  // Only admin/owner can access
  useEffect(() => {
    if (session?.user?.role !== 'admin' && session?.user?.role !== 'owner') {
      router.push('/unauthorized');
    }
  }, [session, router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, rolesRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/roles'),
      ]);
      
      // ✅ Check if responses are OK
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
      setDepartments([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (deptData: Partial<Department>) => {
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData),
      });

      if (response.ok) {
        fetchData();
        setShowAddDeptModal(false);
      }
    } catch (error) {
      console.error('Failed to add department', error);
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    if (!confirm('Delete this department? Users will be unassigned.')) return;

    try {
      await fetch(`/api/departments/${deptId}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete department', error);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield size={32} className="text-blue-600" />
          Roles & Departments
        </h1>
        <p className="text-gray-600 mt-2">Manage organizational structure and permissions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
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
      </div>

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Departments</h2>
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
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{dept.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={16} />
                    <span className="text-sm">{dept.userCount} members</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Roles & Permissions</h2>
            <button
              onClick={() => setShowAddRoleModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 opacity-50 cursor-not-allowed"
              disabled
              title="Custom roles coming soon"
            >
              <Plus size={20} />
              Add Role
            </button>
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
                <RoleCard key={role.id} role={role} />
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={24} className="text-blue-600" />
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
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800" disabled title="Coming soon">
            <Edit2 size={18} />
          </button>
          {role.name !== 'owner' && role.name !== 'admin' && (
            <button className="text-red-600 hover:text-red-800" disabled title="Coming soon">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Permissions</h4>
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

function PermissionRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
        granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {granted ? 'Yes' : 'No'}
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
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Department</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={3}
              placeholder="Brief description of the department"
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
