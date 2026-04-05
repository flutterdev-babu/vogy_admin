'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, Clock, MapPin, X, Save, Calendar, Zap, Shield, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
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
    const toastId = toast.loading('Synchronizing surge protocols...');
    try {
      if (editingCharge) {
        await peakHourChargeService.update(editingCharge.id, formData as UpdatePeakHourChargeRequest);
        toast.success('Surge configuration successfully updated', { id: toastId });
      } else {
        await peakHourChargeService.create(formData);
        toast.success('Surge configuration successfully created', { id: toastId });
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Operation failure', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    setDeleteId(id);
    const toastId = toast.loading('Executing deletion protocol...');
    try {
      await peakHourChargeService.delete(id);
      toast.success('Surge configuration purged', { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Purge failure', { id: toastId });
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (charge: PeakHourCharge) => {
    const toastId = toast.loading(`${!charge.isActive ? 'Activating' : 'Deactivating'} surge protocol...`);
    try {
      await peakHourChargeService.update(charge.id, { isActive: !charge.isActive });
      toast.success(`Protocol ${!charge.isActive ? 'ONLINE' : 'OFFLINE'}`, { id: toastId });
      fetchData();
    } catch (error) {
      toast.error('Protocol toggle failure', { id: toastId });
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
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Surge Command
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Dynamic Yield & Peak Hour Protocol Management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-red-100 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={16} />
            <span>AUTHORIZE SURGE EVENT</span>
          </button>
          <button
            onClick={fetchData}
            className="p-3 bg-white text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Control Insight */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200 text-white flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0 w-16 h-16 rounded-[2rem] bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900/40">
            <Zap size={32} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Yield Multipliers Active</h3>
            <p className="text-3xl font-black text-white mt-1 uppercase tracking-tight">{charges.filter(c => c.isActive).length} PROTOCOLS ONLINE</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Registry</p>
            <p className="text-xl font-black text-white">{charges.length} CONFIGS</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500">
            <Shield size={20} />
          </div>
        </div>
      </div>

      {/* Grid of Protocols */}
      {charges.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300 mx-auto mb-6 border border-gray-100">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">No Surge Protocols Found</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-2">Initialize your first dynamic pricing event above</p>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          {charges.map((charge) => (
            <div key={charge.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-100 group relative">
              <div className="absolute top-8 right-8 flex items-center gap-2">
                <button
                  onClick={() => openEditModal(charge)}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(charge.id)}
                  disabled={deleteId === charge.id}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                >
                  {deleteId === charge.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>

              <div className="space-y-8">
                {/* Identity & Status */}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${charge.isActive ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                    <Zap size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">{charge.name}</h3>
                      <button onClick={() => toggleActive(charge)}>
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border tracking-widest ${charge.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-gray-50 text-gray-400 border-gray-100/50'}`}>
                          {charge.isActive ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100 text-gray-500 bg-gray-50`}>
                        {charge.vehicleType?.category}
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                        {charge.vehicleType?.displayName} FLEET
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Cities */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] block">Jurisdiction</label>
                    <div className="flex flex-wrap gap-2">
                      {charge.cityCodes?.map(city => (
                        <span key={city.id} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black border border-gray-100 flex items-center gap-2 uppercase tracking-tighter">
                          <MapPin size={10} className="text-gray-300" />
                          {city.cityName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Days */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] block">Schedule</label>
                    <div className="flex flex-wrap gap-1.5">
                      {DAYS_OF_WEEK.map(day => {
                        const active = charge.days.includes(day);
                        return (
                          <span key={day} className={`w-8 h-8 flex items-center justify-center rounded-lg text-[9px] font-black border transition-all ${active ? 'bg-red-600 text-white border-red-500 shadow-sm' : 'bg-gray-50 text-gray-300 border-gray-100 opacity-50'}`}>
                            {day.slice(0, 1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Slots */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] block">Dynamic Multipliers</label>
                  <div className="grid gap-3">
                    {charge.slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                            <Clock size={14} />
                          </div>
                          <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">{slot.startTime} — {slot.endTime}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {(slot.fixedExtra ?? 0) > 0 && (
                            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl border border-emerald-100 font-mono">
                              +₹{slot.fixedExtra}
                            </div>
                          )}
                          {(slot.percentageExtra ?? 0) > 0 && (
                            <div className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-red-100 font-mono">
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
        title={editingCharge ? 'Recalibrate Surge Event' : 'Authorize New Surge Event'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-10 p-2 overflow-y-auto max-h-[75vh] pr-4 custom-scrollbar">
          {/* Basic Info */}
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Header</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-300"
                placeholder="e.g. Morning Rush Terminal"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fleet Selection</label>
              <div className="relative">
                <select
                  value={formData.vehicleTypeId}
                  onChange={(e) => setFormData({ ...formData, vehicleTypeId: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all appearance-none"
                  required
                >
                  <option value="" disabled>AUTHORIZE FLEET TYPE</option>
                  {vehicleTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.displayName} ({type.category})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cities Multi-select */}
          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1 text-white">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Jurisdictional Coverage</label>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-lg">{formData.cityCodeIds.length} ACTIVE NODES</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 max-h-56 overflow-y-auto">
              {cities.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => toggleCity(city.id)}
                  className={`px-4 py-3 text-[10px] font-black rounded-2xl border transition-all truncate text-left flex items-center gap-3 uppercase tracking-widest ${formData.cityCodeIds.includes(city.id)
                    ? 'bg-red-600 text-white border-red-500 shadow-xl shadow-red-100'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                    }`}
                >
                  <MapPin size={12} className={formData.cityCodeIds.includes(city.id) ? 'text-white' : 'text-gray-300'} />
                  {city.cityName}
                </button>
              ))}
            </div>
          </div>

          {/* Days Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temporal Window (Days)</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-5 py-3 text-[10px] font-black rounded-2xl border transition-all uppercase tracking-widest ${formData.days.includes(day)
                    ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                    }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-4 ml-1">
              <button type="button" onClick={() => setFormData(p => ({ ...p, days: DAYS_OF_WEEK.slice(0, 5) }))} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">WEEKDAYS</button>
              <button type="button" onClick={() => setFormData(p => ({ ...p, days: DAYS_OF_WEEK.slice(5) }))} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">WEEKENDS</button>
              <button type="button" onClick={() => setFormData(p => ({ ...p, days: DAYS_OF_WEEK }))} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">FULL SPECTRUM</button>
            </div>
          </div>

          {/* Slots Management */}
          <div className="space-y-6">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yield Adjustment Windows</label>
              <button type="button" onClick={addSlot} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
                <Plus size={12} /> ADD WINDOW
              </button>
            </div>
            <div className="grid gap-6">
              {formData.slots.map((slot, idx) => (
                <div key={idx} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-100">
                  <button
                    type="button"
                    onClick={() => removeSlot(idx)}
                    className="absolute -top-3 -right-3 p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-600 hover:border-red-500 shadow-xl transition-all"
                  >
                    <X size={16} />
                  </button>
                  <div className="grid gap-10 md:grid-cols-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">START PROTOCOL</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(idx, 'startTime', e.target.value)}
                          className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-gray-100"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">TERMINATE PROTOCOL</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(idx, 'endTime', e.target.value)}
                          className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-gray-100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">FIXED SURGE (INR)</label>
                        <input
                          type="number"
                          value={slot.fixedExtra}
                          onChange={(e) => updateSlot(idx, 'fixedExtra', Number(e.target.value))}
                          className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-100 font-mono"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">YIELD MULTIPLIER (%)</label>
                        <input
                          type="number"
                          value={slot.percentageExtra}
                          onChange={(e) => updateSlot(idx, 'percentageExtra', Number(e.target.value))}
                          className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-red-600 outline-none focus:ring-2 focus:ring-red-100 font-mono"
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
          <div className="flex gap-4 pt-10 sticky bottom-0 bg-white pb-4 mt-10">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">ABORT OPERATION</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:shadow-none min-w-[240px]">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              <span>{editingCharge ? 'UPDATE PROTOCOL' : 'INITIALIZE PROTOCOL'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
