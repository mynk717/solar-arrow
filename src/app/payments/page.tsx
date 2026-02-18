'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  FileText,
  Calendar,
  User,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

interface PaymentRecord {
  enquiryId: string;
  customerName: string;
  phone: string;
  capacity: string;
  quotationAmount: number;
  
  // Payment 1 (70%)
  payment1Amount: number;
  payment1Status: 'pending' | 'received' | 'verified';
  payment1Date?: string;
  payment1Method?: string;
  payment1Reference?: string;
  payment1VerifiedBy?: string;
  
  // Payment 2 (30%)
  payment2Amount: number;
  payment2Status: 'pending' | 'received' | 'verified' | 'not-applicable';
  payment2Date?: string;
  payment2Method?: string;
  payment2Reference?: string;
  payment2VerifiedBy?: string;
  
  // Derived
  totalPaid: number;
  balanceAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'full';
  installationStatus?: string;
}

export default function PaymentsPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyType, setVerifyType] = useState<'payment1' | 'payment2'>('payment1');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = (payment: PaymentRecord, type: 'payment1' | 'payment2') => {
    setSelectedPayment(payment);
    setVerifyType(type);
    setShowVerifyModal(true);
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.enquiryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' ||
      payment.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const metrics = {
    total: payments.length,
    unpaid: payments.filter(p => p.paymentStatus === 'unpaid').length,
    partial: payments.filter(p => p.paymentStatus === 'partial').length,
    full: payments.filter(p => p.paymentStatus === 'full').length,
    totalReceived: payments.reduce((sum, p) => sum + p.totalPaid, 0),
    totalPending: payments.reduce((sum, p) => sum + p.balanceAmount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Payment Tracking
        </h1>
        <p className="text-gray-800 font-medium mt-2">
          Track and verify customer payments (70% upfront + 30% after installation)
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="text-sm font-semibold text-gray-700">Total Enquiries</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="text-sm font-semibold text-gray-700">Unpaid</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{metrics.unpaid}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="text-sm font-semibold text-gray-700">Partial</div>
          <div className="text-2xl font-bold text-yellow-700 mt-1">{metrics.partial}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="text-sm font-semibold text-gray-700">Paid Full</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{metrics.full}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="text-sm font-semibold text-gray-700">Total Received</div>
          <div className="text-xl font-bold text-purple-700 mt-1">
            ₹{(metrics.totalReceived / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <div className="text-sm font-semibold text-gray-700">Pending</div>
          <div className="text-xl font-bold text-orange-700 mt-1">
            ₹{(metrics.totalPending / 100000).toFixed(1)}L
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by enquiry ID, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="all">All Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial (70% paid)</option>
            <option value="full">Paid Full</option>
          </select>
        </div>

        <button
          onClick={() => fetchPayments(true)}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Enquiry ID</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Customer</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Quotation</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Payment 1 (70%)</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Payment 2 (30%)</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Balance</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.enquiryId} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 font-mono text-sm font-semibold text-gray-900">
                    {payment.enquiryId}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{payment.customerName}</div>
                    <div className="text-sm font-medium text-gray-700">{payment.phone}</div>
                    <div className="text-xs font-medium text-gray-600">{payment.capacity}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">
                      ₹{payment.quotationAmount.toLocaleString('en-IN')}
                    </div>
                  </td>
                  
                  {/* Payment 1 */}
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900">
                        ₹{payment.payment1Amount.toLocaleString('en-IN')}
                      </div>
                      <PaymentStatusBadge status={payment.payment1Status} />
                      {payment.payment1Date && (
                        <div className="text-xs text-gray-600">
                          {new Date(payment.payment1Date).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Payment 2 */}
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900">
                        ₹{payment.payment2Amount.toLocaleString('en-IN')}
                      </div>
                      <PaymentStatusBadge status={payment.payment2Status} />
                      {payment.payment2Date && (
                        <div className="text-xs text-gray-600">
                          {new Date(payment.payment2Date).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className={`font-bold ${payment.balanceAmount === 0 ? 'text-green-700' : 'text-red-700'}`}>
                      ₹{payment.balanceAmount.toLocaleString('en-IN')}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <PaymentProgressBadge status={payment.paymentStatus} />
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      {payment.payment1Status === 'pending' && (
                        <button
                          onClick={() => handleVerifyPayment(payment, 'payment1')}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 font-medium text-sm"
                        >
                          Verify 70%
                        </button>
                      )}
                      {payment.payment1Status === 'verified' && 
                       payment.payment2Status === 'pending' && 
                       payment.installationStatus === 'completed' && (
                        <button
                          onClick={() => handleVerifyPayment(payment, 'payment2')}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 font-medium text-sm"
                        >
                          Verify 30%
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold">No payments found</p>
          </div>
        )}
      </div>

      {/* Verify Payment Modal */}
      {showVerifyModal && selectedPayment && (
        <VerifyPaymentModal
          payment={selectedPayment}
          type={verifyType}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedPayment(null);
          }}
          onSuccess={() => {
            setShowVerifyModal(false);
            setSelectedPayment(null);
            fetchPayments(true);
          }}
        />
      )}

      {/* Payment Details Modal */}
      {selectedPayment && !showVerifyModal && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

// Payment Status Badge
function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
    received: { label: 'Received', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    verified: { label: 'Verified', color: 'bg-green-100 text-green-900 border-green-300' },
    'not-applicable': { label: 'N/A', color: 'bg-gray-100 text-gray-900 border-gray-300' },
  };

  const { label, color } = config[status] || config.pending;

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold border ${color} inline-block`}>
      {label}
    </span>
  );
}

// Payment Progress Badge
function PaymentProgressBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    unpaid: { label: 'Unpaid', color: 'bg-red-100 text-red-900 border-red-300' },
    partial: { label: '70% Paid', color: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
    full: { label: 'Paid Full', color: 'bg-green-100 text-green-900 border-green-300' },
  };

  const { label, color } = config[status] || config.unpaid;

  return (
    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 ${color} inline-block`}>
      {label}
    </span>
  );
}

// Verify Payment Modal Component
function VerifyPaymentModal({
  payment,
  type,
  onClose,
  onSuccess,
}: {
  payment: PaymentRecord;
  type: 'payment1' | 'payment2';
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank-transfer',
    referenceNumber: '',
    amount: type === 'payment1' ? payment.payment1Amount : payment.payment2Amount,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.referenceNumber.trim()) {
      alert('Reference number is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: payment.enquiryId,
          paymentType: type,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify payment');
      }

      alert(`Payment ${type === 'payment1' ? '1 (70%)' : '2 (30%)'} verified successfully!`);
      onSuccess();
    } catch (error: any) {
      console.error('Verification error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const paymentLabel = type === 'payment1' ? 'Payment 1 (70%)' : 'Payment 2 (30%)';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Verify {paymentLabel}</h2>
          <p className="text-gray-600 text-sm mt-1">
            {payment.enquiryId} - {payment.customerName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Payment Summary */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Quotation Amount:</span>
              <span className="text-sm font-bold text-gray-900">
                ₹{payment.quotationAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-700">{paymentLabel} Expected:</span>
              <span className="text-sm font-bold text-gray-900">
                ₹{formData.amount.toLocaleString('en-IN')}
              </span>
            </div>
            {type === 'payment2' && (
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Installation Status:</span>
                <span className="text-sm font-bold text-green-700">
                  {payment.installationStatus || 'N/A'}
                </span>
              </div>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold"
            >
              <option value="bank-transfer">Bank Transfer / NEFT / RTGS</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
              <option value="dd">Demand Draft</option>
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Transaction Reference / Cheque No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., UTR123456789 or Cheque #123456"
            />
          </div>

          {/* Amount (editable for adjustments) */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Amount Received (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold"
            />
            {formData.amount !== (type === 'payment1' ? payment.payment1Amount : payment.payment2Amount) && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                ⚠️ Amount differs from expected {type === 'payment1' ? '70%' : '30%'} split
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-800 font-medium mb-2 text-sm">
              Verification Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Any additional notes about this payment..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 border-gray-300 text-gray-900 font-bold px-4 py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Payment Details Modal (view only)
function PaymentDetailsModal({
  payment,
  onClose,
}: {
  payment: PaymentRecord;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
              <p className="text-gray-600 text-sm mt-1">{payment.enquiryId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Name:</span>
                <span className="text-sm font-bold text-gray-900">{payment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Phone:</span>
                <span className="text-sm font-bold text-gray-900">{payment.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Capacity:</span>
                <span className="text-sm font-bold text-gray-900">{payment.capacity}</span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Payment Breakdown</h3>
            <div className="space-y-3">
              {/* Quotation */}
              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Quotation Amount</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{payment.quotationAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment 1 */}
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Payment 1 (70%)</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{payment.payment1Amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Status:</span>
                    <PaymentStatusBadge status={payment.payment1Status} />
                  </div>
                  {payment.payment1Date && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Date:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(payment.payment1Date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                  {payment.payment1Method && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Method:</span>
                      <span className="font-semibold text-gray-900">{payment.payment1Method}</span>
                    </div>
                  )}
                  {payment.payment1Reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Reference:</span>
                      <span className="font-mono text-xs font-semibold text-gray-900">{payment.payment1Reference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment 2 */}
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Payment 2 (30%)</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{payment.payment2Amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Status:</span>
                    <PaymentStatusBadge status={payment.payment2Status} />
                  </div>
                  {payment.payment2Date && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Date:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(payment.payment2Date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                  {payment.payment2Method && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Method:</span>
                      <span className="font-semibold text-gray-900">{payment.payment2Method}</span>
                    </div>
                  )}
                  {payment.payment2Reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Reference:</span>
                      <span className="font-mono text-xs font-semibold text-gray-900">{payment.payment2Reference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Total Paid</span>
                  <span className="text-xl font-bold text-green-700">
                    ₹{payment.totalPaid.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Balance Amount</span>
                  <span className={`text-xl font-bold ${payment.balanceAmount === 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ₹{payment.balanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
