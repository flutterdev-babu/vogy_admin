'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Loader2, Users, ArrowLeft, ChevronDown, ChevronUp, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerService } from '@/services/partnerService';
import { agentService } from '@/services/agentService';
import { PartnerRegisterRequest } from '@/types';

export default function PartnerRegisterPage() {
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    cityCodeId: '',
    vendorCustomId: '',
    // Personal Details
    localAddress: '',
    permanentAddress: '',
    aadharNumber: '',
    licenseNumber: '',
    licenseImage: '',
    dateOfBirth: '',
    gender: '' as any,
    // Banking Details
    bankAccountNumber: '',
    upiId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonalDetails, setShowPersonalDetails] = useState(false);
  const [showBankingDetails, setShowBankingDetails] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [cityCodes, setCityCodes] = useState<any[]>([]);
  const router = useRouter();

  // Own Vehicle fields
  const [hasOwnVehicle, setHasOwnVehicle] = useState(false);
  const [ownVehicleNumber, setOwnVehicleNumber] = useState('');
  const [ownVehicleModel, setOwnVehicleModel] = useState('');
  const [ownVehicleTypeId, setOwnVehicleTypeId] = useState('');

  useState(() => {
    const loadLookups = async () => {
      try {
        const [vtRes, cityRes] = await Promise.all([
          agentService.getVehicleTypesLookup(),
          agentService.getCityCodes(),
        ]);
        if (vtRes.success) setVehicleTypes(vtRes.data || []);
        if (cityRes.success) setCityCodes(cityRes.data || []);
      } catch (err) { console.error('Failed to load lookups:', err); }
    };
    loadLookups();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { firstName, lastName, ...rest } = formData;
      const submitData: any = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        phone: `+91${rest.phone}`,
        email: rest.email || undefined,
        password: rest.password,
        
        // Governance
        cityCodeId: formData.cityCodeId,
        gender: formData.gender as any,
        dateOfBirth: formData.dateOfBirth,
        localAddress: formData.localAddress,
        permanentAddress: formData.permanentAddress,
        
        // License
        hasLicense: true,
        licenseNumber: formData.licenseNumber,
        licenseImage: formData.licenseImage,

        // Optional fields from UI that might be allowed but not strictly required
        // Keeping aadharNumber as it is critical for KYC usually
        aadharNumber: formData.aadharNumber || undefined,
      };

      // Only add vehicle details if strictly true to avoid backend constraint issues
      if (hasOwnVehicle) {
        submitData.hasOwnVehicle = true;
        if (ownVehicleNumber) submitData.ownVehicleNumber = ownVehicleNumber;
        if (ownVehicleModel) submitData.ownVehicleModel = ownVehicleModel;
        if (ownVehicleTypeId) submitData.ownVehicleTypeId = ownVehicleTypeId;
      }

      console.log('Sending Partner Registration Request:', submitData);
      const response = await partnerService.register(submitData);
      console.log('Partner Registration Response:', response);

      if (response.success) {
        toast.success('Registration successful! Please login.');
        router.push('/partner/login');
      }
    } catch (error: any) {
      console.error('Partner Registration Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/20 transition-all hover:bg-white/[0.05]";
  const labelClass = "text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-1 mb-1.5 block";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 py-16 selection:bg-[#E32222]/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-[#E32222]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-10 group"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Back to Ara Portal</span>
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#E32222]/20 to-transparent border border-[#E32222]/20 mb-8 shadow-[0_0_40px_rgba(227,34,34,0.15)] transform hover:rotate-3 transition-transform cursor-default">
            <Users size={42} className="text-[#E32222]" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase italic">Partner Registration</h1>
          <p className="text-neutral-400 font-medium max-w-md mx-auto">Complete the form below to become an authorized Ara delivery partner and start your journey.</p>
        </div>

        <div className="rounded-[40px] bg-[#121212]/80 backdrop-blur-3xl border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <h3 className="text-[10px] font-black text-[#E32222] uppercase tracking-[0.3em] whitespace-nowrap">Identity Details</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/10 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>First Name <span className="text-[#E32222]">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className={inputClass}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Last Name <span className="text-[#E32222]">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className={inputClass}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>Mobile Number <span className="text-[#E32222]">*</span></label>
                  <div className="flex group">
                    <span className="inline-flex items-center px-5 bg-white/[0.05] border border-r-0 border-white/10 rounded-l-xl text-neutral-400 text-sm font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-r-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/20 transition-all hover:bg-white/[0.05]"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={inputClass}
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>Password <span className="text-[#E32222]">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className={inputClass + " pr-12"}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>City</label>
                    <select
                      value={formData.cityCodeId}
                      onChange={(e) => setFormData({...formData, cityCodeId: e.target.value})}
                      className={inputClass + " appearance-none cursor-pointer"}
                    >
                      <option value="" className="bg-[#121212]">Select</option>
                      {cityCodes.map((c: any) => <option key={c.id} value={c.id} className="bg-[#121212]">{c.cityName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Vendor Code</label>
                    <input
                      type="text"
                      value={formData.vendorCustomId}
                      onChange={(e) => setFormData({...formData, vendorCustomId: e.target.value})}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Sections Container */}
            <div className="space-y-4">
              {/* Personal & License Section */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPersonalDetails(!showPersonalDetails)}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${showPersonalDetails ? 'bg-white/[0.04]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Car size={16} className="text-[#E32222]" />
                    </div>
                    <span className="font-bold text-sm text-neutral-200 uppercase tracking-widest italic">Personal & License Tracking</span>
                  </div>
                  {showPersonalDetails ? <ChevronUp size={20} className="text-neutral-500" /> : <ChevronDown size={20} className="text-neutral-500" />}
                </button>
                
                {showPersonalDetails && (
                  <div className="p-6 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className={labelClass}>Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className={inputClass + " appearance-none"}
                        >
                          <option value="" className="bg-[#121212]">Select gender</option>
                          <option value="MALE" className="bg-[#121212]">Male</option>
                          <option value="FEMALE" className="bg-[#121212]">Female</option>
                          <option value="OTHER" className="bg-[#121212]">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className={labelClass}>Aadhar Card Number <span className="text-[#E32222]">*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.aadharNumber}
                          onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                          className={inputClass}
                          placeholder="12 digit number"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>Driving License No <span className="text-[#E32222]">*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})}
                          className={inputClass}
                          placeholder="AS PER DL CARD"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Local / Communications Address</label>
                      <textarea
                        value={formData.localAddress}
                        onChange={(e) => setFormData({...formData, localAddress: e.target.value})}
                        className={inputClass + " resize-none h-20"}
                        placeholder="Current residential address..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Section */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowVehicleDetails(!showVehicleDetails)}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${showVehicleDetails ? 'bg-white/[0.04]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Car size={16} className="text-emerald-500" />
                    </div>
                    <span className="font-bold text-sm text-neutral-200 uppercase tracking-widest italic">Vehicle Ownership</span>
                  </div>
                  {showVehicleDetails ? <ChevronUp size={20} className="text-neutral-500" /> : <ChevronDown size={20} className="text-neutral-500" />}
                </button>
                
                {showVehicleDetails && (
                  <div className="p-6 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <label className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 cursor-pointer group transition-colors hover:bg-emerald-500/10">
                      <input 
                        type="checkbox" 
                        checked={hasOwnVehicle}
                        onChange={e => setHasOwnVehicle(e.target.checked)}
                        className="w-5 h-5 accent-[#E32222] rounded border-white/10 bg-transparent" 
                      />
                      <span className="text-sm font-bold text-neutral-300 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">I am an Owner-Driver (I have my own vehicle)</span>
                    </label>
                    {hasOwnVehicle && (
                      <div className="space-y-6 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className={labelClass}>Vehicle Reg Number</label>
                            <input type="text" value={ownVehicleNumber}
                              onChange={e => setOwnVehicleNumber(e.target.value.toUpperCase())}
                              className={inputClass} placeholder="KA 03 MB 1234" />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClass}>Model / Make</label>
                            <input type="text" value={ownVehicleModel}
                              onChange={e => setOwnVehicleModel(e.target.value)}
                              className={inputClass} placeholder="Maruti Dzire White" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>Vehicle Category</label>
                          <select value={ownVehicleTypeId}
                            onChange={e => setOwnVehicleTypeId(e.target.value)}
                            className={inputClass + " appearance-none cursor-pointer"}>
                            <option value="" className="bg-[#121212]">Choose vehicle type</option>
                            {vehicleTypes.map((vt: any) => <option key={vt.id} value={vt.id} className="bg-[#121212]">{vt.displayName} ({vt.category})</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Section */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowBankingDetails(!showBankingDetails)}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${showBankingDetails ? 'bg-white/[0.04]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users size={16} className="text-blue-500" />
                    </div>
                    <span className="font-bold text-sm text-neutral-200 uppercase tracking-widest italic">Payout Information</span>
                  </div>
                  {showBankingDetails ? <ChevronUp size={20} className="text-neutral-500" /> : <ChevronDown size={20} className="text-neutral-500" />}
                </button>
                
                {showBankingDetails && (
                  <div className="p-6 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className={labelClass}>Account Number</label>
                        <input
                          type="text"
                          value={formData.bankAccountNumber}
                          onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                          className={inputClass}
                          placeholder="Your bank account no"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>UPI Address</label>
                        <input
                          type="text"
                          value={formData.upiId}
                          onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                          className={inputClass}
                          placeholder="name@upi"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group h-14 rounded-2xl bg-[#E32222] hover:bg-[#ff1a1a] text-white font-black uppercase tracking-widest transition-all duration-300 shadow-[0_12px_24px_-8px_rgba(227,34,34,0.5)] active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
                      <span>Create Account Now</span>
                    </>
                  )}
                </div>
              </button>
              
              <p className="text-center text-neutral-500 mt-8 font-medium">
                Part of Ara before?{' '}
                <Link
                  href="/partner/login"
                  className="text-white hover:text-[#E32222] font-black transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-[#E32222]"
                >
                  SIGN IN HERE
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center text-[10px] text-neutral-600 font-bold uppercase tracking-[0.2em]">
          Powered by Ara Travel Systems &copy; 2026
        </div>
      </div>
    </div>
  );
}
