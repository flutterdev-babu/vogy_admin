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
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Fiscal Terminal
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Corporate Invoicing & Payment Reconciliation</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowBillingModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200">
            <CreditCard size={16} /><span>GENERATE INVOICE</span>
          </button>
          <button onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg shadow-red-200">
            <Plus size={16} /><span>RECORD DISBURSEMENT</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar / Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200/50 shadow-inner overflow-hidden max-w-fit">
          {(['billing', 'payments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-100'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {tab === 'billing' ? 'Invoicing Ledger' : 'Payment Reconciliation'}
            </button>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-900 rounded-[1.5rem] flex items-center justify-between min-w-[200px]">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate mr-4">Active Records</span>
          <span className="text-sm font-black text-white">{activeTab === 'billing' ? billings.length : payments.length}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 mb-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{activeTab === 'billing' ? 'Validated Corporate Invoices' : 'Verified Clearing Records'}</h3>
          {isLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'billing' ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Corporate Entity</th>
                  <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Billing Window</th>
                  <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gross Total</th>
                  <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cleared Amount</th>
                  <th className="text-center py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {billings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <CreditCard size={48} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">No invoices detected</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  billings.map((bill) => {
                    const StatusIcon = statusIcons[bill.status];
                    return (
                      <tr key={bill.id} className="group hover:bg-gray-50/50 transition-all">
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100/50">
                              <Building2 size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-gray-900 tracking-tight leading-none uppercase">{bill.corporate?.companyName}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase mt-1.5 tracking-tighter">ID: {bill.id.slice(-8).toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase font-mono">
                            <span>{new Date(bill.billingPeriodStart).toLocaleDateString('en-GB')}</span>
                            <span className="text-gray-300">→</span>
                            <span>{new Date(bill.billingPeriodEnd).toLocaleDateString('en-GB')}</span>
                          </div>
                        </td>
                        <td className="py-5 px-8 text-right font-mono text-sm font-black text-gray-900">
                          ₹{bill.totalAmount?.toLocaleString()}
                        </td>
                        <td className="py-5 px-8 text-right font-mono text-sm font-black text-emerald-600">
                          ₹{bill.paidAmount?.toLocaleString()}
                        </td>
                        <td className="py-5 px-8 text-center">
                          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-current opacity-90 ${statusColors[bill.status]}`}>
                            <StatusIcon size={12} />
                            {bill.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payer Identity</th>
                  <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Settled Amount</th>
                  <th className="text-center py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Protocol</th>
                  <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Trace</th>
                  <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Auth Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <DollarSign size={48} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">No clearing records detected</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="group hover:bg-gray-50/50 transition-all">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50">
                            <Building2 size={18} />
                          </div>
                          <span className="text-sm font-black text-gray-900 tracking-tight uppercase">{payment.corporate?.companyName}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-right font-mono text-sm font-black text-emerald-600">
                        ₹{payment.amount?.toLocaleString()}
                      </td>
                      <td className="py-5 px-8 text-center">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-200">
                          {payment.paymentMode}
                        </span>
                      </td>
                      <td className="py-5 px-8 font-mono text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                        {payment.transactionId || '--- N/A ---'}
                      </td>
                      <td className="py-5 px-8 text-right font-mono text-[10px] font-black text-gray-900 uppercase">
                        {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Generate Billing Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard size={20} />
                  </div>
                  Issue Corporate Invoice
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fiscal generation protocol</p>
              </div>
              <button
                onClick={() => setShowBillingModal(false)}
                className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-gray-900 hover:bg-white rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Target Corporate Asset</label>
                  <select
                    value={billingForm.corporateId}
                    onChange={(e) => setBillingForm({ ...billingForm, corporateId: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase"
                  >
                    <option value="">Select corporate entity</option>
                    {corporates.filter(c => c.status === 'APPROVED').map(c =>
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Window Ignition</label>
                    <input
                      type="date"
                      value={billingForm.billingPeriodStart}
                      onChange={(e) => setBillingForm({ ...billingForm, billingPeriodStart: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase"
                    />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Window Termination</label>
                    <input
                      type="date"
                      value={billingForm.billingPeriodEnd}
                      onChange={(e) => setBillingForm({ ...billingForm, billingPeriodEnd: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-10 border-t border-gray-50">
                <button
                  onClick={() => setShowBillingModal(false)}
                  className="px-8 py-4 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={handleGenerateBilling}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black transition-all flex items-center gap-3 disabled:bg-gray-200 disabled:shadow-none"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  <span>{isSubmitting ? 'GENERATING...' : 'AUTHORIZE INVOICE'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <DollarSign size={20} />
                  </div>
                  Verify Clearing Record
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Payment reconciliation interface</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-gray-900 hover:bg-white rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Payer Entity</label>
                  <select
                    value={paymentForm.corporateId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, corporateId: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase"
                  >
                    <option value="">Select payer</option>
                    {corporates.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Distribution Amount (₹)</label>
                    <input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Clearing Protocol</label>
                    <select
                      value={paymentForm.paymentMode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value as 'CASH' | 'UPI' | 'CARD' | 'CREDIT' })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase"
                    >
                      <option value="UPI">UPI DIGITAL</option>
                      <option value="CARD">CREDIT_CARD</option>
                      <option value="CASH">CASH_FIAT</option>
                      <option value="CREDIT">DEFERRED_CREDIT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Network Trace ID</label>
                    <input
                      type="text"
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all font-mono uppercase"
                      placeholder="TXN_778899"
                    />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Audit Notes</label>
                    <input
                      type="text"
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase"
                      placeholder="Ref: FEB_INVOICE"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-10 border-t border-gray-50">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-8 py-4 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-red-200 hover:bg-black transition-all flex items-center gap-3 disabled:bg-gray-200 disabled:shadow-none"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  <span>{isSubmitting ? 'CLEARING...' : 'COMMIT SETTLEMENT'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
