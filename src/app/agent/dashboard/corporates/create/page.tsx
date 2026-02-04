'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { 
  Building2, Mail, CreditCard, CheckCircle, User, Phone, MapPin, Lock, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CityCode } from '@/types';

export default function CreateCorporatePage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    gstNumber: '',
    address: '',
    cityCodeId: ''
  });
  const [loading, setLoading] = useState(false);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);

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
      await agentService.createCorporate(formData);
      toast.success('Corporate account created successfully!');
      setFormData({ 
        companyName: '', contactPerson: '', phone: '', email: '', 
        password: '', gstNumber: '', address: '', cityCodeId: '' 
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create corporate account');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Building2 className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Register Corporate</h1>
            <p className="text-sm text-gray-500">Add a new corporate client account</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Company name"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Contact person name"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  value={formData.contactPerson}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  placeholder="10 digit phone number"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Email *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="company@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Password & City Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="Create a password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none bg-white"
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

          {/* GST Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                value={formData.gstNumber}
                onChange={(e) => updateField('gstNumber', e.target.value)}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              rows={2}
              placeholder="Company address (optional)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle size={20} />
            )}
            Create Corporate
          </button>
        </form>
      </div>
    </div>
  );
}
