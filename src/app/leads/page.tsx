// src/app/leads/page.tsx - PWA OPTIMIZED + DARK TEXT
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  UserPlus,
  AlertCircle,
  Search,
  Plus,
  Eye,
  ArrowRight,
  Upload,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import AssignLeadsModal from '@/components/AssignLeadsModal';
import { Lead, LeadStatus, LeadSource, CallOutcome } from '@/lib/types';
import AddLeadModal from '@/components/AddLeadModal';
import { useLeads } from '@/lib/useLeads';
import { useDemoMode } from '@/contexts/DemoContext';



export default function LeadsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'admin';

  // View state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showQualifyModal, setShowQualifyModal] = useState(false);
const [selectedLeadForQualify, setSelectedLeadForQualify] = useState<Lead | null>(null);


  // Filters
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedLeads, setSelectedLeads] = useState<string[]>([]); // For bulk actions
const [users, setUsers] = useState<any[]>([]);
const [autoAssigning, setAutoAssigning] = useState(false);
const canAssign = ['owner', 'admin', 'sales'].includes(userRole);
const { refreshSilent } = useLeads();

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers((Array.isArray(data) ? data : data.users ?? [])
        .filter((u: any) => u.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };
  
  if (canAssign) {
    fetchUsers();
  }
}, [canAssign]);

useEffect(() => {
  // ✅ Listen for lead creation events
  const handleLeadCreated = () => {
    console.log('🔔 Lead created - refreshing...');
    refreshSilent();
  };

  window.addEventListener('leadCreated', handleLeadCreated);
  
  return () => {
    window.removeEventListener('leadCreated', handleLeadCreated);
  };
}, [refreshSilent]);

const handleSelectLead = (leadId: string) => {
  console.log('Checkbox clicked:', leadId);
  console.log('Before:', selectedLeads);
  setSelectedLeads((prev) =>
    prev.includes(leadId)
      ? prev.filter((id) => id !== leadId)
      : [...prev, leadId]
  );
};


