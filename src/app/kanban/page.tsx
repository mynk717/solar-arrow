// src/app/kanban/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Enquiry, EnquiryStatus } from '@/lib/types';
import DemoBanner from '@/components/DemoBanner';
import { demoEnquiries } from '@/lib/demoData';
import { useDemoMode } from '@/contexts/DemoContext';
import { 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  FileText,
  Search,
  FileCheck,
  DollarSign,
  Truck,
  Wrench,
  Zap,
  MapPin
} from 'lucide-react';

// Simplified Scrum stages - linear workflow
const SCRUM_STAGES = [
  {
    id: 'new',
    title: 'New Enquiries',
    statuses: ['new', 'lead', 'prospect'] as EnquiryStatus[],
    color: 'bg-blue-500',
    icon: FileText,
  },
  {
    id: 'survey',
    title: 'Survey',
    statuses: ['survey-pending', 'survey-completed'] as EnquiryStatus[],
    color: 'bg-purple-500',
    icon: Search,
  },
  {
    id: 'registration',
    title: 'Registration',
    statuses: ['registration-pending', 'registration-completed'] as EnquiryStatus[],
    color: 'bg-yellow-500',
    icon: FileCheck,
  },
  {
    id: 'payment',
    title: 'Payment',
    statuses: ['payment-pending', 'payment-received'] as EnquiryStatus[],
    color: 'bg-green-500',
    icon: DollarSign,
  },
  {
    id: 'installation',
    title: 'Installation',
    statuses: ['dispatch_pending', 'dispatched', 'installation_pending', 'installation_completed'] as EnquiryStatus[],
    color: 'bg-orange-500',
    icon: Wrench,
  },
  {
    id: 'completion',
    title: 'Active',
    statuses: ['active'] as EnquiryStatus[],
    color: 'bg-emerald-500',
    icon: CheckCircle2,
  },
];

