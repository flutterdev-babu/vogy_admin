'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { 
  Users, Phone, Mail, User, MapPin, Lock, 
  CreditCard, Landmark, ChevronDown, ChevronUp, Hash,
  FileCheck, Calendar, Car
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CityCode, Vendor, Gender } from '@/types';

export default function CreatePartnerPage() {
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    cityCodeId: '',
    vendorId: '',
    // Personal Details
    dateOfBirth: '',
    gender: '' as Gender | '',
    localAddress: '',
    permanentAddress: '',
    aadharNumber: '',
    licenseNumber: '',
    // Banking Details
    bankAccountNumber: '',
    upiId: ''
  });
  const [loading, setLoading] = useState(false);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showPersonalDetails, setShowPersonalDetails] = useState(false);
  const [showBankingDetails, setShowBankingDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cityRes, vendorRes] = await Promise.all([
        agentService.getCityCodes(),
        agentService.getVendors()
      ]);
      setCityCodes(cityRes.data);
      setVendors(vendorRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        gender: formData.gender || undefined
      };
      await agentService.createPartner(submitData);
      toast.success('Partner created successfully!');
      setFormData({
        firstName: '', lastName: '', phone: '', email: '', password: '', cityCodeId: '', vendorId: '',
        dateOfBirth: '', gender: '', localAddress: '', permanentAddress: '', aadharNumber: '', licenseNumber: '',
        bankAccountNumber: '', upiId: ''
      });
      setShowPersonalDetails(false);
      setShowBankingDetails(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create partner');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Users className="text-[#E32222]" />
          Add New Partner
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className={inputClass}
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className={inputClass}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className={inputClass}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={inputClass}
                    placeholder="partner@email.com"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Password *</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={inputClass}
                    placeholder="Create password"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>City Code *</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    required
                    value={formData.cityCodeId}
                    onChange={(e) => updateField('cityCodeId', e.target.value)}
                    className={inputClass + " appearance-none"}
                  >
                    <option value="">Select city</option>
                    {cityCodes.map(city => (
                      <option key={city.id} value={city.id}>{city.code} - {city.cityName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Assign to Vendor</label>
                <div className="relative">
                  <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.vendorId}
                    onChange={(e) => updateField('vendorId', e.target.value)}
                    className={inputClass + " appearance-none"}
                  >
                    <option value="">Select vendor (optional)</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>{vendor.companyName} - {vendor.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPersonalDetails(!showPersonalDetails)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">Personal & License Details</span>
              {showPersonalDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {showPersonalDetails && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateField('dateOfBirth', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className={inputClass + " appearance-none pl-4"}
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Aadhar Number</label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.aadharNumber}
                        onChange={(e) => updateField('aadharNumber', e.target.value)}
                        className={inputClass}
                        placeholder="1234 5678 9012"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>DL Number</label>
                    <div className="relative">
                      <FileCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => updateField('licenseNumber', e.target.value)}
                        className={inputClass}
                        placeholder="KA01 20240007238"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Local Address</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        value={formData.localAddress}
                        onChange={(e) => updateField('localAddress', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all resize-none"
                        rows={2}
                        placeholder="Enter local address..."
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Permanent Address</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        value={formData.permanentAddress}
                        onChange={(e) => updateField('permanentAddress', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all resize-none"
                        rows={2}
                        placeholder="Enter permanent address..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Banking Details Section */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowBankingDetails(!showBankingDetails)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">Banking Details</span>
              {showBankingDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {showBankingDetails && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Bank Account Number</label>
                    <div className="relative">
                      <Landmark size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.bankAccountNumber}
                        onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                        className={inputClass}
                        placeholder="Enter account number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>UPI ID</label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => updateField('upiId', e.target.value)}
                        className={inputClass}
                        placeholder="name@upi"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E32222] text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:bg-[#cc1f1f] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Partner...
              </>
            ) : (
              <>
                <Users size={20} />
                Create Partner
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
