'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Car, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { cityCodeService } from '@/services/cityCodeService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { vendorService } from '@/services/vendorService';
import { partnerService } from '@/services/partnerService';
import { CreateVehicleRequest, FuelType } from '@/types';

export default function AdminCreateVehiclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const [cityCodes, setCityCodes] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleModel: '',
    vehicleTypeId: '',
    vendorCustomId: '',
    partnerCustomId: '',
    cityCodeId: '',
    // Additional
    color: '',
    fuelType: '' as FuelType | '',
    seatingCapacity: '',
    rtoTaxExpiryDate: '',
    speedGovernor: false,
  });

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [cityRes, vtRes, vendorRes, partnerRes] = await Promise.all([
          cityCodeService.getAll(),
          vehicleTypeService.getAll(),
          vendorService.getAll(),
          partnerService.getAll(),
        ]);
        if (cityRes.success) setCityCodes(cityRes.data || []);
        if (vtRes.success) setVehicleTypes(vtRes.data || []);
        if (vendorRes.success) setVendors(vendorRes.data || []);
        if (partnerRes.success) setPartners(partnerRes.data || []);
      } catch (err) {
        console.error('Failed to load lookups:', err);
      }
    };
    loadLookups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.registrationNumber || !formData.vehicleModel || !formData.vehicleTypeId || !formData.cityCodeId) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!formData.vendorCustomId) {
      toast.error('Please select a vendor');
      return;
    }
    setIsLoading(true);
    try {
      const selectedVendor = vendors.find((v: any) => v.customId === formData.vendorCustomId);
      const selectedPartner = partners.find((p: any) => p.customId === formData.partnerCustomId);
      const submitData: CreateVehicleRequest = {
        registrationNumber: formData.registrationNumber.toUpperCase(),
        vehicleModel: formData.vehicleModel,
        vehicleTypeId: formData.vehicleTypeId,
        vendorId: selectedVendor?.id || undefined,
        vendorCustomId: formData.vendorCustomId || undefined,
        partnerId: selectedPartner?.id || undefined,
        partnerCustomId: formData.partnerCustomId || undefined,
        cityCodeId: formData.cityCodeId,
        color: formData.color || undefined,
        fuelType: formData.fuelType ? (formData.fuelType as FuelType) : undefined,
        seatingCapacity: formData.seatingCapacity ? parseInt(formData.seatingCapacity) : undefined,
        rtoTaxExpiryDate: formData.rtoTaxExpiryDate || undefined,
        speedGovernor: formData.speedGovernor,
      };
      const response = await vendorService.createVehicle(submitData);
      if (response.success) {
        toast.success('Vehicle created successfully!');
        router.push('/dashboard/vehicles');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all bg-white";
  const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link href="/dashboard/vehicles" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 group text-sm">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Vehicles
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Register New Vehicle</h1>
        <p className="text-sm text-gray-500 mt-1">Add a vehicle to the fleet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#E32222] uppercase tracking-wide mb-2">Vehicle Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Registration Number *</label>
              <input type="text" required value={formData.registrationNumber}
                onChange={e => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})}
                className={inputClass} placeholder="KA01AB1234" />
            </div>
            <div>
              <label className={labelClass}>Vehicle Model *</label>
              <input type="text" required value={formData.vehicleModel}
                onChange={e => setFormData({...formData, vehicleModel: e.target.value})}
                className={inputClass} placeholder="Maruti Dzire" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vehicle Type *</label>
              <select required value={formData.vehicleTypeId}
                onChange={e => setFormData({...formData, vehicleTypeId: e.target.value})}
                className={inputClass + " appearance-none"}>
                <option value="">Select Type</option>
                {vehicleTypes.map((vt: any) => <option key={vt.id} value={vt.id}>{vt.displayName} ({vt.category})</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>City Code *</label>
              <select required value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={inputClass + " appearance-none"}>
                <option value="">Select City</option>
                {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName} ({c.code})</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#E32222] uppercase tracking-wide mb-2">Assignment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Vendor *</label>
              <select required value={formData.vendorCustomId}
                onChange={e => setFormData({...formData, vendorCustomId: e.target.value})}
                className={inputClass + " appearance-none"}>
                <option value="">Select Vendor</option>
                {vendors.map((v: any) => <option key={v.id} value={v.customId}>{v.companyName || v.name} ({v.customId})</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Partner (Optional)</label>
              <select value={formData.partnerCustomId}
                onChange={e => setFormData({...formData, partnerCustomId: e.target.value})}
                className={inputClass + " appearance-none"}>
                <option value="">No Partner</option>
                {partners.map((p: any) => <option key={p.id} value={p.customId}>{p.name} ({p.customId})</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Details (Collapsible) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <button type="button" onClick={() => setShowAdditional(!showAdditional)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <span className="font-semibold text-gray-700 text-sm">Additional Details</span>
            {showAdditional ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {showAdditional && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Color</label>
                  <input type="text" value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                    className={inputClass} placeholder="White" />
                </div>
                <div>
                  <label className={labelClass}>Fuel Type</label>
                  <select value={formData.fuelType}
                    onChange={e => setFormData({...formData, fuelType: e.target.value as any})}
                    className={inputClass + " appearance-none"}>
                    <option value="">Select</option>
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Seating Capacity</label>
                  <input type="number" value={formData.seatingCapacity}
                    onChange={e => setFormData({...formData, seatingCapacity: e.target.value})}
                    className={inputClass} placeholder="4" min="1" max="50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>RTO Tax Expiry Date</label>
                  <input type="date" value={formData.rtoTaxExpiryDate}
                    onChange={e => setFormData({...formData, rtoTaxExpiryDate: e.target.value})}
                    className={inputClass} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.speedGovernor}
                      onChange={e => setFormData({...formData, speedGovernor: e.target.checked})}
                      className="w-4 h-4 accent-[#E32222] rounded" />
                    <span className="text-sm font-medium text-gray-700">Speed Governor Installed</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-semibold text-sm shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Car size={20} />}
          <span>{isLoading ? 'Registering Vehicle...' : 'Register Vehicle'}</span>
        </button>
      </form>
    </div>
  );
}