export default function ScrumBoard() {
  const { data: session, status } = useSession();
  const { isDemoMode } = useDemoMode();
  
  const [enquiries, setEnquiries] = useState<Enquiry[]>(demoEnquiries);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Fetch enquiries from API or use demo data
  useEffect(() => {
    const fetchData = async () => {
      if (status === 'unauthenticated') {
        setEnquiries(demoEnquiries);
        setLoading(false);
        return;
      }

      if (status === 'authenticated') {
        try {
          setLoading(true);
          const response = await fetch('/api/enquiries');
          if (!response.ok) throw new Error('Failed to fetch enquiries');
          
          const data = await response.json();
          const enquiriesWithDates = data.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
            surveyDate: e.surveyDate ? new Date(e.surveyDate) : undefined,
            registrationDate: e.registrationDate ? new Date(e.registrationDate) : undefined,
            paymentDate: e.paymentDate ? new Date(e.paymentDate) : undefined,
            dispatchDate: e.dispatchDate ? new Date(e.dispatchDate) : undefined,
            installationDate: e.installationDate ? new Date(e.installationDate) : undefined,
            inspectionDate: e.inspectionDate ? new Date(e.inspectionDate) : undefined,
            activationDate: e.activationDate ? new Date(e.activationDate) : undefined,
          }));
          
          setEnquiries(enquiriesWithDates);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [status]);

  const getEnquiriesForStage = (statuses: EnquiryStatus[]) => {
    return enquiries.filter(e => statuses.includes(e.status));
  };

  const moveToNextStage = async (enquiry: Enquiry) => {
    if (isDemoMode) {
      return;
    }

    const currentStageIndex = SCRUM_STAGES.findIndex(stage => 
      stage.statuses.includes(enquiry.status)
    );

    if (currentStageIndex < SCRUM_STAGES.length - 1) {
      const nextStage = SCRUM_STAGES[currentStageIndex + 1];
      const newStatus = nextStage.statuses[0];

      setEnquiries(prev =>
        prev.map(e =>
          e.id === enquiry.id
            ? { ...e, status: newStatus, updatedAt: new Date() }
            : e
        )
      );

      try {
        const response = await fetch(`/api/enquiries/${enquiry.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) throw new Error('Failed to update');
      } catch (error) {
        console.error('Error:', error);
        setEnquiries(prev =>
          prev.map(e => (e.id === enquiry.id ? enquiry : e))
        );
      }
    }
  };

  if (loading && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading scrum board...</p>
        </div>
      </div>
    );
  }

  if (error && !isDemoMode) {
    return (
      <div>
        <DemoBanner />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalProjects = enquiries.length;
  const activeProjects = getEnquiriesForStage(['active']).length;
  const inProgress = totalProjects - activeProjects;

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />
      
      <div className="p-3 md:p-6">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Project Pipeline {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {isDemoMode 
              ? 'Sample workflow - Sign in to manage real projects'
              : 'Track your solar projects through each stage'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-600">Total</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalProjects}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-600">In Progress</p>
            <p className="text-2xl md:text-3xl font-bold text-orange-600">{inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-600">Completed</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{activeProjects}</p>
          </div>
        </div>

        {/* Scrum Stages - Flexbox Auto-sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {SCRUM_STAGES.map((stage, index) => {
            const stageEnquiries = getEnquiriesForStage(stage.statuses);
            const StageIcon = stage.icon;
            
            return (
              <div key={stage.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                {/* Stage Header */}
                <div className={`${stage.color} text-white p-3 md:p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <StageIcon size={20} />
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                      {stageEnquiries.length}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">{stage.title}</h3>
                </div>

                {/* Stage Cards */}
                <div className="p-2 md:p-3 bg-gray-50 flex-1 space-y-2 max-h-[500px] overflow-y-auto">
                  {stageEnquiries.length === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-6">No items</p>
                  ) : (
                    stageEnquiries.map(enquiry => (
                      <div
                        key={enquiry.id}
                        className="bg-white rounded-lg shadow-sm p-2 md:p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedEnquiry(enquiry)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 text-xs md:text-sm flex-1 truncate">
                            {enquiry.customerName}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                            enquiry.panelTag === 'RTS' ? 'bg-blue-100 text-blue-800' :
                            enquiry.panelTag === 'Commercial' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {enquiry.panelTag}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <MapPin size={12} />
                          <span className="truncate">{enquiry.area}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                          <Zap size={12} />
                          <span>{enquiry.capacity} kW</span>
                        </div>
                        
                        {/* Move to Next Stage Button */}
                        {index < SCRUM_STAGES.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveToNextStage(enquiry);
                            }}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-2 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                          >
                            Move to {SCRUM_STAGES[index + 1].title}
                            <ChevronRight size={14} />
                          </button>
                        )}

                        {index === SCRUM_STAGES.length - 1 && (
                          <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-medium py-1">
                            <CheckCircle2 size={14} />
                            Complete
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <EnquiryDetailsModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
        />
      )}
    </div>
  );
}

// Enquiry Details Modal
function EnquiryDetailsModal({ 
  enquiry, 
  onClose 
}: { 
  enquiry: Enquiry; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {/* Customer Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {enquiry.customerName}</p>
              <p><span className="font-medium">Phone:</span> {enquiry.phone}</p>
              <p><span className="font-medium">Email:</span> {enquiry.email}</p>
              <p><span className="font-medium">Address:</span> {enquiry.address}</p>
              <p><span className="font-medium">Area:</span> {enquiry.area}</p>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Project Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">ID:</span> {enquiry.id}</p>
              <p><span className="font-medium">Capacity:</span> {enquiry.capacity} kW</p>
              <p><span className="font-medium">Panel Tag:</span> {enquiry.panelTag}</p>
              <p><span className="font-medium">Payment Type:</span> {enquiry.paymentType}</p>
              <p><span className="font-medium">Status:</span> {enquiry.status}</p>
              <p><span className="font-medium">Created:</span> {enquiry.createdAt.toLocaleDateString()}</p>
            </div>
          </div>

          {/* Timeline */}
          {(enquiry.surveyDate || enquiry.paymentDate || enquiry.installationDate) && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-2 text-sm">
                {enquiry.surveyDate && (
                  <p><span className="font-medium">Survey:</span> {enquiry.surveyDate.toLocaleDateString()}</p>
                )}
                {enquiry.paymentDate && (
                  <p><span className="font-medium">Payment:</span> {enquiry.paymentDate.toLocaleDateString()}</p>
                )}
                {enquiry.installationDate && (
                  <p><span className="font-medium">Installation:</span> {enquiry.installationDate.toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
