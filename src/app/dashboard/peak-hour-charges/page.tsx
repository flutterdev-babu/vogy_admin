'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, Clock, MapPin, X, Save, Calendar } from 'lucide-react';
import { peakHourChargeService } from '@/services/peakHourChargeService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { cityCodeService } from '@/services/cityCodeService';
import { 
  PeakHourCharge, 
  PeakHourSlot,
  DayOfWeek,
  VehicleType, 
  CityCode,
  CreatePeakHourChargeRequest,
  UpdatePeakHourChargeRequest
} from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { CategoryBadge, ActiveBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
];

export default function PeakHourChargesPage() {
  const [charges, setCharges] = useState<PeakHourCharge[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [cities, setCities] = useState<CityCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<PeakHourCharge | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreatePeakHourChargeRequest>({
    name: '',
    vehicleTypeId: '',
    cityCodeIds: [],
    days: [],
    slots: [
      { startTime: '08:00', endTime: '10:00', fixedExtra: 0, percentageExtra: 0 }
    ],
  });

  const fetchData = async () => {
    try {
      const [chargesRes, typesRes, citiesRes] = await Promise.all([
        peakHourChargeService.getAll(),
        vehicleTypeService.getAll(),
        cityCodeService.getAll()
      ]);
      setCharges(chargesRes.data || []);
      setVehicleTypes(typesRes.data || []);
      setCities(citiesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load peak hour charges');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      vehicleTypeId: '',
      cityCodeIds: [],
      days: [],
      slots: [
        { startTime: '08:00', endTime: '10:00', fixedExtra: 0, percentageExtra: 0 }
      ],
    });
    setEditingCharge(null);
  };

  const openCreateModal = () => {
    resetForm();
    if (vehicleTypes.length > 0) {
      setFormData(prev => ({ ...prev, vehicleTypeId: vehicleTypes[0].id }));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (charge: PeakHourCharge) => {
    setEditingCharge(charge);
    setFormData({
      name: charge.name,
      vehicleTypeId: charge.vehicleTypeId,
      cityCodeIds: charge.cityCodeIds,
      days: charge.days,
      slots: charge.slots,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.vehicleTypeId || formData.cityCodeIds.length === 0 || formData.days.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.slots.length === 0) {
        toast.error('Add at least one time slot');
        return;
    }

    setIsSubmitting(true);
    try {
      if (editingCharge) {
        await peakHourChargeService.update(editingCharge.id, formData as UpdatePeakHourChargeRequest);
        toast.success('Peak hour charge updated successfully');
      } else {
        await peakHourChargeService.create(formData);
        toast.success('Peak hour charge created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    setDeleteId(id);
    try {
      await peakHourChargeService.delete(id);
      toast.success('Configuration deleted successfully');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (charge: PeakHourCharge) => {
    try {
      await peakHourChargeService.update(charge.id, { isActive: !charge.isActive });
      toast.success(`Configuration ${!charge.isActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleCity = (cityId: string) => {
    setFormData(prev => ({
      ...prev,
      cityCodeIds: prev.cityCodeIds.includes(cityId)
        ? prev.cityCodeIds.filter(id => id !== cityId)
        : [...prev.cityCodeIds, cityId]
    }));
  };

  const toggleDay = (day: DayOfWeek) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const addSlot = () => {
    setFormData(prev => ({
      ...prev,
      slots: [...prev.slots, { startTime: '18:00', endTime: '21:00', fixedExtra: 0, percentageExtra: 0 }]
    }));
  };

  const removeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index)
    }));
  };

  const updateSlot = (index: number, field: keyof PeakHourSlot, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.map((slot, i) => i === index ? { ...slot, [field]: value } : slot)
    }));
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="animate-fade-in text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Peak Hour Charges</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Configure dynamic pricing for high-demand periods</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={20} />
          <span>Add Peak Charge</span>
        </button>
      </div>

      {/* List */}
      {charges.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <p className="text-gray-500">No peak hour charges configured.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {charges.map((charge) => (
            <div key={charge.id} className="card p-6 border border-gray-100 hover:border-red-200 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold">{charge.name}</h3>
                            <button onClick={() => toggleActive(charge)}>
                                <ActiveBadge isActive={charge.isActive} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                             <CategoryBadge category={charge.vehicleType?.category || 'CAR'} />
                             <span className="text-sm font-semibold text-gray-700">{charge.vehicleType?.displayName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                        onClick={() => openEditModal(charge)}
                        className="p-2 hover:bg-orange-50 rounded-lg text-orange-500 transition-colors"
                        >
                        <Edit2 size={18} />
                        </button>
                        <button
                        onClick={() => handleDelete(charge.id)}
                        disabled={deleteId === charge.id}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors disabled:opacity-50"
                        >
                        {deleteId === charge.id ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Trash2 size={18} />
                        )}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Cities */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Applicable Cities</label>
                        <div className="flex flex-wrap gap-1">
                            {charge.cityCodes?.map(city => (
                                <span key={city.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200 flex items-center gap-1">
                                    <MapPin size={10} />
                                    {city.cityName}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Days */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Applicable Days</label>
                        <div className="flex flex-wrap gap-1">
                            {charge.days.map(day => (
                                <span key={day} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold border border-red-100 uppercase">
                                    {day.slice(0, 3)}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Slots */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Peak Slots & Extras</label>
                        <div className="grid gap-2">
                             {charge.slots.map((slot, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                     <div className="flex items-center gap-2 text-sm font-semibold">
                                         <Clock size={14} className="text-gray-400" />
                                         <span>{slot.startTime} - {slot.endTime}</span>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         {slot.fixedExtra > 0 && (
                                             <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                 +₹{slot.fixedExtra}
                                             </div>
                                         )}
                                         {slot.percentageExtra > 0 && (
                                             <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                                 +{slot.percentageExtra}%
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingCharge ? 'Edit Peak Charge' : 'New Peak Charge'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Configuration Name</label>
                <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g. Morning Rush"
                required
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                <select
                value={formData.vehicleTypeId}
                onChange={(e) => setFormData({ ...formData, vehicleTypeId: e.target.value })}
                className="input"
                required
                >
                <option value="" disabled>Select vehicle type</option>
                {vehicleTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.displayName} ({type.category})</option>
                ))}
                </select>
            </div>
          </div>

          {/* Cities Multi-select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                <span>Apply to Cities</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{formData.cityCodeIds.length} Selected</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 max-h-40 overflow-y-auto">
              {cities.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => toggleCity(city.id)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all truncate text-left flex items-center gap-2 ${
                    formData.cityCodeIds.includes(city.id)
                      ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-200'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-red-200'
                  }`}
                >
                  <MapPin size={12} />
                  {city.cityName}
                </button>
              ))}
            </div>
          </div>

          {/* Days Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Applicable Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                    formData.days.includes(day)
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-orange-200'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setFormData(p => ({...p, days: DAYS_OF_WEEK.slice(0, 5)}))} className="text-[10px] font-bold text-blue-600 hover:underline">Weekdays</button>
                <button type="button" onClick={() => setFormData(p => ({...p, days: DAYS_OF_WEEK.slice(5)}))} className="text-[10px] font-bold text-blue-600 hover:underline">Weekends</button>
                <button type="button" onClick={() => setFormData(p => ({...p, days: DAYS_OF_WEEK}))} className="text-[10px] font-bold text-blue-600 hover:underline">All Days</button>
            </div>
          </div>

          {/* Slots Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Peak Slots & Pricing Adjustments</label>
              <button type="button" onClick={addSlot} className="text-xs font-bold text-red-600 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                <Plus size={14} /> Add Slot
              </button>
            </div>
            <div className="space-y-4">
              {formData.slots.map((slot, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                  <button 
                    type="button" 
                    onClick={() => removeSlot(idx)}
                    className="absolute -top-2 -right-2 p-1 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:border-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Start Time</label>
                        <input 
                          type="time" 
                          value={slot.startTime} 
                          onChange={(e) => updateSlot(idx, 'startTime', e.target.value)}
                          className="input py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">End Time</label>
                        <input 
                          type="time" 
                          value={slot.endTime} 
                          onChange={(e) => updateSlot(idx, 'endTime', e.target.value)}
                          className="input py-1.5 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Fixed Extra (₹)</label>
                        <input 
                          type="number" 
                          value={slot.fixedExtra} 
                          onChange={(e) => updateSlot(idx, 'fixedExtra', Number(e.target.value))}
                          className="input py-1.5 text-sm"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Percentage (%)</label>
                        <input 
                          type="number" 
                          value={slot.percentageExtra} 
                          onChange={(e) => updateSlot(idx, 'percentageExtra', Number(e.target.value))}
                          className="input py-1.5 text-sm"
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 sticky bottom-0 bg-white pb-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{editingCharge ? 'Update Configuration' : 'Create Configuration'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
