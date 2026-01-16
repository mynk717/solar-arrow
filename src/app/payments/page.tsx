'use client';

import { useState } from 'react';
import { dummyEnquiries } from '@/lib/data';
import StatusBadge from '@/components/StatusBadge';
import { IndianRupee, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';

export default function PaymentsPage() {
  const [enquiries, setEnquiries] = useState(dummyEnquiries);
  
  const awaitingRegistration = enquiries.filter(e => 
    e.status === 'survey_completed'
  );
  
  const awaitingPayment = enquiries.filter(e => 
    e.status === 'registration_pending' || e.registrationId && !e.paymentDate
  );
  
  const paymentReceived = enquiries.filter(e => 
    e.paymentDate && e.status !== 'active'
  );
  
  const completed = enquiries.filter(e => e.status === 'active');

  const totalExpectedPayment = awaitingPayment.reduce((sum, e) => sum + (e.estimatedCost || 0) * 0.5, 0);
  const totalReceivedPayment = paymentReceived.reduce((sum, e) => sum + (e.initialPayment || 0), 0);

  const handleUpdateRegistration = (enquiryId: string, registrationId: string, vendorName: string) => {
    setEnquiries(prev => prev.map(e => 
      e.id === enquiryId 
        ? { 
            ...e, 
            registrationId,
            vendorName,
            registrationDate: new Date(),
            status: 'registration_pending' as any,
            updatedAt: new Date()
          }
        : e
    ));
  };

  const handleRecordPayment = (enquiryId: string, amount: number) => {
    setEnquiries(prev => prev.map(e => 
      e.id === enquiryId 
        ? { 
            ...e, 
            initialPayment: amount,
            paymentDate: new Date(),
            status: 'payment_received' as any,
            updatedAt: new Date()
          }
        : e
    ));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-900 mt-2">Track registration and payment status</p>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm font-medium">Awaiting Registration</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{awaitingRegistration.length}</p>
            </div>
            <div className="bg-orange-500 text-white p-3 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm font-medium">Awaiting Payment</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{awaitingPayment.length}</p>
            </div>
            <div className="bg-red-500 text-white p-3 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm font-medium">Payment Received</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{paymentReceived.length}</p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm font-medium">Total Received</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₹{(totalReceivedPayment / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <IndianRupee size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Awaiting Registration */}
      {awaitingRegistration.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="text-orange-500" size={24} />
            Awaiting Government Registration
          </h2>
          
          <div className="space-y-4">
            {awaitingRegistration.map(enquiry => (
              <RegistrationCard 
                key={enquiry.id} 
                enquiry={enquiry}
                onUpdate={handleUpdateRegistration}
              />
            ))}
          </div>
        </div>
      )}

      {/* Awaiting Payment */}
      {awaitingPayment.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="text-red-500" size={24} />
            Awaiting Initial Payment
          </h2>
          
          <div className="space-y-4">
            {awaitingPayment.map(enquiry => (
              <PaymentCard 
                key={enquiry.id} 
                enquiry={enquiry}
                onRecordPayment={handleRecordPayment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Payment Received */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CheckCircle className="text-green-500" size={24} />
          Payment Received - Ready for Installation
        </h2>
        
        {paymentReceived.length === 0 ? (
          <p className="text-gray-900 text-center py-8">No payments received yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Registration ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Cost</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Initial Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentReceived.map(enquiry => (
                  <tr key={enquiry.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700">{enquiry.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{enquiry.customerName}</div>
                        <div className="text-sm text-gray-900">{enquiry.capacity} kW</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-700">{enquiry.registrationId}</td>
                    <td className="py-3 px-4 font-semibold text-gray-700">₹{enquiry.estimatedCost?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">
                      ₹{enquiry.initialPayment?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{enquiry.paymentDate?.toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={enquiry.status} />
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm">
                        <Download size={14} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RegistrationCard({ enquiry, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [vendorName, setVendorName] = useState('Solar Solutions Pvt Ltd');

  const handleSubmit = () => {
    if (registrationId) {
      onUpdate(enquiry.id, registrationId, vendorName);
      setIsEditing(false);
      setRegistrationId('');
    }
  };

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-900">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-900 mt-1">Survey Approved: {enquiry.surveyDate?.toLocaleDateString()}</p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-orange-500 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-1">Action Required: Customer Registration</p>
            <p className="text-gray-900">
              Customer must register at CSPDCL government portal and use vendor name: <strong>{vendorName}</strong>
            </p>
          </div>
        </div>
      </div>

      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          Update Registration Details
        </button>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Government Registration ID
            </label>
            <input
              type="text"
              placeholder="CSPDCL/2024/XXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name Used
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              disabled={!registrationId}
            >
              Confirm Registration
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setRegistrationId('');
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentCard({ enquiry, onRecordPayment }: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [amount, setAmount] = useState(enquiry.estimatedCost ? enquiry.estimatedCost / 2 : 0);

  const handleSubmit = () => {
    if (amount > 0) {
      onRecordPayment(enquiry.id, amount);
      setIsRecording(false);
    }
  };

  const estimatedCost = enquiry.estimatedCost || parseInt(enquiry.capacity) * 60000;
  const expectedPayment = estimatedCost / 2;

  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900">{enquiry.id} - {enquiry.customerName}</h3>
              <p className="text-sm text-gray-900">{enquiry.area} • {enquiry.capacity} kW</p>
              <p className="text-sm text-gray-900 mt-1">
                Registration: <span className="font-mono">{enquiry.registrationId}</span>
              </p>
            </div>
            <StatusBadge status={enquiry.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-900 mb-1">Total Project Cost</p>
          <p className="text-xl font-bold text-gray-900">₹{estimatedCost.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-900 mb-1">Expected Initial Payment (50%)</p>
          <p className="text-xl font-bold text-orange-600">₹{expectedPayment.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <IndianRupee className="text-red-500 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-1">Awaiting Government Payment</p>
            <p className="text-gray-900">
              Initial payment (50%) will be received from CSPDCL after customer application approval
            </p>
          </div>
        </div>
      </div>

      {!isRecording ? (
        <button
          onClick={() => setIsRecording(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Record Payment Received
        </button>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount Received
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900">₹</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
              />
            </div>
            <p className="text-xs text-gray-900 mt-1">Expected: ₹{expectedPayment.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option>NEFT</option>
              <option>RTGS</option>
              <option>Cheque</option>
              <option>Government Portal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Reference
            </label>
            <input
              type="text"
              placeholder="Transaction ID / Reference Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Confirm Payment
            </button>
            <button
              onClick={() => setIsRecording(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}