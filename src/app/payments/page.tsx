'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  FileText,
  RefreshCw,
  IndianRupee,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PaymentRecord {
  enquiryId: string;
  customerName: string;
  phone: string;
  capacity: string;
  quotationId?: string;
  quotationAmount: number;
  payment1Amount: number;
  payment1Status: string;
  payment1Date?: string;
  payment1Method?: string;
  payment1Reference?: string;
  payment1VerifiedBy?: string;
  payment2Amount: number;
  payment2Status: string;
  payment2Date?: string;
  payment2Method?: string;
  payment2Reference?: string;
  payment2VerifiedBy?: string;
  totalPaid: number;
  balanceAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'full';
  installationStatus?: string;
  paymentMethod?: string;
  paymentDate?: string;
  paymentUTR?: string;
  paymentVerifiedBy?: string;
}

// ─── Safe helpers ───────────────────────────────────────────────────────────
const fmt = (n: unknown) =>
  (typeof n === 'number' && isFinite(n) ? n : 0).toLocaleString('en-IN');

const fmtL = (n: unknown) =>
  ((typeof n === 'number' && isFinite(n) ? n : 0) / 100000).toFixed(1);

const fmtDate = (d?: string) => {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('en-IN');
  } catch {
    return null;
  }
};

// ─── Status badge helpers ────────────────────────────────────────────────────
function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    verified: 'bg-green-100 text-green-800 border-green-300',
    received: 'bg-blue-100 text-blue-800 border-blue-300',
    pending:  'bg-yellow-100 text-yellow-800 border-yellow-300',
  };
  const label: Record<string, string> = {
    verified: 'Verified', received: 'Received', pending: 'Pending',
  };
  const cls = map[status] ?? map.pending;
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${cls}`}>
      {label[status] ?? 'Pending'}
    </span>
  );
}

function ProgressBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    full:    'bg-green-100 text-green-800 border-green-300',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    unpaid:  'bg-red-100 text-red-800 border-red-300',
  };
  const label: Record<string, string> = {
    full: 'Paid Full', partial: '70% Paid', unpaid: 'Unpaid',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border-2 ${map[status] ?? map.unpaid}`}>
      {label[status] ?? 'Unpaid'}
    </span>
  );
}

