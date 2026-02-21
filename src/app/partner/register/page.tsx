'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Loader2, Users, ArrowLeft, ChevronDown, ChevronUp, Car, ShieldCheck, CreditCard, Link as LinkIcon, Upload, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerService } from '@/services/partnerService';
import { agentService } from '@/services/agentService';

// Logic for document input within the dark theme
const PublicDocInput = ({ label, value, onChange, required }: { label: string, value: string, onChange: (v: string) => void, required?: boolean }) => {
  const [mode, setMode] = useState<'URL' | 'UPLOAD'>('URL');
  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/20 transition-all hover:bg-white/[0.05]";

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">
          {label} {required && <span className="text-[#E32222]">*</span>}
        </label>
        <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg">
          <button type="button" onClick={() => setMode('URL')} className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${mode === 'URL' ? 'bg-[#E32222] text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>URL</button>
          <button type="button" onClick={() => setMode('UPLOAD')} className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${mode === 'UPLOAD' ? 'bg-[#E32222] text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>Upload</button>
        </div>
      </div>
      {mode === 'URL' ? (
        <div className="relative group">
          <input type="text" value={value.startsWith('blob:') ? '' : value} onChange={e => onChange(e.target.value)} placeholder="Paste image link..." className={inputClass} />
          <LinkIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" />
        </div>
      ) : (
        <div className="relative border border-dashed border-white/10 rounded-xl py-3 px-4 hover:border-[#E32222]/40 transition-colors group cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 truncate max-w-[150px]">{value.startsWith('blob:') ? 'Selected' : 'Select File'}</span>
            <Upload size={14} className="text-neutral-600 group-hover:text-[#E32222] transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
};

export default function PartnerRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    cityCodeId: '',
    vendorCustomId: '',
    localAddress: '',
    dateOfBirth: '',
    gender: '' as any,
    panNumber: '',
    panImage: '',
    aadhaarNumber: '',
    aadhaarImage: '',
    licenseNumber: '',
    licenseImage: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [cityCodes, setCityCodes] = useState<any[]>([]);
  const router = useRouter();

  const [hasOwnVehicle, setHasOwnVehicle] = useState(false);
  const [ownVehicleNumber, setOwnVehicleNumber] = useState('');
  const [ownVehicleModel, setOwnVehicleModel] = useState('');
  const [ownVehicleTypeId, setOwnVehicleTypeId] = useState('');

  useEffect(() => {
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submitData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: `+91${formData.phone}`,
        email: formData.email || undefined,
        password: formData.password,
        cityCodeId: formData.cityCodeId,
        gender: formData.gender as any,
        dateOfBirth: formData.dateOfBirth,
        localAddress: formData.localAddress,
        panNumber: formData.panNumber || undefined,
        panImage: formData.panImage || undefined,
        aadhaarNumber: formData.aadhaarNumber || undefined,
        aadhaarImage: formData.aadhaarImage || undefined,
        hasLicense: true,
        licenseNumber: formData.licenseNumber,
        licenseImage: formData.licenseImage,
        bankName: formData.bankName || undefined,
        accountNumber: formData.bankAccountNumber || undefined,
        ifscCode: formData.ifscCode || undefined,
      };

      if (hasOwnVehicle) {
        submitData.hasOwnVehicle = true;
        if (ownVehicleNumber) submitData.ownVehicleNumber = ownVehicleNumber;
        if (ownVehicleModel) submitData.ownVehicleModel = ownVehicleModel;
        if (ownVehicleTypeId) submitData.ownVehicleTypeId = ownVehicleTypeId;
      }

      const response = await partnerService.register(submitData);
      if (response.success) {
        toast.success('Registration successful! Please login.');
        router.push('/partner/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/20 transition-all hover:bg-white/[0.05]";
  const labelClass = "text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-1.5 block";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 py-16 selection:bg-[#E32222]/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-[#E32222]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white mb-8 group font-bold uppercase text-[10px] tracking-widest">
          <ArrowLeft size={14} className="group-hover:-translate-x-1" /> Back
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Join the Crew</h1>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.2em]">Partner Application</p>
        </div>

        <div className="rounded-[32px] bg-[#111]/80 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Identity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className={labelClass}>First Name *</label>
                <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={inputClass} placeholder="First" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Last Name *</label>
                <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className={inputClass} placeholder="Last" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Phone *</label>
                <div className="flex">
                  <span className="px-4 py-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-xs font-bold text-neutral-500 flex items-center">+91</span>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className={inputClass + " rounded-l-none"} placeholder="10 Digit" maxLength={10} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className={labelClass}>Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass + " pr-12"} placeholder="Security Key" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>City *</label>
                <select required value={formData.cityCodeId} onChange={e => setFormData({...formData, cityCodeId: e.target.value})} className={inputClass + " appearance-none cursor-pointer"}>
                  <option value="" className="bg-black">Choose City</option>
                  {cityCodes.map((c: any) => <option key={c.id} value={c.id} className="bg-black">{c.cityName}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Gender</label>
                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className={inputClass + " appearance-none"}>
                  <option value="" className="bg-black">Choose</option>
                  <option value="MALE" className="bg-black">Male</option>
                  <option value="FEMALE" className="bg-black">Female</option>
                </select>
              </div>
            </div>

            {/* KYC Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-[#E32222]" />
                  <span className="text-[10px] font-black uppercase text-neutral-400">PAN Verification</span>
                </div>
                <input type="text" value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value.toUpperCase()})} className={inputClass} placeholder="PAN NO" maxLength={10} />
                <PublicDocInput label="Upload PAN" value={formData.panImage} onChange={v => setFormData({...formData, panImage: v})} />
              </div>

              <div className="space-y-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-[#E32222]" />
                  <span className="text-[10px] font-black uppercase text-neutral-400">Aadhaar Verification</span>
                </div>
                <input type="text" value={formData.aadhaarNumber} onChange={e => setFormData({...formData, aadhaarNumber: e.target.value.replace(/\D/g, '')})} className={inputClass} placeholder="12 DIGIT AADHAAR" maxLength={12} />
                <PublicDocInput label="Upload Aadhaar" value={formData.aadhaarImage} onChange={v => setFormData({...formData, aadhaarImage: v})} />
              </div>

              <div className="space-y-4 p-5 bg-white /[0.02] rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-[#E32222]" />
                  <span className="text-[10px] font-black uppercase text-neutral-400">Driving License *</span>
                </div>
                <input type="text" required value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})} className={inputClass} placeholder="DL NUMBER" />
                <PublicDocInput label="Upload DL" value={formData.licenseImage} onChange={v => setFormData({...formData, licenseImage: v})} required />
              </div>
            </div>

            {/* Ownership & Banking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Car size={14} className="text-[#E32222]" />
                  <span className="text-[10px] font-black uppercase text-neutral-400">Vehicle Mode</span>
                </div>
                <label className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer group hover:bg-white/10 transition-all">
                  <input type="checkbox" checked={hasOwnVehicle} onChange={e => setHasOwnVehicle(e.target.checked)} className="w-5 h-5 accent-[#E32222]" />
                  <span className="text-xs font-bold text-neutral-300">I HAVE MY OWN VEHICLE</span>
                </label>
                {hasOwnVehicle && (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <input type="text" value={ownVehicleNumber} onChange={e => setOwnVehicleNumber(e.target.value.toUpperCase())} className={inputClass} placeholder="VEHICLE REG NO" />
                    <select value={ownVehicleTypeId} onChange={e => setOwnVehicleTypeId(e.target.value)} className={inputClass + " appearance-none cursor-pointer"}>
                      <option value="" className="bg-black">VEHICLE TYPE</option>
                      {vehicleTypes.map((vt: any) => <option key={vt.id} value={vt.id} className="bg-black">{vt.displayName}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={14} className="text-[#E32222]" />
                  <span className="text-[10px] font-black uppercase text-neutral-400">Payout Details</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className={inputClass} placeholder="BANK NAME" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={formData.bankAccountNumber} onChange={e => setFormData({...formData, bankAccountNumber: e.target.value})} className={inputClass} placeholder="ACCOUNT NO" />
                    <input type="text" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} className={inputClass} placeholder="IFSC CODE" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-[#E32222] hover:bg-[#ff1a1a] text-white font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_-12px_rgba(227,34,34,0.4)] active:scale-[0.98] disabled:opacity-50">
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <span>Start Your Journey</span>}
              </button>
              <p className="text-center mt-6 text-neutral-500 font-bold text-[10px] uppercase tracking-widest">
                Already registered? <Link href="/partner/login" className="text-white hover:text-[#E32222] underline underline-offset-4 decoration-white/20">Sign In</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
