'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Loader2, ChevronDown, ChevronUp, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerService } from '@/services/partnerService';
import { agentService } from '@/services/agentService';
import { PartnerRegisterRequest } from '@/types';

export default function AdminCreatePartnerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonal, setShowPersonal] = useState(false);
  const [showVehicle, setShowVehicle] = useState(false);
  const [showBanking, setShowBanking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [cityCodes, setCityCodes] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    cityCodeId: '',
    vendorId: '',
    // Personal
    dateOfBirth: '',
    gender: '',
    localAddress: '',
    permanentAddress: '',
    aadharNumber: '',
    licenseNumber: '',
    // Own Vehicle
    hasOwnVehicle: false,
    ownVehicleNumber: '',
    ownVehicleModel: '',
    ownVehicleTypeId: '',
    // Banking
    bankAccountNumber: '',
    upiId: '',
  });

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [cityRes, vtRes, vendorRes] = await Promise.all([
          agentService.getCityCodes(),
          agentService.getVehicleTypesLookup(),
          agentService.getVendorsLookup(),
        ]);
        if (cityRes.success) setCityCodes(cityRes.data || []);
        if (vtRes.success) setVehicleTypes(vtRes.data || []);
        if (vendorRes.success) setVendors(vendorRes.data || []);
      } catch (err) {
        console.error('Failed to load lookups:', err);
      }
    };
    loadLookups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }
    setIsLoading(true);
    try {
      const submitData: PartnerRegisterRequest = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: `+91${formData.phone}`,
        email: formData.email || undefined,
        password: formData.password,
        cityCodeId: formData.cityCodeId || undefined,
        vendorId: formData.vendorId || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender ? (formData.gender as any) : undefined,
        localAddress: formData.localAddress || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        aadharNumber: formData.aadharNumber || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        hasOwnVehicle: formData.hasOwnVehicle,
        ownVehicleNumber: formData.hasOwnVehicle ? formData.ownVehicleNumber || undefined : undefined,
        ownVehicleModel: formData.hasOwnVehicle ? formData.ownVehicleModel || undefined : undefined,
        ownVehicleTypeId: formData.hasOwnVehicle ? formData.ownVehicleTypeId || undefined : undefined,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        upiId: formData.upiId || undefined,
      };
      const response = await partnerService.createPartner(submitData);
      if (response.success) {
        toast.success('Partner created successfully!');
        router.push('/dashboard/partners');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create partner');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all bg-white";
  const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link href="/dashboard/partners" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 group text-sm">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Partners
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create New Partner</h1>
        <p className="text-sm text-gray-500 mt-1">Register a new driver partner via admin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#E32222] uppercase tracking-wide mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input type="text" required value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className={inputClass} placeholder="John" />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input type="text" required value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className={inputClass} placeholder="Doe" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Phone *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium">+91</span>
                <input type="tel" required value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  className="w-full border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all"
                  placeholder="9876543210" maxLength={10} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={inputClass} placeholder="john@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className={inputClass + " pr-10"} placeholder="Create a password" />
              </div>
            </div>
            <div>
              <label className={labelClass}>City Code</label>
              <select value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={inputClass + " appearance-none"}>
                <option value="">Select City</option>
                {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName} ({c.code})</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Vendor</label>
            <select value={formData.vendorId}
              onChange={e => setFormData({...formData, vendorId: e.target.value})}
              className={inputClass + " appearance-none"}>
              <option value="">No Vendor (Independent)</option>
              {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.companyName || v.name} ({v.customId})</option>)}
            </select>
          </div>
        </div>

        {/* Section 2: Personal Details (Collapsible) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <button type="button" onClick={() => setShowPersonal(!showPersonal)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <span className="font-semibold text-gray-700 text-sm">Personal & Document Details</span>
            {showPersonal ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {showPersonal && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" value={formData.dateOfBirth}
                    onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className={inputClass + " appearance-none"}>
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Aadhar Number</label>
                  <input type="text" value={formData.aadharNumber}
                    onChange={e => setFormData({...formData, aadharNumber: e.target.value})}
                    className={inputClass} placeholder="1234 5678 9012" />
                </div>
                <div>
                  <label className={labelClass}>License Number</label>
                  <input type="text" value={formData.licenseNumber}
                    onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                    className={inputClass} placeholder="KA01 20220001234" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Local Address</label>
                <textarea value={formData.localAddress}
                  onChange={e => setFormData({...formData, localAddress: e.target.value})}
                  className={inputClass + " resize-none"} rows={2} placeholder="Current address..." />
              </div>
              <div>
                <label className={labelClass}>Permanent Address</label>
                <textarea value={formData.permanentAddress}
                  onChange={e => setFormData({...formData, permanentAddress: e.target.value})}
                  className={inputClass + " resize-none"} rows={2} placeholder="Permanent address..." />
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Own Vehicle (Collapsible) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <button type="button" onClick={() => setShowVehicle(!showVehicle)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <span className="font-semibold text-gray-700 text-sm flex items-center gap-2"><Car size={16} className="text-emerald-500" /> Own Vehicle Details</span>
            {showVehicle ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {showVehicle && (
            <div className="px-6 pb-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.hasOwnVehicle}
                  onChange={e => setFormData({...formData, hasOwnVehicle: e.target.checked})}
                  className="w-4 h-4 accent-[#E32222] rounded" />
                <span className="text-sm font-medium text-gray-700">Partner has own vehicle</span>
              </label>
              {formData.hasOwnVehicle && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className={labelClass}>Vehicle Number</label>
                    <input type="text" value={formData.ownVehicleNumber}
                      onChange={e => setFormData({...formData, ownVehicleNumber: e.target.value.toUpperCase()})}
                      className={inputClass} placeholder="KA01AB1234" />
                  </div>
                  <div>
                    <label className={labelClass}>Vehicle Model</label>
                    <input type="text" value={formData.ownVehicleModel}
                      onChange={e => setFormData({...formData, ownVehicleModel: e.target.value})}
                      className={inputClass} placeholder="Maruti Dzire" />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Vehicle Type</label>
                    <select value={formData.ownVehicleTypeId}
                      onChange={e => setFormData({...formData, ownVehicleTypeId: e.target.value})}
                      className={inputClass + " appearance-none"}>
                      <option value="">Select Type</option>
                      {vehicleTypes.map((vt: any) => <option key={vt.id} value={vt.id}>{vt.displayName} ({vt.category})</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 4: Banking Details (Collapsible) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <button type="button" onClick={() => setShowBanking(!showBanking)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <span className="font-semibold text-gray-700 text-sm">Banking Details</span>
            {showBanking ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {showBanking && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Bank Account Number</label>
                  <input type="text" value={formData.bankAccountNumber}
                    onChange={e => setFormData({...formData, bankAccountNumber: e.target.value})}
                    className={inputClass} placeholder="Enter account number" />
                </div>
                <div>
                  <label className={labelClass}>UPI ID</label>
                  <input type="text" value={formData.upiId}
                    onChange={e => setFormData({...formData, upiId: e.target.value})}
                    className={inputClass} placeholder="name@upi" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-semibold text-sm shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
          <span>{isLoading ? 'Creating Partner...' : 'Create Partner'}</span>
        </button>
      </form>
    </div>
  );
}
