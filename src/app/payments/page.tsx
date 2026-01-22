'use client';

import { useState } from 'react';
import { dummyEnquiries } from '@/lib/data';
import StatusBadge from '@/components/StatusBadge';
import { IndianRupee, CheckCircle, Clock, AlertCircle, Download, Filter } from 'lucide-react';
import type { PaymentType, Enquiry } from '@/lib/types';

export default function PaymentsPage() {
  const [enquiries, setEnquiries] = useState(dummyEnquiries);
  const [paymentFilter, setPaymentFilter] = useState<PaymentType | 'all'>('all');
  
  const awaitingRegistration = enquiries.filter(e => 
    e.status === 'survey_completed'
  );
  
  const awaitingPayment = enquiries.filter(e => 
    e.status === 'registration_pending' || (e.registrationId && !e.paymentDate)
  );
  
  const paymentReceived = enquiries.filter(e => 
    e.paymentDate && e.status !== 'active'
  );
  
  const subsidyPending = enquiries.filter(e => 
    e.paymentType && e.paymentType.includes('Subsidy') && 
    (!e.subsidyStatus || e.subsidyStatus === 'pending')
  );
  
  const completed = enquiries.filter(e => e.status === 'active');

  const totalExpectedPayment = awaitingPayment.reduce((sum, e) => sum + (e.estimatedCost || 0) * 0.5, 0);
  const totalReceivedPayment = paymentReceived.reduce((sum, e) => sum + (e.initialPayment || 0), 0);
  const totalSubsidyAmount = subsidyPending.reduce((sum, e) => sum + (e.subsidyAmount || 0), 0);

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

  const handleRecordPayment = (
    enquiryId: string, 
    amount: number, 
    paymentType: PaymentType,
    paymentMethod: string,
    transactionRef?: string
  ) => {
    setEnquiries(prev => prev.map(e => 
      e.id === enquiryId 
        ? { 
            ...e, 
            initialPayment: amount,
            paymentDate: new Date(),
            paymentType,
            paymentMethod,
            status: 'payment_received' as any,
            updatedAt: new Date()
          }
        : e
    ));
  };

  
const handleSubsidyUpdate = (
  enquiryId: string,
  subsidyAmount: number,
  status: 'pending' | 'approved' | 'disbursed' | 'rejected'
) => {
  setEnquiries(prev => prev.map(e => 
    e.id === enquiryId 
      ? { 
          ...e, 
          subsidyAmount,
          subsidyStatus: status,
          subsidyAppliedDate: e.subsidyAppliedDate || new Date(),
          subsidyApprovedDate: status === 'approved' || status === 'disbursed' ? new Date() : undefined,
          subsidyDisbursedDate: status === 'disbursed' ? new Date() : undefined,
          updatedAt: new Date()
        }
      : e
  ));
};


  // Filter by payment type
  const filteredPaymentReceived = paymentFilter === 'all' 
    ? paymentReceived 
    : paymentReceived.filter(e => e.paymentType === paymentFilter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-2">Track registration, payment status, and subsidy disbursement</p>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Awaiting Registration</p>
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
              <p className="text-gray-600 text-sm font-medium">Awaiting Payment</p>
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
              <p className="text-gray-600 text-sm font-medium">Payment Received</p>
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
              <p className="text-gray-600 text-sm font-medium">Subsidy Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{subsidyPending.length}</p>
            </div>
            <div className="bg-purple-500 text-white p-3 rounded-lg">
              <IndianRupee size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Received</p>
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

      {/* Subsidy Tracking */}
      {subsidyPending.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <IndianRupee className="text-purple-500" size={24} />
            Subsidy Disbursement Tracking
          </h2>
          
          <div className="space-y-4">
            {subsidyPending.map(enquiry => (
              <SubsidyCard 
                key={enquiry.id} 
                enquiry={enquiry}
                onUpdate={handleSubsidyUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Payment Received */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={24} />
            Payment Received - Ready for Next Stage
          </h2>
          
          {/* Payment Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentType | 'all')}
            >
              <option value="all">All Payment Types</option>
              <option value="Direct">Direct Payment</option>
              <option value="Bank Loan">Bank Loan</option>
              <option value="Subsidy + Direct">Subsidy + Direct</option>
              <option value="Subsidy + Finance">Subsidy + Finance</option>
            </select>
          </div>
        </div>
        
        {filteredPaymentReceived.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No payments received yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Panel Tag</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Registration ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Cost</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Initial Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subsidy</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaymentReceived.map(enquiry => (
                  <tr key={enquiry.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700">{enquiry.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{enquiry.customerName}</div>
                        <div className="text-sm text-gray-600">{enquiry.capacity} kW</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        enquiry.panelTag === 'RTS' ? 'bg-blue-100 text-blue-800' :
                        enquiry.panelTag === 'Commercial' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {enquiry.panelTag}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-gray-700">{enquiry.registrationId}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        enquiry.paymentType?.includes('Subsidy') ? 'bg-purple-100 text-purple-800' :
                        enquiry.paymentType === 'Bank Loan' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {enquiry.paymentType || 'Direct'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-700">₹{enquiry.estimatedCost?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">
                      ₹{enquiry.initialPayment?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {enquiry.subsidyAmount ? (
                        <div>
                          <div className="text-purple-600 font-semibold">₹{enquiry.subsidyAmount.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">{enquiry.subsidyStatus || 'pending'}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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

function RegistrationCard({ enquiry, onUpdate }: { enquiry: Enquiry; onUpdate: (id: string, regId: string, vendor: string) => void }) {
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
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-600 mt-1">Survey Approved: {enquiry.surveyDate?.toLocaleDateString()}</p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-orange-500 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-1">Action Required: Customer Registration</p>
            <p className="text-gray-700">
              Customer must register at CSPDCL government portal and select our vendor: <strong>{vendorName}</strong>
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
              placeholder="CSPDCL/2026/XXX"
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
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

function PaymentCard({ enquiry, onRecordPayment }: { 
  enquiry: Enquiry; 
  onRecordPayment: (id: string, amount: number, paymentType: PaymentType, method: string, ref?: string) => void 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [amount, setAmount] = useState(enquiry.estimatedCost ? enquiry.estimatedCost / 2 : 0);
  const [paymentType, setPaymentType] = useState<PaymentType>('Direct');
  const [paymentMethod, setPaymentMethod] = useState('NEFT');
  const [transactionRef, setTransactionRef] = useState('');

  const handleSubmit = () => {
    if (amount > 0) {
      onRecordPayment(enquiry.id, amount, paymentType, paymentMethod, transactionRef);
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
              <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
              <p className="text-sm text-gray-600 mt-1">
                Registration: <span className="font-mono">{enquiry.registrationId}</span>
              </p>
            </div>
            <StatusBadge status={enquiry.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Total Project Cost</p>
          <p className="text-xl font-bold text-gray-900">₹{estimatedCost.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Expected Initial Payment (50%)</p>
          <p className="text-xl font-bold text-orange-600">₹{expectedPayment.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <IndianRupee className="text-red-500 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-1">Awaiting Payment</p>
            <p className="text-gray-700">
              Initial payment (50%) will be received from customer or CSPDCL after application approval
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
              Payment Type
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
            >
              <option value="Direct">Direct Payment</option>
              <option value="Bank Loan">Bank Loan</option>
              <option value="Subsidy + Direct">Subsidy + Direct Payment</option>
              <option value="Subsidy + Finance">Subsidy + Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount Received
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₹</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Expected: ₹{expectedPayment.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option>NEFT</option>
              <option>RTGS</option>
              <option>IMPS</option>
              <option>Cheque</option>
              <option>Government Portal</option>
              <option>Bank Loan Transfer</option>
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
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
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

function SubsidyCard({ enquiry, onUpdate }: { 
  enquiry: Enquiry; 
  onUpdate: (id: string, amount: number, status: 'pending' | 'approved' | 'disbursed'| 'rejected') => void 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [subsidyAmount, setSubsidyAmount] = useState(enquiry.subsidyAmount || 0);
  const [subsidyStatus, setSubsidyStatus] = useState<'pending' | 'approved' | 'disbursed'| 'rejected'>(
    enquiry.subsidyStatus || 'pending'
  );

  const handleSubmit = () => {
    if (subsidyAmount > 0) {
      onUpdate(enquiry.id, subsidyAmount, subsidyStatus);
      setIsEditing(false);
    }
  };

  return (
    <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900">{enquiry.id} - {enquiry.customerName}</h3>
          <p className="text-sm text-gray-600">{enquiry.area} • {enquiry.capacity} kW</p>
          <p className="text-sm text-gray-600 mt-1">Payment Type: {enquiry.paymentType}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          enquiry.subsidyStatus === 'disbursed' ? 'bg-green-100 text-green-800' :
          enquiry.subsidyStatus === 'approved' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {enquiry.subsidyStatus || 'Pending'}
        </span>
      </div>

      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Update Subsidy Status
        </button>
      ) : (
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subsidy Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₹</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={subsidyAmount}
                onChange={(e) => setSubsidyAmount(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subsidy Status
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              value={subsidyStatus}
              onChange={(e) => setSubsidyStatus(e.target.value as 'pending' | 'approved' | 'disbursed')}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disbursed">Disbursed</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Update Subsidy
            </button>
            <button
              onClick={() => setIsEditing(false)}
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
