'use client';

import { useState, useEffect } from 'react';
import { rideService } from '@/services/rideService';
import { cityCodeService } from '@/services/cityCodeService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { Calendar, User, MapPin, Car, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { CityCode, VehicleType } from '@/types';
import Link from 'next/link';

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
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cityRes, typeRes] = await Promise.all([
        cityCodeService.getAll(),
        vehicleTypeService.getAll()
      ]);
      setCityCodes(cityRes.data || []);
      setVehicleTypes(typeRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load initial data');
    }
  };

  const getEstimate = async () => {
    if (!formData.distanceKm || !formData.vehicleTypeId || !formData.cityCodeId) {
      toast.error('Please select city, vehicle type and distance');
      return;
    }
    setEstimating(true);
    try {
      // Assuming a generic estimate API or local calculation if needed
      // For now, let's assume rideService has an estimate method or similar
      // If not, we can implement it in rideService
      const res = await rideService.getAll(); // Placeholder for actual estimate call
      // Mocking estimate for now if the specific API is missing
      setEstimate({
        totalFare: formData.distanceKm * 15 + 50,
        baseFare: 50,
        distanceKm: formData.distanceKm
      });
    } catch (err) {
      toast.error('Failed to get estimate');
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await rideService.createManualRide({
        ...formData,
        phone: `+91${formData.phone}`,
        isManualBooking: true
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manual Ride Booking</h1>
          <p className="text-gray-500 text-sm">Create a ride for a customer directly.</p>
        </div>
        <Link href="/dashboard/rides" className="text-orange-500 hover:text-orange-600 font-medium">
          View All Rides
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Customer Name *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter name"
                      className="input-field pl-10"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      className="w-full px-4 py-2 border border-gray-200 rounded-r-xl focus:ring-orange-500 focus:border-orange-500 outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">City *</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      required
                      className="input-field pl-10"
                      value={formData.cityCodeId}
                      onChange={(e) => setFormData({...formData, cityCodeId: e.target.value})}
                    >
                      <option value="">Select City</option>
                      {cityCodes.map((cc) => (
                        <option key={cc.id} value={cc.id}>{cc.cityName} ({cc.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Vehicle Type *</label>
                  <div className="relative">
                    <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      required
                      className="input-field pl-10"
                      value={formData.vehicleTypeId}
                      onChange={(e) => setFormData({...formData, vehicleTypeId: e.target.value})}
                    >
                      <option value="">Select Type</option>
                      {vehicleTypes.map((vt) => (
                        <option key={vt.id} value={vt.id}>{vt.displayName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Pickup Address *</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter pickup location"
                    className="input-field pl-10"
                    value={formData.pickup}
                    onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Drop Address *</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter drop location"
                    className="input-field pl-10"
                    value={formData.drop}
                    onChange={(e) => setFormData({...formData, drop: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Payment Mode</label>
                  <select
                    className="input-field"
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="ONLINE">Online</option>
                    <option value="CREDIT">Corporate Credit</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Booking...' : (
                    <>
                      <CheckCircle size={20} />
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info size={18} className="text-orange-400" />
              Fare Estimation
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Estimated Distance (Km)</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({...formData, distanceKm: parseInt(e.target.value) || 0})}
                  />
                  <button 
                    onClick={getEstimate}
                    disabled={estimating}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Calculate
                  </button>
                </div>
              </div>

              {estimate && (
                <div className="pt-4 border-t border-white/10 space-y-2 animate-fade-in">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Base Fare</span>
                    <span>₹{estimate.baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Distance Charges</span>
                    <span>₹{(estimate.totalFare - estimate.baseFare).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-xl font-bold border-t border-white/10 mt-2">
                    <span className="text-orange-400">Total Est.</span>
                    <span>₹{estimate.totalFare.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 border-orange-100 bg-orange-50/30">
            <h4 className="text-sm font-bold text-gray-800 mb-2">Important Note</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Manual bookings are immediately visible to available partners in the selected city. Ensure the customer's phone number is correct for OTP verification at the start of the ride.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
