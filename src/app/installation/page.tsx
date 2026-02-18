'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Calendar,
  Users,
  Zap,
  MapPin,
  Phone,
  Eye,
  Edit,
  Camera,
  Download,
} from 'lucide-react';

interface Installation {
  enquiryId: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  capacity: string;
  status: string;
  systemCapacity: string;
  panelMake: string;
  panelWattage: string;
  panelQuantity: string;
  inverterMake: string;
  inverterCapacity: string;
  structureType: string;
  installationScheduledDate?: string;
  installationStartDate?: string;
  installationCompletedDate?: string;
  installationTeam?: string;
  installationSupervisor?: string;
  installationNotes?: string;
  pvModuleSerialNumbers?: string;
  inverterSerialNumber?: string;
  meterNumber?: string;
  meterInstalledDate?: string;
  meterReadingInitial?: string;
  earthingDone: string;
  earthingResistance?: string;
  installationPhotos?: string;
  inspectionScheduledDate?: string;
  inspectionDate?: string;
  inspectionStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InstallationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchInstallations();
  }, []);

  const fetchInstallations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/installation');
      if (!response.ok) throw new Error('Failed to fetch installations');
      const data = await response.json();
      setInstallations(data.installations || []);
    } catch (error) {
      console.error('Error fetching installations:', error);
      alert('Failed to load installations');
    } finally {
      setLoading(false);
    }
  };

  // Filter installations
  const filteredInstallations = installations.filter((inst) => {
    const matchesSearch = !searchQuery || 
      inst.enquiryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'scheduled' && inst.installationScheduledDate && !inst.installationStartDate) ||
      (filterStatus === 'in-progress' && inst.installationStartDate && !inst.installationCompletedDate) ||
      (filterStatus === 'completed' && inst.installationCompletedDate);
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const scheduled = installations.filter(i => i.installationScheduledDate && !i.installationStartDate).length;
  const inProgress = installations.filter(i => i.installationStartDate && !i.installationCompletedDate).length;
  const completed = installations.filter(i => i.installationCompletedDate).length;
  const pending = installations.filter(i => !i.installationScheduledDate).length;

  const handleSchedule = (installation: Installation) => {
    setSelectedInstallation(installation);
    setShowScheduleModal(true);
  };

  const handleComplete = (installation: Installation) => {
    setSelectedInstallation(installation);
    setShowCompleteModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Installation Management</h1>
            <p className="text-slate-700 mt-1 text-sm md:text-base">
              Schedule, track, and complete solar installations
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatCard icon={<Clock size={24} />} label="Pending" value={pending} color="yellow" />
        <StatCard icon={<Calendar size={24} />} label="Scheduled" value={scheduled} color="blue" />
        <StatCard icon={<Wrench size={24} />} label="In Progress" value={inProgress} color="orange" />
        <StatCard icon={<CheckCircle size={24} />} label="Completed" value={completed} color="green" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <input
            type="text"
            placeholder="Search by Enquiry ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 text-sm md:text-base"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm md:text-base"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-4 py-2.5 rounded-lg hover:bg-slate-200 font-medium text-sm md:text-base">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Installation List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-600 bg-white rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="font-medium">Loading installations...</p>
          </div>
        ) : filteredInstallations.length === 0 ? (
          <div className="text-center py-16 text-slate-600 bg-white rounded-xl">
            <Wrench size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium text-lg">No installations found</p>
            <p className="text-slate-500 text-sm mt-2">Check BOM dispatch status for pending installations</p>
          </div>
        ) : (
          filteredInstallations.map((installation) => (
            <InstallationCard
              key={installation.enquiryId}
              installation={installation}
              expanded={expanded === installation.enquiryId}
              onToggleExpand={() => setExpanded(expanded === installation.enquiryId ? null : installation.enquiryId)}
              onSchedule={() => handleSchedule(installation)}
              onComplete={() => handleComplete(installation)}
            />
          ))
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedInstallation && (
        <ScheduleModal
          installation={selectedInstallation}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedInstallation(null);
          }}
          onSuccess={() => {
            setShowScheduleModal(false);
            setSelectedInstallation(null);
            fetchInstallations();
          }}
        />
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedInstallation && (
        <CompleteModal
          installation={selectedInstallation}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedInstallation(null);
          }}
          onSuccess={() => {
            setShowCompleteModal(false);
            setSelectedInstallation(null);
            fetchInstallations();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    orange: 'text-orange-600 bg-orange-50',
    green: 'text-green-600 bg-green-50',
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || 'text-slate-600 bg-slate-50';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div className={`p-2 rounded-lg ${bgClass}`}>{icon}</div>
        <span className={`text-xl md:text-2xl font-bold ${bgClass.split(' ')[0]}`}>{value}</span>
      </div>
      <div className="text-slate-700 text-xs md:text-sm font-medium">{label}</div>
    </div>
  );
}

