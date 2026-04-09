'use client';

import { useState, useEffect } from 'react';
import { Truck, Search, Filter, Plus, Eye, Car, Building2, UserCheck, MapPin, X, Loader2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
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

const verificationStatusColors: Record<EntityVerificationStatus, string> = {
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  VERIFIED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNVERIFIED: 'bg-gray-100 text-gray-700',
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight text-white/0 bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Vehicles</h1>
          <p className="text-sm text-gray-500 font-medium">Manage fleet inventory and driver assignments</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xl font-black text-gray-900 leading-none">{vehicles.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Total Fleet</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black shadow-lg shadow-gray-200 text-sm font-bold transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} />
              Register Vehicle
            </button>
            <button
              onClick={fetchData}
              className="p-3 bg-white text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh Data"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filter Section */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by registration, model, or vehicle code..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-600 appearance-none focus:ring-2 focus:ring-gray-200 outline-none cursor-pointer"
              >
                <option value="">Vendor: All</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName || v.name}</option>)}
              </select>
            </div>

            <button
              onClick={() => { setSearch(''); setVendorFilter(''); }}
              className="px-4 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Global Stats or Sub-filters if needed */}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Reference</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Registration</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Model / Type</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Fleet Owner</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Assigned Partner</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Operational Hub</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Status & Verify</th>
                <th className="px-4 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Truck size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No vehicles matching your search criteria</p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="group transition-all duration-200 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-black text-orange-600 tracking-tight font-mono">
                        {vehicle.customId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:scale-110 transition-transform">
                          <Car size={16} />
                        </div>
                        <span className="text-sm font-black text-gray-900 tracking-tight uppercase">{vehicle.registrationNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-gray-800">{vehicle.vehicleModel}</span>
                        <div className="inline-flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{vehicle.vehicleType?.displayName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={10} className="text-gray-400" />
                          <span className="text-[10px] font-black text-gray-700 tracking-tight">{vehicle.vendor?.customId}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 truncate max-w-[140px] mt-0.5">{vehicle.vendor?.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {vehicle.partner ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <UserCheck size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-gray-800">{vehicle.partner.name}</span>
                            <span className="text-[9px] text-blue-600 font-mono font-bold tracking-tighter uppercase">{vehicle.partner.customId}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex px-2 py-0.5 bg-gray-100 rounded-md">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Unassigned</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-[11px] font-black text-gray-700">{vehicle.cityCode?.cityName || 'Unset'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[160px]">
                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 ${activeStatusColors[vehicle.status] || 'bg-gray-100 text-gray-700'}`}>
                          <div className={`w-1 h-1 rounded-full ${vehicle.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{vehicle.status}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 ${verificationStatusColors[vehicle.verificationStatus] || 'bg-gray-100 text-gray-700'}`}>
                          <span className="text-[9px] font-black uppercase tracking-widest">{vehicle.verificationStatus}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                        <div className="relative group/actions">
                          <button className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900">
                            <Filter size={16} />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 hidden group-hover/actions:block z-20">
                            <p className="px-4 py-1 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Update Status</p>
                            {['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'].map((s) => (
                              <button key={s} onClick={() => handleStatusUpdate(vehicle, s as any)} className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                                {s} {vehicle.status === s && <CheckCircle2 size={10} className="text-green-500" />}
                              </button>
                            ))}
                            <div className="h-px bg-gray-100 my-1" />
                            <p className="px-4 py-1 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 mt-1">Verification</p>
                            {['VERIFIED', 'REJECTED', 'UNDER_REVIEW'].map((v) => (
                              <button key={v} onClick={() => handleVerifyHelper(vehicle, v as any)} className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                                {v.replace('_', ' ')} {vehicle.verificationStatus === v && <CheckCircle2 size={10} className="text-blue-500" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <Link
                          href={`/dashboard/vehicles/${vehicle.id}/edit`}
                          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl transition-all shadow-sm"
                          title="Edit Vehicle"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          onClick={() => handleDelete(vehicle)}
                          className="p-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Remove Vehicle"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modern Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-50 bg-gray-50/30">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900">{filteredVehicles.length}</span> fleet assets
          </span>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
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
                    onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                    className="input" placeholder="Enter Partner ID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reg No. *</label>
                  <input type="text" value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                    className="input" placeholder="Enter Vehicle Registration Number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Name *</label>
                  <input type="text" value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="input" placeholder="Enter Model Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input type="text" value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input" placeholder="Enter Vehicle Color" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                  <select value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, vehicleTypeId: e.target.value })}
                    className="input">
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City Code *</label>
                  <select value={formData.cityCodeId}
                    onChange={(e) => setFormData({ ...formData, cityCodeId: e.target.value })}
                    className="input">
                    <option value="">Select City Code</option>
                    {cityCodes.map(c => <option key={c.id} value={c.id}>{c.cityName} ({c.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RC Number</label>
                  <input type="text" value={formData.rcNumber}
                    onChange={(e) => setFormData({ ...formData, rcNumber: e.target.value.toUpperCase() })}
                    className="input" placeholder="Enter RC Number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chassis Number</label>
                  <input type="text" value={formData.chassisNumber}
                    onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })}
                    className="input" placeholder="Enter Chassis Number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                  <input type="text" value={formData.insuranceNumber}
                    onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                    className="input" placeholder="Enter Insurance Number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry Date</label>
                  <input type="date" value={formData.insuranceExpiryDate}
                    onChange={(e) => setFormData({ ...formData, insuranceExpiryDate: e.target.value })}
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
