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
  XCircle
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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Coupon Codes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage agent promotional discount formulas centrally.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E32222] text-white rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg shadow-red-500/20 hover:bg-red-700 active:scale-[0.98] transition-all"
        >
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or Agent..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500"><span className="font-bold text-gray-800">{filteredCoupons.length}</span> Total Coupons</span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Coupon Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bound Agent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Validity Period</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">No coupons found.</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.validTo) < new Date();
                  return (
                    <tr key={coupon.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Ticket size={16} className="text-[#E32222]" />
                          <span className="text-sm font-bold text-gray-900 font-mono tracking-wider">{coupon.couponCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.agent ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800">{coupon.agent.name}</span>
                            <span className="text-xs text-gray-500 font-medium">{coupon.agent.customId || coupon.agent.id.slice(-6).toUpperCase()}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 italic">Unbound</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-green-600">{coupon.discountValue}% OFF</span>
                          <span className="text-[10px] text-gray-500 font-medium">Up to ₹{coupon.maxDiscountAmount || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-gray-600">
                          <span>{new Date(coupon.validFrom).toLocaleDateString('en-GB')} to</span>
                          <span className={isExpired ? 'text-red-500 font-bold' : ''}>{new Date(coupon.validTo).toLocaleDateString('en-GB')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${coupon.isActive && !isExpired ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${coupon.isActive && !isExpired ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        {isExpired && <span className="text-[10px] text-red-500 block mt-1 font-bold">EXPIRED</span>}
                      </td>
                      <td className="px-6 py-4 gap-2 flex items-center">
                        <button 
                          onClick={() => handleEditClick(coupon)}
                          className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Edit Limits/Dates"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon.id)}
                          className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Ticket size={20} className="text-[#E32222]" /> Create New Coupon
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Coupon Code *</label>
                    <input type="text" required value={createFormData.couponCode} onChange={e => setCreateFormData({...createFormData, couponCode: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER50" className={`${inputClass} font-mono uppercase`} />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <input type="text" value={createFormData.description || ''} onChange={e => setCreateFormData({...createFormData, description: e.target.value})} placeholder="e.g. Festival 50% Off" className={inputClass} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Discount % *</label>
                    <input type="number" required value={createFormData.discountValue || ''} onChange={e => setCreateFormData({...createFormData, discountValue: e.target.valueAsNumber || 0})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Min Booking ₹ *</label>
                    <input type="number" required value={createFormData.minBookingAmount || ''} onChange={e => setCreateFormData({...createFormData, minBookingAmount: e.target.valueAsNumber || 0})} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Max Discount Capping ₹ *</label>
                  <input type="number" required value={createFormData.maxDiscountAmount || ''} onChange={e => setCreateFormData({...createFormData, maxDiscountAmount: e.target.valueAsNumber || 0})} className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Valid From *</label>
                    <input type="date" required value={createFormData.validFrom} onChange={e => setCreateFormData({...createFormData, validFrom: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Valid To *</label>
                    <input type="date" required value={createFormData.validTo} onChange={e => setCreateFormData({...createFormData, validTo: e.target.value})} className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitLoading} className="px-6 py-2 text-sm font-bold text-white bg-[#E32222] hover:bg-red-700 rounded-xl shadow-lg disabled:opacity-50">
                  {isSubmitLoading ? 'Saving...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={20} className="text-blue-500" /> Edit Limits: <span className="font-mono text-[#E32222]">{editingCoupon.couponCode}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-4">
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-xs flex items-start gap-2 border border-yellow-200">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>Coupon codes and agent bindings are immutable. You may only edit the functional limits and validities below or toggle its active status on the dashboard grid.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Discount %</label>
                    <input type="number" required value={editFormData.discountValue} onChange={e => setEditFormData({...editFormData, discountValue: e.target.valueAsNumber})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Min Booking ₹</label>
                    <input type="number" value={editFormData.minBookingAmount} onChange={e => setEditFormData({...editFormData, minBookingAmount: e.target.valueAsNumber})} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Max Discount Capping ₹</label>
                  <input type="number" value={editFormData.maxDiscountAmount} onChange={e => setEditFormData({...editFormData, maxDiscountAmount: e.target.valueAsNumber})} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Update Valid To Date (Expiry)</label>
                  <input type="date" required value={editFormData.validTo} onChange={e => setEditFormData({...editFormData, validTo: e.target.value})} className={inputClass} />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitLoading} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 rounded-xl shadow-lg disabled:opacity-50">
                  {isSubmitLoading ? 'Saving...' : 'Update Limits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
