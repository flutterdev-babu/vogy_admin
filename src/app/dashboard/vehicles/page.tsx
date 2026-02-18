'use client';

import { useState, useEffect } from 'react';
import { Truck, Search, Filter, Plus, Eye, Car, Building2, UserCheck, MapPin, X, Loader2 } from 'lucide-react';
import { vehicleService } from '@/services/vehicleService';
import { vendorService } from '@/services/vendorService';
import { partnerService } from '@/services/partnerService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { cityCodeService } from '@/services/cityCodeService';
import { Vehicle, Vendor, Partner, VehicleType, CityCode } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    partnerId: '', registrationNumber: '', vehicleModel: '',
    color: '', fuelType: '', vehicleTypeId: '',
    cityCodeId: '', seatingCapacity: '',
    rtoTaxExpiryDate: '', speedGovernor: '',
  });

  const fetchData = async () => {
    try {
      const [vehiclesRes, vendorsRes, partnersRes, typesRes, codesRes] = await Promise.all([
        vehicleService.getAll({ vendorId: vendorFilter || undefined, search: search || undefined }),
        vendorService.getAll({ status: 'APPROVED' }),
        partnerService.getAll({ status: 'APPROVED' }),
        vehicleTypeService.getAll(),
        cityCodeService.getAll(),
      ]);
      setVehicles(vehiclesRes.data || []);
      setVendors(vendorsRes.data || []);
      setPartners(partnersRes.data || []);
      setVehicleTypes(typesRes.data || []);
      setCityCodes(codesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [vendorFilter]);
  useEffect(() => {
    const debounce = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleCreate = async () => {
    if (!formData.registrationNumber || !formData.vehicleModel || !formData.vehicleTypeId || !formData.cityCodeId) {
      toast.error('Please fill all required fields'); return;
    }
    setIsCreating(true);
    try {
      await vehicleService.create({
        registrationNumber: formData.registrationNumber,
        vehicleModel: formData.vehicleModel,
        vehicleTypeId: formData.vehicleTypeId,
        partnerId: formData.partnerId || undefined,
        cityCodeId: formData.cityCodeId,
        color: formData.color || undefined,
        fuelType: formData.fuelType ? (formData.fuelType as any) : undefined,
        seatingCapacity: formData.seatingCapacity ? parseInt(formData.seatingCapacity) : undefined,
        rtoTaxExpiryDate: formData.rtoTaxExpiryDate || undefined,
        speedGovernor: formData.speedGovernor === 'YES',
      });
      toast.success('Vehicle created successfully');
      setShowCreateModal(false);
      setFormData({ partnerId: '', registrationNumber: '', vehicleModel: '', color: '', fuelType: '', vehicleTypeId: '', cityCodeId: '', seatingCapacity: '', rtoTaxExpiryDate: '', speedGovernor: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      toast.error('Failed to create vehicle');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vehicles</h1>
          <p className="text-gray-500 mt-1">Manage fleet vehicles and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold">
            {vehicles.length} Vehicles
          </span>
          <button onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 py-2.5 px-4">
            <Plus size={18} /><span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by registration number..." className="input pl-11" />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}
              className="input pl-11 pr-10 appearance-none cursor-pointer min-w-[160px]">
              <option value="">All Vendors</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="card p-12 text-center">
          <Truck size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No vehicles found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="card p-6 hover:border-orange-300 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
                  <Car size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-500 font-medium">{vehicle.customId}</p>
                  <h3 className="font-bold text-gray-800">{vehicle.registrationNumber}</h3>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Truck size={14} /><span>{vehicle.vehicleModel}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Car size={14} /><span>{vehicle.vehicleType?.displayName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Building2 size={14} /><span>{vehicle.vendor?.companyName || vehicle.vendor?.name}</span>
                </div>
                {vehicle.partner && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <UserCheck size={14} /><span>{vehicle.partner.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin size={14} /><span>{vehicle.cityCode?.cityName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${vehicle.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  {vehicle.isActive ? 'Active' : 'Inactive'}
                </span>
                <button className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-medium">
                  <Eye size={14} />View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Add New Vehicle</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner ID</label>
                <input type="text" value={formData.partnerId}
                  onChange={(e) => setFormData({...formData, partnerId: e.target.value})}
                  className="input" placeholder="Enter Partner ID" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reg No. *</label>
                <input type="text" value={formData.registrationNumber}
                  onChange={(e) => setFormData({...formData, registrationNumber: e.target.value.toUpperCase()})}
                  className="input" placeholder="Enter Vehicle Registration Number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name *</label>
                <input type="text" value={formData.vehicleModel}
                  onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                  className="input" placeholder="Enter Model Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input type="text" value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="input" placeholder="Enter Vehicle Color" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select value={formData.fuelType}
                  onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                  className="input">
                  <option value="">Select Fuel Type</option>
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Group *</label>
                <select value={formData.vehicleTypeId}
                  onChange={(e) => setFormData({...formData, vehicleTypeId: e.target.value})}
                  className="input">
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City Code *</label>
                <select value={formData.cityCodeId}
                  onChange={(e) => setFormData({...formData, cityCodeId: e.target.value})}
                  className="input">
                  <option value="">Select City Code</option>
                  {cityCodes.map(c => <option key={c.id} value={c.id}>{c.cityName} ({c.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity</label>
                <select value={formData.seatingCapacity}
                  onChange={(e) => setFormData({...formData, seatingCapacity: e.target.value})}
                  className="input">
                  <option value="">Select Seating Capacity</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="10">10</option>
                  <option value="12">12</option>
                  <option value="14">14</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RTO Tax Expiry Date</label>
                <input type="date" value={formData.rtoTaxExpiryDate}
                  onChange={(e) => setFormData({...formData, rtoTaxExpiryDate: e.target.value})}
                  className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speed Governor</label>
                <select value={formData.speedGovernor}
                  onChange={(e) => setFormData({...formData, speedGovernor: e.target.value})}
                  className="input">
                  <option value="">Select Speed Governor</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
              <button onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={isCreating}
                className="flex-1 btn-primary flex items-center justify-center gap-2">
                {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                <span>{isCreating ? 'Creating...' : 'Create Vehicle'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
