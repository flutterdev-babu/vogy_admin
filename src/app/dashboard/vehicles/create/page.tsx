'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, Loader2, Plus, ShieldCheck, Info, MapPin, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { vehicleService } from '@/services/vehicleService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { partnerService } from '@/services/partnerService';
import { cityCodeService } from '@/services/cityCodeService';
import { vendorService } from '@/services/vendorService';
import { DocImageInput } from '@/components/ui/DocImageInput';

export default function AdminCreateVehiclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [cityCodes, setCityCodes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleModel: '',
    vehicleTypeId: '',
    vendorCustomId: '',
    partnerCustomId: '',
    cityCodeId: '',
    color: '',
    fuelType: '',
    rcNumber: '',
    rcImage: '',
    chassisNumber: '',
    engineNumber: '',
    insuranceNumber: '',
    insuranceExpiryDate: '',
  });

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [vtRes, pRes, cityRes, vRes] = await Promise.all([
          vehicleTypeService.getAll(),
          partnerService.getAll(),
          cityCodeService.getAll(),
          vendorService.getAll(),
        ]);
        if (vtRes.success) setVehicleTypes(vtRes.data || []);
        if (pRes.success) setPartners(pRes.data || []);
        if (cityRes.success) setCityCodes(cityRes.data || []);
        if (vRes.success) setVendors(vRes.data || []);
      } catch (err) {
        console.error('Failed to load lookups:', err);
      }
    };
    loadLookups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.registrationNumber || !formData.vehicleModel || !formData.vehicleTypeId || !formData.cityCodeId || !formData.vendorCustomId) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsLoading(true);
    try {
      const selectedVendor = vendors.find((v: any) => v.customId === formData.vendorCustomId);
      const selectedPartner = partners.find((p: any) => p.customId === formData.partnerCustomId);
      
      const submitData: any = {
        registrationNumber: formData.registrationNumber.toUpperCase(),
        vehicleModel: formData.vehicleModel,
        vehicleTypeId: formData.vehicleTypeId,
        vendorId: selectedVendor?.id,
        vendorCustomId: formData.vendorCustomId,
        partnerId: selectedPartner?.id || undefined,
        partnerCustomId: formData.partnerCustomId || undefined,
        cityCodeId: formData.cityCodeId,
        color: formData.color || undefined,
        fuelType: formData.fuelType || undefined,
        rcNumber: formData.rcNumber || undefined,
        rcImage: formData.rcImage || undefined,
        chassisNumber: formData.chassisNumber || undefined,
        engineNumber: formData.engineNumber || undefined,
        insuranceNumber: formData.insuranceNumber || undefined,
        insuranceExpiryDate: formData.insuranceExpiryDate || undefined,
      };

      const response = await vehicleService.create(submitData);
      if (response.success) {
        toast.success('Vehicle registered successfully!');
        router.push('/dashboard/vehicles');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  const inputGroupClass = "flex flex-col gap-1";
  const labelClass = "text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1";
  const fieldClass = "w-full px-3 py-2 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/10 transition-all bg-white shadow-sm hover:border-gray-300 font-medium h-10";
  const selectClass = "w-full px-3 py-2 text-xs text-gray-800 appearance-none border border-gray-200 rounded-xl focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/10 transition-all bg-white shadow-sm hover:border-gray-300 font-medium cursor-pointer h-10";

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12 px-4 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard/vehicles" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#E32222] transition-colors mb-2 group text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Vehicles
          </Link>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight italic uppercase leading-none">Register Vehicle</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
          <Truck size={24} className="text-[#E32222]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section: Deployment & Specification */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <Info size={14} className="text-[#E32222]" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Deployment & Spec</h2>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className={inputGroupClass}>
              <label className={labelClass}>License Plate *</label>
              <input type="text" required value={formData.registrationNumber}
                onChange={e => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})}
                className={fieldClass} placeholder="KA 03 MB 1234" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Model / Make *</label>
              <input type="text" required value={formData.vehicleModel}
                onChange={e => setFormData({...formData, vehicleModel: e.target.value})}
                className={fieldClass} placeholder="Maruti Dzire" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Category *</label>
              <select required value={formData.vehicleTypeId}
                onChange={e => setFormData({...formData, vehicleTypeId: e.target.value})}
                className={selectClass}>
                <option value="">Select Type</option>
                {vehicleTypes.map((vt: any) => <option key={vt.id} value={vt.id}>{vt.displayName}</option>)}
              </select>
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Operating City *</label>
              <select required value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={selectClass}>
                <option value="">Choose City</option>
                {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName}</option>)}
              </select>
            </div>
          </div>

          <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30 py-4 border-t border-gray-50">
            <div className={inputGroupClass}>
              <label className={labelClass}>Assign Vendor *</label>
              <select required value={formData.vendorCustomId}
                onChange={e => setFormData({...formData, vendorCustomId: e.target.value})}
                className={selectClass}>
                <option value="">Select Vendor</option>
                {vendors.map((v: any) => <option key={v.id} value={v.customId}>{v.companyName || v.name} ({v.customId})</option>)}
              </select>
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Assign Partner (Optional)</label>
              <select value={formData.partnerCustomId}
                onChange={e => setFormData({...formData, partnerCustomId: e.target.value})}
                className={selectClass}>
                <option value="">No Partner Assigned</option>
                {partners.map((p: any) => <option key={p.id} value={p.customId}>{p.name} ({p.customId})</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section: Compliance & Identity */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#E32222]" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">KYC Documents & Tech</h2>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
               <div className={inputGroupClass}>
                <label className={labelClass}>RC Number</label>
                <input type="text" value={formData.rcNumber}
                  onChange={e => setFormData({...formData, rcNumber: e.target.value.toUpperCase()})}
                  className={fieldClass} placeholder="Enter RC Number" />
              </div>
              <DocImageInput 
                label="RC Image" 
                value={formData.rcImage} 
                onChange={(val) => setFormData({...formData, rcImage: val})} 
              />
            </div>

            <div className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className={inputGroupClass}>
                <label className={labelClass}>Insurance Number</label>
                <input type="text" value={formData.insuranceNumber}
                  onChange={e => setFormData({...formData, insuranceNumber: e.target.value.toUpperCase()})}
                  className={fieldClass} placeholder="Policy Number" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelClass}>Insurance Expiry</label>
                <input type="date" value={formData.insuranceExpiryDate}
                  onChange={e => setFormData({...formData, insuranceExpiryDate: e.target.value})}
                  className={fieldClass} />
              </div>
            </div>

            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3">
               <div className="flex items-center gap-2 mb-1">
                 <Settings size={12} className="text-[#E32222]" />
                 <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Technical details</span>
               </div>
               <div className="grid grid-cols-1 gap-3">
                 <div className={inputGroupClass}>
                   <label className={labelClass + " text-neutral-500"}>Chassis Number</label>
                   <input type="text" value={formData.chassisNumber}
                     onChange={e => setFormData({...formData, chassisNumber: e.target.value.toUpperCase()})}
                     className={fieldClass + " bg-neutral-800 border-neutral-700 text-white"} placeholder="Last 17 Digits" />
                 </div>
                 <div className={inputGroupClass}>
                   <label className={labelClass + " text-neutral-500"}>Engine Number</label>
                   <input type="text" value={formData.engineNumber}
                     onChange={e => setFormData({...formData, engineNumber: e.target.value.toUpperCase()})}
                     className={fieldClass + " bg-neutral-800 border-neutral-700 text-white"} placeholder="Engine ID" />
                 </div>
               </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-50">
            <div className={inputGroupClass}>
              <label className={labelClass}>Vehicle Color</label>
              <input type="text" value={formData.color}
                onChange={e => setFormData({...formData, color: e.target.value})}
                className={fieldClass} placeholder="White, Silver, etc" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Fuel Type</label>
              <select value={formData.fuelType}
                onChange={e => setFormData({...formData, fuelType: e.target.value})}
                className={selectClass}>
                <option value="">Select Fuel</option>
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="ELECTRIC">Electric</option>
              </select>
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Year of Manufacture</label>
              <input type="text" value={formData.insuranceExpiryDate}
                onChange={e => setFormData({...formData, insuranceExpiryDate: e.target.value})}
                className={fieldClass} placeholder="2024" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900 rounded-2xl gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Plus size={16} className="text-[#E32222]" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Verify & Authorize</p>
              <p className="text-[10px] text-white/60 font-medium">Add to fleet after verification of RC and insurance docs.</p>
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full md:w-auto px-10 h-10 bg-[#E32222] hover:bg-[#ff2a1a] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
            {isLoading ? 'Processing' : 'Authorize Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}
