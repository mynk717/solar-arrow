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
  onAssign
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Assign Leads</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Selected leads: <strong>{selectedLeads.length}</strong>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Assign to:</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select a user...</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.email}>
                {user.name} ({user.email}) {user.branchName && `- ${user.branchName}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedUser}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Leads'}
          </button>
        </div>
      </div>
    </div>
  );
}