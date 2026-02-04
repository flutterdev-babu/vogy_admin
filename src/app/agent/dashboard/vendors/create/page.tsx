'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { 
  Building2, Phone, Mail, User, MapPin, Lock, CheckCircle, 
  CreditCard, Landmark, ChevronDown, ChevronUp, Hash, FileText,
  Smartphone, PhoneCall
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CityCode } from '@/types';

export default function CreateVendorPage() {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    companyName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    cityCodeId: '',
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
  const [loading, setLoading] = useState(false);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showBankingDetails, setShowBankingDetails] = useState(false);

  useEffect(() => {
    fetchCityCodes();
  }, []);

  const fetchCityCodes = async () => {
    try {
      const res = await agentService.getCityCodes();
      setCityCodes(res.data);
    } catch (err) {
      console.error('Failed to fetch city codes:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await agentService.createVendor(formData);
      toast.success('Vendor created successfully!');
      setFormData({
        name: '', companyName: '', phone: '', email: '', password: '', address: '', cityCodeId: '',
        gstNumber: '', panNumber: '', ccMobile: '', primaryNumber: '', secondaryNumber: '',
        ownerContact: '', officeLandline: '', officeAddress: '',
        accountNumber: '', bankName: '', ifscCode: '', accountHolderName: ''
      });
      setShowContactDetails(false);
      setShowBankingDetails(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Building2 className="text-[#E32222]" />
          Add New Vendor
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Owner full name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Company or fleet name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="10 digit phone number"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="vendor@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="Create a password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City Code</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all appearance-none bg-white"
                    value={formData.cityCodeId}
                    onChange={(e) => updateField('cityCodeId', e.target.value)}
                  >
                    <option value="">Select city code</option>
                    {cityCodes.map((cc) => (
                      <option key={cc.id} value={cc.id}>{cc.code} - {cc.cityName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                rows={2}
                placeholder="Full address (optional)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all resize-none"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
          </div>

          {/* Contact Details Section - Collapsible */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowContactDetails(!showContactDetails)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <PhoneCall size={16} className="text-blue-600" />
                </div>
                <span className="font-semibold text-gray-700">Contact Details</span>
                <span className="text-xs text-gray-400">(Optional)</span>
              </div>
              {showContactDetails ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>
            
            {showContactDetails && (
              <div className="p-5 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <div className="relative">
                      <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="22AAAAA0000A1Z5"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={formData.gstNumber}
                        onChange={(e) => updateField('gstNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={formData.panNumber}
                        onChange={(e) => updateField('panNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CC Mobile</label>
                    <div className="relative">
                      <Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="CC Mobile"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={formData.ccMobile}
                        onChange={(e) => updateField('ccMobile', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Primary contact"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={formData.primaryNumber}
                        onChange={(e) => updateField('primaryNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Secondary contact"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={formData.secondaryNumber}
                        onChange={(e) => updateField('secondaryNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Contact</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Owner contact number"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={formData.ownerContact}
                        onChange={(e) => updateField('ownerContact', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Office Landline</label>
                    <div className="relative">
                      <PhoneCall size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Office landline"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={formData.officeLandline}
                        onChange={(e) => updateField('officeLandline', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                  <textarea
                    rows={2}
                    placeholder="Office address"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    value={formData.officeAddress}
                    onChange={(e) => updateField('officeAddress', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Banking Details Section - Collapsible */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowBankingDetails(!showBankingDetails)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Landmark size={16} className="text-green-600" />
                </div>
                <span className="font-semibold text-gray-700">Banking Details</span>
                <span className="text-xs text-gray-400">(Optional)</span>
              </div>
              {showBankingDetails ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </button>
            
            {showBankingDetails && (
              <div className="p-5 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Bank account number"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        value={formData.accountNumber}
                        onChange={(e) => updateField('accountNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <div className="relative">
                      <Landmark size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Bank name"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        value={formData.bankName}
                        onChange={(e) => updateField('bankName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="IFSC code"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        value={formData.ifscCode}
                        onChange={(e) => updateField('ifscCode', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Account holder name"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        value={formData.accountHolderName}
                        onChange={(e) => updateField('accountHolderName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#E32222] to-[#ff4444] hover:from-[#cc1f1f] hover:to-[#E32222] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle size={20} />
            )}
            Create Vendor
          </button>
        </form>
      </div>
    </div>
  );
}