function InstallationCard({ installation, expanded, onToggleExpand, onSchedule, onComplete }: any) {
  const getStatusBadge = () => {
    // Check if completed (must have actual date value, not just empty string)
    if (installation.installationCompletedDate && installation.installationCompletedDate.trim() !== '') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">COMPLETED</span>;
    }
    // Check if started
    if (installation.installationStartDate && installation.installationStartDate.trim() !== '') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">IN PROGRESS</span>;
    }
    // Check if scheduled
    if (installation.installationScheduledDate && installation.installationScheduledDate.trim() !== '') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">SCHEDULED</span>;
    }
    // Default
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">PENDING</span>;
  };
  

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">{installation.enquiryId}</h3>
          <p className="text-sm md:text-base text-slate-700 font-medium mt-1">{installation.customerName}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium flex items-center gap-1">
              <Zap size={12} />
              {installation.systemCapacity || installation.capacity}
            </span>
            {installation.area && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium flex items-center gap-1">
                <MapPin size={12} />
                {installation.area}
              </span>
            )}
            {installation.phone && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium flex items-center gap-1">
                <Phone size={12} />
                {installation.phone}
              </span>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Installation Info - Show if scheduled/started */}
      {(installation.installationScheduledDate || installation.installationStartDate) && (
        <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
            <Calendar size={14} />
            Installation Schedule
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {installation.installationScheduledDate && (
              <div>
                <span className="text-blue-700">Scheduled:</span>
                <span className="text-blue-900 font-medium ml-1">
                  {new Date(installation.installationScheduledDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {installation.installationStartDate && (
              <div>
                <span className="text-blue-700">Started:</span>
                <span className="text-blue-900 font-medium ml-1">
                  {new Date(installation.installationStartDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {installation.installationTeam && (
              <div className="col-span-2">
                <span className="text-blue-700">Team:</span>
                <span className="text-blue-900 font-medium ml-1">{installation.installationTeam}</span>
              </div>
            )}
            {installation.installationSupervisor && (
              <div className="col-span-2">
                <span className="text-blue-700">Supervisor:</span>
                <span className="text-blue-900 font-medium ml-1">{installation.installationSupervisor}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Info - Show if completed */}
      {installation.installationCompletedDate && 
      installation.installationCompletedDate.trim() !== '' &&(
        <div className="mb-4 bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
            <CheckCircle size={14} />
            Installation Completed
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-green-700">Completed:</span>
              <span className="text-green-900 font-medium ml-1">
                {new Date(installation.installationCompletedDate).toLocaleDateString('en-IN')}
              </span>
            </div>
            {installation.meterNumber && (
              <div>
                <span className="text-green-700">Meter:</span>
                <span className="text-green-900 font-medium ml-1">{installation.meterNumber}</span>
              </div>
            )}
            {installation.earthingDone === 'TRUE' && (
              <div className="col-span-2">
                <span className="text-green-700">✅ Earthing Done</span>
                {installation.earthingResistance && (
                  <span className="text-green-900 font-medium ml-1">({installation.earthingResistance} Ω)</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200">
        <p className="text-slate-800 font-medium text-sm md:text-base">
          <strong className="text-slate-900">{installation.panelQuantity || 0}</strong> panels • 
          <strong className="text-slate-900 ml-2">{installation.inverterMake}</strong> inverter
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onToggleExpand}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors"
          >
            <Eye size={16} className="inline mr-1" />
            {expanded ? 'Hide' : 'View'} Details
          </button>
          
          {!installation.installationScheduledDate && (
            <button
              onClick={onSchedule}
              className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
            >
              <Calendar size={16} className="inline mr-1" />
              Schedule
            </button>
          )}
          
          {installation.installationStartDate && !installation.installationCompletedDate && (
            <button
              onClick={onComplete}
              className="flex-1 sm:flex-initial px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
            >
              <CheckCircle size={16} className="inline mr-1" />
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">System Details</h4>
              <div className="space-y-1 text-slate-700">
                <p><strong>Panels:</strong> {installation.panelQuantity}x {installation.panelMake} {installation.panelWattage}W</p>
                <p><strong>Inverter:</strong> {installation.inverterMake} {installation.inverterCapacity}</p>
                <p><strong>Structure:</strong> {installation.structureType || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Site Details</h4>
              <div className="space-y-1 text-slate-700">
                <p><strong>Address:</strong> {installation.address}</p>
                <p><strong>Phone:</strong> {installation.phone}</p>
                <p><strong>Email:</strong> {installation.email}</p>
              </div>
            </div>
          </div>
          {installation.installationNotes && (
            <div className="mt-4">
              <h4 className="font-semibold text-slate-900 mb-2">Installation Notes</h4>
              <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg">{installation.installationNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScheduleModal({ installation, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    installationScheduledDate: '',
    installationTeam: '',
    installationSupervisor: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/installation/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: installation.enquiryId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to schedule installation');
      }

      alert('✅ Installation scheduled successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Schedule error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Schedule Installation</h2>
          <p className="text-slate-600 text-sm mt-1">{installation.enquiryId} - {installation.customerName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.installationScheduledDate}
              onChange={(e) => setFormData({ ...formData, installationScheduledDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Installation Team <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.installationTeam}
              onChange={(e) => setFormData({ ...formData, installationTeam: e.target.value })}
              placeholder="e.g., Tech Team A"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Supervisor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.installationSupervisor}
              onChange={(e) => setFormData({ ...formData, installationSupervisor: e.target.value })}
              placeholder="Enter supervisor name"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 font-semibold transition-colors"
            >
              {loading ? 'Scheduling...' : 'Schedule Installation'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-200 text-slate-800 py-3 rounded-xl hover:bg-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CompleteModal({ installation, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    installationCompletedDate: new Date().toISOString().split('T')[0],
    pvModuleSerialNumbers: '',
    inverterSerialNumber: '',
    meterNumber: '',
    meterInstalledDate: new Date().toISOString().split('T')[0],
    meterReadingInitial: '0',
    earthingDone: true,
    earthingResistance: '',
    installationNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/installation/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: installation.enquiryId,
          installationTeam: installation.installationTeam,
          installationSupervisor: installation.installationSupervisor,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete installation');
      }

      alert('✅ Installation marked as completed successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Complete error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Complete Installation</h2>
          <p className="text-slate-600 text-sm mt-1">{installation.enquiryId} - {installation.customerName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-medium mb-2 text-sm">
                Completion Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.installationCompletedDate}
                onChange={(e) => setFormData({ ...formData, installationCompletedDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-medium mb-2 text-sm">
                Meter Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.meterNumber}
                onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
                placeholder="Enter meter number"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              PV Module Serial Numbers <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.pvModuleSerialNumbers}
              onChange={(e) => setFormData({ ...formData, pvModuleSerialNumbers: e.target.value })}
              placeholder="e.g., PV1234-5678, PV2345-6789"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Inverter Serial Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.inverterSerialNumber}
              onChange={(e) => setFormData({ ...formData, inverterSerialNumber: e.target.value })}
              placeholder="Enter inverter serial number"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-medium mb-2 text-sm">
                Meter Installed Date
              </label>
              <input
                type="date"
                value={formData.meterInstalledDate}
                onChange={(e) => setFormData({ ...formData, meterInstalledDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-medium mb-2 text-sm">
                Initial Meter Reading
              </label>
              <input
                type="text"
                value={formData.meterReadingInitial}
                onChange={(e) => setFormData({ ...formData, meterReadingInitial: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="earthingDone"
              checked={formData.earthingDone}
              onChange={(e) => setFormData({ ...formData, earthingDone: e.target.checked })}
              className="w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
            />
            <label htmlFor="earthingDone" className="text-slate-800 font-medium text-sm">
              Earthing Completed
            </label>
          </div>

          {formData.earthingDone && (
            <div>
              <label className="block text-slate-800 font-medium mb-2 text-sm">
                Earthing Resistance (Ω)
              </label>
              <input
                type="text"
                value={formData.earthingResistance}
                onChange={(e) => setFormData({ ...formData, earthingResistance: e.target.value })}
                placeholder="e.g., 2.5"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-800 font-medium mb-2 text-sm">
              Installation Notes
            </label>
            <textarea
              value={formData.installationNotes}
              onChange={(e) => setFormData({ ...formData, installationNotes: e.target.value })}
              placeholder="Any notes about the installation..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 disabled:bg-slate-400 font-semibold transition-colors"
            >
              {loading ? 'Processing...' : 'Mark as Completed'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-200 text-slate-800 py-3 rounded-xl hover:bg-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
