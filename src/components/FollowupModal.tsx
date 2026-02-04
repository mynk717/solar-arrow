import React, { useState } from 'react';

interface Props {
  enquiryId: string;
  customerName: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function FollowupModal({ enquiryId, customerName, onClose, onSubmit }: Props) {
  const [followupType, setFollowupType] = useState('Call');
  const [followupNotes, setFollowupNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId,
          followupType,
          followupNotes,
          outcome,
          nextFollowupDate
        })
      });

      if (response.ok) {
        onSubmit();
        onClose();
      }
    } catch (error) {
      console.error('Error adding follow-up:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Add Follow-up</h2>
        <p className="text-gray-600 mb-4">Customer: {customerName}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Follow-up Type</label>
            <select
              value={followupType}
              onChange={(e) => setFollowupType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option>Call</option>
              <option>Email</option>
              <option>Visit</option>
              <option>WhatsApp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={followupNotes}
              onChange={(e) => setFollowupNotes(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Outcome</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select outcome</option>
              <option>Interested</option>
              <option>Not Interested</option>
              <option>Converted</option>
              <option>Callback Later</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Next Follow-up Date</label>
            <input
              type="date"
              value={nextFollowupDate}
              onChange={(e) => setNextFollowupDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Adding...' : 'Add Follow-up'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}