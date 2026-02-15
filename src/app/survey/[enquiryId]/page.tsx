// src/app/survey/[enquiryId]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Zap,
  Ruler,
  Cable,
  Shield,
  Wifi,
  MapPin,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function SurveyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [survey, setSurvey] = useState<any>(null);
  const [enquiry, setEnquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAdmin = ['admin', 'owner'].includes((session?.user as any)?.role);

  useEffect(() => {
    fetchData();
  }, [params.enquiryId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch survey
      const surveyRes = await fetch(`/api/survey/list`);
      if (surveyRes.ok) {
        const surveyData = await surveyRes.json();
        const foundSurvey = surveyData.surveys.find(
          (s: any) => s.enquiryId === params.enquiryId
        );
        setSurvey(foundSurvey);
      }

      // Fetch enquiry
      const enquiryRes = await fetch(`/api/enquiries/${params.enquiryId}`);
      if (enquiryRes.ok) {
        const enquiryData = await enquiryRes.json();
        setEnquiry(enquiryData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Approve this survey? Quotation can be created after approval.')) return;

    setActionLoading(true);

    try {
      const response = await fetch('/api/survey/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: params.enquiryId,
          approved: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve survey');
      }

      alert('✅ Survey approved successfully!');
      router.push('/survey');
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch('/api/survey/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: params.enquiryId,
          approved: false,
          rejectionReason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject survey');
      }

      alert('✅ Survey rejected. Team will be notified.');
      router.push('/survey');
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading survey details...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-semibold">❌ Survey not found</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (survey.surveyApproved) {
      return (
        <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-green-50 text-green-700 border-2 border-green-300 flex items-center gap-1">
          <CheckCircle size={16} />
          Approved
        </span>
      );
    }
    if (survey.surveyNotes?.includes('Rejected')) {
      return (
        <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-red-50 text-red-700 border-2 border-red-300 flex items-center gap-1">
          <XCircle size={16} />
          Rejected
        </span>
      );
    }
    return (
      <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-yellow-50 text-yellow-700 border-2 border-yellow-300 flex items-center gap-1">
        <Loader2 size={16} />
        Pending Review
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />

      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Survey Details</h1>
              <p className="text-sm text-gray-600 font-mono">{survey.enquiryId}</p>
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto pb-32">
        {/* Customer Info */}
        {enquiry && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h2>
            <div className="space-y-2">
              <p className="text-gray-900 font-bold text-lg">{enquiry.customerName}</p>
              <p className="text-gray-600">📱 {enquiry.phone}</p>
              <p className="text-gray-600">📧 {enquiry.email || 'N/A'}</p>
              <p className="text-gray-600 flex items-center gap-1">
                <MapPin size={14} />
                {enquiry.area}
              </p>
            </div>
          </div>
        )}

        {/* Survey Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <User size={20} />
            Survey Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Surveyor</p>
              <p className="text-sm font-bold text-gray-900">{survey.surveyorName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Survey Date</p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(survey.surveyDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 size={20} />
            Project Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Project Type" value={survey.projectType} />
            <InfoField label="Consumer Category" value={survey.consumerCategory} />
            <InfoField label="Installation Surface" value={survey.installationSurface} />
            <InfoField label="Building Floor" value={survey.buildingFloor} />
            <InfoField label="Soil Type" value={survey.soilType} />
            <InfoField label="Structure Style" value={survey.structureStyle} />
          </div>
        </div>

        {/* Structure Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Ruler size={20} />
            Structure Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Slope Direction" value={survey.slopeDirection} />
            <InfoField label="Inclination" value={`${survey.inclinationDegrees}°`} />
            <InfoField label="Front Leg Height" value={`${survey.frontLegHeight}m`} />
            <InfoField label="Rear Leg Height" value={`${survey.rearLegHeight}m`} />
            <InfoField label="Rafters" value={survey.rafterCount} />
            <InfoField label="Purlines" value={survey.purlineCount} />
            <InfoField label="Section" value={survey.sectionSpecifications} />
          </div>
        </div>

        {/* Electrical Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Zap size={20} />
            Electrical Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Sanctioned Load" value={`${survey.sanctionedLoad} kW`} />
            <InfoField label="BP Number" value={survey.bpNumber || 'N/A'} />
            <InfoField label="Transformer Capacity" value={`${survey.transformerCapacity} kVA`} />
            <InfoField label="Substation Distance" value={`${survey.substationDistance}m`} />
          </div>
        </div>

        {/* Cable Sizing */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Cable size={20} />
            Cable Sizing
          </h2>
          <div className="space-y-2">
            <CableInfo label="Panel to DCDB" length={survey.panelToDcdbLength} size={survey.panelToDcdbSize} />
            <CableInfo label="DCDB to Inverter" length={survey.dcdbToInverterLength} size={survey.dcdbToInverterSize} />
            <CableInfo label="Inverter to ACDB" length={survey.inverterToAcdbLength} size={survey.inverterToAcdbSize} />
            <CableInfo label="ACDB to Meter" length={survey.acdbToMeterLength} size={survey.acdbToMeterSize} />
            <CableInfo label="Meter to LT Panel" length={survey.meterToLtPanelLength} size={survey.meterToLtPanelSize} />
          </div>
        </div>

        {/* Safety */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Shield size={20} />
            Safety & Infrastructure
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InfoField label="Existing Earthing" value={survey.existingEarthingCount} />
            <InfoField label="New Earthing" value={survey.newEarthingRequired} />
            <InfoField label="Lightning Arrestor" value={survey.lightningArrestorRequired} />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600 mb-1">Shadow Sources</p>
              <div className="flex flex-wrap gap-2">
                {survey.shadowSources.map((source: string) => (
                  <span key={source} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">
                    {source}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600">Shadow Removable</p>
              <p className="text-sm font-bold text-gray-900">
                {survey.shadowRemovable ? '✅ Yes' : '❌ No'}
              </p>
            </div>
          </div>
        </div>

        {/* Monitoring */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Wifi size={20} />
            Monitoring & Connectivity
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Internet" value={survey.internetAvailability} />
            <InfoField label="Monitoring System" value={survey.monitoringSystem} />
          </div>
        </div>

        {/* Notes */}
        {survey.surveyNotes && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={20} />
              Survey Notes
            </h2>
            <p className="text-gray-900 whitespace-pre-wrap">{survey.surveyNotes}</p>
          </div>
        )}

        {/* Photos */}
        {survey.surveyPhotos && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon size={20} />
              Survey Photos
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {survey.surveyPhotos.split(',').map((photo: string, idx: number) => (
                <img
                  key={idx}
                  src={photo.trim()}
                  alt={`Survey ${idx + 1}`}
                  className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions - Only for Admin */}
      {isAdmin && !survey.surveyApproved && !survey.surveyNotes?.includes('Rejected') && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="flex-1 bg-red-600 active:bg-red-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-transform"
            >
              <XCircle size={24} />
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex-1 bg-green-600 active:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-transform"
            >
              {actionLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <CheckCircle size={24} />
              )}
              {actionLoading ? 'Processing...' : 'Approve'}
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Survey</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this survey. The surveyor will be notified.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function CableInfo({ label, length, size }: { label: string; length: number; size: number }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <span className="text-sm font-bold text-gray-900">{label}</span>
      <span className="text-sm text-gray-700">
        {length}m × {size} sq mm
      </span>
    </div>
  );
}
