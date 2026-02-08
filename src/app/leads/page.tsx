// src/app/leads/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Phone, Mail, MapPin, Zap, Plus, Loader2, UserPlus } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

// Demo leads data
const demoLeads = [
  {
    id: 'LEAD-001',
    name: 'Ramesh Patel',
    phone: '+91 98765 43210',
    email: 'ramesh.patel@email.com',
    location: 'Civil Lines, Raipur',
    source: 'Website',
    capacity: '3 kW',
    status: 'new',
    createdAt: new Date('2026-01-20'),
    notes: 'Interested in rooftop solar for home',
  },
  {
    id: 'LEAD-002',
    name: 'Sunita Verma',
    phone: '+91 98765 43211',
    email: 'sunita.v@email.com',
    location: 'Shankar Nagar, Raipur',
    source: 'Referral',
    capacity: '5 kW',
    status: 'contacted',
    createdAt: new Date('2026-01-21'),
    notes: 'Follow up on Thursday',
  },
  {
    id: 'LEAD-003',
    name: 'Anil Kumar',
    phone: '+91 98765 43212',
    email: 'anil.kumar@email.com',
    location: 'Telibandha, Raipur',
    source: 'Walk-in',
    capacity: '10 kW',
    status: 'qualified',
    createdAt: new Date('2026-01-22'),
    notes: 'Commercial property, high interest',
  },
];

export default function LeadsPage() {
  const { data: session, status } = useSession();
  const { isDemoMode } = useDemoMode();
  const [leads, setLeads] = useState(demoLeads);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLeads(demoLeads);
      setLoading(false);
    } else if (status === 'authenticated') {
      // TODO: Fetch real leads from Google Sheets
      setLeads(demoLeads); // Using demo for now
      setLoading(false);
    }
  }, [status]);

  const handleConvertToEnquiry = (leadId: string) => {
    if (isDemoMode) {
      return;
    }
    // Convert lead to enquiry
    alert(`Converting ${leadId} to enquiry...`);
  };

  const newLeads = leads.filter(l => l.status === 'new');
  const contacted = leads.filter(l => l.status === 'contacted');
  const qualified = leads.filter(l => l.status === 'qualified');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <DemoBanner />
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lead Management {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-2">
              {isDemoMode ? 'Sample lead data - Sign in to manage real leads' : 'Track and convert leads to enquiries'}
            </p>
          </div>
          <button
            onClick={() => !isDemoMode && setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            New Lead
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">New Leads</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{newLeads.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Contacted</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{contacted.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-medium">Qualified</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{qualified.length}</p>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* New Leads */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Leads</h2>
            <div className="space-y-4">
              {newLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onConvert={handleConvertToEnquiry} isDemoMode={isDemoMode} />
              ))}
            </div>
          </div>

          {/* Contacted */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contacted</h2>
            <div className="space-y-4">
              {contacted.map(lead => (
                <LeadCard key={lead.id} lead={lead} onConvert={handleConvertToEnquiry} isDemoMode={isDemoMode} />
              ))}
            </div>
          </div>

          {/* Qualified */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Qualified</h2>
            <div className="space-y-4">
              {qualified.map(lead => (
                <LeadCard key={lead.id} lead={lead} onConvert={handleConvertToEnquiry} isDemoMode={isDemoMode} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead, onConvert, isDemoMode }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-900">{lead.name}</h3>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">{lead.source}</span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Phone size={14} />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={14} />
          <span>{lead.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span>{lead.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={14} />
          <span>{lead.capacity}</span>
        </div>
      </div>

      {lead.notes && (
        <p className="text-xs text-gray-500 mb-3 italic">{lead.notes}</p>
      )}

      <button
        onClick={() => onConvert(lead.id)}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2"
      >
        <UserPlus size={16} />
        Convert to Enquiry
      </button>
    </div>
  );
}
