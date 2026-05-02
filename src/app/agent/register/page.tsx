'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Briefcase, ArrowLeft, UserPlus, MapPin, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { agentService } from '@/services/agentService';
import { PremiumSelect, PremiumSelectOption } from '@/components/ui/PremiumSelect';



export default function AgentRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    cityCodeId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cityCodes, setCityCodes] = useState<{ id: string; code: string; cityName: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadCityCodes = async () => {
      try {
        const response = await agentService.getCityCodes();
        if (response.success && response.data && response.data.length > 0) {
          setCityCodes(response.data);
        } else {
          toast.error('No operating cities found. Please contact support.');
        }
      } catch (error) {
        console.error('Failed to load city codes:', error);
        toast.error('Service error: Could not load operating cities');
      }
    };
    loadCityCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cityCodeId) return toast.error('Please select a City Location');
    if (formData.phone.length !== 10) return toast.error('Phone number must be 10 digits');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    
    // Prevent double submission
    if (isLoading) return;
    setIsLoading(true);
    try {
      const submitData = { ...formData, phone: `+91${formData.phone}` };
      const response = await agentService.register(submitData as any);
      if (response.success) {
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => router.push('/agent/login'), 2000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const labelClass = "text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-1.5 block";
  const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/20 transition-all hover:bg-white/[0.05]";

  const cityOptions: PremiumSelectOption[] = cityCodes.map(c => ({ 
    id: c.id, 
    label: c.cityName, 
    subLabel: c.code 
  }));

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 py-20 selection:bg-[#E32222]/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#E32222]/03 rounded-full blur-[120px] -ml-32 -mt-32" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-600/[0.02] rounded-full blur-[120px] -mr-32 -mb-32" />
      </div>

      <div className="relative z-10 w-full max-w-xl animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-all mb-10 group text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-[#E32222]/05 border border-white/5 mb-8 shadow-2xl backdrop-blur-xl group hover:border-[#E32222]/20 transition-colors">
            <Briefcase size={36} className="text-[#E32222] group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-5xl font-black text-white italic uppercase leading-none tracking-tighter">Ops Agent</h1>
          <p className="text-neutral-500 text-[10px] font-black mt-3 uppercase tracking-[0.3em]">Join the Ara Operations Team</p>
        </div>

        <div className="rounded-[40px] bg-[#0F0F0F] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className={labelClass}>Full Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="John Doe" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>Phone *</label>
                  <div className="flex">
                    <span className="px-4 py-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-[10px] font-black text-neutral-500 flex items-center tracking-widest">+91</span>
                    <input type="tel" required value={formData.phone} onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '');
                      if (v.length > 10 && v.startsWith('91')) v = v.slice(2);
                      setFormData({...formData, phone: v.slice(0, 10)});
                    }} className={inputClass + " rounded-l-none"} placeholder="10 Digit Number" maxLength={10} />
                  </div>
                </div>
                
                <PremiumSelect 
                  label="Station Location *" 
                  options={cityOptions} 
                  value={formData.cityCodeId} 
                  onChange={v => setFormData({...formData, cityCodeId: v})} 
                  placeholder="Select Station" 
                  required 
                  icon={<MapPin size={16} />}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Corporate Email *</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="agent@aratravels.in" />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Create Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass + " pr-12"} placeholder="Security Key" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col items-center">
              <button type="submit" disabled={isLoading} className="group relative w-full h-16 rounded-[24px] bg-[#E32222] hover:bg-[#ff1a1a] text-white font-black uppercase tracking-[0.3em] text-sm transition-all shadow-[0_24px_48px_-12px_rgba(227,34,34,0.5)] active:scale-[0.98] disabled:opacity-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isLoading ? <Loader2 size={24} className="animate-spin mx-auto" /> : <span>Confirm Onboarding</span>}
              </button>
              
              <Link href="/agent/login" className="mt-8 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-[#E32222] transition-colors border-b border-white/5 pb-1">
                Already registered? Secure Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