const handleAssign = async (assignToEmail: string, assignToName: string) => {
  try {
    const response = await fetch('/api/leads/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadIds: selectedLeads,
        assignToEmail,
        assignToName: assignToName || assignToEmail,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      // Close modal first for better UX
      setShowAssignModal(false);
      
      // Show success
      alert(`✅ ${result.assigned} lead(s) assigned to ${assignToName}!`);
      
      // Clear selections
      setSelectedLeads([]);
      
      // Silent refresh in background - NO PAGE RELOAD
      await refreshSilent();
    } else {
      alert(`❌ Failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error: any) {
    alert('❌ Network error. Please try again.');
  }
};


const handleAutoAssign = async () => {
  if (!confirm('Auto-assign all unassigned leads?')) return;
  setAutoAssigning(true);
  try {
    const response = await fetch('/api/leads/auto-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentType: 'round-robin' })
    });
    if (response.ok) {
      const result = await response.json();
      alert(`${result.assigned} leads assigned!`);
      window.location.reload();
    }
  } catch (error) {
    alert('Auto-assignment failed');
  } finally {
    setAutoAssigning(false);
  }
};

  // ✅ Use useLeads hook directly instead of PageWrapper
const { leads: rawLeads, loading, error } = useLeads();
const { isDemoMode } = useDemoMode();

// Apply filters
const filteredLeads = rawLeads.filter((lead: Lead) => {
  const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
  const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
  const matchesAssignee = assigneeFilter === 'all' || lead.assignedTo === assigneeFilter;
  const matchesSearch =
    lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.id.toLowerCase().includes(searchTerm.toLowerCase());

  return matchesStatus && matchesSource && matchesAssignee && matchesSearch;
});

// Calculate metrics
const metrics = calculateMetrics(rawLeads);

// Role-based filtering
const myLeads = userRole === 'telecaller' || userRole === 'sales'
  ? filteredLeads.filter((l: Lead) => l.assignedTo === session?.user?.email)
  : filteredLeads;

// Loading state
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Clock className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
        <p className="text-gray-900 font-medium">Loading leads...</p>
      </div>
    </div>
  );
}

// Error state
if (error) {
  return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
        <p className="text-red-900 font-semibold text-center">{error}</p>
      </div>
    </div>
  );
}

return (
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Demo mode banner */}
    {isDemoMode && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="font-semibold text-yellow-900">📊 Demo Mode - Sample Data</p>
      </div>
    )}

    {/* Header */}
            <div  data-tour="leads-header" className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Lead Management {isDemoMode && <span className="text-blue-600">(Demo)</span>}
                </h1>
                <p className="text-gray-800 font-medium mt-2">
                  Track leads from first contact to enquiry conversion
                </p>
              </div>
            

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {canAssign && (
  <>
    <button data-tour="leads-auto-assign"
      onClick={handleAutoAssign}
      disabled={autoAssigning}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 touch-manipulation"
    >
      <RefreshCw size={20} className={autoAssigning ? 'animate-spin' : ''} />
      Auto-Assign
    </button>
    <button data-tour="leads-assign-btn"
      onClick={() => setShowAssignModal(true)}
      disabled={selectedLeads.length === 0}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 touch-manipulation"
    >
      <UserPlus size={20} />
      Assign ({selectedLeads.length})
    </button>
  </>
)}
                {(userRole === 'admin' || userRole === 'lead-provider') && (
                  <button
                    onClick={() => {/* TODO: Bulk upload */}}
                    className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium touch-manipulation"
                  >
                    <Upload size={20} />
                    <span className="hidden sm:inline">Bulk Upload</span>
                  </button>
                )}

                <button data-tour="leads-add-btn"
                  onClick={() => setShowAddModal(true)}
                  disabled={isDemoMode}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  <Plus size={20} />
                  Add Lead
                </button>
              </div>
            </div>

            {/* Filters */}
<div data-tour="leads-filters" className="bg-white rounded-lg shadow-md p-4 mb-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="Search leads..."
        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none"
        style={{ color: '#111827', fontWeight: '500' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    <select
      className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
      style={{ 
        color: '#111827', 
        fontWeight: '600',
        backgroundColor: 'white'
      }}
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value as any)}
    >
      <option value="all" style={{ color: '#111827', fontWeight: '600' }}>All Status</option>
      <option value="new" style={{ color: '#111827', fontWeight: '600' }}>New</option>
      <option value="assigned" style={{ color: '#111827', fontWeight: '600' }}>Assigned</option>
      <option value="contacted" style={{ color: '#111827', fontWeight: '600' }}>Contacted</option>
      <option value="qualified" style={{ color: '#111827', fontWeight: '600' }}>Qualified</option>
      <option value="converted" style={{ color: '#111827', fontWeight: '600' }}>Converted</option>
      <option value="lost" style={{ color: '#111827', fontWeight: '600' }}>Lost</option>
    </select>

    <select
      className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
      style={{ 
        color: '#111827', 
        fontWeight: '600',
        backgroundColor: 'white'
      }}
      value={sourceFilter}
      onChange={(e) => setSourceFilter(e.target.value as any)}
    >
      <option value="all" style={{ color: '#111827', fontWeight: '600' }}>All Sources</option>
      <option value="website" style={{ color: '#111827', fontWeight: '600' }}>Website</option>
      <option value="referral" style={{ color: '#111827', fontWeight: '600' }}>Referral</option>
      <option value="lead-provider" style={{ color: '#111827', fontWeight: '600' }}>Lead Provider</option>
      <option value="walk-in" style={{ color: '#111827', fontWeight: '600' }}>Walk-in</option>
      <option value="social-media" style={{ color: '#111827', fontWeight: '600' }}>Social Media</option>
    </select>

    {userRole === 'admin' && (
      <select
        className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
        style={{ 
          color: '#111827', 
          fontWeight: '600',
          backgroundColor: 'white'
        }}
        value={assigneeFilter}
        onChange={(e) => setAssigneeFilter(e.target.value)}
      >
        <option value="all" style={{ color: '#111827', fontWeight: '600' }}>All Assignees</option>
      </select>
    )}
  </div>
</div>

            {/* Content based on view */}
            <>
  <LeadListView
    leads={myLeads}
    onViewLead={setSelectedLead}
    onCallLog={(lead) => { setSelectedLead(lead); setShowCallLogModal(true); }}
    onConvert={(lead) => { setSelectedLead(lead); setShowConvertModal(true); }}
    isDemoMode={isDemoMode}
    // ADD THESE PROPS ↓
    selectedLeads={selectedLeads}
    onSelectLead={handleSelectLead}
    onSelectAll={(leads) => setSelectedLeads(leads.map(l => l.id))}
    onDeselectAll={() => setSelectedLeads([])}
  />
</>
            {/* Modals - Lazy render */}
            {selectedLead && !showCallLogModal && !showConvertModal && (
  <LeadDetailsModal
    lead={selectedLead}
    onClose={() => setSelectedLead(null)}
    isDemoMode={isDemoMode}
    onQualify={(lead) => {
      setSelectedLeadForQualify(lead);
      setShowQualifyModal(true);
    }}
  />
)}


            {showCallLogModal && selectedLead && (
              <CallLogModal
                lead={selectedLead}
                onClose={() => {
                  setShowCallLogModal(false);
                  setSelectedLead(null);
                }}
                isDemoMode={isDemoMode}
              />
            )}

            {showConvertModal && selectedLead && (
              <ConvertToEnquiryModal
                lead={selectedLead}
                onClose={() => {
                  setShowConvertModal(false);
                  setSelectedLead(null);
                }}
                isDemoMode={isDemoMode}
              />
            )}
            <AssignLeadsModal
  isOpen={showAssignModal}
  onClose={() => setShowAssignModal(false)}
  selectedLeads={selectedLeads}
  availableUsers={users}
  onAssign={handleAssign}
/>
{showAddModal && (
  <AddLeadModal
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    isDemoMode={isDemoMode}
  />
)}
{/* Qualify Modal */}
{showQualifyModal && selectedLeadForQualify && (
  <QualifyLeadModal
    lead={selectedLeadForQualify}
    onClose={() => {
      setShowQualifyModal(false);
      setSelectedLeadForQualify(null);
    }}
    isDemoMode={isDemoMode}
  />
)}

          </div>
        );}

// Helper function to calculate metrics
function calculateMetrics(leads: Lead[]) {
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const assigned = leads.filter(l => l.status === 'assigned').length;
  const contacted = leads.filter(l => ['contacted', 'callback'].includes(l.status)).length;
  const qualified = leads.filter(l => l.status === 'qualified').length;
  const converted = leads.filter(l => l.converted).length;
  const lost = leads.filter(l => l.status === 'lost').length;

  return {
    total,
    newLeads,
    assigned,
    contacted,
    qualified,
    converted,
    lost,
    contactRate: assigned > 0 ? ((contacted / assigned) * 100).toFixed(1) : '0',
    qualificationRate: contacted > 0 ? ((qualified / contacted) * 100).toFixed(1) : '0',
    conversionRate: qualified > 0 ? ((converted / qualified) * 100).toFixed(1) : '0',
    overallConversion: total > 0 ? ((converted / total) * 100).toFixed(1) : '0',
  };
}

// Lead List View Component  
function LeadListView({
  leads,
  onViewLead,
  onCallLog,
  onConvert,
  isDemoMode,
  selectedLeads,
  onSelectLead,
  onSelectAll,
  onDeselectAll,
}: {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onCallLog: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  isDemoMode: boolean;
  selectedLeads: string[];
  onSelectLead: (leadId: string) => void;
  onSelectAll: (leads: Lead[]) => void;
  onDeselectAll: () => void;
}) {
  const [sortField, setSortField] = useState<'customerName' | 'status' | 'priority' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const sorted = useMemo(() => {
    return [...leads].sort((a, b) => {
      let av: string = String(a[sortField] ?? '');
      let bv: string = String(b[sortField] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [leads, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  }

  // Reset to page 1 when leads change (filter applied)
  useEffect(() => { setPage(1); }, [leads.length]);

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <span className="text-gray-400 ml-1">↕</span>;
    return <span className="text-blue-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="text-left py-4 px-6 font-bold text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === paginated.length && paginated.length > 0}
                  onChange={(e) => e.target.checked ? onSelectAll(paginated) : onDeselectAll()}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  title="Select All"
                />
              </th>
              <th className="text-left py-4 px-6 font-bold text-gray-900">Lead ID</th>
              <th
                className="text-left py-4 px-6 font-bold text-gray-900 cursor-pointer hover:text-blue-600 select-none"
                onClick={() => toggleSort('customerName')}
              >
                Customer <SortIcon field="customerName" />
              </th>
              <th className="text-left py-4 px-6 font-bold text-gray-900">Contact</th>
              <th className="text-left py-4 px-6 font-bold text-gray-900">Source</th>
              <th
                className="text-left py-4 px-6 font-bold text-gray-900 cursor-pointer hover:text-blue-600 select-none"
                onClick={() => toggleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
              <th
                className="text-left py-4 px-6 font-bold text-gray-900 cursor-pointer hover:text-blue-600 select-none"
                onClick={() => toggleSort('priority')}
              >
                Priority <SortIcon field="priority" />
              </th>
              <th className="text-left py-4 px-6 font-bold text-gray-900">Assigned To</th>
              <th className="text-left py-4 px-6 font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(lead => (
              <tr
                key={lead.id}
                className={`border-t border-gray-200 hover:bg-gray-50 ${
                  selectedLeads.includes(lead.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => onSelectLead(lead.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-4 px-6 font-mono text-sm font-semibold text-gray-900">{lead.id}</td>
                <td className="py-4 px-6">
                  <div className="font-bold text-gray-900">{lead.customerName}</div>
                  {lead.capacity && <div className="text-sm font-medium text-gray-700">{lead.capacity}</div>}
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm font-semibold text-gray-900">{lead.phone}</div>
                  {lead.email && <div className="text-xs font-medium text-gray-700">{lead.email}</div>}
                </td>
                <td className="py-4 px-6">
                  <span className="px-2 py-1 bg-gray-100 text-gray-900 font-semibold rounded text-xs border border-gray-300">
                    {lead.source}
                  </span>
                </td>
                <td className="py-4 px-6"><LeadStatusBadge status={lead.status} /></td>
                <td className="py-4 px-6">
                  <span className="px-2 py-1 bg-blue-50 text-blue-800 font-semibold rounded text-xs border border-blue-200">
                    {lead.priority}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-gray-900">{lead.assignedToName || '-'}</td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button onClick={() => onViewLead(lead)} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 touch-manipulation" title="View Details" aria-label="View Details">
                      <Eye size={18} />
                    </button>
                    {lead.status !== 'converted' && (
                      <>
                        <button onClick={() => onCallLog(lead)} disabled={isDemoMode} className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 disabled:opacity-50 touch-manipulation" title="Log Call" aria-label="Log Call">
                          <Phone size={18} />
                        </button>
                        {(lead.status === 'assigned' || lead.status === 'contacted' || lead.status === 'callback') && (
                          <button onClick={() => onViewLead(lead)} disabled={isDemoMode} className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 disabled:opacity-50 touch-manipulation" title="Qualify Lead" aria-label="Qualify Lead">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {lead.status === 'qualified' && (
                          <button onClick={() => onConvert(lead)} disabled={isDemoMode} className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 disabled:opacity-50 touch-manipulation" title="Convert to Enquiry" aria-label="Convert to Enquiry">
                            <ArrowRight size={18} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {paginated.map(lead => (
          <div
            key={lead.id}
            className={`p-4 hover:bg-gray-50 ${
              selectedLeads.includes(lead.id) ? 'bg-blue-50 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <input
                type="checkbox"
                checked={selectedLeads.includes(lead.id)}
                onChange={() => onSelectLead(lead.id)}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 mt-1"
              />
              <div className="flex-1 ml-3">
                <div className="font-bold text-gray-900">{lead.customerName}</div>
                <div className="text-xs font-mono text-gray-700">{lead.id}</div>
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>
            <div className="space-y-1 mb-3 text-sm">
              <div className="font-semibold text-gray-900">{lead.phone}</div>
              {lead.capacity && <div className="text-gray-700 font-medium">{lead.capacity}</div>}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-900 font-semibold rounded border border-gray-300">
                {lead.source}
              </span>
              <div className="grid grid-cols-2 gap-1 sm:flex sm:gap-2">
                <button onClick={() => onViewLead(lead)} className="text-blue-600 p-2 rounded-lg bg-blue-50 touch-manipulation" aria-label="View">
                  <Eye size={18} />
                </button>
                {lead.status !== 'converted' && (
                  <button onClick={() => onCallLog(lead)} disabled={isDemoMode} className="text-green-600 p-2 rounded-lg bg-green-50 disabled:opacity-50 touch-manipulation" aria-label="Call">
                    <Phone size={18} />
                  </button>
                )}
                {(lead.status === 'assigned' || lead.status === 'contacted' || lead.status === 'callback') && (
                  <button onClick={() => onViewLead(lead)} disabled={isDemoMode} className="text-emerald-600 p-2 rounded-lg bg-emerald-50 disabled:opacity-50 touch-manipulation" aria-label="Qualify">
                    <CheckCircle size={18} />
                  </button>
                )}
                {lead.status === 'qualified' && (
                  <button onClick={() => onConvert(lead)} disabled={isDemoMode} className="text-purple-600 p-2 rounded-lg bg-purple-50 disabled:opacity-50 touch-manipulation" aria-label="Convert">
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {leads.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold">No leads found</p>
          <p className="text-gray-700 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} leads
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-bold rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 touch-manipulation"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 text-sm font-bold rounded-lg border-2 touch-manipulation ${
                    p === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 text-sm font-bold rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 touch-manipulation"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Lead Card Component
function LeadCard({ lead, compact = false }: { lead: Lead; compact?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md p-3 cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-all touch-manipulation">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm truncate">{lead.customerName}</div>
          <div className="text-xs font-mono text-gray-700">{lead.id}</div>
        </div>
        {lead.priority === 'high' || lead.priority === 'urgent' ? (
          <span className="px-2 py-1 bg-red-100 text-red-900 font-bold rounded text-xs border border-red-300 flex-shrink-0 ml-2">
            {lead.priority}
          </span>
        ) : null}
      </div>

      {!compact && (
        <>
          <div className="space-y-1 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
              <Phone size={12} className="flex-shrink-0" />
              <span className="truncate">{lead.phone}</span>
            </div>
            {lead.capacity && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                <TrendingUp size={12} className="flex-shrink-0" />
                <span>{lead.capacity}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-200">
            <span className="text-gray-700 font-medium">
            {lead.createdAt ? new Date(lead.createdAt as any).toLocaleDateString() : ''}
            </span>
            {lead.assignedToName && (
              <span className="text-blue-700 font-semibold truncate max-w-[100px]">
                {lead.assignedToName.split(' ')[0]}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Lead Status Badge
function LeadStatusBadge({ status }: { status: LeadStatus | string }) {
  const config: Record<string, { label: string; color: string }> = {
    new:       { label: 'New',       color: 'bg-gray-100 text-gray-900 border-gray-300' },
    assigned:  { label: 'Assigned',  color: 'bg-blue-100 text-blue-900 border-blue-300' },
    contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-900 border-yellow-400' },
    callback:  { label: 'Callback',  color: 'bg-orange-100 text-orange-900 border-orange-300' },
    qualified: { label: 'Qualified', color: 'bg-green-100 text-green-900 border-green-400' },
    converted: { label: 'Converted', color: 'bg-purple-100 text-purple-900 border-purple-400' },
    lost:      { label: 'Lost',      color: 'bg-red-100 text-red-900 border-red-300' },
    nurture:   { label: 'Nurture',   color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  };

  const fallbackLabel =
    status && typeof status === 'string'
      ? status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Unknown';

  const fallbackColor = 'bg-gray-100 text-gray-900 border-gray-300';

  const configEntry = config[status as string] ?? {
    label: fallbackLabel,
    color: fallbackColor,
  };

  const { label, color } = configEntry;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 ${color}`}>
      {label}
    </span>
  );
}


function LeadDetailsModal({
  lead,
  onClose,
  isDemoMode,
  onQualify,
}: {
  lead: Lead;
  onClose: () => void;
  isDemoMode: boolean;
  onQualify: (lead: Lead) => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (activeTab === 'activity') {
      setLoadingActivities(true);
      fetch(`/api/leads/${lead.id}/activity`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setActivities(data))
        .catch(() => setActivities([]))
        .finally(() => setLoadingActivities(false));
    }
  }, [activeTab, lead.id]);

  const activityIcons: Record<string, string> = {
    call: '📞',
    'status-changed': '🔄',
    converted: '🎯',
    qualified: '✅',
    assigned: '👤',
    created: '🆕',
    note: '📝',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{lead.customerName}</h2>
              <p className="text-sm font-mono text-gray-700 mt-1">{lead.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 touch-manipulation"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-bold text-sm touch-manipulation ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-lg font-bold text-sm touch-manipulation ${
                activeTab === 'activity'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Activity Timeline
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="text-sm font-semibold text-gray-900 mb-2">Status</div>
                <LeadStatusBadge status={lead.status} />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="text-sm font-semibold text-gray-900 mb-2">Priority</div>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded font-bold text-sm border-2 border-blue-300 inline-block">
                  {lead.priority}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="text-sm font-semibold text-gray-900 mb-2">Source</div>
                <span className="px-2.5 py-1 bg-green-100 text-green-900 rounded font-bold text-sm border-2 border-green-300 inline-block">
                  {lead.source}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Contact Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-700 flex-shrink-0" />
                  <span className="text-gray-900 font-semibold">{lead.phone}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-700 flex-shrink-0" />
                    <span className="text-gray-900 font-semibold">{lead.email}</span>
                  </div>
                )}
                {lead.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-700 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-gray-900 font-semibold">{lead.address}</div>
                      {lead.area && <div className="text-sm font-medium text-gray-700 mt-1">{lead.area}</div>}
                    </div>
                  </div>
                )}
                {lead.assignedToName && (
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-gray-700 flex-shrink-0" />
                    <span className="text-gray-900 font-semibold">{lead.assignedToName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Qualification Data — only show if qualified */}
            {lead.qualified && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Qualification Data</h3>
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 grid grid-cols-2 gap-3">
                  {lead.estimatedBudget && (
                    <div>
                      <div className="text-xs font-bold text-gray-600">Budget</div>
                      <div className="text-sm font-semibold text-gray-900">₹{Number(lead.estimatedBudget).toLocaleString()}</div>
                    </div>
                  )}
                  {lead.electricityBill && (
                    <div>
                      <div className="text-xs font-bold text-gray-600">Electricity Bill</div>
                      <div className="text-sm font-semibold text-gray-900">₹{lead.electricityBill}/month</div>
                    </div>
                  )}
                  {lead.purchaseTimelineDays && (
                    <div>
                      <div className="text-xs font-bold text-gray-600">Timeline</div>
                      <div className="text-sm font-semibold text-gray-900">{lead.purchaseTimelineDays} days</div>
                    </div>
                  )}
                  {lead.roofType && (
                    <div>
                      <div className="text-xs font-bold text-gray-600">Roof Type</div>
                      <div className="text-sm font-semibold text-gray-900">{lead.roofType}</div>
                    </div>
                  )}
                  {lead.purchaseIntent && (
                    <div>
                      <div className="text-xs font-bold text-gray-600">Purchase Intent</div>
                      <div className="text-sm font-semibold text-gray-900">{lead.purchaseIntent}</div>
                    </div>
                  )}
                  {lead.decisionMaker && (
                    <div>
                      <div className="text-xs font-bold text-gray-600">Decision Maker</div>
                      <div className="text-sm font-semibold text-gray-900">{lead.decisionMaker}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {lead.notes && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Notes</h3>
                <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                  <p className="text-gray-900 font-medium">{lead.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="p-6">
            {loadingActivities ? (
              <div className="text-center py-12">
                <Clock className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Loading activity...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No activity recorded yet</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-4">
                  {activities.map((activity, idx) => {
                    const icon = activityIcons[activity.action] || '📋';
                    const date = activity.timestamp
                      ? new Date(activity.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : '—';
                    const time = activity.timestamp
                      ? new Date(activity.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '';
                    const meta = activity.metadata || {};
                    return (
                      <div key={idx} className="relative pl-10">
                        <div className="absolute left-2 top-1 w-5 h-5 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs">
                          {icon}
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900 capitalize">
                              {activity.action?.replace(/-/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-500">{date} {time}</span>
                          </div>
                          {activity.details && (
                            <p className="text-sm text-gray-700 mb-1">{activity.details}</p>
                          )}
                          {meta.outcome && (
                            <span className="text-xs font-semibold text-blue-700">
                              Outcome: {meta.outcome}
                            </span>
                          )}
                          <p className="text-xs text-gray-500 mt-1">By: {activity.performedBy}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="p-6 border-t-2 border-gray-200 bg-gray-50 space-y-3">
          {(lead.status === 'assigned' || lead.status === 'contacted' || lead.status === 'callback') && !lead.qualified && (
            <button
              onClick={() => { onQualify(lead); onClose(); }}
              disabled={isDemoMode}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 touch-manipulation"
            >
              ✅ Mark as Qualified
            </button>
          )}
          {lead.qualified && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-center">
              <span className="text-green-800 font-bold">
                ✅ Qualified on {lead.qualifiedDate ? new Date(lead.qualifiedDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Call Log Modal
function CallLogModal({
  lead,
  onClose,
  isDemoMode,
}: {
  lead: Lead;
  onClose: () => void;
  isDemoMode: boolean;
}) {
  const [callOutcome, setCallOutcome] = useState<CallOutcome>('interested');
  const [callNotes, setCallNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch call history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/leads/${lead.id}/activity`);
        if (res.ok) {
          const all = await res.json();
          setHistory(all.filter((a: any) => a.action === 'call'));
        }
      } catch {
        // silent — history is non-blocking
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [lead.id]);

  const handleSubmit = async () => {
    if (isDemoMode) return;
    setProcessing(true);
    try {
      const response = await fetch('/api/leads/log-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          callOutcome,
          notes: callNotes,
          nextFollowupDate: followUpDate,
        }),
      });
      if (!response.ok) throw new Error('Failed');
      alert('Call logged successfully!');
      onClose();
      window.location.reload();
    } catch (error) {
      alert('Failed to log call. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const outcomeColors: Record<string, string> = {
    interested: 'bg-green-100 text-green-800 border-green-300',
    'not-interested': 'bg-red-100 text-red-800 border-red-300',
    callback: 'bg-orange-100 text-orange-800 border-orange-300',
    'no-answer': 'bg-gray-100 text-gray-800 border-gray-300',
    'wrong-number': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'not-reachable': 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Log Call</h2>
          <p className="text-sm font-medium text-gray-700 mt-1">{lead.customerName} · {lead.phone}</p>
        </div>

        {/* Call History */}
        <div className="px-6 pt-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
            Previous Calls
          </h3>
          {loadingHistory ? (
            <p className="text-sm text-gray-500 italic mb-4">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-500 italic mb-4">No previous calls recorded.</p>
          ) : (
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              {history.map((entry, idx) => {
                const meta = entry.metadata || {};
                const outcome = meta.outcome || 'call';
                const date = entry.timestamp
                  ? new Date(entry.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })
                  : '—';
                const time = entry.timestamp
                  ? new Date(entry.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit',
                    })
                  : '';
                return (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${outcomeColors[outcome] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                        {outcome.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </span>
                      <span className="text-xs text-gray-500">{date} {time}</span>
                    </div>
                    {entry.details && (
                      <p className="text-sm text-gray-700 mt-1">{entry.details}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">By: {entry.performedBy}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 pb-2">
          <div className="border-t-2 border-dashed border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              Log New Call
            </h3>
          </div>
        </div>

        <div className="px-6 pb-4 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Call Outcome *</label>
            <select
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-blue-600 focus:outline-none"
              value={callOutcome}
              onChange={(e) => setCallOutcome(e.target.value as CallOutcome)}
            >
              <option value="interested">Interested</option>
              <option value="not-interested">Not Interested</option>
              <option value="callback">Callback Requested</option>
              <option value="no-answer">No Answer</option>
              <option value="wrong-number">Wrong Number</option>
              <option value="not-reachable">Not Reachable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Notes</label>
            <textarea
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none"
              rows={3}
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="What was discussed..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Follow Up Date <span className="text-gray-500 font-medium">(optional)</span>
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-6 border-t-2 border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-900 font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50 touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing || isDemoMode}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {processing ? 'Saving...' : 'Save Call'}
          </button>
        </div>
      </div>
    </div>
  );
}


// Convert Modal
function ConvertToEnquiryModal({ lead, onClose, isDemoMode }: { lead: Lead; onClose: () => void; isDemoMode: boolean }) {
  const [processing, setProcessing] = useState(false);
  
  // Add form state
  const [formData, setFormData] = useState({
    systemCapacity: lead.capacity || '',
    preferredInstallationDate: '',
    specialRequirements: '',
  });  

  const handleConvert = async () => {
    if (isDemoMode) return;
    
    // Validate required fields
    if (!formData.systemCapacity) {
      alert('System capacity is required');
      return;
    }
    
    setProcessing(true);
    try {
      const response = await fetch('/api/leads/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          enquiryData: {
            // Customer data from lead
            customerName: lead.customerName,
            phone: lead.phone,
            email: lead.email,
            address: lead.address,
            area: lead.area,
            allottedUser: lead.assignedTo || '',
          
            // Capacity — only new field needed
            capacity: formData.systemCapacity,
            preferredInstallationDate: formData.preferredInstallationDate,
            notes: formData.specialRequirements,
          
            // ✅ Auto-carried from qualify step — not re-asked
            estimatedCost: lead.estimatedBudget || '',
            roofType: lead.roofType || '',
            electricityBill: lead.electricityBill || '',
            purchaseTimelineDays: lead.purchaseTimelineDays || '',
            decisionMaker: lead.decisionMaker || '',
            purchaseIntent: lead.purchaseIntent || '',
          
            // Enquiry metadata
            status: 'survey-pending',
            leadSource: lead.source,
            convertedFrom: lead.id,
          },          
        }),
      });

      if (!response.ok) throw new Error('Failed');
      
      const data = await response.json();
      alert(`Lead converted successfully! Enquiry ID: ${data.enquiry.id}`);
      window.location.href = `/enquiries/${data.enquiry.id}`;
    } catch (error) {
      alert('Failed to convert lead. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Convert Lead to Enquiry</h2>
          <p className="text-sm text-gray-600 mt-1">{lead.customerName}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Lead Summary */}
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm font-bold text-gray-900 min-w-[100px]">Lead:</span>
              <span className="text-sm font-semibold text-gray-900">{lead.customerName}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm font-bold text-gray-900 min-w-[100px]">Phone:</span>
              <span className="text-sm font-semibold text-gray-900">{lead.phone}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm font-bold text-gray-900 min-w-[100px]">Area:</span>
              <span className="text-sm font-semibold text-gray-900">{lead.area || 'Not specified'}</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                System Capacity (kW) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.systemCapacity}
                onChange={(e) => setFormData({ ...formData, systemCapacity: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder="e.g., 5.0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Preferred Installation Date
              </label>
              <input
                type="date"
                value={formData.preferredInstallationDate}
                onChange={(e) => setFormData({ ...formData, preferredInstallationDate: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Special Requirements / Notes
              </label>
              <textarea
                rows={3}
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-blue-600 focus:outline-none"
                placeholder="Any special requirements or notes..."
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-900">
  ℹ️ This will create a new enquiry with survey-pending status. The lead will be marked as converted.
</p>
{(lead.estimatedBudget || lead.roofType || lead.electricityBill) && (
  <div className="mt-2 pt-2 border-t border-yellow-300 space-y-1">
    <p className="text-xs font-bold text-gray-700">✅ Auto-carried from qualification:</p>
    {lead.estimatedBudget && <p className="text-xs text-gray-700">• Budget: ₹{lead.estimatedBudget.toLocaleString()}</p>}
    {lead.roofType && <p className="text-xs text-gray-700">• Roof Type: {lead.roofType}</p>}
    {lead.electricityBill && <p className="text-xs text-gray-700">• Electricity Bill: ₹{lead.electricityBill}/month</p>}
    {lead.purchaseTimelineDays && <p className="text-xs text-gray-700">• Timeline: {lead.purchaseTimelineDays} days</p>}
  </div>
)}
          </div>
        </div>

        <div className="p-6 border-t-2 border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-900 font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50 touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={processing || isDemoMode || !formData.systemCapacity}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {processing ? 'Converting...' : 'Convert to Enquiry'}
          </button>
        </div>
      </div>
    </div>
  );
}

function QualifyLeadModal({
  lead,
  onClose,
  isDemoMode,
}: {
  lead: Lead;
  onClose: () => void;
  isDemoMode: boolean;
}) {
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    budget: lead.estimatedBudget?.toString() || '',
    purchaseTimelineDays: '',
    decisionMaker: lead.decisionMaker || 'self',
    electricityBill: lead.electricityBill?.toString() || '',
    roofType: lead.roofType || 'flat',
    purchaseIntent: lead.purchaseIntent || 'warm',
    qualificationNotes: '',
  });  

  const handleQualify = async () => {
    if (isDemoMode) return;

    if (!formData.budget || !formData.electricityBill || !formData.purchaseTimelineDays) {
      alert('Budget, electricity bill and purchase timeline are required');    
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/leads/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          qualificationNotes: formData.qualificationNotes,
          estimatedBudget: formData.budget,
          purchaseTimelineDays: formData.purchaseTimelineDays,
          electricityBill: formData.electricityBill,
          roofType: formData.roofType,
          decisionMaker: formData.decisionMaker,
          purchaseIntent: formData.purchaseIntent,
        }),        
      });

      if (!response.ok) throw new Error('Failed to qualify lead');

      alert('Lead qualified successfully!');
      window.location.reload();
    } catch (error) {
      alert('Failed to qualify lead. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Qualify Lead</h2>
          <p className="text-sm text-gray-600 mt-1">{lead.customerName} - {lead.phone}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Budget (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-green-600 focus:outline-none"
              placeholder="e.g., 300000"
            />
          </div>

          {/* REMOVE entire timeline select div and replace with: */}
<div>
  <label className="block text-sm font-bold text-gray-900 mb-2">
    Purchase Timeline (days) <span className="text-red-500">*</span>
  </label>
  <input
    type="number"
    min="1"
    required
    value={formData.purchaseTimelineDays}
    onChange={(e) => setFormData({ ...formData, purchaseTimelineDays: e.target.value })}
    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-green-600 focus:outline-none"
    placeholder="e.g., 30 (days to purchase)"
  />
  <p className="text-xs text-gray-500 mt-1">Enter number of days. Example: 30 = within a month</p>
</div>


          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Avg Monthly Electricity Bill (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.electricityBill}
              onChange={(e) => setFormData({ ...formData, electricityBill: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-green-600 focus:outline-none"
              placeholder="e.g., 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Decision Maker
            </label>
            <select
              value={formData.decisionMaker}
              onChange={(e) => setFormData({ ...formData, decisionMaker: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-green-600 focus:outline-none"
            >
              <option value="self">Self</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="business-partner">Business Partner</option>
              <option value="board">Board/Committee</option>
            </select>
          </div>

          <div>
  <label className="block text-sm font-bold text-gray-900 mb-2">
    Roof Type
  </label>
  <select
    value={formData.roofType}
    onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-green-600 focus:outline-none"
  >
    <option value="flat">Flat / RCC</option>
    <option value="sloped">Sloped / Tin</option>
    <option value="partial">Partial Shade</option>
    <option value="no-roof">No Roof Access</option>
  </select>
</div>


          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Purchase Intent
            </label>
            <select
              value={formData.purchaseIntent}
              onChange={(e) => setFormData({ ...formData, purchaseIntent: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-green-600 focus:outline-none"
            >
              {/* REPLACE options only: */}
<option value="hot">🔥 Hot — Ready to buy now</option>
<option value="warm">⚡ Warm — Interested, needs follow-up</option>
<option value="cold">❄️ Cold — Just exploring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Qualification Notes
            </label>
            <textarea
              rows={3}
              value={formData.qualificationNotes}
              onChange={(e) => setFormData({ ...formData, qualificationNotes: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-green-600 focus:outline-none"
              placeholder="Additional notes about the qualification..."
            />
          </div>
        </div>

        <div className="p-6 border-t-2 border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-900 font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleQualify}
            disabled={processing || isDemoMode}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg disabled:opacity-50"
          >
            {processing ? 'Qualifying...' : 'Mark as Qualified'}
          </button>
        </div>
      </div>
    </div>
  );
}
