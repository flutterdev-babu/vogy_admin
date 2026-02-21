'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Loader2, Building2, ArrowLeft, ChevronDown, ChevronUp, ShieldCheck, Info, CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorService } from '@/services/vendorService';
import { cityCodeService } from '@/services/cityCodeService';

export default function VendorRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cityCodes, setCityCodes] = useState<any[]>([]);
  
  const [showCompliance, setShowCompliance] = useState(false);
  const [showBanking, setShowBanking] = useState(false);

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
        if (res.success) setCityCodes(res.data || []);
      } catch (err) {
        console.error('Failed to load cities:', err);
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
        toast.success('Registration successful! Please login.');
        router.push('/vendor/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sectionClass = "bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-4";
  const labelClass = "text-[9px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-1 block";
  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all h-10";
  const selectClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#E32222] transition-all h-10";

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Abstract Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E32222]/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-all mb-6 group text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase leading-none tracking-tighter">Vendor Signup</h1>
            <p className="text-neutral-500 text-xs font-bold mt-2 uppercase tracking-wide">Register your fleet with Ara Platform</p>
          </div>
          <div className="w-16 h-16 bg-[#E32222]/10 rounded-[24px] border border-[#E32222]/20 flex items-center justify-center shadow-[0_0_30px_rgba(227,34,34,0.1)]">
            <Building2 size={32} className="text-[#E32222]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary Info */}
          <div className={sectionClass}>
            <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
              <Info size={14} className="text-[#E32222]" />
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Partner Identity</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className={labelClass}>Owner Name *</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={inputClass} placeholder="Full Name" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Company Name *</label>
                <input type="text" required value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className={inputClass} placeholder="Legal Entity Name" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Primary Phone *</label>
                <div className="flex gap-2">
                   <div className="bg-white/5 border border-white/10 rounded-xl px-3 flex items-center h-10 text-[10px] font-bold text-neutral-400">+91</div>
                  <input type="tel" required value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    className={inputClass} placeholder="9876543210" maxLength={10} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Email Address</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={inputClass} placeholder="vendor@company.com" />
              </div>
            </div>

            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-1">
                  <label className={labelClass}>Vendor Type *</label>
                  <select value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className={selectClass}>
                    <option value="BUSINESS">Business Entity</option>
                    <option value="INDIVIDUAL">Individual Owner</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className={labelClass}>Operating City *</label>
                  <select required value={formData.cityCodeId}
                    onChange={(e) => setFormData({...formData, cityCodeId: e.target.value})}
                    className={selectClass}>
                    <option value="">Select City</option>
                    {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName}</option>)}
                  </select>
               </div>
               <div className="space-y-1">
                <label className={labelClass}>Create Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={inputClass + " pr-10"} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Address */}
          <div className={sectionClass}>
            <button type="button" onClick={() => setShowCompliance(!showCompliance)}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#E32222]" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Compliance & Address</span>
              </div>
              {showCompliance ? <ChevronUp size={14} className="text-neutral-600" /> : <ChevronDown size={14} className="text-neutral-600" />}
            </button>
            
            {showCompliance && (
              <div className="px-5 pb-5 pt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>GST Number (Optional)</label>
                    <input type="text" value={formData.gstNumber}
                      onChange={(e) => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                      className={inputClass} placeholder="15 Digit GSTIN" />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>PAN Number (Optional)</label>
                    <input type="text" value={formData.panNumber}
                      onChange={(e) => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                      className={inputClass} placeholder="XXXXXXXXXX" maxLength={10} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Main Office Address</label>
                  <input type="text" value={formData.officeAddress}
                    onChange={(e) => setFormData({...formData, officeAddress: e.target.value})}
                    className={inputClass} placeholder="Street, Building, Area, City" />
                </div>
              </div>
            )}
          </div>

          {/* Banking Details */}
          <div className={sectionClass}>
            <button type="button" onClick={() => setShowBanking(!showBanking)}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-[#E32222]" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Payment Information</span>
              </div>
              {showBanking ? <ChevronUp size={14} className="text-neutral-600" /> : <ChevronDown size={14} className="text-neutral-600" />}
            </button>
            
            {showBanking && (
              <div className="px-5 pb-5 pt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Settlement Bank Account</label>
                    <input type="text" value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                      className={inputClass} placeholder="A/C Number for Payments" />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Secondary Contact (CC)</label>
                    <input type="tel" value={formData.ccMobile}
                      onChange={(e) => setFormData({...formData, ccMobile: e.target.value})}
                      className={inputClass} placeholder="Backup Contact" />
                  </div>
                </div>
                <div className="p-3 bg-[#E32222]/5 rounded-xl border border-[#E32222]/10 flex items-start gap-3">
                  <div className="mt-0.5"><Lock size={12} className="text-[#E32222]" /></div>
                  <p className="text-[10px] text-neutral-400 leading-relaxed font-medium">Bank details are used strictly for settlement purposes and are encrypted in our systems.</p>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#E32222] hover:bg-[#ff2a1a] text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-900/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 group">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} className="group-hover:scale-110 transition-transform" />}
            <span>{isLoading ? 'Processing Signup...' : 'Complete Registration'}</span>
          </button>
        </form>

        <p className="text-center text-neutral-500 mt-8 text-[10px] font-bold uppercase tracking-widest">
          Existing fleet owner?{' '}
          <Link href="/vendor/login" className="text-[#E32222] hover:text-[#ff4d4d] transition-colors ml-1">
            Portal Login
          </Link>
        </p>
      </div>
    </div>
  );
}
