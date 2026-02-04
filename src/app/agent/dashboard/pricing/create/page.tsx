'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, RotateCw } from 'lucide-react';

export default function AddPricePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cityCode: '',
    bookingType: '',
    vehicleCategory: '',
    baseKm: 0,
    basePrice: 0,
    extraPricePerKm: 0,
    driverBaseKm: 0,
    driverBasePrice: 0,
    driverExtraPricePerKm: 0,
    commissionPercentage: 0,
    tollRate: 0,
    gstRate: 5,
    vehicleStatus: 'Active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement API call
    console.log('Submitting price data:', formData);

    // Simulate delay
    setTimeout(() => {
      setLoading(false);
      // router.push('/agent/dashboard/pricing');
      alert('Price added successfully (Simulation)');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Add Price</h1>
        <button 
          onClick={() => window.location.reload()}
          className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RotateCw size={20} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Price Details</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* City Code */}
            <div className="space-y-2">
              <label htmlFor="cityCode" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                City Code
              </label>
              <div className="relative">
                <select
                  id="cityCode"
                  name="cityCode"
                  value={formData.cityCode}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select City</option>
                  <option value="BLR">Bangalore (BLR)</option>
                  <option value="HYD">Hyderabad (HYD)</option>
                  <option value="DEL">Delhi (DEL)</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Booking Type */}
            <div className="space-y-2">
              <label htmlFor="bookingType" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Booking Type
              </label>
              <div className="relative">
                <select
                  id="bookingType"
                  name="bookingType"
                  value={formData.bookingType}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Booking Type</option>
                  <option value="daily">Daily Ride</option>
                  <option value="rental">Rental</option>
                  <option value="outstation">Outstation</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Vehicle Category */}
            <div className="space-y-2">
              <label htmlFor="vehicleCategory" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Vehicle Category
              </label>
              <div className="relative">
                <select
                  id="vehicleCategory"
                  name="vehicleCategory"
                  value={formData.vehicleCategory}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Vehicle Category</option>
                  <option value="mini">Mini</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Base KM */}
            <div className="space-y-2">
              <label htmlFor="baseKm" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Base KM
              </label>
              <input
                type="number"
                id="baseKm"
                name="baseKm"
                value={formData.baseKm}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Base Price */}
            <div className="space-y-2">
              <label htmlFor="basePrice" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Base Price
              </label>
              <input
                type="number"
                id="basePrice"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Extra Price/KM */}
            <div className="space-y-2">
              <label htmlFor="extraPricePerKm" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Extra Price/KM
              </label>
              <input
                type="number"
                id="extraPricePerKm"
                name="extraPricePerKm"
                value={formData.extraPricePerKm}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Driver Base KM */}
            <div className="space-y-2">
              <label htmlFor="driverBaseKm" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Driver Base KM
              </label>
              <input
                type="number"
                id="driverBaseKm"
                name="driverBaseKm"
                value={formData.driverBaseKm}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Driver Base Price */}
            <div className="space-y-2">
              <label htmlFor="driverBasePrice" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Driver Base Price
              </label>
              <input
                type="number"
                id="driverBasePrice"
                name="driverBasePrice"
                value={formData.driverBasePrice}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Driver Extra Price/KM */}
            <div className="space-y-2">
              <label htmlFor="driverExtraPricePerKm" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Driver Extra Price/KM
              </label>
              <input
                type="number"
                id="driverExtraPricePerKm"
                name="driverExtraPricePerKm"
                value={formData.driverExtraPricePerKm}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Commission Percentage */}
            <div className="space-y-2">
              <label htmlFor="commissionPercentage" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Commission Percentage
              </label>
              <input
                type="number"
                id="commissionPercentage"
                name="commissionPercentage"
                value={formData.commissionPercentage}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Toll Rate */}
            <div className="space-y-2">
              <label htmlFor="tollRate" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Toll Rate
              </label>
              <input
                type="number"
                id="tollRate"
                name="tollRate"
                value={formData.tollRate}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* GST Rate */}
            <div className="space-y-2">
              <label htmlFor="gstRate" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                gstRate
              </label>
              <input
                type="number"
                id="gstRate"
                name="gstRate"
                value={formData.gstRate}
                onChange={handleChange}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Vehicle Status */}
            <div className="space-y-2">
              <label htmlFor="vehicleStatus" className="block text-sm font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded">
                Vehicle Status
              </label>
              <div className="relative">
                <select
                  id="vehicleStatus"
                  name="vehicleStatus"
                  value={formData.vehicleStatus}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-slate-500 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
