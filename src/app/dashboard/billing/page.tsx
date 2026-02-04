'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, DollarSign, Plus, Building2, Calendar, CheckCircle, Clock, AlertCircle, X, Loader2 } from 'lucide-react';
import { billingService } from '@/services/billingService';
import { corporateService } from '@/services/corporateService';
import { Billing, Payment, Corporate } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'billing' | 'payments'>('billing');
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingForm, setBillingForm] = useState({ corporateId: '', billingPeriodStart: '', billingPeriodEnd: '' });
  const [paymentForm, setPaymentForm] = useState<{
    corporateId: string;
    amount: string;
    paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
    transactionId: string;
    notes: string;
  }>({ corporateId: '', amount: '', paymentMode: 'UPI', transactionId: '', notes: '' });

  const fetchData = async () => {
    try {
      const [billingsRes, paymentsRes, corporatesRes] = await Promise.all([
        billingService.getAllBillings(),
        billingService.getAllPayments(),
        corporateService.getAll(),
      ]);
      setBillings(billingsRes.data || []);
      setPayments(paymentsRes.data || []);
      setCorporates(corporatesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerateBilling = async () => {
    if (!billingForm.corporateId || !billingForm.billingPeriodStart || !billingForm.billingPeriodEnd) {
      toast.error('Please fill all fields'); return;
    }
    setIsSubmitting(true);
    try {
      await billingService.generateBilling(billingForm);
      toast.success('Billing generated');
      setShowBillingModal(false);
      setBillingForm({ corporateId: '', billingPeriodStart: '', billingPeriodEnd: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to generate billing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.corporateId || !paymentForm.amount) {
      toast.error('Please fill required fields'); return;
    }
    setIsSubmitting(true);
    try {
      await billingService.recordPayment({
        corporateId: paymentForm.corporateId,
        amount: parseFloat(paymentForm.amount),
        paymentMode: paymentForm.paymentMode,
        transactionId: paymentForm.transactionId || undefined,
        notes: paymentForm.notes || undefined,
      });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      setPaymentForm({ corporateId: '', amount: '', paymentMode: 'UPI', transactionId: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<'PENDING' | 'PARTIAL' | 'PAID', string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PARTIAL: 'bg-orange-100 text-orange-700',
    PAID: 'bg-green-100 text-green-700',
  };

  type BillingStatusIcon = React.ComponentType<{ size?: number; className?: string }>;
  const statusIcons: Record<'PENDING' | 'PARTIAL' | 'PAID', BillingStatusIcon> = {
    PENDING: Clock,
    PARTIAL: AlertCircle,
    PAID: CheckCircle,
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Billing & Payments</h1>
          <p className="text-gray-500 mt-1">Manage corporate billing and payments</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowBillingModal(true)}
            className="btn-secondary flex items-center gap-2 py-2.5 px-4">
            <CreditCard size={18} /><span>Generate Bill</span>
          </button>
          <button onClick={() => setShowPaymentModal(true)}
            className="btn-primary flex items-center gap-2 py-2.5 px-4">
            <Plus size={18} /><span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('billing')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'billing' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          Billings ({billings.length})
        </button>
        <button onClick={() => setActiveTab('payments')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'payments' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          Payments ({payments.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'billing' ? (
        billings.length === 0 ? (
          <div className="card p-12 text-center">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No billings yet</h3>
            <p className="text-gray-500 mt-1">Generate billing for corporates</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Corporate</th>
                  <th>Period</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {billings.map((bill) => {
                  const StatusIcon = statusIcons[bill.status];
                  return (
                    <tr key={bill.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-gray-400" />
                          <span className="font-medium">{bill.corporate?.companyName}</span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-600">
                        {new Date(bill.billingPeriodStart).toLocaleDateString()} - {new Date(bill.billingPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="font-semibold">₹{bill.totalAmount?.toLocaleString()}</td>
                      <td className="text-green-600 font-medium">₹{bill.paidAmount?.toLocaleString()}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[bill.status]}`}>
                          <StatusIcon size={12} />{bill.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        payments.length === 0 ? (
          <div className="card p-12 text-center">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No payments yet</h3>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Corporate</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Transaction ID</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <span className="font-medium">{payment.corporate?.companyName}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-green-600">₹{payment.amount?.toLocaleString()}</td>
                    <td><span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{payment.paymentMode}</span></td>
                    <td className="text-sm text-gray-600">{payment.transactionId || '-'}</td>
                    <td className="text-sm text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Generate Billing Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Generate Billing</h2>
              <button onClick={() => setShowBillingModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corporate *</label>
                <select value={billingForm.corporateId}
                  onChange={(e) => setBillingForm({...billingForm, corporateId: e.target.value})}
                  className="input">
                  <option value="">Select corporate</option>
                  {corporates.filter(c => c.status === 'APPROVED').map(c =>
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="date" value={billingForm.billingPeriodStart}
                    onChange={(e) => setBillingForm({...billingForm, billingPeriodStart: e.target.value})}
                    className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input type="date" value={billingForm.billingPeriodEnd}
                    onChange={(e) => setBillingForm({...billingForm, billingPeriodEnd: e.target.value})}
                    className="input" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBillingModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleGenerateBilling} disabled={isSubmitting}
                className="flex-1 btn-primary flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                <span>{isSubmitting ? 'Generating...' : 'Generate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corporate *</label>
                <select value={paymentForm.corporateId}
                  onChange={(e) => setPaymentForm({...paymentForm, corporateId: e.target.value})}
                  className="input">
                  <option value="">Select corporate</option>
                  {corporates.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input type="number" value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="input" placeholder="15000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode *</label>
                  <select value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentMode: e.target.value as 'CASH' | 'UPI' | 'CARD' | 'CREDIT'})}
                    className="input">
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="CASH">Cash</option>
                    <option value="CREDIT">Credit</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <input type="text" value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                  className="input" placeholder="TXN123456" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input type="text" value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  className="input" placeholder="January payment" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleRecordPayment} disabled={isSubmitting}
                className="flex-1 btn-primary flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <DollarSign size={18} />}
                <span>{isSubmitting ? 'Recording...' : 'Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
