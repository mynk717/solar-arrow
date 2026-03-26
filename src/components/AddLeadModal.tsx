// src/components/AddLeadModal.tsx
'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { LeadSource } from '@/lib/types';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode?: boolean;
}

export default function AddLeadModal({ isOpen, onClose, isDemoMode = false }: AddLeadModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    capacity: '',
    source: 'website' as LeadSource,
    priority: 'medium',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode) {
      alert('Demo mode - cannot create leads');
      return;
    }
  
    setSaving(true);
    try {
      // ✅ Prepare complete lead data with ALL required fields
      const leadData = {
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email || '',
        address: formData.address || '',
        area: formData.area || '',
        capacity: formData.capacity || '',
        source: formData.source,
        status: 'new',
        priority: formData.priority,
        notes: formData.notes || '',
        providerId: '',
        providerName: '',
        assignedTo: '',
        assignedToName: '',
        assignedDate: '',
        urgency: 'medium',
        callbackScheduled: false,
        qualified: false,
        converted: false,
        contactAttempts: 0,
        tags: [],
      };
  
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lead');
      }
  
      alert('Lead created successfully!');
      onClose();
      window.dispatchEvent(new CustomEvent('leadCreated'));
    } catch (error: any) {
      console.error('Error creating lead:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Add New Lead</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Enter customer name"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91-9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>
          </div>

          {/* Address & Area */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Address
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Area/City
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="Raipur"
            />
          </div>

          {/* Capacity, Source, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Capacity (kW)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="5.0"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Source *
              </label>
              <select
                required
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold focus:border-blue-600 focus:outline-none"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="lead-provider">Lead Provider</option>
                <option value="walk-in">Walk-in</option>
                <option value="social-media">Social Media</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Priority *
              </label>
              <select
                required
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-semibold focus:border-blue-600 focus:outline-none"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this lead..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-900 font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isDemoMode}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
