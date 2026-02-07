'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { Calendar, User, MapPin, Car, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { CityCode } from '@/types';

export default function CreateRidePage() {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    pickup: '',
    drop: '',
    vehicleTypeId: '',
    scheduledTime: '',
    distanceKm: 10,
    paymentMode: 'CASH',
    cityCodeId: '',
  });
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cityRes, typeRes] = await Promise.all([
        agentService.getCityCodes(),
        agentService.getVehicleTypesLookup()
      ]);
      setCityCodes(cityRes.data);
      setVehicleTypes(typeRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const getEstimate = async () => {
    if (!formData.distanceKm) return;
    setEstimating(true);
    try {
      const res = await agentService.getRideEstimate(formData.distanceKm);
      setEstimate(res.data);
    } catch (err) {
      toast.error('Failed to get estimate');
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.cityCodeId) {
      toast.error('Please select a city first');
      setLoading(false);
      return;
    }

    try {
      await agentService.createRide({
        ...formData,
        phone: `+91${formData.phone}`
      });
      toast.success('Ride booked successfully!');
      setFormData({ 
        customerName: '', phone: '', pickup: '', drop: '', 
        vehicleTypeId: '', scheduledTime: '', distanceKm: 10, 
        paymentMode: 'CASH', cityCodeId: '' 
      });
      setEstimate(null);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-[#E32222] focus:border-[#E32222] appearance-none bg-white"
                value={formData.cityCodeId}
                onChange={(e) => setFormData({...formData, cityCodeId: e.target.value})}
              >
                <option value="">Select city</option>
                {cityCodes.map((cc) => (
                  <option key={cc.id} value={cc.code}>{cc.code} - {cc.cityName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Phone</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    className="w-full px-4 py-2 border border-gray-200 rounded-r-xl focus:ring-[#E32222] focus:border-[#E32222]"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  />
                </div>
             </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Distance (Km)</label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                value={formData.distanceKm}
                onChange={(e) => setFormData({...formData, distanceKm: parseInt(e.target.value) || 0})}
              />
            </div>
            <button
              type="button"
              onClick={getEstimate}
              disabled={estimating}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              {estimating ? 'Estimating...' : 'Get Estimate'}
            </button>
          </div>

          {estimate && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex justify-between items-center animate-fade-in text-sm sm:text-base">
              <div>
                <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Estimated Fare</p>
                <p className="text-2xl font-bold text-green-700">₹{estimate.totalFare || '0.00'}</p>
              </div>
              <div className="text-right text-green-600">
                <p>Base: ₹{estimate.baseFare}</p>
                <p>Dist: {estimate.distanceKm} km</p>
              </div>
            </div>
          )}

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
             <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-[#E32222] focus:border-[#E32222] appearance-none bg-white"
                      value={formData.vehicleTypeId}
                      onChange={(e) => setFormData({...formData, vehicleTypeId: e.target.value})}
                   >
                     <option value="">Select vehicle type</option>
                     {vehicleTypes.map((vt) => (
                       <option key={vt.id} value={vt.customId}>{vt.displayName} ({vt.category})</option>
                     ))}
                   </select>
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="ONLINE">Online (Razorpay)</option>
                  <option value="CREDIT">Corporate Credit</option>
                </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-[#E32222] focus:border-[#E32222]"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#E32222] hover:bg-[#cc1f1f] text-white py-4 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle size={22} />
            )}
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
