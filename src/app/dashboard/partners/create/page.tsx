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
    password: 'Partner@123', // Default password
    cityCodeId: '',
    vendorId: '',
    vendorCustomId: '',
    profileImage: '',
    // Personal
    dateOfBirth: '',
    gender: '',
    localAddress: '',
    permanentAddress: '',
    aadharNumber: '',
    // License
    hasLicense: true,
    licenseNumber: '',
    licenseImage: '',
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
          cityCodeService.getAll(),
          vehicleTypeService.getAll(),
          vendorService.getAll(),
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
        vendorCustomId: formData.vendorCustomId || undefined,
        profileImage: formData.profileImage || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender ? (formData.gender as any) : undefined,
        localAddress: formData.localAddress || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        hasLicense: true, // As per spec, must be true
        licenseNumber: formData.licenseNumber || undefined,
        licenseImage: formData.licenseImage || undefined,
        // Empty fields for backend compatibility
        aadharNumber: undefined,
        hasOwnVehicle: false,
        ownVehicleNumber: undefined,
        ownVehicleModel: undefined,
        ownVehicleTypeId: undefined,
        bankAccountNumber: undefined,
        upiId: undefined,
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

  const inputGroupClass = "flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#E32222] focus-within:ring-1 focus-within:ring-[#E32222]/30 transition-all bg-white shadow-sm";
  const labelSideClass = "px-4 py-2.5 bg-gray-50 border-r border-gray-100 text-[10px] font-bold text-red-600 uppercase tracking-wide min-w-[120px] whitespace-nowrap";
  const fieldClass = "flex-1 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none";
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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-800">Partner Details</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Row 1: Names, Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Mobile Number</label>
              <input type="tel" required value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                className={fieldClass} placeholder="Enter Mobile Number" maxLength={10} />
            </div>
          </div>

          {/* Row 2: Addresses, Email, DOB, Profile Image */}
          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 h-full">
                  <div className={`${inputGroupClass} h-full items-start`}>
                    <label className={`${labelSideClass} h-full pt-3`}>Local (Current) Address</label>
                    <textarea required value={formData.localAddress}
                      onChange={e => setFormData({...formData, localAddress: e.target.value})}
                      className={`${fieldClass} resize-none h-24`} placeholder="Enter the Local or Current Address of the Partner" />
                  </div>
                </div>
                
                <div className="lg:col-span-7 space-y-4">
                  <div className={inputGroupClass}>
                    <label className={labelSideClass}>Email</label>
                    <input type="email" value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className={fieldClass} placeholder="Enter Email" />
                  </div>
                  <div className={inputGroupClass}>
                    <label className={labelSideClass}>Date of Birth</label>
                    <div className="flex-1 relative flex items-center">
                      <input type="date" value={formData.dateOfBirth}
                        onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                        className={`${fieldClass} pr-10`} />
                      <div className="absolute right-0 top-0 bottom-0 px-3 bg-[#E32222] flex items-center justify-center rounded-r-xl border-l border-red-700 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-0 min-w-[140px]">
              <div className="w-32 h-24 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white relative group cursor-pointer overflow-hidden mb-0">
                {formData.profileImage ? (
                  <img src={formData.profileImage} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-dashed border-gray-400 flex items-center justify-center">
                      <Plus size={16} className="text-gray-400" />
                    </div>
                  </div>
                )}
                <input type="text" value={formData.profileImage}
                  onChange={e => setFormData({...formData, profileImage: e.target.value})}
                  className="absolute inset-0 opacity-0 cursor-pointer" title="Enter profile image URL" />
              </div>
              <button type="button" className="w-full py-2 bg-[#E32222] text-white text-[10px] font-bold rounded-b-lg uppercase tracking-wider">
                Profile Image
              </button>
            </div>
          </div>

          {/* Row 3: Permanent Address, Gender, City Code */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Permanent Address</label>
                <input type="text" value={formData.permanentAddress}
                  onChange={e => setFormData({...formData, permanentAddress: e.target.value})}
                  className={fieldClass} placeholder="Enter address as on Aadhar Card" />
              </div>
            </div>
            <div className="lg:col-span-3">
              <select value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className={`${fieldClass} border border-gray-200 rounded-xl px-4 py-2.5 appearance-none bg-white w-full h-[42px]`}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <select value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={`${fieldClass} border border-gray-200 rounded-xl px-4 py-2.5 appearance-none bg-white w-full h-[42px]`}>
                <option value="">Select City Code</option>
                {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName} ({c.code})</option>)}
              </select>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 -mx-6 -mt-4 mb-4">
            <h2 className="text-base font-bold text-gray-800">License Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={inputGroupClass}>
              <label className={labelSideClass}>License Number</label>
              <input type="text" required value={formData.licenseNumber}
                onChange={e => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})}
                className={fieldClass} placeholder="Enter License Number" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelSideClass}>License Image URL</label>
              <input type="text" required value={formData.licenseImage}
                onChange={e => setFormData({...formData, licenseImage: e.target.value})}
                className={fieldClass} placeholder="Enter Image URL" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isLoading}
              className="px-10 py-2.5 bg-[#94a3b8] hover:bg-[#64748b] text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2">
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
