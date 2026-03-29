'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Building2, ArrowLeft, ShieldCheck, CreditCard, Car, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorService } from '@/services/vendorService';
import { cityCodeService } from '@/services/cityCodeService';
import { PremiumSelect, PremiumSelectOption } from '@/components/ui/PremiumSelect';

const FALLBACK_CITIES = [
  { id: 'fallback-blr', code: 'BLR', cityName: 'Bangalore' },
  { id: 'fallback-hyd', code: 'HYD', cityName: 'Hyderabad' },
  { id: 'fallback-che', code: 'CHE', cityName: 'Chennai' },
  { id: 'fallback-mum', code: 'MUM', cityName: 'Mumbai' },
];

const VENDOR_TYPE_OPTIONS: PremiumSelectOption[] = [
  { id: 'BUSINESS', label: 'Business Entity', subLabel: 'Registered Company / LLC' },
  { id: 'INDIVIDUAL', label: 'Individual Owner', subLabel: 'Private Fleet Operator' }
];

export default function VendorRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cityCodes, setCityCodes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    password: '',
    cityCodeId: '',
    type: 'BUSINESS' as 'INDIVIDUAL' | 'BUSINESS',
    gstNumber: '',
    panNumber: '',
    ccMobile: '',
    accountNumber: '',
    officeAddress: '',
  });

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await cityCodeService.getAll();
        if (res.success && res.data && res.data.length > 0) {
          setCityCodes(res.data);
        } else {
          setCityCodes(FALLBACK_CITIES);
        }
      } catch (err) {
        console.error('Failed to load cities, using fallback:', err);
        setCityCodes(FALLBACK_CITIES);
      }
    };
    loadCities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.companyName || !formData.phone || !formData.cityCodeId || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsLoading(true);
    try {
      const submitData: any = {
        ...formData,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
      };
      const response = await vendorService.register(submitData);
      if (response.success) {
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => router.push('/vendor/login'), 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const labelClass = "text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-1.5 block";
  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/20 transition-all hover:bg-white/[0.05]";

  const cityOptions: PremiumSelectOption[] = cityCodes.map(c => ({ id: c.id, label: c.cityName, subLabel: c.code }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 py-20 selection:bg-[#E32222]/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E32222]/05 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/[0.02] rounded-full blur-[140px] -ml-32 -mb-32" />
      </div>

      <div className="relative z-10 w-full max-w-3xl animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-all mb-10 group text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-white italic uppercase leading-none tracking-tighter">Vendor Portal</h1>
            <p className="text-neutral-500 text-[10px] font-black mt-3 uppercase tracking-[0.3em]">Fleet Management Registration</p>
          </div>
          <div className="w-20 h-20 bg-[#E32222]/05 rounded-[32px] border border-white/5 flex items-center justify-center shadow-2xl backdrop-blur-xl">
            <Building2 size={36} className="text-[#E32222]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Business Info */}
          <div className="bg-[#0F0F0F] border border-white/5 rounded-[40px] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-full bg-[#E32222]/10 border border-[#E32222]/20 flex items-center justify-center">
                <span className="text-[10px] font-black text-[#E32222]">01</span>
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Business Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <label className={labelClass}>Owner Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="Full Legal Name" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Company Name *</label>
                <input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className={inputClass} placeholder="Agency / Company Name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <label className={labelClass}>Primary Phone *</label>
                <div className="flex">
                  <span className="px-4 py-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-[10px] font-black text-neutral-500 flex items-center tracking-widest">+91</span>
                  <input type="tel" required value={formData.phone} onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length > 10 && v.startsWith('91')) v = v.slice(2);
                    setFormData({...formData, phone: v.slice(0, 10)});
                  }} className={inputClass + " rounded-l-none"} placeholder="10 Digit Number" maxLength={10} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Email Address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="admin@vogy.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PremiumSelect 
                label="Vendor Role" 
                options={VENDOR_TYPE_OPTIONS} 
                value={formData.type} 
                onChange={v => setFormData({...formData, type: v as any})} 
              />
              <PremiumSelect 
                label="Operating City" 
                options={cityOptions} 
                value={formData.cityCodeId} 
                onChange={v => setFormData({...formData, cityCodeId: v})} 
                placeholder="Choose City"
                required
              />
              <div className="space-y-1">
                <label className={labelClass}>Set Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass + " pr-12"} placeholder="Security Key" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Compliance & Payouts */}
          <div className="bg-[#0F0F0F] border border-white/5 rounded-[40px] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-full bg-[#E32222]/10 border border-[#E32222]/20 flex items-center justify-center">
                <span className="text-[10px] font-black text-[#E32222]">02</span>
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Compliance & Settlement</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} className="text-[#E32222]" />
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">KYC Info</span>
                </div>
                <div className="space-y-4">
                  <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})} className={inputClass} placeholder="GST Number (Optional)" />
                  <input type="text" value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value.toUpperCase()})} className={inputClass} placeholder="PAN Card Number" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={14} className="text-[#E32222]" />
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Payout Setup</span>
                </div>
                <div className="space-y-4">
                  <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className={inputClass} placeholder="Primary Bank A/C NO" />
                  <input type="tel" value={formData.ccMobile} onChange={e => setFormData({...formData, ccMobile: e.target.value.replace(/\D/g, '')})} className={inputClass} placeholder="Customer Support Mobile" maxLength={10} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-1">
              <label className={labelClass}>Office Address</label>
              <textarea rows={2} value={formData.officeAddress} onChange={e => setFormData({...formData, officeAddress: e.target.value})} className={inputClass + " h-auto resize-none py-4"} placeholder="Full Registered Address" />
            </div>
          </div>

          <div className="pt-10 flex flex-col items-center">
            <button type="submit" disabled={isLoading} className="group relative w-full md:w-[450px] h-16 rounded-[24px] bg-[#E32222] hover:bg-[#ff1a1a] text-white font-black uppercase tracking-[0.3em] text-sm transition-all shadow-[0_24px_48px_-12px_rgba(227,34,34,0.5)] active:scale-[0.98] disabled:opacity-50 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
               {isLoading ? <Loader2 size={24} className="animate-spin mx-auto" /> : <span>Launch Fleet Partnership</span>}
            </button>
            
            <Link href="/vendor/login" className="mt-8 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-[#E32222] transition-colors border-b border-white/5 pb-1">
              Already a provider? Access Portal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
