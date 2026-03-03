// src/components/FollowupModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, PhoneCall, Mail, MapPin, MessageCircle, X } from 'lucide-react';

interface Props {
  enquiryId: string;
  customerName: string;
  onClose: () => void;
  onSaved: () => void; // renamed from onSubmit for clarity
}

const FOLLOWUP_TYPES = [
  { value: 'call',    label: 'Phone Call',  icon: PhoneCall },
  { value: 'visit',   label: 'Site Visit',  icon: MapPin },
  { value: 'whatsapp',label: 'WhatsApp',    icon: MessageCircle },
  { value: 'email',   label: 'Email',       icon: Mail },
] as const;

type FollowupType = typeof FOLLOWUP_TYPES[number]['value'];

const OUTCOMES = [
  'Interested',
  'Not Interested',
  'Converted',
  'Callback Later',
] as const;

type Outcome = typeof OUTCOMES[number];

interface FormState {
  followupType: FollowupType;
  followupNotes: string;
  outcome: Outcome | '';
  nextFollowupDate: string;
}

export default function FollowupModal({ enquiryId, customerName, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>({
    followupType: 'call',
    followupNotes: '',
    outcome: '',
    nextFollowupDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  const todayISO = new Date().toISOString().split('T')[0];
  const isValid = form.followupNotes.trim().length > 0 && form.outcome !== '';

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError(null);

    try {
      // 1. Append row to FOLLOWUPS tab
      const fuRes = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId,
          followupType: form.followupType,
          followupNotes: form.followupNotes,
          outcome: form.outcome,
          nextFollowupDate: form.nextFollowupDate || '',
        }),
      });

      if (!fuRes.ok) {
        const data = await fuRes.json();
        throw new Error(data.error ?? 'Failed to save follow-up');
      }

      // 2. Patch back lastFollowupDate + nextActionDate on the ENQUIRIES row
      //    so the dashboard / kanban card reflects this follow-up immediately
      const patchPayload: Record<string, string> = {
        lastFollowupDate: todayISO,
      };
      if (form.nextFollowupDate) {
        patchPayload.nextActionDate = form.nextFollowupDate;
      }

      try {
        await fetch(`/api/enquiries/${enquiryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchPayload),
        });
      } catch {
        // silent — followup already saved above
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
<div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 pb-16 sm:pb-0 sm:p-4 touch-none">
<div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[90vh] flex flex-col mb-16 sm:mb-0">

      {/* Header — outside scroll area, not sticky, just sits on top */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Add Follow-up</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {customerName} · <span className="text-blue-600 font-mono text-xs">{enquiryId}</span>
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Scrollable body — this is the ONLY scrollable div */}
      <div className="px-6 pb-6 pt-4 space-y-4 overflow-y-auto flex-grow">

        {/* Follow-up Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {FOLLOWUP_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(f => ({ ...f, followupType: value }))}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition
                  ${form.followupType === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.followupNotes}
            onChange={e => setForm(f => ({ ...f, followupNotes: e.target.value }))}
            rows={3}
            placeholder="What happened in this follow-up?"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm resize-none"
          />
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Outcome <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {OUTCOMES.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => setForm(f => ({ ...f, outcome: o }))}
                className={`py-2 rounded-xl border-2 text-xs font-semibold transition
                  ${form.outcome === o
                    ? o === 'Not Interested'
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : o === 'Converted'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                  }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Next Follow-up Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Next Follow-up Date
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="date"
            value={form.nextFollowupDate}
            min={todayISO}
            onChange={e => setForm(f => ({ ...f, nextFollowupDate: e.target.value }))}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
          >
            {saving
              ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
              : <><CheckCircle2 size={16} /> Save Follow-up</>
            }
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition"
          >
            Cancel
          </button>
        </div>

      </div>
      {/* END scrollable body */}

    </div>
  </div>
);
}
