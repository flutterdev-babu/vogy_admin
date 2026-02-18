'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorService } from '@/services/vendorService';
import { cityCodeService } from '@/services/cityCodeService';
import { VendorRegisterRequest } from '@/types';

export default function AdminCreateVendorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showBanking, setShowBanking] = useState(false);
  const [cityCodes, setCityCodes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    cityCodeId: '',
    type: 'BUSINESS' as 'INDIVIDUAL' | 'BUSINESS',
    // Tax
    gstNumber: '',
    panNumber: '',
    // Contact
    ccMobile: '',
    primaryNumber: '',
    secondaryNumber: '',
    ownerContact: '',
    officeLandline: '',
    officeAddress: '',
    // Banking
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    accountHolderName: '',
  });

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await cityCodeService.getAll();
        if (res.success) setCityCodes(res.data || []);
      } catch (err) {
        console.error('Failed to load city codes:', err);
      }
    };
    loadCities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submitData: VendorRegisterRequest = {
        name: formData.name, // Owner Name
        companyName: formData.companyName, // Business Name
        phone: `+91${formData.primaryNumber}`, // Use primary number as main phone
        email: formData.email || undefined,
        password: formData.password || 'Vendor@123',
        address: formData.officeAddress || undefined,
        cityCodeId: formData.cityCodeId || undefined,
        type: 'BUSINESS',
        gstNumber: formData.gstNumber || undefined,
        panNumber: formData.panNumber || undefined,
        ccMobile: formData.ccMobile || undefined,
        primaryNumber: formData.primaryNumber || undefined,
        secondaryNumber: formData.secondaryNumber || undefined,
        ownerContact: formData.ownerContact || undefined,
        officeLandline: formData.officeLandline || undefined,
        officeAddress: formData.officeAddress || undefined,
        accountNumber: formData.accountNumber || undefined,
        // Optional banking fields that are no longer in UI
        bankName: undefined,
        ifscCode: undefined,
        accountHolderName: undefined,
      };
      const response = await vendorService.createVendor(submitData);
      if (response.success) {
        toast.success('Vendor created successfully!');
        router.push('/dashboard/vendors');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create vendor');
    } finally {
      setIsLoading(false);
    }
  };

  const inputGroupClass = "flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#E32222] focus-within:ring-1 focus-within:ring-[#E32222]/30 transition-all bg-white shadow-sm";
  const labelSideClass = "px-4 py-2.5 bg-gray-50 border-r border-gray-100 text-[10px] font-bold text-red-600 uppercase tracking-wide min-w-[140px] whitespace-nowrap";
  const fieldClass = "flex-1 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none";

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Link href="/dashboard/vendors" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 group text-sm">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Vendors
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create New Vendor</h1>
        <p className="text-sm text-gray-500 mt-1">Register a new fleet vendor via admin</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-800">Vendor Details</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Owner Name</label>
                <input type="text" required value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={fieldClass} placeholder="Enter Owner Name" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Company Name</label>
                <input type="text" required value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className={fieldClass} placeholder="Enter Company Name" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>GST Number</label>
                <input type="text" value={formData.gstNumber}
                  onChange={e => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                  className={fieldClass} placeholder="Enter GST Number" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>PAN Number</label>
                <input type="text" value={formData.panNumber}
                  onChange={e => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                  className={fieldClass} placeholder="XXXXXXXXXX" maxLength={10} />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Email</label>
                <input type="email" value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={fieldClass} placeholder="Enter Email" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Select City</label>
                <select value={formData.cityCodeId}
                  onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                  className={`${fieldClass} appearance-none bg-white`}>
                  <option value="">Select City Code</option>
                  {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName} ({c.code})</option>)}
                </select>
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>CC Mobile</label>
                <input type="tel" value={formData.ccMobile}
                  onChange={e => setFormData({...formData, ccMobile: e.target.value})}
                  className={fieldClass} placeholder="Enter Mobile Number" />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Vendor Account Number</label>
                <input type="text" value={formData.accountNumber}
                  onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                  className={fieldClass} placeholder="Enter Account Number" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Vendor Office Address</label>
                <input type="text" value={formData.officeAddress}
                  onChange={e => setFormData({...formData, officeAddress: e.target.value})}
                  className={fieldClass} placeholder="Enter Office Address" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Primary Number</label>
                <input type="tel" required value={formData.primaryNumber}
                  onChange={e => setFormData({...formData, primaryNumber: e.target.value})}
                  className={fieldClass} placeholder="Enter Primary Number" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Secondary Number</label>
                <input type="tel" value={formData.secondaryNumber}
                  onChange={e => setFormData({...formData, secondaryNumber: e.target.value})}
                  className={fieldClass} placeholder="Enter Secondary Number" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Owner Contact</label>
                <input type="tel" value={formData.ownerContact}
                  onChange={e => setFormData({...formData, ownerContact: e.target.value})}
                  className={fieldClass} placeholder="Enter Owner Contact Number" />
              </div>
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Office Landline</label>
                <input type="tel" value={formData.officeLandline}
                  onChange={e => setFormData({...formData, officeLandline: e.target.value})}
                  className={fieldClass} placeholder="Enter Landline Number" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-8">
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
