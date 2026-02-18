'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Loader2, Car, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorService } from '@/services/vendorService';
import { VendorRegisterRequest } from '@/types';

export default function VendorRegisterPage() {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    companyName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    cityCode: '',
    type: 'BUSINESS' as 'INDIVIDUAL' | 'BUSINESS',
    // Contact Details
    gstNumber: '',
    panNumber: '',
    ccMobile: '',
    primaryNumber: '',
    secondaryNumber: '',
    ownerContact: '',
    officeLandline: '',
    officeAddress: '',
    // Banking Details
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showBankingDetails, setShowBankingDetails] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submitData: VendorRegisterRequest = {
        ...formData,
        phone: `+91${formData.phone}`,
        cityCodeId: formData.cityCode || undefined,
      };
      const response = await vendorService.register(submitData as any);
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

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/50 transition-all";

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E32222]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to home</span>
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#E32222]/10 border border-[#E32222]/20 mb-6 shadow-[0_0_20px_rgba(227,34,34,0.1)]">
            <Car size={36} className="text-[#E32222]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Vendor Registration</h1>
          <p className="text-neutral-400">Register your fleet with Ara</p>
        </div>

        <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#E32222] uppercase tracking-wide">Basic Information</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 ml-1">Vendor Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className={inputClass + " appearance-none"}
                >
                  <option value="BUSINESS">Business</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 ml-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className={inputClass}
                  placeholder="Ara Travels Pvt Ltd"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={inputClass}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">Phone *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 bg-white/10 border border-r-0 border-white/10 rounded-l-xl text-neutral-400 text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="w-full bg-white/5 border border-white/10 rounded-r-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/50 transition-all"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={inputClass}
                    placeholder="vendor@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">City Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.cityCode}
                    onChange={(e) => setFormData({...formData, cityCode: e.target.value})}
                    className={inputClass}
                    placeholder="Ex: BLR, BOM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 ml-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={inputClass}
                  placeholder="Office address"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 ml-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={inputClass + " pr-12"}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Details (Collapsible) */}
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowContactDetails(!showContactDetails)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="font-medium text-neutral-300">Contact & Tax Details (Optional)</span>
                {showContactDetails ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
              </button>
              
              {showContactDetails && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">GST Number</label>
                      <input
                        type="text"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                        className={inputClass}
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">PAN Number</label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                        className={inputClass}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">CC Mobile</label>
                      <input
                        type="tel"
                        value={formData.ccMobile}
                        onChange={(e) => setFormData({...formData, ccMobile: e.target.value})}
                        className={inputClass}
                        placeholder="+91..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Primary Contact</label>
                      <input
                        type="tel"
                        value={formData.primaryNumber}
                        onChange={(e) => setFormData({...formData, primaryNumber: e.target.value})}
                        className={inputClass}
                        placeholder="+91..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Secondary Contact</label>
                      <input
                        type="tel"
                        value={formData.secondaryNumber}
                        onChange={(e) => setFormData({...formData, secondaryNumber: e.target.value})}
                        className={inputClass}
                        placeholder="+91..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Owner Contact</label>
                      <input
                        type="tel"
                        value={formData.ownerContact}
                        onChange={(e) => setFormData({...formData, ownerContact: e.target.value})}
                        className={inputClass}
                        placeholder="+91..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Office Landline</label>
                      <input
                        type="tel"
                        value={formData.officeLandline}
                        onChange={(e) => setFormData({...formData, officeLandline: e.target.value})}
                        className={inputClass}
                        placeholder="080-12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Office Address</label>
                      <input
                        type="text"
                        value={formData.officeAddress}
                        onChange={(e) => setFormData({...formData, officeAddress: e.target.value})}
                        className={inputClass}
                        placeholder="Office address"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Banking Details (Collapsible) */}
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowBankingDetails(!showBankingDetails)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="font-medium text-neutral-300">Banking Details (Optional)</span>
                {showBankingDetails ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
              </button>
              
              {showBankingDetails && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Account Number</label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                        className={inputClass}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                        className={inputClass}
                        placeholder="Bank name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">IFSC Code</label>
                      <input
                        type="text"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                        className={inputClass}
                        placeholder="SBIN0001234"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={formData.accountHolderName}
                        onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                        className={inputClass}
                        placeholder="Name as per bank"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-semibold text-lg shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <UserPlus size={22} />
              )}
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          <p className="text-center text-neutral-400 mt-8">
            Already have an account?{' '}
            <Link
              href="/vendor/login"
              className="text-[#E32222] hover:text-[#ff4d4d] font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
