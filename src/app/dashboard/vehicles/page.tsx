'use client';

import { useState, useEffect } from 'react';
import { Truck, Search, Filter, Plus, Eye, Car, Building2, UserCheck, MapPin, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { vehicleService } from '@/services/vehicleService';
import { vendorService } from '@/services/vendorService';
import { partnerService } from '@/services/partnerService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { cityCodeService } from '@/services/cityCodeService';
import { Vehicle, Vendor, Partner, VehicleType, CityCode, EntityActiveStatus, EntityVerificationStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Trash2, ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const activeStatusColors: Record<EntityActiveStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  SUSPENDED: 'bg-yellow-100 text-yellow-700',
  BANNED: 'bg-red-100 text-red-700',
};

const verifyStatusColors: Record<EntityVerificationStatus, string> = {
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  VERIFIED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
};

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
    cityCodeId: '', rcNumber: '', chassisNumber: '',
    insuranceNumber: '', insuranceExpiryDate: '',
  });

  const fetchData = async () => {
    try {
      const [vehiclesRes, vendorsRes, partnersRes, typesRes, codesRes] = await Promise.all([
        vehicleService.getAll(),
        vendorService.getAll(),
        partnerService.getAll(),
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

  useEffect(() => { 
    fetchData(); 
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      v.registrationNumber.toLowerCase().includes(searchLower) ||
      v.vehicleModel.toLowerCase().includes(searchLower) ||
      v.customId.toLowerCase().includes(searchLower) ||
      v.vendor?.companyName?.toLowerCase().includes(searchLower) ||
      v.partner?.name?.toLowerCase().includes(searchLower);
    
    const matchesVendor = !vendorFilter || v.vendor?.id === vendorFilter;
    
    return matchesSearch && matchesVendor;
  });

  const handleCreate = async () => {
    if (!formData.registrationNumber || !formData.vehicleModel || !formData.vehicleTypeId || !formData.cityCodeId) {
      toast.error('Please fill all required fields'); return;
    }
    setIsCreating(true);
    const submitData = {
      registrationNumber: formData.registrationNumber,
      vehicleModel: formData.vehicleModel,
      vehicleTypeId: formData.vehicleTypeId,
      partnerId: formData.partnerId || undefined,
      cityCodeId: formData.cityCodeId,
      color: formData.color || undefined,
      fuelType: formData.fuelType ? (formData.fuelType as any) : undefined,
      rcNumber: formData.rcNumber || undefined,
      chassisNumber: formData.chassisNumber || undefined,
      insuranceNumber: formData.insuranceNumber || undefined,
      insuranceExpiryDate: formData.insuranceExpiryDate || undefined,
    };

    console.log('Submitting vehicle data (Modal):', submitData);
    try {
      await vehicleService.create(submitData);
      toast.success('Vehicle created successfully');
      setShowCreateModal(false);
      setFormData({ partnerId: '', registrationNumber: '', vehicleModel: '', color: '', fuelType: '', vehicleTypeId: '', cityCodeId: '', rcNumber: '', chassisNumber: '', insuranceNumber: '', insuranceExpiryDate: '' });
      fetchData();
    } catch (error: any) {
      console.error('Failed to create vehicle - Full Error:', error);
      if (error.response) {
        console.error('Error Status:', error.response.status);
        console.error('Error Data:', error.response.data);
      }
      toast.error(error.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusUpdate = async (vehicle: Vehicle, status: EntityActiveStatus) => {
    try {
      await vehicleService.updateStatus(vehicle.id, status);
      toast.success(`Vehicle status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleVerifyHelper = async (vehicle: Vehicle, status: EntityVerificationStatus) => {
    try {
      await vehicleService.verify(vehicle.id, status);
      toast.success(`Vehicle verification set to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update verification');
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action is permanent.')) return;
    try {
      await vehicleService.deleteVehicle(vehicle.id);
      toast.success('Vehicle deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
  };

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
            {filteredVehicles.length} Vehicles
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
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by registration number..." className="input pl-11" />
            </div>
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

      {/* Vehicles Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#E32222] text-white">
              <tr>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[120px]">Vehicle ID</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Reg No.</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Model / Type</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Owner (Vendor)</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Assignment</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">City</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[80px]">Status</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 italic text-gray-800">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 italic not-italic">No vehicles found.</td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-red-50/20 transition-colors not-italic">
                    <td className="px-3 py-4">
                      <span className="text-[11px] font-bold text-orange-600 font-mono uppercase">
                        {vehicle.customId}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                       <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-[#E32222]">
                          <Car size={14} />
                        </div>
                        <span className="text-[11px] font-black text-gray-800 tracking-tight">{vehicle.registrationNumber}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-700">{vehicle.vehicleModel}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{vehicle.vehicleType?.displayName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-orange-600 font-mono">{vehicle.vendor?.customId}</span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{vehicle.vendor?.companyName || vehicle.vendor?.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                       {vehicle.partner ? (
                        <div className="flex items-center gap-2">
                          <UserCheck size={12} className="text-blue-500" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-700">{vehicle.partner.name}</span>
                            <span className="text-[9px] text-emerald-600 font-mono font-bold tracking-tighter uppercase">{vehicle.partner.customId}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-[11px] font-medium text-gray-600">
                      {vehicle.cityCode?.cityName}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${activeStatusColors[vehicle.status] || 'bg-gray-100 text-gray-700'}`}>
                          {vehicle.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${verifyStatusColors[vehicle.verifyStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {vehicle.verifyStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleStatusUpdate(vehicle, e.target.value as EntityActiveStatus);
                            }}
                            className="text-[9px] p-1 border border-gray-200 rounded bg-white outline-none cursor-pointer flex-1"
                          >
                            <option value="">Status</option>
                            <option value="ACTIVE">Activate</option>
                            <option value="INACTIVE">Deactivate</option>
                            <option value="SUSPENDED">Suspend</option>
                            <option value="BANNED">Ban</option>
                          </select>
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleVerifyHelper(vehicle, e.target.value as EntityVerificationStatus);
                            }}
                            className="text-[9px] p-1 border border-gray-200 rounded bg-white outline-none cursor-pointer flex-1"
                          >
                            <option value="">Verify</option>
                            <option value="VERIFIED">Verify</option>
                            <option value="REJECTED">Reject</option>
                            <option value="UNDER_REVIEW">Review</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/vehicles/${vehicle.id}/edit`} className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded text-[9px] font-bold flex items-center gap-1">
                            <Eye size={12} /> Edit
                          </Link>
                          <button onClick={() => handleDelete(vehicle)} className="p-1 px-2 text-red-600 hover:bg-red-50 rounded text-[9px] font-bold flex items-center gap-1">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500">Showing <span className="font-bold text-[#E32222]">{vehicles.length}</span> fleet vehicles</span>
        </div>
      </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">RC Number</label>
                <input type="text" value={formData.rcNumber}
                  onChange={(e) => setFormData({...formData, rcNumber: e.target.value.toUpperCase()})}
                  className="input" placeholder="Enter RC Number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number</label>
                <input type="text" value={formData.chassisNumber}
                  onChange={(e) => setFormData({...formData, chassisNumber: e.target.value.toUpperCase()})}
                  className="input" placeholder="Enter Chassis Number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                <input type="text" value={formData.insuranceNumber}
                  onChange={(e) => setFormData({...formData, insuranceNumber: e.target.value})}
                  className="input" placeholder="Enter Insurance Number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry Date</label>
                <input type="date" value={formData.insuranceExpiryDate}
                  onChange={(e) => setFormData({...formData, insuranceExpiryDate: e.target.value})}
                  className="input" />
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
