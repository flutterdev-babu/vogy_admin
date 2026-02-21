'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Loader2, Save, ShieldCheck, CreditCard, MapPin, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorService } from '@/services/vendorService';
import { cityCodeService } from '@/services/cityCodeService';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cityCodes, setCityCodes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    cityCodeId: '',
    type: 'BUSINESS' as 'INDIVIDUAL' | 'BUSINESS',
    gstNumber: '',
    panNumber: '',
    ccMobile: '',
    accountNumber: '',
    officeAddress: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityRes, vendorRes] = await Promise.all([
          cityCodeService.getAll(),
          vendorService.getById(id)
        ]);
        
        if (cityRes.success) setCityCodes(cityRes.data || []);
        
        if (vendorRes.success && vendorRes.data) {
          const v = vendorRes.data;
          setFormData({
            name: v.name || '',
            companyName: v.companyName || '',
            phone: v.phone.replace('+91', ''),
            email: v.email || '',
            cityCodeId: v.cityCode?.id || '',
            type: v.type || 'BUSINESS',
            gstNumber: v.gstNumber || '',
            panNumber: v.panNumber || '',
            ccMobile: v.ccMobile || '',
            accountNumber: v.accountNumber || '',
            officeAddress: v.officeAddress || '',
          });
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        toast.error('Failed to load vendor details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.companyName || !formData.phone || !formData.cityCodeId) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSaving(true);
    try {
      const updateData: any = {
        name: formData.name,
        companyName: formData.companyName,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
        email: formData.email || undefined,
        cityCodeId: formData.cityCodeId,
        type: formData.type,
        gstNumber: formData.gstNumber || undefined,
        panNumber: formData.panNumber || undefined,
        ccMobile: formData.ccMobile || undefined,
        accountNumber: formData.accountNumber || undefined,
        officeAddress: formData.officeAddress || undefined,
      };

      const response = await vendorService.updateVendor(id, updateData);
      if (response.success) {
        toast.success('Vendor updated successfully!');
        router.push('/dashboard/vendors');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vendor');
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
          <Link href="/dashboard/vendors" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#E32222] transition-colors mb-2 group text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Vendors
          </Link>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight italic uppercase leading-none">Edit Vendor</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">ID: {id}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
          <Building2 size={24} className="text-[#E32222]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Info */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <Info size={14} className="text-[#E32222]" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Primary Details</h2>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className={inputGroupClass}>
              <label className={labelClass}>Owner Name *</label>
              <input type="text" required value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className={fieldClass} placeholder="Full Name" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Company Name *</label>
              <input type="text" required value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className={fieldClass} placeholder="Legal Name" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Primary Phone *</label>
              <input type="tel" required value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className={fieldClass} placeholder="10 Digit Number" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Email Address</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={fieldClass} placeholder="Optional" />
            </div>
          </div>

          <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-50 pt-4 bg-gray-50/30">
            <div className={inputGroupClass}>
              <label className={labelClass}>Operation City *</label>
              <select required value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={selectClass}>
                <option value="">Select City</option>
                {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName}</option>)}
              </select>
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Vendor Type</label>
              <select value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
                className={selectClass}>
                <option value="BUSINESS">Business Entity</option>
                <option value="INDIVIDUAL">Individual Owner</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tax & Banking */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#E32222]" />
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Compliance & Banking</h2>
          </div>
          
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={inputGroupClass}>
              <label className={labelClass}>GST Number</label>
              <input type="text" value={formData.gstNumber}
                onChange={e => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                className={fieldClass} placeholder="15 Digit GSTIN" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>PAN Number</label>
              <input type="text" value={formData.panNumber}
                onChange={e => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                className={fieldClass} placeholder="XXXXXXXXXX" maxLength={10} />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Account Number</label>
              <input type="text" value={formData.accountNumber}
                onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                className={fieldClass} placeholder="Primary Bank A/C" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass}>Secondary Phone</label>
              <input type="tel" value={formData.ccMobile}
                onChange={e => setFormData({...formData, ccMobile: e.target.value})}
                className={fieldClass} placeholder="CC Mobile" />
            </div>
          </div>

          <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50/30">
            <div className={inputGroupClass}>
              <label className={labelClass}>Office Address</label>
              <input type="text" value={formData.officeAddress}
                onChange={e => setFormData({...formData, officeAddress: e.target.value})}
                className={fieldClass} placeholder="Building, Street, Area, City" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-900 rounded-2xl gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Save size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Update Vendor</p>
              <p className="text-[10px] text-white/60 font-medium">Changes will be reflected in the vendor portal immediately.</p>
            </div>
          </div>
          <button type="submit" disabled={isSaving}
            className="w-full md:w-auto px-10 h-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Processing' : 'Update Vendor'}
          </button>
        </div>
      </form>
    </div>
  );
}
