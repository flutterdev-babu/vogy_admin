'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Calendar,
  DollarSign,
  Ticket,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { couponService, CreateCouponRequest, UpdateCouponRequest } from '@/services/couponService';
import { Coupon } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Form states
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [createFormData, setCreateFormData] = useState<CreateCouponRequest>({
    couponCode: '',
    description: '',
    discountValue: 0,
    minBookingAmount: 0,
    maxDiscountAmount: 0,
    validFrom: '',
    validTo: ''
  });

  const [editFormData, setEditFormData] = useState<UpdateCouponRequest>({
    discountValue: 0,
    minBookingAmount: 0,
    maxDiscountAmount: 0,
    validTo: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const couponsRes = await couponService.getAll();
      if (couponsRes.success) setCoupons(couponsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch coupons data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const codeMatch = c.couponCode.toLowerCase().includes(searchQuery.toLowerCase());
    const agentMatch = c.agent && (
      c.agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.agent.customId && c.agent.customId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return codeMatch || agentMatch;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this coupon?')) return;
    try {
      const res = await couponService.delete(id);
      if (res.success) {
        toast.success('Coupon deleted successfully');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  // Status Toggle
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await couponService.toggleStatus(id, !currentStatus);
      if (response.success) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change status');
    }
  };

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.couponCode || !createFormData.discountValue || !createFormData.minBookingAmount || !createFormData.maxDiscountAmount || !createFormData.validFrom || !createFormData.validTo) {
      toast.error('Please fill all required fields including booking limits.');
      return;
    }

    setIsSubmitLoading(true);
    try {
      // Ensure precise ISO trailing standards
      const payload = {
        ...createFormData,
        validFrom: new Date(createFormData.validFrom).toISOString(),
        validTo: new Date(createFormData.validTo).toISOString()
      };

      const res = await couponService.create(payload);
      if (res.success) {
        toast.success('Coupon created successfully!');
        setIsCreateModalOpen(false);
        setCreateFormData({ couponCode: '', description: '', discountValue: 0, minBookingAmount: 0, maxDiscountAmount: 0, validFrom: '', validTo: '' });
        fetchData();
      }
    } catch (error: any) {
      console.error("COUPON CREATION ERROR", error?.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Edit Handlers
  const handleEditClick = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setEditFormData({
      discountValue: coupon.discountValue,
      minBookingAmount: coupon.minBookingAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      validTo: new Date(coupon.validTo).toISOString().split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setIsSubmitLoading(true);
    try {
      const payload = {
        ...editFormData,
        validTo: editFormData.validTo ? new Date(editFormData.validTo).toISOString() : undefined
      };

      const res = await couponService.update(editingCoupon.id, payload);
      if (res.success) {
        toast.success('Coupon updated successfully!');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 outline-none transition-all bg-white";
  const labelClass = "text-xs text-gray-500 mb-1 block font-medium";

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Promotions Hub
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Configure and manage algorithmic discount formulas</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-red-200 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={16} />
          <span>GENERATE NEW COUPON</span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by coupon code or agent identity..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[1.5rem] text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
          />
        </div>
        <div className="px-6 py-4 bg-gray-900 rounded-[1.5rem] flex items-center justify-between min-w-[180px]">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Formulas</span>
          <span className="text-sm font-black text-white">{filteredCoupons.length}</span>
        </div>
      </div>

      {/* Main Promotions Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 mb-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Validated Promotion Codes</h3>
          {isLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Formula Code</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agent Binding</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Yield Logic</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Validity Window</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Exposure</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Ticket size={40} className="text-gray-100" />
                      <span className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">No promotion records found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.validTo) < new Date();
                  return (
                    <tr key={coupon.id} className="group hover:bg-gray-50/50 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100/50">
                            <Ticket size={18} />
                          </div>
                          <span className="text-sm font-black text-gray-900 tracking-tight font-mono uppercase">{coupon.couponCode}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {coupon.agent ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-900 tracking-tight uppercase leading-none">{coupon.agent.name}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{coupon.agent.customId || "SYSTEM_GEN"}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Global Distribution</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-black text-emerald-600 tracking-tight">{coupon.discountValue}%</span>
                            <span className="text-[9px] font-black text-emerald-600/50 uppercase">OFF</span>
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Cap: ₹{coupon.maxDiscountAmount}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{new Date(coupon.validFrom).toLocaleDateString('en-GB')}</span>
                          <span className={`text-[9px] font-black uppercase mt-0.5 ${isExpired ? 'text-red-500' : 'text-gray-400'}`}>
                            UNTIL {new Date(coupon.validTo).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${coupon.isActive && !isExpired ? 'bg-emerald-500 shadow-md shadow-emerald-100' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${coupon.isActive && !isExpired ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                          {isExpired && (
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Vault Expired</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(coupon)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Logic"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Purge Formula"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  Configure Promotion
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Formula generation engine</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-gray-900 hover:bg-white rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-10 space-y-8">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Universal Access Code</label>
                    <input
                      type="text"
                      required
                      value={createFormData.couponCode}
                      onChange={e => setCreateFormData({ ...createFormData, couponCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. FLASH100"
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all font-mono uppercase"
                    />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Internal Reference</label>
                    <input
                      type="text"
                      value={createFormData.description || ''}
                      onChange={e => setCreateFormData({ ...createFormData, description: e.target.value })}
                      placeholder="e.g. Q2 Growth Campaign"
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Yield %</label>
                    <input type="number" required value={createFormData.discountValue || ''} onChange={e => setCreateFormData({ ...createFormData, discountValue: e.target.valueAsNumber || 0 })} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all" />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Min Threshold (₹)</label>
                    <input type="number" required value={createFormData.minBookingAmount || ''} onChange={e => setCreateFormData({ ...createFormData, minBookingAmount: e.target.valueAsNumber || 0 })} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Max Cap (₹)</label>
                    <input type="number" required value={createFormData.maxDiscountAmount || ''} onChange={e => setCreateFormData({ ...createFormData, maxDiscountAmount: e.target.valueAsNumber || 0 })} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Activation Date</label>
                    <input type="date" required value={createFormData.validFrom} onChange={e => setCreateFormData({ ...createFormData, validFrom: e.target.value })} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase" />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Termination Date</label>
                    <input type="date" required value={createFormData.validTo} onChange={e => setCreateFormData({ ...createFormData, validTo: e.target.value })} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-10 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-8 py-4 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-red-200 hover:bg-black transition-all flex items-center gap-3 disabled:bg-gray-200 disabled:shadow-none"
                >
                  {isSubmitLoading ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
                  <span>AUTHORIZE FORMULA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingCoupon && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Edit2 size={20} />
                  </div>
                  Adjust Logic: <span className="font-mono text-red-600">{editingCoupon.couponCode}</span>
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Live formula recalibration</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-gray-900 hover:bg-white rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-10 space-y-8">
              <div className="space-y-8">
                <div className="bg-indigo-50/50 rounded-[2rem] p-6 border border-indigo-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <p className="text-[11px] leading-relaxed text-indigo-900 font-medium uppercase font-mono">
                    Coupon identifier and agent bindings are cryptographically locked.
                    You may recalibrate functional yield limits and termination dates below.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Refined Yield %</label>
                    <input type="number" required value={editFormData.discountValue} onChange={e => setEditFormData({ ...editFormData, discountValue: e.target.valueAsNumber })} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all" />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Threshold Update (₹)</label>
                    <input type="number" value={editFormData.minBookingAmount} onChange={e => setEditFormData({ ...editFormData, minBookingAmount: e.target.valueAsNumber })} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Capping Reset (₹)</label>
                    <input type="number" value={editFormData.maxDiscountAmount} onChange={e => setEditFormData({ ...editFormData, maxDiscountAmount: e.target.valueAsNumber })} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                  </div>
                  <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Updated Expiry</label>
                    <input type="date" required value={editFormData.validTo} onChange={e => setEditFormData({ ...editFormData, validTo: e.target.value })} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-10 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-8 py-4 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black transition-all flex items-center gap-3 disabled:bg-gray-200 disabled:shadow-none"
                >
                  {isSubmitLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  <span>COMMIT RECALIBRATION</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  );
}
