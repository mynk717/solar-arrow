'use client';

import { useState } from 'react';
import { dummyEnquiries } from '@/lib/data';
import { Enquiry, EnquiryStatus } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { Search, Filter, Plus, Eye } from 'lucide-react';
import EnquiryForm from '@/components/EnquiryForm';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState(dummyEnquiries);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'all'>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showForm, setShowForm] = useState(false);


  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch = 
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enquiry Management</h1>
          <p className="text-gray-900 mt-2">Manage all customer enquiries</p>
        </div>
       <button 
  onClick={() => setShowForm(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
>
  <Plus size={20} />
  New Enquiry
</button>
{showForm && (
  <EnquiryForm
    onClose={() => setShowForm(false)}
    onSubmit={(newEnquiry) => {
      setEnquiries(prev => [newEnquiry, ...prev]);
    }}
  />
)}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" size={20} />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700" size={20} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-900"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="survey_pending">Survey Pending</option>
              <option value="survey_completed">Survey Completed</option>
              <option value="payment_pending">Payment Pending</option>
              <option value="payment_received">Payment Received</option>
              <option value="installation_completed">Installation Completed</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">ID</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer Details</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Location</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Capacity</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((enquiry) => (
                <tr key={enquiry.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">{enquiry.id}</td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{enquiry.customerName}</div>
                      <div className="text-sm text-gray-900">{enquiry.phone}</div>
                      <div className="text-sm text-gray-900">{enquiry.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{enquiry.area}</div>
                      <div className="text-gray-900">{enquiry.address}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-900">{enquiry.capacity} kW</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={enquiry.status} />
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {enquiry.createdAt.toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedEnquiry(enquiry)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEnquiries.length === 0 && (
          <div className="text-center py-12 text-gray-900">
            No enquiries found matching your criteria
          </div>
        )}
      </div>

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <EnquiryModal 
          enquiry={selectedEnquiry} 
          onClose={() => setSelectedEnquiry(null)} 
        />
      )}
    </div>
  );
}

function EnquiryModal({ enquiry, onClose }: { enquiry: Enquiry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Enquiry Details - {enquiry.id}</h2>
          <button onClick={onClose} className="text-gray-900 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <Section title="Customer Information">
            <InfoRow label="Name" value={enquiry.customerName} />
            <InfoRow label="Phone" value={enquiry.phone} />
            <InfoRow label="Email" value={enquiry.email} />
            <InfoRow label="Address" value={enquiry.address} />
            <InfoRow label="Area" value={enquiry.area} />
          </Section>

          <Section title="Project Details">
            <InfoRow label="Capacity" value={`${enquiry.capacity} kW`} />
            <InfoRow label="Status" value={<StatusBadge status={enquiry.status} />} />
            <InfoRow label="Created" value={enquiry.createdAt.toLocaleDateString()} />
          </Section>

          {enquiry.surveyDate && (
            <Section title="Survey Information">
              <InfoRow label="Survey Date" value={enquiry.surveyDate.toLocaleDateString()} />
              <InfoRow label="Surveyed By" value={enquiry.surveyedBy || '-'} />
              <InfoRow label="Survey Notes" value={enquiry.surveyNotes || '-'} />
              <InfoRow label="Approved" value={enquiry.surveyApproved ? '✅ Yes' : '❌ No'} />
            </Section>
          )}

          {enquiry.registrationId && (
            <Section title="Registration Details">
              <InfoRow label="Registration ID" value={enquiry.registrationId} />
              <InfoRow label="Registration Date" value={enquiry.registrationDate?.toLocaleDateString()} />
              <InfoRow label="Vendor Name" value={enquiry.vendorName || '-'} />
            </Section>
          )}

          {enquiry.estimatedCost && (
            <Section title="Payment Information">
              <InfoRow label="Estimated Cost" value={`₹${enquiry.estimatedCost.toLocaleString()}`} />
              <InfoRow label="Initial Payment" value={`₹${enquiry.initialPayment?.toLocaleString()}`} />
              <InfoRow label="Payment Date" value={enquiry.paymentDate?.toLocaleDateString()} />
            </Section>
          )}

          {enquiry.installationDate && (
            <Section title="Installation Details">
              <InfoRow label="Dispatch Date" value={enquiry.dispatchDate?.toLocaleDateString()} />
              <InfoRow label="Installation Date" value={enquiry.installationDate?.toLocaleDateString()} />
              <InfoRow label="Installed By" value={enquiry.installedBy || '-'} />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 bg-gray-50 rounded-lg p-4">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="text-gray-900 font-medium">{label}:</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}