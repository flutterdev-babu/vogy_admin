'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Loader2, Users, ArrowLeft, ChevronDown, ChevronUp, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerService } from '@/services/partnerService';
import { agentService } from '@/services/agentService';
import { PartnerRegisterRequest } from '@/types';

export default function PartnerRegisterPage() {
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    cityCodeId: '',
    vendorCustomId: '',
    // Personal Details
    localAddress: '',
    permanentAddress: '',
    aadharNumber: '',
    licenseNumber: '',
    licenseImage: '',
    dateOfBirth: '',
    gender: '' as any,
    // Banking Details
    bankAccountNumber: '',
    upiId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonalDetails, setShowPersonalDetails] = useState(false);
  const [showBankingDetails, setShowBankingDetails] = useState(false);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [cityCodes, setCityCodes] = useState<any[]>([]);
  const router = useRouter();

  // Own Vehicle fields
  const [hasOwnVehicle, setHasOwnVehicle] = useState(false);
  const [ownVehicleNumber, setOwnVehicleNumber] = useState('');
  const [ownVehicleModel, setOwnVehicleModel] = useState('');
  const [ownVehicleTypeId, setOwnVehicleTypeId] = useState('');

  useState(() => {
    const loadLookups = async () => {
      try {
        const [vtRes, cityRes] = await Promise.all([
          agentService.getVehicleTypesLookup(),
          agentService.getCityCodes(),
        ]);
        if (vtRes.success) setVehicleTypes(vtRes.data || []);
        if (cityRes.success) setCityCodes(cityRes.data || []);
      } catch (err) { console.error('Failed to load lookups:', err); }
    };
    loadLookups();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { firstName, lastName, ...rest } = formData;
      const submitData: PartnerRegisterRequest = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        phone: `+91${rest.phone}`,
        email: rest.email || undefined,
        password: rest.password,
        cityCodeId: formData.cityCodeId || undefined,
        vendorCustomId: formData.vendorCustomId || undefined,
        gender: formData.gender as any,
        dateOfBirth: formData.dateOfBirth || undefined,
        localAddress: formData.localAddress || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        aadharNumber: formData.aadharNumber || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        licenseImage: formData.licenseImage || undefined,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        upiId: formData.upiId || undefined,
        hasLicense: true,
        hasOwnVehicle,
        ownVehicleNumber: hasOwnVehicle ? ownVehicleNumber || undefined : undefined,
        ownVehicleModel: hasOwnVehicle ? ownVehicleModel || undefined : undefined,
        ownVehicleTypeId: hasOwnVehicle ? ownVehicleTypeId || undefined : undefined,
      };

      console.log('Sending Partner Registration Request:', submitData);
      const response = await partnerService.register(submitData);
      console.log('Partner Registration Response:', response);

      if (response.success) {
        toast.success('Registration successful! Please login.');
        router.push('/partner/login');
      }
    } catch (error: any) {
      console.error('Partner Registration Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
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
            <Users size={36} className="text-[#E32222]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Become a Partner</h1>
          <p className="text-neutral-400">Join Ara and start earning</p>
        </div>

        <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#E32222] uppercase tracking-wide">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className={inputClass}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className={inputClass}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={inputClass}
                    placeholder="john@example.com"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">City Code</label>
                  <select
                    value={formData.cityCodeId}
                    onChange={(e) => setFormData({...formData, cityCodeId: e.target.value})}
                    className={inputClass + " appearance-none"}
                  >
                    <option value="">Select City</option>
                    {cityCodes.map((c: any) => <option key={c.id} value={c.id}>{c.cityName} ({c.code})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300 ml-1">Vendor Code</label>
                  <input
                    type="text"
                    value={formData.vendorCustomId}
                    onChange={(e) => setFormData({...formData, vendorCustomId: e.target.value})}
                    className={inputClass}
                    placeholder="VDR-BLR-001 (if linked)"
                  />
                </div>
              </div>
            </div>

            {/* Personal & License Details (Collapsible) */}
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPersonalDetails(!showPersonalDetails)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="font-medium text-neutral-300">Personal & License Details</span>
                {showPersonalDetails ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
              </button>
              
              {showPersonalDetails && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className={inputClass + " appearance-none"}
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">Aadhar Number *</label>
                      <input
                        type="text"
                        required
                        value={formData.aadharNumber}
                        onChange={(e) => setFormData({...formData, aadharNumber: e.target.value})}
                        className={inputClass}
                        placeholder="1234 5678 9012"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">DL Number *</label>
                      <input
                        type="text"
                        required
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                        className={inputClass}
                        placeholder="KA01 20220001234"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300 ml-1">License Image URL</label>
                    <input
                      type="text"
                      value={formData.licenseImage}
                      onChange={(e) => setFormData({...formData, licenseImage: e.target.value})}
                      className={inputClass}
                      placeholder="https://... or upload path"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300 ml-1">Local Address</label>
                    <textarea
                      value={formData.localAddress}
                      onChange={(e) => setFormData({...formData, localAddress: e.target.value})}
                      className={inputClass + " resize-none"}
                      rows={2}
                      placeholder="Current address..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300 ml-1">Permanent Address</label>
                    <textarea
                      value={formData.permanentAddress}
                      onChange={(e) => setFormData({...formData, permanentAddress: e.target.value})}
                      className={inputClass + " resize-none"}
                      rows={2}
                      placeholder="Permanent address..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Own Vehicle Details (Collapsible) */}
            <div className="border border-white/10 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowVehicleDetails(!showVehicleDetails)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="font-medium text-neutral-300 flex items-center gap-2"><Car size={16} className="text-emerald-400" /> Own Vehicle Details</span>
                {showVehicleDetails ? <ChevronUp size={20} className="text-neutral-400" /> : <ChevronDown size={20} className="text-neutral-400" />}
              </button>
              
              {showVehicleDetails && (
                <div className="p-4 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasOwnVehicle}
                      onChange={e => setHasOwnVehicle(e.target.checked)}
                      className="w-4 h-4 accent-[#E32222] rounded" />
                    <span className="text-sm font-medium text-neutral-300">I have my own vehicle</span>
                  </label>
                  {hasOwnVehicle && (
                    <div className="space-y-4 pt-2 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300 ml-1">Vehicle Number</label>
                          <input type="text" value={ownVehicleNumber}
                            onChange={e => setOwnVehicleNumber(e.target.value.toUpperCase())}
                            className={inputClass} placeholder="KA01AB1234" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-300 ml-1">Vehicle Model</label>
                          <input type="text" value={ownVehicleModel}
                            onChange={e => setOwnVehicleModel(e.target.value)}
                            className={inputClass} placeholder="Maruti Dzire" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300 ml-1">Vehicle Type</label>
                        <select value={ownVehicleTypeId}
                          onChange={e => setOwnVehicleTypeId(e.target.value)}
                          className={inputClass + " appearance-none"}>
                          <option value="">Select Type</option>
                          {vehicleTypes.map((vt: any) => <option key={vt.id} value={vt.id}>{vt.displayName} ({vt.category})</option>)}
                        </select>
                      </div>
                    </div>
                  )}
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
                      <label className="text-sm font-medium text-neutral-300 ml-1">Bank Account Number</label>
                      <input
                        type="text"
                        value={formData.bankAccountNumber}
                        onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                        className={inputClass}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300 ml-1">UPI ID</label>
                      <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                        className={inputClass}
                        placeholder="name@upi"
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
              href="/partner/login"
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
