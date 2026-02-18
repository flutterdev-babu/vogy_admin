'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Loader2, ChevronDown, ChevronUp, Car, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerService } from '@/services/partnerService';
import { cityCodeService } from '@/services/cityCodeService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { vendorService } from '@/services/vendorService';
import { PartnerRegisterRequest } from '@/types';

export default function AdminCreatePartnerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [cityCodes, setCityCodes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: 'Partner@123', // Default password
    cityCodeId: '',
    // Personal
    dateOfBirth: '',
    gender: '',
    localAddress: '',
    permanentAddress: '',
    // License
    hasLicense: true,
    licenseNumber: '',
    licenseImage: '',
    // Deprecated fields removed
  });

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const cityRes = await cityCodeService.getAll();
        if (cityRes.success) setCityCodes(cityRes.data || []);
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
      const submitData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: `+91${formData.phone}`,
        email: formData.email || undefined,
        password: formData.password,
        
        // Governance
        cityCodeId: formData.cityCodeId,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        localAddress: formData.localAddress,
        permanentAddress: formData.permanentAddress,
        
        // License
        hasLicense: true,
        licenseNumber: formData.licenseNumber,
        licenseImage: formData.licenseImage,
      };

      console.log('Sending Admin Partner Creation Request:', submitData);
      const response = await partnerService.createPartner(submitData);
      console.log('Admin Partner Creation Response:', response);

      if (response.success) {
        toast.success('Partner created successfully!');
        router.push('/dashboard/partners');
      }
    } catch (error: any) {
      console.error('Admin Partner Creation Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Failed to create partner');
    } finally {
      setIsLoading(false);
    }
  };

  const inputGroupClass = "flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#E32222] focus-within:ring-2 focus-within:ring-[#E32222]/10 transition-all bg-white shadow-sm hover:border-gray-300";
  const labelSideClass = "px-4 py-3 bg-gray-50/80 border-r border-gray-100 text-[9px] font-black text-red-600 uppercase tracking-[0.15em] min-w-[130px] whitespace-nowrap flex items-center justify-center text-center";
  const fieldClass = "flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent font-medium";
  const selectClass = "flex-1 px-4 py-3 text-sm text-gray-800 appearance-none bg-transparent focus:outline-none cursor-pointer font-medium";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/partners" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#E32222] transition-colors mb-3 group text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Partner Directory
          </Link>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight italic uppercase">Create New Partner</h1>
          <p className="text-sm text-gray-500 font-medium">Register and authorize a new driver partner in the system</p>
        </div>
        <div className="w-16 h-16 rounded-[20px] bg-red-50 flex items-center justify-center border border-red-100">
          <UserPlus size={28} className="text-[#E32222]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity & Basic Info */}
        <div className="bg-white rounded-[32px] border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Identity & Communication</h2>
            <span className="px-3 py-1 bg-red-50 text-[#E32222] text-[10px] font-black rounded-full uppercase tracking-wider">Required Fields</span>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={inputGroupClass}>
                <label className={labelSideClass}>First Name</label>
                <input type="text" required value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className={fieldClass} placeholder="Enter First Name" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Last Name</label>
                <input type="text" required value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className={fieldClass} placeholder="Enter Last Name" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Mobile Number</label>
                <div className="flex-1 flex items-center">
                  <span className="pl-4 text-xs font-bold text-gray-400 border-r border-gray-100 pr-3">+91</span>
                  <input type="tel" required value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    className={fieldClass} placeholder="10 Digit Number" maxLength={10} />
                </div>
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Email Address</label>
                <input type="email" value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={fieldClass} placeholder="example@email.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Date of Birth</label>
                <input type="date" value={formData.dateOfBirth}
                  onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                  className={fieldClass} />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Gender</label>
                <select value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                  className={selectClass}>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Association & Location */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-[32px] border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Regional & Address</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={inputGroupClass}>
                  <label className={labelSideClass}>Assign City</label>
                  <select value={formData.cityCodeId}
                    onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                    className={selectClass}>
                    <option value="">Choose Operational City</option>
                    {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName} ({c.code})</option>)}
                  </select>
                </div>
                <div className={inputGroupClass}>
                  <label className={labelSideClass}>Local Address</label>
                  <input type="text" required value={formData.localAddress}
                    onChange={e => setFormData({...formData, localAddress: e.target.value})}
                    className={fieldClass} placeholder="Enter current residential address" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* License Details */}
        <div className="bg-white rounded-[32px] border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Statutory Compliance</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={inputGroupClass}>
                <label className={labelSideClass}>License Number</label>
                <input type="text" required value={formData.licenseNumber}
                  onChange={e => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})}
                  className={fieldClass} placeholder="Enter DL Number" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>DL Image URL</label>
                <input type="text" required value={formData.licenseImage}
                  onChange={e => setFormData({...formData, licenseImage: e.target.value})}
                  className={fieldClass} placeholder="Enter Image URL" />
              </div>
            </div>
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Permanent Address</label>
              <input type="text" value={formData.permanentAddress}
                onChange={e => setFormData({...formData, permanentAddress: e.target.value})}
                className={fieldClass} placeholder="Address as per Documentation" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-200/60 mt-8">
          <div className="px-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Security Defaults</p>
            <p className="text-xs font-bold text-gray-600 italic">User will be assigned password: <span className="text-[#E32222]">{formData.password}</span></p>
          </div>
          <button type="submit" disabled={isLoading}
            className="px-12 h-14 bg-gray-800 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} className="text-[#E32222]" />}
            Authorize Partner
          </button>
        </div>
      </form>
    </div>
  );
}
