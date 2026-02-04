'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { VehicleType, CreateVehicleTypeRequest, UpdateVehicleTypeRequest } from '@/types';
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

  // Form state
  const [formData, setFormData] = useState<CreateVehicleTypeRequest>({
    category: 'CAR',
    name: '',
    displayName: '',
    pricePerKm: 0,
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

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const resetForm = () => {
    setFormData({
      category: 'CAR',
      name: '',
      displayName: '',
      pricePerKm: 0,
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

  const handleDelete = async (id: string) => {
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
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage vehicle categories and pricing</p>
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
                      onClick={() => openEditModal(type)}
                      className="p-2 hover:bg-orange-50 rounded-lg text-orange-500"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
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
                    <p className="text-xs text-gray-500">Price/KM</p>
                    <p className="font-semibold text-green-600">₹{type.pricePerKm}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Base Fare</p>
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
                  <th>Price/KM</th>
                  <th>Base Fare</th>
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
                          onClick={() => openEditModal(type)}
                          className="p-2 hover:bg-orange-50 rounded-lg text-orange-500 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(type.id)}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingType ? 'Edit Vehicle Type' : 'Create Vehicle Type'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
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

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name (Identifier)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              className="input font-mono"
              placeholder="e.g., SEDAN, SUV, MPV"
              disabled={!!editingType}
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="input"
              placeholder="e.g., Sedan, SUV, MPV"
            />
          </div>

          {/* Price per KM */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price per KM (₹)
            </label>
            <input
              type="number"
              value={formData.pricePerKm}
              onChange={(e) => setFormData({ ...formData, pricePerKm: Number(e.target.value) })}
              className="input"
              placeholder="15"
              min="0"
              step="0.5"
            />
          </div>

          {/* Base Fare */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Base Fare (₹) - Optional
            </label>
            <input
              type="number"
              value={formData.baseFare || ''}
              onChange={(e) => setFormData({ ...formData, baseFare: e.target.value ? Number(e.target.value) : undefined })}
              className="input"
              placeholder="Leave empty to use global base fare"
              min="0"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              <span>{editingType ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
