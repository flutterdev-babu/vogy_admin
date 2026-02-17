'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorService } from '@/services/vendorService';
import { agentService } from '@/services/agentService';
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
        const res = await agentService.getCityCodes();
        if (res.success) setCityCodes(res.data || []);
      } catch (err) {
        console.error('Failed to load city codes:', err);
      }
    };
    loadCities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }
    setIsLoading(true);
    try {
      const submitData: VendorRegisterRequest = {
        name: formData.name,
        companyName: formData.companyName,
        phone: `+91${formData.phone}`,
        email: formData.email || undefined,
        password: formData.password,
        address: formData.address || undefined,
        cityCodeId: formData.cityCodeId || undefined,
        type: formData.type,
        gstNumber: formData.gstNumber || undefined,
        panNumber: formData.panNumber || undefined,
        ccMobile: formData.ccMobile || undefined,
        primaryNumber: formData.primaryNumber || undefined,
        secondaryNumber: formData.secondaryNumber || undefined,
        ownerContact: formData.ownerContact || undefined,
        officeLandline: formData.officeLandline || undefined,
        officeAddress: formData.officeAddress || undefined,
        accountNumber: formData.accountNumber || undefined,
        bankName: formData.bankName || undefined,
        ifscCode: formData.ifscCode || undefined,
        accountHolderName: formData.accountHolderName || undefined,
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

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all bg-white";
  const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link href="/dashboard/vendors" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 group text-sm">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Vendors
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create New Vendor</h1>
        <p className="text-sm text-gray-500 mt-1">Register a new fleet vendor</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#E32222] uppercase tracking-wide mb-2">Basic Information</h3>
          <div>
            <label className={labelClass}>Vendor Type *</label>
            <select value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as any})}
              className={inputClass + " appearance-none"}>
              <option value="BUSINESS">Business</option>
              <option value="INDIVIDUAL">Individual</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Company Name *</label>
            <input type="text" required value={formData.companyName}
              onChange={e => setFormData({...formData, companyName: e.target.value})}
              className={inputClass} placeholder="Ara Travels Pvt Ltd" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Owner Name *</label>
              <input type="text" required value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium">+91</span>
                <input type="tel" required value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  className="w-full border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all"
                  placeholder="9876543210" maxLength={10} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={inputClass} placeholder="vendor@company.com" />
            </div>
            <div>
              <label className={labelClass}>City Code</label>
              <select value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={inputClass + " appearance-none"}>
                <option value="">Select City</option>
                {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName} ({c.code})</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input type="text" value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className={inputClass} placeholder="Office address" />
          </div>
          <div>
            <label className={labelClass}>Password *</label>
            <input type="password" required value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className={inputClass} placeholder="Create a password" />
          </div>
          {/* Tax Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className={labelClass}>GST Number</label>
              <input type="text" value={formData.gstNumber}
                onChange={e => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                className={inputClass} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div>
              <label className={labelClass}>PAN Number</label>
              <input type="text" value={formData.panNumber}
                onChange={e => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                className={inputClass} placeholder="ABCDE1234F" />
            </div>
          </div>
        </div>

        {/* Contact Details (Collapsible) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <button type="button" onClick={() => setShowContact(!showContact)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <span className="font-semibold text-gray-700 text-sm">Contact Details</span>
            {showContact ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {showContact && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>CC Mobile</label>
                  <input type="tel" value={formData.ccMobile}
                    onChange={e => setFormData({...formData, ccMobile: e.target.value})}
                    className={inputClass} placeholder="+91..." />
                </div>
                <div>
                  <label className={labelClass}>Primary Number</label>
                  <input type="tel" value={formData.primaryNumber}
                    onChange={e => setFormData({...formData, primaryNumber: e.target.value})}
                    className={inputClass} placeholder="+91..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Secondary Number</label>
                  <input type="tel" value={formData.secondaryNumber}
                    onChange={e => setFormData({...formData, secondaryNumber: e.target.value})}
                    className={inputClass} placeholder="+91..." />
                </div>
                <div>
                  <label className={labelClass}>Owner Contact</label>
                  <input type="tel" value={formData.ownerContact}
                    onChange={e => setFormData({...formData, ownerContact: e.target.value})}
                    className={inputClass} placeholder="+91..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Office Landline</label>
                  <input type="tel" value={formData.officeLandline}
                    onChange={e => setFormData({...formData, officeLandline: e.target.value})}
                    className={inputClass} placeholder="080-12345678" />
                </div>
                <div>
                  <label className={labelClass}>Office Address</label>
                  <input type="text" value={formData.officeAddress}
                    onChange={e => setFormData({...formData, officeAddress: e.target.value})}
                    className={inputClass} placeholder="Office address" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Banking Details (Collapsible) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <button type="button" onClick={() => setShowBanking(!showBanking)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <span className="font-semibold text-gray-700 text-sm">Banking Details</span>
            {showBanking ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>
          {showBanking && (
            <div className="px-6 pb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Account Number</label>
                  <input type="text" value={formData.accountNumber}
                    onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                    className={inputClass} placeholder="Enter account number" />
                </div>
                <div>
                  <label className={labelClass}>Bank Name</label>
                  <input type="text" value={formData.bankName}
                    onChange={e => setFormData({...formData, bankName: e.target.value})}
                    className={inputClass} placeholder="Bank name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>IFSC Code</label>
                  <input type="text" value={formData.ifscCode}
                    onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                    className={inputClass} placeholder="SBIN0001234" />
                </div>
                <div>
                  <label className={labelClass}>Account Holder Name</label>
                  <input type="text" value={formData.accountHolderName}
                    onChange={e => setFormData({...formData, accountHolderName: e.target.value})}
                    className={inputClass} placeholder="Name as per bank" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-semibold text-sm shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Building2 size={20} />}
          <span>{isLoading ? 'Creating Vendor...' : 'Create Vendor'}</span>
        </button>
      </form>
    </div>
  );
}
