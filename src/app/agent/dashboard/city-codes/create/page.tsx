'use client';

import { useState } from 'react';
import { agentService } from '@/services/agentService';
import { MapPin, Hash, CheckCircle }from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CreateCityCodePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: '',
    cityName: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate code format (uppercase, 2-5 characters)
    if (!/^[A-Z]{2,5}$/.test(formData.code)) {
      toast.error('City code must be 2-5 uppercase letters');
      return;
    }

    setLoading(true);
    try {
      await agentService.createCityCode(formData.code, formData.cityName);
      toast.success('City code created successfully!');
      setFormData({ code: '', cityName: '' });
      router.push('/agent/dashboard/city-codes');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create city code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <MapPin className="text-[#E32222]" />
          Add City Code
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City Code *</label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g., BLR, HYD, CHN"
                maxLength={5}
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-[#E32222] focus:border-[#E32222] uppercase"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">2-5 uppercase letters (e.g., BLR for Bangalore)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City Name *</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g., Bangalore, Hyderabad"
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                value={formData.cityName}
                onChange={(e) => setFormData({...formData, cityName: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#E32222] hover:bg-[#cc1f1f] text-white py-3 rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
            >
              {loading ? <span className="animate-spin">⏳</span> : <CheckCircle size={20} />}
              Create City Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