// ─── Mobile Payment Card ─────────────────────────────────────────────────────
function PaymentCard({
  payment,
  onVerify,
  onView,
}: {
  payment: PaymentRecord;
  onVerify: (p: PaymentRecord, t: 'payment1' | 'payment2') => void;
  onView: (p: PaymentRecord) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const p1date = fmtDate(payment.payment1Date);
  const p2date = fmtDate(payment.payment2Date);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Top row */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-gray-900 text-base">{payment.customerName}</p>
            <p className="text-sm text-gray-600">{payment.phone}</p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{payment.enquiryId}</p>
          </div>
          <ProgressBadge status={payment.paymentStatus} />
        </div>

        {/* Amount summary */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Quotation</p>
            <p className="text-sm font-bold text-gray-900">₹{fmt(payment.quotationAmount)}</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-xs text-gray-500 mb-0.5">Paid</p>
            <p className="text-sm font-bold text-green-700">₹{fmt(payment.totalPaid)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Balance</p>
            <p className={`text-sm font-bold ${(payment.balanceAmount ?? 0) === 0 ? 'text-green-700' : 'text-red-700'}`}>
              ₹{fmt(payment.balanceAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment 1 & 2 rows */}
      {expanded && (
        <div className="px-4 pb-2 space-y-2 border-t border-gray-100 pt-3">
          {/* Payment 1 */}
          <div className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-gray-700">Payment 1 (70%)</p>
              <p className="text-sm font-bold text-gray-900">₹{fmt(payment.payment1Amount)}</p>
              {p1date && <p className="text-xs text-gray-500">{p1date}</p>}
              {payment.payment1Method && <p className="text-xs text-gray-500">{payment.payment1Method}</p>}
              {payment.payment1Reference && (
                <p className="text-xs font-mono text-gray-600">{payment.payment1Reference}</p>
              )}
            </div>
            <PaymentStatusBadge status={payment.payment1Status} />
          </div>

          {/* Payment 2 */}
          <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-gray-700">Payment 2 (30%)</p>
              <p className="text-sm font-bold text-gray-900">₹{fmt(payment.payment2Amount)}</p>
              {p2date && <p className="text-xs text-gray-500">{p2date}</p>}
              {payment.payment2Method && <p className="text-xs text-gray-500">{payment.payment2Method}</p>}
              {payment.payment2Reference && (
                <p className="text-xs font-mono text-gray-600">{payment.payment2Reference}</p>
              )}
            </div>
            <PaymentStatusBadge status={payment.payment2Status} />
          </div>
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-gray-600 text-sm font-medium"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Less' : 'Details'}
        </button>

        <div className="flex gap-2">
          {payment.payment1Status === 'pending' && (payment.quotationAmount ?? 0) > 0 && (
            <button
              onClick={() => onVerify(payment, 'payment1')}
              className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              Verify 70%
            </button>
          )}
          {payment.payment1Status === 'verified' &&
            payment.payment2Status === 'pending' &&
            payment.installationStatus === 'completed' && (
              <button
                onClick={() => onVerify(payment, 'payment2')}
                className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                Verify 30%
              </button>
            )}
          <button
            onClick={() => onView(payment)}
            className="border border-gray-300 text-gray-700 p-1.5 rounded-lg"
          >
            <FileText size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Verify Modal ────────────────────────────────────────────────────────────
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
  const expectedAmount = type === 'payment1'
    ? (payment.payment1Amount ?? 0)
    : (payment.payment2Amount ?? 0);

  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank-transfer',
    referenceNumber: '',
    amount: expectedAmount,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.referenceNumber.trim()) {
      alert('Reference number is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId: payment.enquiryId, paymentType: type, ...form }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      alert(`Payment ${type === 'payment1' ? '1 (70%)' : '2 (30%)'} verified!`);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Verify {type === 'payment1' ? 'Payment 1 (70%)' : 'Payment 2 (30%)'}
            </h2>
            <p className="text-sm text-gray-500">{payment.enquiryId} · {payment.customerName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quotation Amount</span>
              <span className="font-bold text-gray-900">₹{fmt(payment.quotationAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expected Amount</span>
              <span className="font-bold text-gray-900">₹{fmt(expectedAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.paymentDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, paymentDate: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="bank-transfer">Bank Transfer / NEFT / RTGS</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
              <option value="dd">Demand Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              UTR / Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.referenceNumber}
              onChange={e => setForm({ ...form, referenceNumber: e.target.value })}
              placeholder="e.g. UTR123456789"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Amount Received (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={form.amount}
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 font-bold focus:border-blue-500 focus:outline-none text-sm"
            />
            {form.amount !== expectedAmount && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                ⚠️ Differs from expected {type === 'payment1' ? '70%' : '30%'} amount
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional notes..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:outline-none text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2 pb-safe">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 border-gray-300 text-gray-900 font-bold py-3 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Verifying...' : '✓ Verify Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Details Modal ───────────────────────────────────────────────────────────
function PaymentDetailsModal({
  payment,
  onClose,
}: {
  payment: PaymentRecord;
  onClose: () => void;
}) {
  const p1date = fmtDate(payment.payment1Date);
  const p2date = fmtDate(payment.payment2Date);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
            <p className="text-sm text-gray-500">{payment.enquiryId} · {payment.customerName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <Row label="Customer" value={payment.customerName} />
            <Row label="Phone" value={payment.phone} />
            <Row label="Capacity" value={`${payment.capacity} kW`} />
            {payment.quotationId && <Row label="Quotation ID" value={payment.quotationId} mono />}
          </div>

          {/* Quotation */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Quotation Amount</span>
              <span className="text-lg font-bold text-gray-900">₹{fmt(payment.quotationAmount)}</span>
            </div>
          </div>

          {/* Payment 1 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-gray-900">Payment 1 (70%)</span>
              <span className="text-lg font-bold text-gray-900">₹{fmt(payment.payment1Amount)}</span>
            </div>
            <Row label="Status" value={<PaymentStatusBadge status={payment.payment1Status} />} />
            {p1date && <Row label="Date" value={p1date} />}
            {payment.payment1Method && <Row label="Method" value={payment.payment1Method} />}
            {payment.payment1Reference && <Row label="Reference" value={payment.payment1Reference} mono />}
            {payment.payment1VerifiedBy && <Row label="Verified By" value={payment.payment1VerifiedBy} />}
          </div>

          {/* Payment 2 */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-gray-900">Payment 2 (30%)</span>
              <span className="text-lg font-bold text-gray-900">₹{fmt(payment.payment2Amount)}</span>
            </div>
            <Row label="Status" value={<PaymentStatusBadge status={payment.payment2Status} />} />
            {p2date && <Row label="Date" value={p2date} />}
            {payment.payment2Method && <Row label="Method" value={payment.payment2Method} />}
            {payment.payment2Reference && <Row label="Reference" value={payment.payment2Reference} mono />}
            {payment.payment2VerifiedBy && <Row label="Verified By" value={payment.payment2VerifiedBy} />}
          </div>

          {/* Summary */}
          <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Paid</span>
              <span className="text-lg font-bold text-green-700">₹{fmt(payment.totalPaid)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Balance</span>
              <span className={`text-lg font-bold ${(payment.balanceAmount ?? 0) === 0 ? 'text-green-700' : 'text-red-700'}`}>
                ₹{fmt(payment.balanceAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Status</span>
              <ProgressBadge status={payment.paymentStatus} />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 pb-safe">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center gap-2 text-sm">
      <span className="text-gray-600 shrink-0">{label}</span>
      <span className={`font-semibold text-gray-900 text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const { data: session } = useSession();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyType, setVerifyType] = useState<'payment1' | 'payment2'>('payment1');

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(Array.isArray(data.payments) ? data.payments : []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (p.enquiryId ?? '').toLowerCase().includes(q) ||
      (p.customerName ?? '').toLowerCase().includes(q) ||
      (p.phone ?? '').includes(q);
    const matchStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const metrics = {
    total: payments.length,
    unpaid: payments.filter(p => p.paymentStatus === 'unpaid').length,
    partial: payments.filter(p => p.paymentStatus === 'partial').length,
    full: payments.filter(p => p.paymentStatus === 'full').length,
    totalReceived: payments.reduce((s, p) => s + (p.totalPaid ?? 0), 0),
    totalPending: payments.reduce((s, p) => s + (p.balanceAmount ?? 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Clock className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 pt-5 pb-4 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
        <p className="text-sm text-gray-600 mt-1">70% upfront · 30% after installation</p>
      </div>

      <div className="px-4 sm:px-6 pt-4 space-y-4">

        {/* Metric Cards - 2 col on mobile, 6 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: metrics.total, color: 'border-blue-500', text: 'text-gray-900' },
            { label: 'Unpaid', value: metrics.unpaid, color: 'border-red-500', text: 'text-red-700' },
            { label: 'Partial', value: metrics.partial, color: 'border-yellow-500', text: 'text-yellow-700' },
            { label: 'Paid Full', value: metrics.full, color: 'border-green-500', text: 'text-green-700' },
            { label: 'Received', value: `₹${fmtL(metrics.totalReceived)}L`, color: 'border-purple-500', text: 'text-purple-700' },
            { label: 'Pending', value: `₹${fmtL(metrics.totalPending)}L`, color: 'border-orange-500', text: 'text-orange-700' },
          ].map(m => (
            <div key={m.label} className={`bg-white rounded-xl shadow-sm p-3 border-l-4 ${m.color}`}>
              <p className="text-xs font-semibold text-gray-600">{m.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${m.text}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search enquiry, customer, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial (70%)</option>
              <option value="full">Paid Full</option>
            </select>
            <button
              onClick={() => fetchPayments(true)}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-medium px-3 py-2.5 border-2 border-blue-200 rounded-xl hover:bg-blue-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {/* Cards List (mobile-first, table on lg) */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No payments found</p>
            <p className="text-gray-400 text-sm mt-1">Try changing search or filters</p>
          </div>
        ) : (
          <>
            {/* Mobile cards (hidden on lg) */}
            <div className="lg:hidden space-y-3">
              {filtered.map(p => (
                <PaymentCard
                  key={p.enquiryId}
                  payment={p}
                  onVerify={(payment, type) => {
                    setSelectedPayment(payment);
                    setVerifyType(type);
                    setShowVerifyModal(true);
                  }}
                  onView={setSelectedPayment}
                />
              ))}
            </div>

            {/* Desktop table (hidden on mobile) */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    {['Enquiry', 'Customer', 'Quotation', 'Payment 1 (70%)', 'Payment 2 (30%)', 'Balance', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3.5 px-5 text-xs font-bold text-gray-600 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(p => (
                    <tr key={p.enquiryId} className="hover:bg-gray-50">
                      <td className="py-4 px-5 font-mono text-sm font-semibold text-gray-900">{p.enquiryId}</td>
                      <td className="py-4 px-5">
                        <p className="font-bold text-gray-900 text-sm">{p.customerName}</p>
                        <p className="text-xs text-gray-600">{p.phone}</p>
                        <p className="text-xs text-gray-500">{p.capacity} kW</p>
                      </td>
                      <td className="py-4 px-5 font-bold text-gray-900">₹{fmt(p.quotationAmount)}</td>
                      <td className="py-4 px-5">
                        <p className="font-bold text-gray-900 text-sm">₹{fmt(p.payment1Amount)}</p>
                        <PaymentStatusBadge status={p.payment1Status} />
                        {fmtDate(p.payment1Date) && (
                          <p className="text-xs text-gray-500 mt-0.5">{fmtDate(p.payment1Date)}</p>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-bold text-gray-900 text-sm">₹{fmt(p.payment2Amount)}</p>
                        <PaymentStatusBadge status={p.payment2Status} />
                        {fmtDate(p.payment2Date) && (
                          <p className="text-xs text-gray-500 mt-0.5">{fmtDate(p.payment2Date)}</p>
                        )}
                      </td>
                      <td className={`py-4 px-5 font-bold ${(p.balanceAmount ?? 0) === 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ₹{fmt(p.balanceAmount)}
                      </td>
                      <td className="py-4 px-5"><ProgressBadge status={p.paymentStatus} /></td>
                      <td className="py-4 px-5">
                        <div className="flex gap-2">
                          {p.payment1Status === 'pending' && (p.quotationAmount ?? 0) > 0 && (
                            <button
                              onClick={() => { setSelectedPayment(p); setVerifyType('payment1'); setShowVerifyModal(true); }}
                              className="text-xs font-bold bg-blue-600 text-white px-2.5 py-1.5 rounded-lg"
                            >
                              Verify 70%
                            </button>
                          )}
                          {p.payment1Status === 'verified' && p.payment2Status === 'pending' && p.installationStatus === 'completed' && (
                            <button
                              onClick={() => { setSelectedPayment(p); setVerifyType('payment2'); setShowVerifyModal(true); }}
                              className="text-xs font-bold bg-green-600 text-white px-2.5 py-1.5 rounded-lg"
                            >
                              Verify 30%
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100"
                          >
                            <FileText size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showVerifyModal && selectedPayment && (
        <VerifyPaymentModal
          payment={selectedPayment}
          type={verifyType}
          onClose={() => { setShowVerifyModal(false); setSelectedPayment(null); }}
          onSuccess={() => { setShowVerifyModal(false); setSelectedPayment(null); fetchPayments(true); }}
        />
      )}
      {selectedPayment && !showVerifyModal && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}
