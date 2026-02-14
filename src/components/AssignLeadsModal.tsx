'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  branchName?: string;
}

interface AssignLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: string[];
  availableUsers: User[];
  onAssign: (assignee: string, assigneeName: string) => Promise<void>;
}

export default function AssignLeadsModal({
  isOpen,
  onClose,
  selectedLeads,
  availableUsers,
  onAssign,
}: AssignLeadsModalProps) {
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }

    const user = availableUsers.find(u => u.email === selectedUser);
    if (!user) return;

    setLoading(true);
    try {
      await onAssign(user.email, user.name);
      onClose();
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Assign Leads
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Selected leads:{' '}
            <span className="font-semibold text-gray-900">
              {selectedLeads.length}
            </span>
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Assign to
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="" className="text-gray-500">
              Select a user…
            </option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name} ({user.email})
                {user.branchName ? ` – ${user.branchName}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedUser}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Assigning…' : 'Assign Leads'}
          </button>
        </div>
      </div>
    </div>
  );
}
