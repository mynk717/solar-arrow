'use client';

import { useState } from 'react';
import { dummyEnquiries, surveyTeamMembers } from '@/lib/data';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, User, CheckCircle, XCircle } from 'lucide-react';

export default function SurveyPage() {
  const [enquiries, setEnquiries] = useState(dummyEnquiries);
  
  const pendingSurveys = enquiries.filter(e => 
    e.status === 'survey_pending' || e.status === 'new'
  );
  
  const completedSurveys = enquiries.filter(e => 
    e.status === 'survey_completed' || 
    ['registration_pending', 'payment_pending', 'payment_received', 'active'].includes(e.status)
  ).filter(e => e.surveyDate);

  const handleScheduleSurvey = (enquiryId: string, surveyDate: Date, assignee: string) => {
    setEnquiries(prev => prev.map(e => 
      e.id === enquiryId 
        ? { ...e, surveyDate, surveyedBy: assignee, status: 'survey_pending' as any }
        : e
    ));
  };

  const handleApproveSurvey = (enquiryId: string, approved: boolean, notes: string) => {
    setEnquiries(prev => prev.map(e => 
      e.id === enquiryId 
        ? { 
            ...e, 
            surveyApproved: approved, 
            surveyNotes: notes,
            status: approved ? 'survey_completed' as any : 'survey_pending' as any,
            updatedAt: new Date()
          }
        : e
    ));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Survey Panel</h1>
        <p className="text-gray-900 mt-2">Schedule and manage site surveys (CSPDCL Guidelines)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm font-medium">Pending Surveys</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingSurveys.length}</p>
            </div>
            <div className="bg-yellow-500 text-white p-3 rounded-lg">
              <Calendar size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{completedSurveys.length}</p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm font-medium">Team Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{surveyTeamMembers.length}</p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <User size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Surveys */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Surveys</h2>
        
        {pendingSurveys.length === 0 ? (
          <p className="text-gray-900 text-center py-8">No pending surveys</p>
        ) : (
          <div className="space-y-4">
            {pendingSurveys.map(enquiry => (
              <SurveyCard 
                key={enquiry.id} 
                enquiry={enquiry} 
                onSchedule={handleScheduleSurvey}
                onApprove={handleApproveSurvey}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Surveys */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Completed Surveys</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Survey Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Surveyed By</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Result</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {completedSurveys.map(enquiry => (
                <tr key={enquiry.id} className="border-t border-gray-200">
                  <td className="py-3 px-4 font-medium text-gray-700">{enquiry.id}</td>
                  <td className="py-3 px-4 text-gray-700">{enquiry.customerName}</td>
                  <td className="py-3 px-4 text-gray-700">{enquiry.surveyDate?.toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700">{enquiry.surveyedBy}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {enquiry.surveyApproved ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={16} /> Approved
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle size={16} /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{enquiry.surveyNotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SurveyCard({ enquiry, onSchedule, onApprove }: any) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-900">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-900 mt-1">{enquiry.address}</p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      {!enquiry.surveyDate ? (
        <div>
          {!isScheduling ? (
            <button
              onClick={() => setIsScheduling(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Schedule Survey
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  {surveyTeamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSchedule(enquiry.id, new Date(), surveyTeamMembers[0]);
                    setIsScheduling(false);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setIsScheduling(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="text-sm text-gray-900 mb-2">
            Scheduled: {enquiry.surveyDate.toLocaleDateString()} • {enquiry.surveyedBy}
          </div>
          
          {!enquiry.surveyApproved && enquiry.status === 'survey_pending' && !isApproving && (
            <button
              onClick={() => setIsApproving(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Submit Survey Result
            </button>
          )}

          {isApproving && (
            <div className="bg-gray-50 p-4 rounded-lg mt-2">
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                placeholder="Survey notes and observations..."
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onApprove(enquiry.id, true, 'Site approved - suitable for installation');
                    setIsApproving(false);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => {
                    onApprove(enquiry.id, false, 'Site rejected - not suitable');
                    setIsApproving(false);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={() => setIsApproving(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}