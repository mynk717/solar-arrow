'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export default function CreateRegistrationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEligibleEnquiries();
  }, []);

  const fetchEligibleEnquiries = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/enquiries');
      const data = await response.json();
      
      const regResponse = await fetch('/api/registration/list');
      const regData = await regResponse.json();
      
      const registeredEnquiryIds = regData.success 
        ? regData.registrations.map((r: any) => r.enquiryId)
        : [];

      // Filter: Survey completed + not already registered
      const eligible = data.filter((enq: any) => 
        enq.surveyApproved === true &&
        !registeredEnquiryIds.includes(enq.id)
      );
      
      setEnquiries(eligible);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEnquiry = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (showForm && selectedEnquiry) {
    return (
      <RegistrationForm
        enquiry={selectedEnquiry}
        onCancel={() => {
          setShowForm(false);
          setSelectedEnquiry(null);
        }}
        onSuccess={() => router.push('/registration')}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/registration')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Registration
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Submit Enquiry for DISCOM Registration
        </h1>
        <p className="text-gray-600 mt-2">
          Select an enquiry to submit for registration approval
        </p>
      </div>

      <div className="space-y-4">
        {enquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              No eligible enquiries found
            </p>
            <p className="text-gray-500 text-sm">
              Enquiries must have survey completed and approved
            </p>
          </div>
        ) : (
          enquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono font-bold text-blue-600">
                      {enq.id}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                      ✅ Survey Approved
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {enq.customerName}
                  </h3>
                  
                  <p className="text-gray-600 mb-3">
                    {enq.phone} • {enq.email}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Capacity</p>
                      <p className="font-bold text-gray-900">{enq.capacity} kW</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Location</p>
                      <p className="font-bold text-gray-900">{enq.area}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Panel Tag</p>
                      <p className="font-bold text-gray-900">{enq.panelTag}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Survey Date</p>
                      <p className="font-bold text-gray-900">
                        {enq.surveyCompletedDate
                          ? new Date(enq.surveyCompletedDate).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleSelectEnquiry(enq)}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium whitespace-nowrap"
                >
                  Submit for Registration
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RegistrationForm({ enquiry, onCancel, onSuccess }: any) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    applicationNumber: '',
    consumerNumber: '',
    discomCircle: 'Raipur Circle',
    discomDivision: 'Raipur Division',
    discomSubDivision: '',
    submittedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/registration/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: enquiry.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create registration');
      }

      alert('✅ Registration entry created successfully!');
      onSuccess();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to List
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Submit Registration for {enquiry.id}
        </h1>
        <p className="text-gray-600 mt-2">
          Fill in registration details to submit to DISCOM
        </p>
      </div>

      {/* Enquiry Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Enquiry Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Enquiry ID</p>
            <p className="font-bold text-gray-900">{enquiry.id}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Customer</p>
            <p className="font-bold text-gray-900">{enquiry.customerName}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Phone</p>
            <p className="font-bold text-gray-900">{enquiry.phone}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Capacity</p>
            <p className="font-bold text-gray-900">{enquiry.capacity} kW</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DISCOM Application Number
              </label>
              <input
                type="text"
                value={formData.applicationNumber}
                onChange={(e) =>
                  setFormData({ ...formData, applicationNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="APP/PMSG/2026/00001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Can be added later
              </p>
            </div>

            {/* Consumer Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Consumer Number
              </label>
              <input
                type="text"
                value={formData.consumerNumber}
                onChange={(e) =>
                  setFormData({ ...formData, consumerNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1234567890"
              />
            </div>

            {/* DISCOM Circle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DISCOM Circle *
              </label>
              <select
                value={formData.discomCircle}
                onChange={(e) =>
                  setFormData({ ...formData, discomCircle: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Raipur Circle">Raipur Circle</option>
                <option value="Bilaspur Circle">Bilaspur Circle</option>
                <option value="Durg Circle">Durg Circle</option>
              </select>
            </div>

            {/* DISCOM Division */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DISCOM Division *
              </label>
              <select
                value={formData.discomDivision}
                onChange={(e) =>
                  setFormData({ ...formData, discomDivision: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Raipur Division">Raipur Division</option>
                <option value="Durg Division">Durg Division</option>
                <option value="Bhilai Division">Bhilai Division</option>
              </select>
            </div>

            {/* Sub-Division */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Division *
              </label>
              <select
                value={formData.discomSubDivision}
                onChange={(e) =>
                  setFormData({ ...formData, discomSubDivision: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Sub-Division</option>
                <option value="Sub-Division 1">Sub-Division 1</option>
                <option value="Sub-Division 2">Sub-Division 2</option>
                <option value="Sub-Division 3">Sub-Division 3</option>
                <option value="Sub-Division 4">Sub-Division 4</option>
                <option value="Sub-Division 5">Sub-Division 5</option>
              </select>
            </div>

            {/* Submitted Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Date *
              </label>
              <input
                type="date"
                value={formData.submittedDate}
                onChange={(e) =>
                  setFormData({ ...formData, submittedDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any notes about this registration submission..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Submit Registration'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
