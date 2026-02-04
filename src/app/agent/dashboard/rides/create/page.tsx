'use client';

import { useState } from 'react';
import { agentService } from '@/services/agentService';
import { Calendar, User, MapPin, Car, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateRidePage() {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    pickup: '',
    drop: '',
    vehicleType: 'sedan',
    scheduledTime: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await agentService.createRide(formData);
      toast.success('Ride booked successfully!');
      setFormData({ customerName: '', phone: '', pickup: '', drop: '', vehicleType: 'sedan', scheduledTime: '' });
    } catch (err) {
      toast.error('Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Calendar className="text-[#E32222]" />
          Book a Manual Ride
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                 <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
             <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                    value={formData.pickup}
                    onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Drop Location</label>
             <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                    value={formData.drop}
                    onChange={(e) => setFormData({...formData, drop: e.target.value})}
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <div className="relative">
                   <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <select
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                   >
                     <option value="sedan">Sedan</option>
                     <option value="suv">SUV</option>
                     <option value="mini">Mini</option>
                   </select>
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                />
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#E32222] hover:bg-[#cc1f1f] text-white py-3 rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
          >
            {loading ? <span className="animate-spin">⏳</span> : <CheckCircle size={20} />}
            Book Ride
          </button>
        </form>
      </div>
    </div>
  );
}
