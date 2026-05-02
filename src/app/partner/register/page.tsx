'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Loader2, Users, ArrowLeft, ChevronDown, ChevronUp, Car, ShieldCheck, CreditCard, Link as LinkIcon, Upload, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerService } from '@/services/partnerService';
import { agentService } from '@/services/agentService';
import { publicRideService } from '@/services/publicRideService';
import { PremiumSelect, PremiumSelectOption } from '@/components/ui/PremiumSelect';
import { uploadService } from '@/services/uploadService';



const GENDER_OPTIONS: PremiumSelectOption[] = [
  { id: 'MALE', label: 'Male' },
  { id: 'FEMALE', label: 'Female' },
  { id: 'OTHER', label: 'Other/Prefer not to say' }
];

// Logic for document input within the dark theme
const PublicDocInput = ({ label, value, onChange, required, folder = 'documents' }: { label: string, value: string, onChange: (v: string) => void, required?: boolean, folder?: string }) => {
  const [mode, setMode] = useState<'URL' | 'UPLOAD'>('UPLOAD');
  const [isUploading, setIsUploading] = useState(false);
  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/20 transition-all hover:bg-white/[0.05] text-sm";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const oldUrl = value && value.startsWith('http') ? value : undefined;
        const finalUrl = await uploadService.uploadFile(file, folder, oldUrl);
        onChange(finalUrl);
        toast.success(`${label} uploaded successfully`);
      } catch (err) {
        console.error(err);
        toast.error(`Failed to upload ${label}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">
          {label} {required && <span className="text-[#E32222]">*</span>}
        </label>
      </div>
      <div className="relative border border-dashed border-white/10 rounded-xl py-3 px-4 hover:border-[#E32222]/40 transition-all group cursor-pointer bg-white/[0.01] hover:bg-white/[0.03]">
        <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400 truncate max-w-[150px] font-medium">{value ? 'File Selected' : 'Choose local file'}</span>
          <Upload size={14} className="text-neutral-600 group-hover:text-[#E32222] transition-colors" />
        </div>
      </div>
      {mode === 'URL' ? (
        <div className="relative group">
          <input type="text" value={value.startsWith('blob:') ? '' : value} onChange={e => onChange(e.target.value)} placeholder="Paste image link..." className={inputClass} />
          <LinkIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#E32222] transition-colors" />
        </div>
      ) : (
        <div className="relative border border-dashed border-white/10 rounded-xl py-3 px-4 hover:border-[#E32222]/40 transition-all group cursor-pointer bg-white/[0.01] hover:bg-white/[0.03]">
          <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isUploading} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 truncate max-w-[150px] font-medium">
              {isUploading ? 'Uploading...' : (value && !value.startsWith('blob:') ? 'Replace File' : 'Choose local file')}
            </span>
            {isUploading ? (
               <Loader2 size={14} className="text-[#E32222] animate-spin" />
            ) : (
               <Upload size={14} className="text-neutral-600 group-hover:text-[#E32222] transition-colors" />
            )}
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
    accountNumber: '',
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
      // Load Vehicle Types
      try {
        const vtRes = await agentService.getVehicleTypesLookup();
        if (vtRes.success) {
          setVehicleTypes(vtRes.data || []);
        } else {
          toast.error('Failed to load vehicle categories');
        }
      } catch (err) {
        console.error('Failed to load vehicle types:', err);
        toast.error('Service error: Could not load vehicle categories');
      }

      // Load City Codes
      try {
        const cityRes = await agentService.getCityCodes();
        if (cityRes.success && cityRes.data && cityRes.data.length > 0) {
          setCityCodes(cityRes.data);
        } else {
          toast.error('No operating cities found. Please contact support.');
        }
      } catch (err) {
        console.error('Failed to load city codes:', err);
        toast.error('Service error: Could not load operating cities');
      }
    };
    loadLookups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cityCodeId) return toast.error('Please select your city');
    
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
        accountNumber: formData.accountNumber || undefined,
        ifscCode: formData.ifscCode || undefined,
        vendorCustomId: formData.vendorCustomId || undefined,
      };

      if (hasOwnVehicle) {
        submitData.hasOwnVehicle = true;
        if (ownVehicleNumber) submitData.ownVehicleNumber = ownVehicleNumber;
        if (ownVehicleModel) submitData.ownVehicleModel = ownVehicleModel;
        if (ownVehicleTypeId) submitData.ownVehicleTypeId = ownVehicleTypeId;
      }

      const response = await partnerService.register(submitData);
      if (response.success) {
        toast.success('Welcome aboard! Redirecting to login...');
        setTimeout(() => router.push('/partner/login'), 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/20 transition-all hover:bg-white/[0.05] text-sm";
  const labelClass = "text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-1.5 block";

  const cityOptions: PremiumSelectOption[] = cityCodes.map(c => ({ id: c.id, label: c.cityName, subLabel: c.code }));
  const vehicleTypeOptions: PremiumSelectOption[] = vehicleTypes.map(vt => ({ id: vt.id, label: vt.displayName, subLabel: vt.name }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 py-20 selection:bg-[#E32222]/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-[#E32222]/05 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/[0.02] rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white mb-10 group font-black uppercase text-[10px] tracking-widest transition-colors">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-3 uppercase italic tracking-tighter leading-none">Apply to Captain</h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">Join the Ara Travels Elite Fleet</p>
        </div>

        <div className="rounded-[40px] bg-[#0F0F0F] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            {/* Identity Group */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#E32222]/10 border border-[#E32222]/20 flex items-center justify-center">
                  <span className="text-[10px] font-black text-[#E32222]">01</span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Personal Identity</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>First Name *</label>
                  <input type="text" required value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} className={inputClass} placeholder="First" />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Last Name *</label>
                  <input type="text" required value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} className={inputClass} placeholder="Last" />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Phone *</label>
                  <div className="flex">
                    <span className="px-4 py-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-[10px] font-black text-neutral-500 flex items-center tracking-widest">+91</span>
                    <input type="tel" required value={formData.phone || ''} onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '');
                      if (v.length > 10 && v.startsWith('91')) v = v.slice(2);
                      setFormData({...formData, phone: v.slice(0, 10)});
                    }} className={inputClass + " rounded-l-none"} placeholder="10 Digit Number" maxLength={10} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Vendor ID (Optional)</label>
                  <input type="text" value={formData.vendorCustomId || ''} onChange={e => setFormData({...formData, vendorCustomId: e.target.value.toUpperCase()})} className={inputClass} placeholder="e.g. ACVBLR01" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass + " pr-12"} placeholder="Security Key" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <PremiumSelect 
                  label="Operating City" 
                  options={cityOptions} 
                  value={formData.cityCodeId} 
                  onChange={v => setFormData({...formData, cityCodeId: v})} 
                  placeholder="Choose City" 
                  required 
                />

                <PremiumSelect 
                  label="Gender" 
                  options={GENDER_OPTIONS} 
                  value={formData.gender} 
                  onChange={v => setFormData({...formData, gender: v})} 
                  placeholder="Choose Gender" 
                />
              </div>
            </div>

            {/* KYC Documents */}
            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#E32222]/10 border border-[#E32222]/20 flex items-center justify-center">
                  <span className="text-[10px] font-black text-[#E32222]">02</span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Credential Verification</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} className="text-[#E32222] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">PAN Detail</span>
                  </div>
                  <input type="text" value={formData.panNumber || ''} onChange={e => setFormData({...formData, panNumber: e.target.value.toUpperCase()})} className={inputClass} placeholder="PAN NO" maxLength={10} />
                  <PublicDocInput label="Upload PAN" value={formData.panImage} onChange={v => setFormData({...formData, panImage: v})} />
                </div>

                <div className="space-y-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} className="text-[#E32222] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Aadhaar Card</span>
                  </div>
                  <input type="text" value={formData.aadhaarNumber || ''} onChange={e => setFormData({...formData, aadhaarNumber: e.target.value.replace(/\D/g, '')})} className={inputClass} placeholder="12 DIGITS" maxLength={12} />
                  <PublicDocInput label="Upload Aadhaar" value={formData.aadhaarImage} onChange={v => setFormData({...formData, aadhaarImage: v})} />
                </div>

                <div className="space-y-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={14} className="text-[#E32222] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">DL (Required) *</span>
                  </div>
                  <input type="text" required value={formData.licenseNumber || ''} onChange={e => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})} className={inputClass} placeholder="DL NUMBER" />
                  <PublicDocInput label="Upload DL" value={formData.licenseImage} onChange={v => setFormData({...formData, licenseImage: v})} required />
                </div>
              </div>
            </div>

            {/* Vehicle & Banking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 border-t border-white/5">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#E32222]/10 border border-[#E32222]/20 flex items-center justify-center">
                    <span className="text-[10px] font-black text-[#E32222]">03</span>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Vehicle Setup</h3>
                </div>
                <label className="flex items-center gap-4 p-5 bg-white/[0.03] rounded-2xl border border-white/10 cursor-pointer group hover:bg-white/[0.05] transition-all ring-inset ring-1 ring-white/5 hover:ring-[#E32222]/20">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${hasOwnVehicle ? 'bg-[#E32222] shadow-[0_0_15px_rgba(227,34,34,0.4)]' : 'bg-white/5 border border-white/10 group-hover:border-white/20'}`}>
                    <input type="checkbox" checked={hasOwnVehicle} onChange={e => setHasOwnVehicle(e.target.checked)} className="hidden" />
                    {hasOwnVehicle && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.1em] text-neutral-300">I own a vehicle</span>
                </label>
                {hasOwnVehicle && (
                  <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-1">
                      <label className={labelClass}>Registration NO</label>
                      <input type="text" value={ownVehicleNumber || ''} onChange={e => setOwnVehicleNumber(e.target.value.toUpperCase())} className={inputClass} placeholder="KA 01 AB 1234" />
                    </div>
                    <PremiumSelect 
                      label="Vehicle Model Type" 
                      options={vehicleTypeOptions} 
                      value={ownVehicleTypeId} 
                      onChange={v => setOwnVehicleTypeId(v)} 
                      placeholder="Select Category" 
                      icon={<Car size={16} />}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#E32222]/10 border border-[#E32222]/20 flex items-center justify-center">
                    <span className="text-[10px] font-black text-[#E32222]">04</span>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Settlement Info</h3>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1">
                    <label className={labelClass}>Bank Name</label>
                    <input type="text" value={formData.bankName || ''} onChange={e => setFormData({...formData, bankName: e.target.value})} className={inputClass} placeholder="Full Name of Bank" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelClass}>Account NO</label>
                      <input type="text" value={formData.accountNumber || ''} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className={inputClass} placeholder="Digits" />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>IFSC CODE</label>
                      <input type="text" value={formData.ifscCode || ''} onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})} className={inputClass} placeholder="XXXX0123456" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 flex flex-col items-center">
              <button type="submit" disabled={isLoading} className="group relative w-full md:w-[400px] h-16 rounded-[24px] bg-[#E32222] hover:bg-[#ff1a1a] text-white font-black uppercase tracking-[0.3em] text-sm transition-all shadow-[0_24px_48px_-12px_rgba(227,34,34,0.5)] active:scale-[0.98] disabled:opacity-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <span>Start Application</span>}
              </button>
              
              <p className="mt-8 text-neutral-500 font-black text-[9px] uppercase tracking-[0.4em] opacity-40">
                Member of ARA Group Ecosystem
              </p>
              
              <Link href="/partner/login" className="mt-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-[#E32222] transition-colors border-b border-white/5 pb-1">
                Already registered? Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

