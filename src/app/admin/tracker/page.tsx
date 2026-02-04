// src/app/admin/tracker/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Clock, AlertCircle, CheckCircle, XCircle, Users, 
  TrendingUp, Calendar, Filter, Search, Download,
  ChevronRight, MessageSquare, ExternalLink
} from 'lucide-react';

interface ProjectTrackerData {
  id: string;
  customerName: string;
  capacity: string;
  currentStage: string;
  stageStatus: string;
  daysInStage: number;
  assignedTo: string;
  assignedToName: string;
  lastFollowupDate?: string;
  nextFollowupDate?: string;
  isOverdue: boolean;
  isBlocked: boolean;
  priority: string;
  applicationNumber?: string;
}

export default function AdminProjectTracker() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectTrackerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchProjectData = async () => {
    try {
      const response = await fetch('/api/admin/project-tracker');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  const filteredProjects = projects.filter(p => {
    const matchesStage = filterStage === 'all' || p.currentStage === filterStage;
    const matchesStatus = filterStatus === 'all' || p.stageStatus === filterStatus;
    const matchesUser = filterUser === 'all' || p.assignedTo === filterUser;
    const matchesSearch = 
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.applicationNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStage && matchesStatus && matchesUser && matchesSearch;
  });

  // Metrics
  const totalProjects = projects.length;
  const overdueProjects = projects.filter(p => p.isOverdue).length;
  const blockedProjects = projects.filter(p => p.isBlocked).length;
  const onTrackProjects = projects.filter(p => !p.isOverdue && !p.isBlocked).length;

  // Stage distribution
  const stageDistribution = projects.reduce((acc, p) => {
    acc[p.currentStage] = (acc[p.currentStage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Tracker</h1>
        <p className="text-gray-600">Monitor project progress and team follow-ups in real-time</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Users className="text-blue-600" />}
          label="Total Projects"
          value={totalProjects}
          color="blue"
        />
        <MetricCard
          icon={<CheckCircle className="text-green-600" />}
          label="On Track"
          value={onTrackProjects}
          color="green"
        />
        <MetricCard
          icon={<Clock className="text-yellow-600" />}
          label="Overdue"
          value={overdueProjects}
          color="yellow"
        />
        <MetricCard
          icon={<XCircle className="text-red-600" />}
          label="Blocked"
          value={blockedProjects}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Stages</option>
            <option value="Survey">Survey</option>
            <option value="Registration">Registration</option>
            <option value="Payment">Payment</option>
            <option value="Quotation">Quotation</option>
            <option value="Installation">Installation</option>
            <option value="Inspection">Inspection</option>
            <option value="Subsidy">Subsidy</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Blocked">Blocked</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days in Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Follow-up</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading projects...
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No projects found
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{project.customerName}</div>
                        <div className="text-sm text-gray-500">
                          {project.capacity} kWp • {project.applicationNumber || project.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {project.currentStage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge 
                        status={project.stageStatus} 
                        isOverdue={project.isOverdue}
                        isBlocked={project.isBlocked}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className={project.isOverdue ? 'text-red-500' : 'text-gray-400'} />
                        <span className={project.isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}>
                          {project.daysInStage} days
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{project.assignedToName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {project.lastFollowupDate ? 
                          new Date(project.lastFollowupDate).toLocaleDateString() : 
                          <span className="text-gray-400">No follow-up</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {project.nextFollowupDate ? (
                          <span className={
                            new Date(project.nextFollowupDate) < new Date() 
                              ? 'text-red-600 font-medium' 
                              : 'text-gray-700'
                          }>
                            {new Date(project.nextFollowupDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not scheduled</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => window.location.href = `/enquiries/${project.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-800"
                          title="Add Follow-up"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredProjects.length} of {totalProjects} projects
        </div>
        {/* Add pagination controls here */}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  color: string; 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className={`text-2xl font-bold text-${color}-600`}>{value}</span>
      </div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ 
  status, 
  isOverdue, 
  isBlocked 
}: { 
  status: string; 
  isOverdue: boolean; 
  isBlocked: boolean; 
}) {
  if (isBlocked) {
    return (
      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
        <XCircle size={14} />
        Blocked
      </span>
    );
  }

  if (isOverdue) {
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
        <AlertCircle size={14} />
        Overdue
      </span>
    );
  }

  const colorMap: Record<string, string> = {
    'Not Started': 'gray',
    'In Progress': 'blue',
    'Completed': 'green',
    'Blocked': 'red',
  };

  const color = colorMap[status] || 'gray';

  return (
    <span className={`px-3 py-1 bg-${color}-100 text-${color}-800 rounded-full text-xs font-medium`}>
      {status}
    </span>
  );
}