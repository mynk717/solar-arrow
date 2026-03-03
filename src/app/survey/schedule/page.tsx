// src/app/survey/schedule/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  ArrowLeft,
  Loader2,
  CheckCircle,
  User,
  Clock,
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

export default function ScheduleSurveyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    enquiryId: '',
    surveyDate: '',
    assignedTo: '',
    assignedToName: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);

      // Fetch enquiries that need survey (status: new, contacted, qualified)
      const enquiriesRes = await fetch('/api/enquiries');
      const enquiriesData = await enquiriesRes.json();
      const needsSurvey = enquiriesData.filter((e: any) =>
        ['new', 'contacted', 'qualified', 'survey-pending'].includes(e.status)
      );
      setEnquiries(needsSurvey);

      // Fetch users (surveyors)
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const surveyors = usersData.filter(
          (u: any) => ['surveyor', 'admin', 'owner'].includes(u.role) && u.isActive
        );        
        setUsers(surveyors);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.enquiryId || !formData.surveyDate || !formData.assignedTo) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/survey/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule survey');
      }

     // Telegram group notification


alert('✅ Survey scheduled successfully!');
router.push('/survey');

    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Survey</h1>
            <p className="text-sm text-gray-600">Assign survey to team member</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-5">
          {/* Select Enquiry */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle size={16} />
              Select Enquiry
            </label>
            <select
              value={formData.enquiryId}
              onChange={(e) => setFormData({ ...formData, enquiryId: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-semibold"
            >
              <option value="">-- Select Enquiry --</option>
              {enquiries.map((enq) => (
                <option key={enq.id} value={enq.id}>
                  {enq.id} - {enq.customerName} ({enq.capacity} kW)
                </option>
              ))}
            </select>
            {enquiries.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No enquiries available for survey
              </p>
            )}
          </div>

          {/* Survey Date */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Survey Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.surveyDate}
              onChange={(e) => setFormData({ ...formData, surveyDate: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-semibold"
            />
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <User size={16} />
              Assign To (Surveyor)
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => {
                const user = users.find((u) => u.email === e.target.value);
                setFormData({
                  ...formData,
                  assignedTo: e.target.value,
                  assignedToName: user?.name || user?.email || '',
                });
              }}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-semibold"
            >
              <option value="">-- Select Surveyor --</option>
              {users.map((user) => (
                <option key={user.email} value={user.email}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {users.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No surveyors available
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 active:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-transform shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar size={24} />
                Schedule Survey
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
