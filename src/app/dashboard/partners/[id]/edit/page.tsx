'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Loader2, Save, ShieldCheck, CreditCard, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerService } from '@/services/partnerService';
import { cityCodeService } from '@/services/cityCodeService';
import { DocImageInput } from '@/components/ui/DocImageInput';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cityCodes, setCityCodes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    cityCodeId: '',
    dateOfBirth: '',
    gender: '',
    localAddress: '',
    panNumber: '',
    panImage: '',
    aadhaarNumber: '',
    aadhaarImage: '',
    licenseNumber: '',
    licenseImage: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityRes, partnerRes] = await Promise.all([
          cityCodeService.getAll(),
          partnerService.getById(id)
        ]);
        
        if (cityRes.success) setCityCodes(cityRes.data || []);
        
        if (partnerRes.success && partnerRes.data) {
          const p = partnerRes.data;
          const nameParts = p.name ? p.name.split(' ') : ['', ''];
          setFormData({
            firstName: p.firstName || nameParts[0] || '',
            lastName: p.lastName || nameParts.slice(1).join(' ') || '',
            phone: p.phone.replace('+91', ''),
            email: p.email || '',
            cityCodeId: p.cityCode?.id || '',
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
            gender: p.gender || '',
            localAddress: p.localAddress || '',
            panNumber: p.panNumber || '',
            panImage: p.panImage || '',
            aadhaarNumber: p.aadhaarNumber || '',
            aadhaarImage: p.aadhaarImage || '',
            licenseNumber: p.licenseNumber || '',
            licenseImage: p.licenseImage || '',
            bankName: p.bankName || '',
            accountNumber: p.accountNumber || '',
            ifscCode: p.ifscCode || '',
          });
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        toast.error('Failed to load partner details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }
    setIsSaving(true);
    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: `+91${formData.phone}`,
        email: formData.email || undefined,
        cityCodeId: formData.cityCodeId,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        localAddress: formData.localAddress || undefined,
        panNumber: formData.panNumber || undefined,
        panImage: formData.panImage || undefined,
        aadhaarNumber: formData.aadhaarNumber || undefined,
        aadhaarImage: formData.aadhaarImage || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        licenseImage: formData.licenseImage || undefined,
        bankName: formData.bankName || undefined,
        accountNumber: formData.accountNumber || undefined,
        ifscCode: formData.ifscCode || undefined,
      };

      const response = await partnerService.updatePartner(id, updateData);
      if (response.success) {
        toast.success('Partner updated successfully!');
        router.push('/dashboard/partners');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update partner');
    } finally {
      setIsSaving(false);
    }
  };

  const inputGroupClass = "flex flex-col gap-1";
  const labelClass = "text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1";
  const fieldClass = "w-full px-3 py-2 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/10 transition-all bg-white shadow-sm hover:border-gray-300 font-medium h-10";
  const selectClass = "w-full px-3 py-2 text-xs text-gray-800 appearance-none border border-gray-200 rounded-xl focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/10 transition-all bg-white shadow-sm hover:border-gray-300 font-medium cursor-pointer h-10";

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12 px-4 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard/partners" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#E32222] transition-colors mb-2 group text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Partners
          </Link>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight italic uppercase leading-none">Edit Partner</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">ID: {id}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
          <User size={24} className="text-blue-600" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section: Basic Identity */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <User size={14} className="text-[#E32222]" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Basics</h2>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className={inputGroupClass}>
              <label className={labelClass}>First Name *</label>
              <input type="text" required value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className={fieldClass} placeholder="First name" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Last Name *</label>
              <input type="text" required value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className={fieldClass} placeholder="Last name" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Mobile *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">+91</span>
                <input type="tel" required value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  className={fieldClass + " pl-10"} placeholder="Mobile" maxLength={10} />
              </div>
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Email (Optional)</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={fieldClass} placeholder="Email" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Gender</label>
              <select value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className={selectClass}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" value={formData.dateOfBirth}
                onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                className={fieldClass} />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Operational City *</label>
              <select required value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={selectClass}>
                <option value="">Choose City</option>
                {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section: KYC & Documents */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#E32222]" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">KYC Documents</h2>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* PAN Card */}
            <div className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className={inputGroupClass}>
                <label className={labelClass}>PAN Card Number</label>
                <input type="text" value={formData.panNumber}
                  onChange={e => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                  className={fieldClass} placeholder="Enter PAN Number" maxLength={10} />
              </div>
              <DocImageInput 
                label="PAN Card Image" 
                value={formData.panImage} 
                onChange={(val) => setFormData({...formData, panImage: val})} 
              />
            </div>

            {/* Aadhaar Card */}
            <div className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className={inputGroupClass}>
                <label className={labelClass}>Aadhaar Number</label>
                <input type="text" value={formData.aadhaarNumber}
                  onChange={e => setFormData({...formData, aadhaarNumber: e.target.value.replace(/\D/g, '')})}
                  className={fieldClass} placeholder="12 Digit Aadhaar" maxLength={12} />
              </div>
              <DocImageInput 
                label="Aadhaar Image" 
                value={formData.aadhaarImage} 
                onChange={(val) => setFormData({...formData, aadhaarImage: val})} 
              />
            </div>

            {/* Driving License */}
            <div className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className={inputGroupClass}>
                <label className={labelClass}>DL Number</label>
                <input type="text" value={formData.licenseNumber}
                  onChange={e => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})}
                  className={fieldClass} placeholder="Enter DL Number" />
              </div>
              <DocImageInput 
                label="License Image" 
                value={formData.licenseImage} 
                onChange={(val) => setFormData({...formData, licenseImage: val})} 
              />
            </div>
          </div>
          
          <div className="px-5 pb-5">
            <div className={inputGroupClass}>
              <label className={labelClass}>Residential Address</label>
              <textarea value={formData.localAddress}
                onChange={e => setFormData({...formData, localAddress: e.target.value})}
                className={fieldClass + " h-16 py-2 resize-none"} placeholder="Enter current residential address" />
            </div>
          </div>
        </div>

        {/* Section: Banking */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <CreditCard size={14} className="text-[#E32222]" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Banking & Payouts</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={inputGroupClass}>
              <label className={labelClass}>Bank Name</label>
              <input type="text" value={formData.bankName}
                onChange={e => setFormData({...formData, bankName: e.target.value})}
                className={fieldClass} placeholder="Bank name" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Account Number</label>
              <input type="text" value={formData.accountNumber}
                onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                className={fieldClass} placeholder="Account number" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>IFSC Code</label>
              <input type="text" value={formData.ifscCode}
                onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                className={fieldClass} placeholder="IFSC Code" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900 rounded-2xl gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Save size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Update Information</p>
              <p className="text-[10px] text-white/60 font-medium">Verify any changed identity documents carefully.</p>
            </div>
          </div>
          <button type="submit" disabled={isSaving}
            className="w-full md:w-auto px-8 h-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Saving...' : 'Update Partner'}
          </button>
        </div>
      </form>
    </div>
  );
}
