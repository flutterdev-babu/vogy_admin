'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, DollarSign, MapPin, X, Save } from 'lucide-react';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { vehiclePricingGroupService } from '@/services/vehiclePricingGroupService';
import { cityCodeService } from '@/services/cityCodeService';
import { 
  VehicleType, 
  CreateVehicleTypeRequest, 
  UpdateVehicleTypeRequest,
  VehiclePricingGroup,
  CityCode,
  CreateVehiclePricingGroupRequest,
  UpdateVehiclePricingGroupRequest
} from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { CategoryBadge, ActiveBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function VehicleTypesPage() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<VehicleType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pricing Group Logic State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [selectedTypeForPricing, setSelectedTypeForPricing] = useState<VehicleType | null>(null);
  const [pricingGroups, setPricingGroups] = useState<VehiclePricingGroup[]>([]);
  const [cities, setCities] = useState<CityCode[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isPricingGroupModalOpen, setIsPricingGroupModalOpen] = useState(false);
  const [editingPricingGroup, setEditingPricingGroup] = useState<VehiclePricingGroup | null>(null);
  const [isPricingSubmitting, setIsPricingSubmitting] = useState(false);
  const [pricingFormData, setPricingFormData] = useState<CreateVehiclePricingGroupRequest>({
    vehicleTypeId: '',
    name: '',
    baseKm: 2,
    baseFare: 50,
    perKmPrice: 15,
    cityCodeIds: [],
  });

  // Form state for Vehicle Type
  const [formData, setFormData] = useState<CreateVehicleTypeRequest>({
    category: 'CAR',
    name: '',
    displayName: '',
    pricePerKm: 15,
    baseFare: undefined,
  });

  const fetchVehicleTypes = async () => {
    try {
      const response = await vehicleTypeService.getAll();
      setVehicleTypes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch vehicle types:', error);
      toast.error('Failed to load vehicle types');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await cityCodeService.getAll();
      setCities(response.data || []);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
    fetchCities();
  }, []);

  const resetForm = () => {
    setFormData({
      category: 'CAR',
      name: '',
      displayName: '',
      pricePerKm: 15,
      baseFare: undefined,
    });
    setEditingType(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (type: VehicleType) => {
    setEditingType(type);
    setFormData({
      category: type.category,
      name: type.name,
      displayName: type.displayName,
      pricePerKm: type.pricePerKm,
      baseFare: type.baseFare || undefined,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.displayName || formData.pricePerKm <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingType) {
        const updateData: UpdateVehicleTypeRequest = {
          displayName: formData.displayName,
          pricePerKm: formData.pricePerKm,
          baseFare: formData.baseFare,
        };
        await vehicleTypeService.update(editingType.id, updateData);
        toast.success('Vehicle type updated successfully');
      } else {
        await vehicleTypeService.create(formData);
        toast.success('Vehicle type created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchVehicleTypes();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pricing Group Handlers
  const fetchPricingGroups = async (typeId: string) => {
    setIsPricingLoading(true);
    try {
      const response = await vehiclePricingGroupService.getAll(typeId);
      setPricingGroups(response.data || []);
    } catch (error) {
      console.error('Failed to fetch pricing groups:', error);
      toast.error('Failed to load pricing groups');
    } finally {
      setIsPricingLoading(false);
    }
  };

  const openPricingManager = (type: VehicleType) => {
    setSelectedTypeForPricing(type);
    fetchPricingGroups(type.id);
    setIsPricingModalOpen(true);
  };

  const resetPricingForm = (typeId: string) => {
    setPricingFormData({
      vehicleTypeId: typeId,
      name: '',
      baseKm: 2,
      baseFare: 50,
      perKmPrice: 15,
      cityCodeIds: [],
    });
    setEditingPricingGroup(null);
  };

  const openPricingGroupForm = (group?: VehiclePricingGroup) => {
    if (group) {
      setEditingPricingGroup(group);
      setPricingFormData({
        vehicleTypeId: group.vehicleTypeId,
        name: group.name || '',
        baseKm: group.baseKm,
        baseFare: group.baseFare,
        perKmPrice: group.perKmPrice,
        cityCodeIds: group.cityCodeIds,
      });
    } else {
      resetPricingForm(selectedTypeForPricing!.id);
    }
    setIsPricingGroupModalOpen(true);
  };

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pricingFormData.cityCodeIds.length === 0) {
      toast.error('Select at least one city');
      return;
    }

    setIsPricingSubmitting(true);
    try {
      if (editingPricingGroup) {
        await vehiclePricingGroupService.update(editingPricingGroup.id, pricingFormData as UpdateVehiclePricingGroupRequest);
        toast.success('Pricing group updated');
      } else {
        await vehiclePricingGroupService.create(pricingFormData);
        toast.success('Pricing group created');
      }
      setIsPricingGroupModalOpen(false);
      fetchPricingGroups(selectedTypeForPricing!.id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save pricing group');
    } finally {
      setIsPricingSubmitting(false);
    }
  };

  const handleDeletePricingGroup = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await vehiclePricingGroupService.delete(id);
      toast.success('Pricing group deleted');
      fetchPricingGroups(selectedTypeForPricing!.id);
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const toggleCityInForm = (cityId: string) => {
    setPricingFormData(prev => ({
      ...prev,
      cityCodeIds: prev.cityCodeIds.includes(cityId)
        ? prev.cityCodeIds.filter(id => id !== cityId)
        : [...prev.cityCodeIds, cityId]
    }));
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle type?')) return;
    setDeleteId(id);
    try {
      await vehicleTypeService.delete(id);
      toast.success('Vehicle type deleted successfully');
      fetchVehicleTypes();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (type: VehicleType) => {
    try {
      await vehicleTypeService.update(type.id, { isActive: !type.isActive });
      toast.success(`Vehicle type ${!type.isActive ? 'activated' : 'deactivated'}`);
      fetchVehicleTypes();
    } catch (error) {
      console.error('Failed to toggle active state:', error);
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vehicle Types</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage categories and city-based pricing</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={20} />
          <span>Add Vehicle Type</span>
        </button>
      </div>

      {/* Content */}
      {vehicleTypes.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <p className="text-gray-500">No vehicle types found. Create your first one!</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {vehicleTypes.map((type) => (
              <div key={type.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryBadge category={type.category} />
                      <button onClick={() => toggleActive(type)}>
                        <ActiveBadge isActive={type.isActive} />
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-800 truncate">{type.displayName}</h3>
                    <p className="text-xs text-gray-500 font-mono">{type.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openPricingManager(type)}
                      className="p-2 hover:bg-orange-50 rounded-lg text-orange-600"
                      title="Manage Pricing Groups"
                    >
                      <DollarSign size={18} />
                    </button>
                    <button
                      onClick={() => openEditModal(type)}
                      className="p-2 hover:bg-orange-50 rounded-lg text-orange-500"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteType(type.id)}
                      disabled={deleteId === type.id}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500 disabled:opacity-50"
                    >
                      {deleteId === type.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Default Price/KM</p>
                    <p className="font-semibold text-green-600">₹{type.pricePerKm}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Default Base Fare</p>
                    <p className="font-semibold text-gray-600">{type.baseFare ? `₹${type.baseFare}` : '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Name</th>
                  <th>Display Name</th>
                  <th>Default Price/KM</th>
                  <th>Default Base Fare</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicleTypes.map((type) => (
                  <tr key={type.id}>
                    <td><CategoryBadge category={type.category} /></td>
                    <td className="font-mono text-sm text-gray-600">{type.name}</td>
                    <td className="font-semibold text-gray-800">{type.displayName}</td>
                    <td className="font-semibold text-green-600">₹{type.pricePerKm}</td>
                    <td className="text-gray-600">{type.baseFare ? `₹${type.baseFare}` : '-'}</td>
                    <td>
                      <button onClick={() => toggleActive(type)}>
                        <ActiveBadge isActive={type.isActive} />
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPricingManager(type)}
                          className="p-2 hover:bg-orange-100 rounded-lg text-orange-600 transition-colors"
                          title="Manage Pricing Groups"
                        >
                          <DollarSign size={18} />
                        </button>
                        <button
                          onClick={() => openEditModal(type)}
                          className="p-2 hover:bg-orange-50 rounded-lg text-orange-500 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteType(type.id)}
                          disabled={deleteId === type.id}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deleteId === type.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Main Vehicle Type Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingType ? 'Edit Vehicle Type' : 'Create Vehicle Type'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as 'BIKE' | 'AUTO' | 'CAR' })}
              className="input"
              disabled={!!editingType}
            >
              <option value="BIKE">BIKE</option>
              <option value="AUTO">AUTO</option>
              <option value="CAR">CAR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name (Identifier)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              className="input font-mono"
              placeholder="e.g., SEDAN"
              disabled={!!editingType}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="input"
              placeholder="e.g., Sedan"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Price per KM (₹)</label>
            <input
              type="number"
              value={formData.pricePerKm}
              onChange={(e) => setFormData({ ...formData, pricePerKm: Number(e.target.value) })}
              className="input"
              min="0"
              step="0.5"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Base Fare (₹) - Optional</label>
            <input
              type="number"
              value={formData.baseFare || ''}
              onChange={(e) => setFormData({ ...formData, baseFare: e.target.value ? Number(e.target.value) : undefined })}
              className="input"
              placeholder="Global default"
              min="0"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              <span>{editingType ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* PRICING GROUPS MANAGER MODAL */}
      <Modal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        title={`Pricing Groups: ${selectedTypeForPricing?.displayName}`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Manage city-specific pricing for this vehicle type.</p>
            <button 
              onClick={() => openPricingGroupForm()} 
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Add Group
            </button>
          </div>

          {isPricingLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
          ) : pricingGroups.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">No special pricing groups for this vehicle type.</p>
            </div>
          ) : (
            <div className="grid gap-4 max-h-[50vh] overflow-y-auto pr-2">
              {pricingGroups.map(group => (
                <div key={group.id} className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-between group hover:border-orange-200 transition-colors shadow-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-800">{group.name || 'Unnamed Group'}</h4>
                      <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                        ₹{group.perKmPrice}/km
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.cityCodes?.map(c => (
                        <span key={c.id} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200">
                          {c.cityName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Base</p>
                      <p className="text-sm font-bold text-gray-700">₹{group.baseFare} · {group.baseKm}km</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openPricingGroupForm(group)} className="p-2 hover:bg-orange-50 text-orange-500 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeletePricingGroup(group.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* PRICING GROUP EDIT/CREATE MODAL */}
      <Modal
        isOpen={isPricingGroupModalOpen}
        onClose={() => setIsPricingGroupModalOpen(false)}
        title={editingPricingGroup ? 'Edit Pricing Group' : 'New Pricing Group'}
      >
        <form onSubmit={handlePricingSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Group Name</label>
            <input 
              type="text" 
              className="input" 
              value={pricingFormData.name} 
              onChange={e => setPricingFormData({...pricingFormData, name: e.target.value})}
              placeholder="e.g. Metro Cities"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-required">Price/KM (₹)</label>
              <input type="number" className="input" step="0.5" required
                value={pricingFormData.perKmPrice} onChange={e => setPricingFormData({...pricingFormData, perKmPrice: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 font-required">Base Fare (₹)</label>
              <input type="number" className="input" required
                value={pricingFormData.baseFare} onChange={e => setPricingFormData({...pricingFormData, baseFare: Number(e.target.value)})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-required">Base distance (KM)</label>
            <input type="number" className="input" required
              value={pricingFormData.baseKm} onChange={e => setPricingFormData({...pricingFormData, baseKm: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-required">Apply to Cities</label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-40 overflow-y-auto">
              {cities.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => toggleCityInForm(city.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    pricingFormData.cityCodeIds.includes(city.id)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {city.cityName}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsPricingGroupModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isPricingSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isPricingSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{editingPricingGroup ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

