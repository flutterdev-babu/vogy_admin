'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { 
  Car, CheckCircle, Hash, MapPin, User, Building2, Palette, 
  Fuel, Users, Calendar, Gauge, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CityCode, VehicleType, Vendor, FuelType } from '@/types';

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'PETROL', label: 'Petrol' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'CNG', label: 'CNG' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export default function CreateVehiclePage() {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleModel: '',
    vehicleTypeId: '',
    vendorCustomId: '',
    partnerCustomId: '',
    cityCodeId: '',
    // New Fields
    color: '',
    fuelType: '' as FuelType | '',
    seatingCapacity: '',
    rtoTaxExpiryDate: '',
    speedGovernor: false
  });
  
  const [loading, setLoading] = useState(false);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cityRes, typeRes, vendorRes, partnerRes] = await Promise.all([
        agentService.getCityCodes(),
        agentService.getVehicleTypesLookup(),
        agentService.getVendorsLookup(),
        agentService.getPartnersLookup()
      ]);
      setCityCodes(cityRes.data);
      setVehicleTypes(typeRes.data);
      setVendors(vendorRes.data);
      setPartners(partnerRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load form data');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleTypeId || !formData.partnerCustomId || !formData.cityCodeId) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await agentService.createVehicle({
        registrationNumber: formData.registrationNumber,
        vehicleModel: formData.vehicleModel,
        vehicleTypeId: formData.vehicleTypeId,
        vendorCustomId: formData.vendorCustomId || undefined,
        partnerCustomId: formData.partnerCustomId,
        cityCodeId: formData.cityCodeId,
        color: formData.color || undefined,
        fuelType: formData.fuelType || undefined,
        seatingCapacity: formData.seatingCapacity ? parseInt(formData.seatingCapacity) : undefined,
        rtoTaxExpiryDate: formData.rtoTaxExpiryDate || undefined,
        speedGovernor: formData.speedGovernor
      });
      toast.success('Vehicle created successfully!');
      setFormData({
        registrationNumber: '', vehicleModel: '', vehicleTypeId: '', vendorCustomId: '',
        partnerCustomId: '', cityCodeId: '', color: '', fuelType: '', seatingCapacity: '',
        rtoTaxExpiryDate: '', speedGovernor: false
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E32222]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E32222] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-red-500/30">
            <Car className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Vehicle</h1>
            <p className="text-sm text-gray-500">Register a new vehicle to the fleet</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Vehicle Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Vehicle Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                <div className="relative">
                  <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="KA01AB1234"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all uppercase"
                    value={formData.registrationNumber}
                    onChange={(e) => updateField('registrationNumber', e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model *</label>
                <div className="relative">
                  <Car size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Swift Dzire"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all"
                    value={formData.vehicleModel}
                    onChange={(e) => updateField('vehicleModel', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all appearance-none bg-white"
                    value={formData.vehicleTypeId}
                    onChange={(e) => updateField('vehicleTypeId', e.target.value)}
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map((vt) => (
                      <option key={vt.id} value={vt.id}>{vt.displayName} ({vt.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City Code *</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all appearance-none bg-white"
                    value={formData.cityCodeId}
                    onChange={(e) => updateField('cityCodeId', e.target.value)}
                  >
                    <option value="">Select city code</option>
                    {cityCodes.map((cc) => (
                      <option key={cc.id} value={cc.code}>{cc.code} - {cc.cityName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Owner & Driver Assignment */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Assignment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Owner) *</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all appearance-none bg-white"
                    value={formData.vendorCustomId}
                    onChange={(e) => updateField('vendorCustomId', e.target.value)}
                  >
                    <option value="">Select vendor (optional)</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.customId}>{v.companyName || v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner (Driver) *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all appearance-none bg-white"
                    value={formData.partnerCustomId}
                    onChange={(e) => updateField('partnerCustomId', e.target.value)}
                  >
                    <option value="">Select partner</option>
                    {partners.map((p) => (
                      <option key={p.id || p._id} value={p.customId}>{p.name} - {p.phone}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Additional Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="relative">
                  <Palette size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g., White"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all"
                    value={formData.color}
                    onChange={(e) => updateField('color', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <div className="relative">
                  <Fuel size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all appearance-none bg-white"
                    value={formData.fuelType}
                    onChange={(e) => updateField('fuelType', e.target.value)}
                  >
                    <option value="">Select fuel type</option>
                    {FUEL_TYPES.map((ft) => (
                      <option key={ft.value} value={ft.value}>{ft.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity</label>
                <div className="relative">
                  <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="e.g., 4"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all"
                    value={formData.seatingCapacity}
                    onChange={(e) => updateField('seatingCapacity', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RTO Tax Expiry Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] transition-all"
                    value={formData.rtoTaxExpiryDate}
                    onChange={(e) => updateField('rtoTaxExpiryDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.speedGovernor}
                      onChange={(e) => updateField('speedGovernor', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#E32222] transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge size={18} className="text-gray-400" />
                    <span className="font-medium text-gray-700">Speed Governor Installed</span>
                  </div>
                </label>
              </div>
            </div>
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
            Register Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}
