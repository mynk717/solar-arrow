// src/app/survey/submit/[enquiryId]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Loader2,
  Save,
  Building2,
  Zap,
  Ruler,
  Cable,
  Shield,
  Wifi,
  Camera,
  FileText,
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function SubmitSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [enquiry, setEnquiry] = useState<any>(null);

  const [formData, setFormData] = useState({
    // Project Details
    projectType: 'ONGRID',
    consumerCategory: 'DOMESTIC',
    installationSurface: 'ROOFTOP',
    buildingFloor: 0,
    soilType: 'CLAY',

    // Structure
    structureStyle: 'STANDARD',
    slopeDirection: 'SOUTH',
    inclinationDegrees: 15,
    frontLegHeight: 1.5,
    rearLegHeight: 2.5,
    rafterCount: 4,
    purlineCount: 8,
    sectionSpecifications: 'C_CHANNEL',

    // Electrical
    sanctionedLoad: 0,
    bpNumber: '',
    transformerCapacity: 0,
    substationDistance: 0,

    // Cables
    panelToDcdbLength: 0,
    panelToDcdbSize: 4,
    dcdbToInverterLength: 0,
    dcdbToInverterSize: 6,
    inverterToAcdbLength: 0,
    inverterToAcdbSize: 10,
    acdbToMeterLength: 0,
    acdbToMeterSize: 16,
    meterToLtPanelLength: 0,
    meterToLtPanelSize: 25,

    // Safety
    existingEarthingCount: 0,
    newEarthingRequired: 2,
    lightningArrestorRequired: 1,
    shadowSources: [] as string[],
    shadowRemovable: false,

    // Monitoring
    internetAvailability: 'WIFI',
    monitoringSystem: 'RMS',

    // Notes
    surveyNotes: '',
    surveyPhotos: '',
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
const [photoUploading, setPhotoUploading] = useState(false);


  useEffect(() => {
    fetchEnquiry();
  }, [params.enquiryId]);

  const fetchEnquiry = async () => {
    try {
      const response = await fetch(`/api/enquiries/${params.enquiryId}`);
      if (response.ok) {
        const data = await response.json();
        setEnquiry(data);
        
        // Pre-fill some fields from enquiry
        setFormData(prev => ({
          ...prev,
          sanctionedLoad: data.capacity || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching enquiry:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: params.enquiryId,
          surveyorName: session?.user?.name || session?.user?.email,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit survey');
      }

      alert('✅ Survey submitted successfully!');
      router.push('/survey');
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleShadowSource = (source: string) => {
    setFormData(prev => ({
      ...prev,
      shadowSources: prev.shadowSources.includes(source)
        ? prev.shadowSources.filter(s => s !== source)
        : [...prev.shadowSources, source],
    }));
  };
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
  
    setPhotoUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'solar-arrow/surveys');
        fd.append('publicId', `${params.enquiryId}_${Date.now()}`);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Upload failed');
        urls.push(data.url);
      }
      setUploadedPhotos(prev => [...prev, ...urls]);
      // keep formData.surveyPhotos in sync
      setFormData(prev => ({
        ...prev,
        surveyPhotos: [...uploadedPhotos, ...urls].join(','),
      }));
    } catch (err: any) {
      alert(`❌ Photo upload failed: ${err.message}`);
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };
  
  const removePhoto = (idx: number) => {
    const updated = uploadedPhotos.filter((_, i) => i !== idx);
    setUploadedPhotos(updated);
    setFormData(prev => ({ ...prev, surveyPhotos: updated.join(',') }));
  };
  

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />

      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Submit Survey</h1>
            <p className="text-sm text-gray-600">
              {params.enquiryId} - {enquiry?.customerName || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto pb-24">
        {/* Project Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={20} />
            Project Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Project Type
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ONGRID">On-Grid</option>
                <option value="OFFGRID">Off-Grid</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Consumer Category
              </label>
              <select
                value={formData.consumerCategory}
                onChange={(e) => setFormData({ ...formData, consumerCategory: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DOMESTIC">Domestic</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="INDUSTRIAL">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Installation Surface
              </label>
              <select
                value={formData.installationSurface}
                onChange={(e) => setFormData({ ...formData, installationSurface: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ROOFTOP">Rooftop</option>
                <option value="GROUND">Ground</option>
                <option value="TERRACE">Terrace</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Building Floor
                </label>
                <input
                  type="number"
                  value={formData.buildingFloor}
                  onChange={(e) => setFormData({ ...formData, buildingFloor: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Soil Type
                </label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CLAY">Clay</option>
                  <option value="SANDY">Sandy</option>
                  <option value="ROCKY">Rocky</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Structure Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Ruler size={20} />
            Structure Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Structure Style
              </label>
              <select
                value={formData.structureStyle}
                onChange={(e) => setFormData({ ...formData, structureStyle: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="STANDARD">Standard</option>
                <option value="ELEVATED">Elevated</option>
                <option value="BALLAST">Ballast</option>
                <option value="FLAT_ROOF">Flat Roof</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Slope Direction
                </label>
                <select
                  value={formData.slopeDirection}
                  onChange={(e) => setFormData({ ...formData, slopeDirection: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SOUTH">South</option>
                  <option value="SOUTH_EAST">South-East</option>
                  <option value="SOUTH_WEST">South-West</option>
                  <option value="EAST">East</option>
                  <option value="WEST">West</option>
                  <option value="NORTH">North</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Inclination (°)
                </label>
                <input
                  type="number"
                  value={formData.inclinationDegrees}
                  onChange={(e) => setFormData({ ...formData, inclinationDegrees: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Front Leg Height (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.frontLegHeight}
                  onChange={(e) => setFormData({ ...formData, frontLegHeight: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rear Leg Height (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.rearLegHeight}
                  onChange={(e) => setFormData({ ...formData, rearLegHeight: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rafters
                </label>
                <input
                  type="number"
                  value={formData.rafterCount}
                  onChange={(e) => setFormData({ ...formData, rafterCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Purlines
                </label>
                <input
                  type="number"
                  value={formData.purlineCount}
                  onChange={(e) => setFormData({ ...formData, purlineCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Section
                </label>
                <select
                  value={formData.sectionSpecifications}
                  onChange={(e) => setFormData({ ...formData, sectionSpecifications: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="C_CHANNEL">C-Channel</option>
                  <option value="HOLLOW_SQUARE">Hollow Square</option>
                  <option value="ANGLE">Angle</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Electrical Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={20} />
            Electrical Details
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Sanctioned Load (kW)
                </label>
                <input
                  type="number"
                  value={formData.sanctionedLoad}
                  onChange={(e) => setFormData({ ...formData, sanctionedLoad: parseFloat(e.target.value) })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  BP Number
                </label>
                <input
                  type="text"
                  value={formData.bpNumber}
                  onChange={(e) => setFormData({ ...formData, bpNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Transformer Capacity (kVA)
                </label>
                <input
                  type="number"
                  value={formData.transformerCapacity}
                  onChange={(e) => setFormData({ ...formData, transformerCapacity: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Substation Distance (m)
                </label>
                <input
                  type="number"
                  value={formData.substationDistance}
                  onChange={(e) => setFormData({ ...formData, substationDistance: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cable Sizing */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Cable size={20} />
            Cable Sizing
          </h2>

          <div className="space-y-3">
            {[
              { label: 'Panel to DCDB', lengthKey: 'panelToDcdbLength', sizeKey: 'panelToDcdbSize' },
              { label: 'DCDB to Inverter', lengthKey: 'dcdbToInverterLength', sizeKey: 'dcdbToInverterSize' },
              { label: 'Inverter to ACDB', lengthKey: 'inverterToAcdbLength', sizeKey: 'inverterToAcdbSize' },
              { label: 'ACDB to Meter', lengthKey: 'acdbToMeterLength', sizeKey: 'acdbToMeterSize' },
              { label: 'Meter to LT Panel', lengthKey: 'meterToLtPanelLength', sizeKey: 'meterToLtPanelSize' },
            ].map(({ label, lengthKey, sizeKey }) => (
              <div key={lengthKey} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {label} Length (m)
                  </label>
                  <input
                    type="number"
                    value={(formData as any)[lengthKey]}
                    onChange={(e) => setFormData({ ...formData, [lengthKey]: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Size (sq mm)
                  </label>
                  <input
                    type="number"
                    value={(formData as any)[sizeKey]}
                    onChange={(e) => setFormData({ ...formData, [sizeKey]: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Infrastructure */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} />
            Safety & Infrastructure
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Existing Earthing
                </label>
                <input
                  type="number"
                  value={formData.existingEarthingCount}
                  onChange={(e) => setFormData({ ...formData, existingEarthingCount: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  New Earthing Req.
                </label>
                <input
                  type="number"
                  value={formData.newEarthingRequired}
                  onChange={(e) => setFormData({ ...formData, newEarthingRequired: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  LA Required
                </label>
                <input
                  type="number"
                  value={formData.lightningArrestorRequired}
                  onChange={(e) => setFormData({ ...formData, lightningArrestorRequired: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Shadow Sources
              </label>
              <div className="flex flex-wrap gap-2">
                {['TREE', 'BUILDING', 'POLE', 'NONE'].map(source => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleShadowSource(source)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${
                      formData.shadowSources.includes(source)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.shadowRemovable}
                  onChange={(e) => setFormData({ ...formData, shadowRemovable: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-700">
                  Shadow can be removed
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Monitoring */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wifi size={20} />
            Monitoring & Connectivity
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Internet Availability
                </label>
                <select
                  value={formData.internetAvailability}
                  onChange={(e) => setFormData({ ...formData, internetAvailability: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="WIFI">WiFi</option>
                  <option value="GSM">GSM</option>
                  <option value="LAN">LAN</option>
                  <option value="NONE">None</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Monitoring System
                </label>
                <select
                  value={formData.monitoringSystem}
                  onChange={(e) => setFormData({ ...formData, monitoringSystem: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="RMS">RMS</option>
                  <option value="SCADA">SCADA</option>
                  <option value="NONE">None</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Photos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} />
            Notes & Photos
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Survey Notes
              </label>
              <textarea
                value={formData.surveyNotes}
                onChange={(e) => setFormData({ ...formData, surveyNotes: e.target.value })}
                rows={4}
                placeholder="Add any important observations, recommendations, or concerns..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
    <Camera size={16} />
    Site Photos
  </label>

  {/* Upload trigger */}
  <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl transition
    ${photoUploading
      ? 'border-blue-300 bg-blue-50 cursor-wait'
      : 'border-gray-300 bg-gray-50 cursor-pointer hover:border-blue-400 active:bg-gray-100'
    }`}>
    {photoUploading ? (
      <div className="flex items-center gap-2 text-blue-600">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm font-semibold">Uploading...</span>
      </div>
    ) : (
      <>
        <Camera size={24} className="text-gray-400 mb-1" />
        <span className="text-sm font-semibold text-gray-600">Tap to add site photos</span>
        <span className="text-xs text-gray-400 mt-0.5">Multiple files supported</span>
      </>
    )}
    <input
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={handlePhotoUpload}
      disabled={photoUploading}
    />
  </label>

  {/* Preview grid */}
  {uploadedPhotos.length > 0 && (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {uploadedPhotos.map((url, idx) => (
        <div key={url} className="relative group">
          <img
            src={url}
            alt={`Site photo ${idx + 1}`}
            className="w-full h-24 object-cover rounded-xl border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={() => removePhoto(idx)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md active:scale-95 transition"
            aria-label="Remove photo"
          >
            ✕
          </button>
          <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {idx + 1}
          </span>
        </div>
      ))}
    </div>
  )}

  {/* Counter */}
  <p className="text-xs text-gray-400 mt-2">
    {uploadedPhotos.length} photo{uploadedPhotos.length !== 1 ? 's' : ''} uploaded
    {uploadedPhotos.length > 0 && ' · tap ✕ to remove'}
  </p>
</div>
          </div>
        </div>
      </form>

      {/* Fixed Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <button
          onClick={handleSubmit}
          disabled={loading || photoUploading}
          className="w-full bg-blue-600 active:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-transform shadow-lg max-w-2xl mx-auto"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Submitting Survey...
            </>
          ) : (
            <>
              <Save size={24} />
              Submit Survey
            </>
          )}
        </button>
      </div>
    </div>
  );
}
