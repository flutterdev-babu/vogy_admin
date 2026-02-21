'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Car, Loader2, Save, ShieldCheck, Building2, User, Info, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { vehicleService } from '@/services/vehicleService';
import { vendorService } from '@/services/vendorService';
import { partnerService } from '@/services/partnerService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { cityCodeService } from '@/services/cityCodeService';
import { DocImageInput } from '@/components/ui/DocImageInput';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [vendors, setVendors] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [cityCodes, setCityCodes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleModel: '',
    vehicleTypeId: '',
    vendorId: '',
    cityCodeId: '',
    rcImage: '',
    // Note: partnerId might be managed via attachmentService/assignment, 
    // but we'll include it here if the backend supports direct update.
    partnerId: '', 
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vendRes, partRes, typeRes, cityRes, vehRes] = await Promise.all([
          vendorService.getAll(),
          partnerService.getAll(),
          vehicleTypeService.getAll(),
          cityCodeService.getAll(),
          vehicleService.getById(id)
        ]);

        if (vendRes.success) setVendors(vendRes.data || []);
        if (partRes.success) setPartners(partRes.data || []);
        if (typeRes.success) setVehicleTypes(typeRes.data || []);
        if (cityRes.success) setCityCodes(cityRes.data || []);

        if (vehRes.success && vehRes.data) {
          const v = vehRes.data;
          setFormData({
            registrationNumber: v.registrationNumber || '',
            vehicleModel: v.vehicleModel || '',
            vehicleTypeId: v.vehicleType?.id || '',
            vendorId: v.vendor?.id || '',
            cityCodeId: v.cityCode?.id || '',
            rcImage: v.rcImage || '',
            partnerId: v.partner?.id || '',
          });
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        toast.error('Failed to load vehicle details');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.registrationNumber || !formData.vehicleModel || !formData.vehicleTypeId || !formData.vendorId || !formData.cityCodeId) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSaving(true);
    try {
      const updateData: any = {
        registrationNumber: formData.registrationNumber.toUpperCase(),
        vehicleModel: formData.vehicleModel,
        vehicleTypeId: formData.vehicleTypeId,
        vendorId: formData.vendorId,
        cityCodeId: formData.cityCodeId,
        rcImage: formData.rcImage || undefined,
        partnerId: formData.partnerId || undefined,
      };

      const response = await vehicleService.update(id, updateData);
      if (response.success) {
        toast.success('Vehicle updated successfully!');
        router.push('/dashboard/vehicles');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setIsSaving(false);
    }
  };

  const inputGroupClass = "flex flex-col gap-1";
  const labelClass = "text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1";
  const fieldClass = "w-full px-3 py-2 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/10 transition-all bg-white shadow-sm hover:border-gray-300 font-medium h-10";
  const selectClass = "w-full px-3 py-2 text-xs text-gray-800 appearance-none border border-gray-200 rounded-xl focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/10 transition-all bg-white shadow-sm hover:border-gray-300 font-medium cursor-pointer h-10";

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12 px-4 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard/vehicles" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#E32222] transition-colors mb-2 group text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Fleets
          </Link>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight italic uppercase leading-none">Edit Vehicle</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">ID: {id}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100">
          <Car size={24} className="text-orange-500" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Specs */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <Info size={14} className="text-[#E32222]" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Vehicle Specifications</h2>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={inputGroupClass}>
              <label className={labelClass}>Registration Number *</label>
              <input type="text" required value={formData.registrationNumber}
                onChange={e => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})}
                className={fieldClass} placeholder="e.g. MH12AB1234" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Vehicle Model *</label>
              <input type="text" required value={formData.vehicleModel}
                onChange={e => setFormData({...formData, vehicleModel: e.target.value})}
                className={fieldClass} placeholder="e.g. Maruti Suzuki WagonR" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Vehicle Category *</label>
              <select required value={formData.vehicleTypeId}
                onChange={e => setFormData({...formData, vehicleTypeId: e.target.value})}
                className={selectClass}>
                <option value="">Select Type</option>
                {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
              </select>
            </div>
          </div>

          <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 pt-4 bg-gray-50/30">
            <div className={inputGroupClass}>
              <label className={labelClass}>Operational City *</label>
              <select required value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={selectClass}>
                <option value="">Choose City</option>
                {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName}</option>)}
              </select>
            </div>
            <DocImageInput 
              label="RC Book / Registration Certificate" 
              value={formData.rcImage} 
              onChange={(val) => setFormData({...formData, rcImage: val})}
            />
          </div>
        </div>

        {/* Ownership & Assignment */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#E32222]" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Ownership & Assignment</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={inputGroupClass}>
              <label className={labelClass}>Vehicle Owner (Vendor) *</label>
              <select required value={formData.vendorId}
                onChange={e => setFormData({...formData, vendorId: e.target.value})}
                className={selectClass}>
                <option value="">Select Vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName || v.name}</option>)}
              </select>
              <p className="text-[8px] text-gray-400 mt-1 ml-1 uppercase font-bold tracking-tighter italic">Vendor manages technical maintenance and documentation.</p>
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Assigned Driver (Partner)</label>
              <select value={formData.partnerId}
                onChange={e => setFormData({...formData, partnerId: e.target.value})}
                className={selectClass}>
                <option value="">Unassigned</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
              </select>
              <p className="text-[8px] text-gray-400 mt-1 ml-1 uppercase font-bold tracking-tighter italic">Partner is the primary operator of this vehicle.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900 rounded-2xl gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Save size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Update Fleet Vehicle</p>
              <p className="text-[10px] text-white/60 font-medium">Verify RC documents if registration number is changed.</p>
            </div>
          </div>
          <button type="submit" disabled={isSaving}
            className="w-full md:w-auto px-10 h-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Processing' : 'Update Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}
