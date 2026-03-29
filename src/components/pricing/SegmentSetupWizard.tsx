'use client';

import { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  DollarSign, 
  ArrowRight, 
  CheckCircle, 
  Trash2, 
  Clock, 
  Calendar,
  ChevronDown,
  Car,
  MapPin,
  Plus,
  Loader2
} from 'lucide-react';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { vehiclePricingGroupService } from '@/services/vehiclePricingGroupService';
import { peakHourChargeService } from '@/services/peakHourChargeService';
import { 
  CityCode, 
  DayOfWeek, 
  PeakHourSlot,
  CreateVehicleTypeRequest,
  CreateVehiclePricingGroupRequest,
  ServiceType
} from '@/types';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
];

interface SegmentSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  cities: CityCode[];
  onComplete: () => void;
}

export default function SegmentSetupWizard({ isOpen, onClose, cities, onComplete }: SegmentSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phase 1: Vehicle Type
  const [typeData, setTypeData] = useState<CreateVehicleTypeRequest>({
    name: '',
    displayName: '',
    category: 'CAR',
    pricePerKm: 22, // Default
    baseFare: 600,  // Default
  });

  // Phase 2: Rate Card (Pricing Group)
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([cities[0]?.id].filter(Boolean));
  const [rateData, setRateData] = useState({
    baseKm: 20,
    baseFare: 600,
    perKmPrice: 22,
    driverBaseKm: 20,
    driverBasePrice: 510,
    driverExtraPricePerKm: 18.7,
    commissionPercentage: 15,
    tollRate: 120,
    parkingRate: 0,
    gstRate: 5,
    serviceType: 'LOCAL' as ServiceType,
    bookingType: 'AIRPORT_TO_CITY',
  });

  // Phase 3: Peak Hour Slots
  const [peakSlots, setPeakSlots] = useState<PeakHourSlot[]>([
    { 
      startTime: '08:00', 
      endTime: '10:00', 
      dayAdjustments: DAYS_OF_WEEK.reduce((acc, d) => ({ ...acc, [d]: 10 }), {}) 
    }
  ]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (selectedCityIds.length === 0) {
      toast.error('Select at least one city');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Create Vehicle Type
      const typeRes = await vehicleTypeService.create(typeData);
      const vehicleTypeId = typeRes.data.id;

      // 2. Create Pricing Group
      const pricingPayload: CreateVehiclePricingGroupRequest = {
        ...rateData,
        vehicleTypeId,
        cityCodeIds: selectedCityIds,
        name: `${typeData.displayName} Default Rates`,
      };
      await vehiclePricingGroupService.create(pricingPayload);

      // 3. Create Peak Hour Charge
      await peakHourChargeService.create({
        name: `${typeData.displayName} Peak Rates`,
        vehicleTypeId,
        cityCodeIds: selectedCityIds,
        days: DAYS_OF_WEEK,
        slots: peakSlots
      });

      toast.success(`${typeData.displayName} setup completed successfully!`);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Setup failed:', error);
      toast.error('Failed to complete segment setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSlot = () => {
    setPeakSlots([...peakSlots, { 
      startTime: '18:00', 
      endTime: '20:00', 
      dayAdjustments: DAYS_OF_WEEK.reduce((acc, d) => ({ ...acc, [d]: 5 }), {}) 
    }]);
  };

  const toggleCity = (cityId: string) => {
    setSelectedCityIds(prev => 
      prev.includes(cityId) ? prev.filter(id => id !== cityId) : [...prev, cityId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Segment Setup</h2>
            <p className="text-sm text-gray-500 mt-1">Configure vehicle type, pricing, and peak hours in one go</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <StepIndicator current={step} step={1} label="Segment Info" icon={Car} />
            <div className="h-px bg-gray-200 flex-1 mx-4" />
            <StepIndicator current={step} step={2} label="Rate Card" icon={DollarSign} />
            <div className="h-px bg-gray-200 flex-1 mx-4" />
            <StepIndicator current={step} step={3} label="Peak Hours" icon={Clock} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6 max-w-xl mx-auto animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Vehicle Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {['CAR', 'AUTO', 'BIKE'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTypeData({ ...typeData, category: cat as any })}
                      className={`py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                        typeData.category === cat 
                          ? 'border-red-500 bg-red-50 text-red-600' 
                          : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Internal Name (e.g. hatchback)</label>
                  <input 
                    type="text" 
                    value={typeData.name}
                    onChange={(e) => setTypeData({ ...typeData, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
                    placeholder="hatchback"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name (e.g. Vogy Hatchback)</label>
                  <input 
                    type="text" 
                    value={typeData.displayName}
                    onChange={(e) => setTypeData({ ...typeData, displayName: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Vogy Hatchback"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 space-y-4 max-w-2xl mx-auto">
                 <div className="flex items-center gap-3">
                    <MapPin className="text-orange-500" size={18} />
                    <p className="text-xs font-black text-orange-800 uppercase tracking-widest">Select Cities for Group</p>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {cities.map(city => (
                      <label key={city.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${selectedCityIds.includes(city.id) ? 'bg-white border-orange-500 shadow-sm' : 'bg-white/50 border-transparent hover:border-orange-200'}`}>
                        <input 
                          type="checkbox" 
                          checked={selectedCityIds.includes(city.id)}
                          onChange={() => toggleCity(city.id)}
                          className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-xs font-bold text-gray-700">{city.cityName}</span>
                      </label>
                    ))}
                 </div>
               </div>

                <div className="grid grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Service Type</label>
                    <div className="relative">
                      <select 
                        value={rateData.serviceType}
                        onChange={e => setRateData({...rateData, serviceType: e.target.value as ServiceType})}
                        className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-100 transition-all appearance-none shadow-sm"
                      >
                         <option value="LOCAL">📍 Local Hourly</option>
                         <option value="AIRPORT">✈ Airport Transfers</option>
                         <option value="OUTSTATION">🛣 Outstation Trips</option>
                         <option value="RENTAL">📅 Long-Term Rental</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <HighFidelityInput label="Base KM" value={rateData.baseKm} onChange={(v) => setRateData({...rateData, baseKm: v})} />
                  <HighFidelityInput label="Base Fare" value={rateData.baseFare} onChange={(v) => setRateData({...rateData, baseFare: v})} />
                  <HighFidelityInput label="Price Per KM" value={rateData.perKmPrice} onChange={(v) => setRateData({...rateData, perKmPrice: v})} />
                  <HighFidelityInput label="Driver Base KM" value={rateData.driverBaseKm} onChange={(v) => setRateData({...rateData, driverBaseKm: v})} />
                  <HighFidelityInput label="Driver Base Price" value={rateData.driverBasePrice} onChange={(v) => setRateData({...rateData, driverBasePrice: v})} />
                  <HighFidelityInput label="Commission (%)" value={rateData.commissionPercentage} onChange={(v) => setRateData({...rateData, commissionPercentage: v})} />
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <p className="text-sm font-bold text-blue-800">Configure Peak Hour Multipliers</p>
                 <button onClick={addSlot} className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2 border border-blue-200">
                   <Plus size={14} /> Add Slot
                 </button>
               </div>

                 {/* Horizontal Column Layout for Peak Sections */}
                 <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                   {peakSlots.map((slot, sIdx) => (
                     <div key={sIdx} className="w-[360px] flex-shrink-0 border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-gray-50/20">
                       <div className="bg-gray-50/80 py-3 text-center border-b border-gray-100">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Section {sIdx + 1}</span>
                       </div>
                       <div className="p-4 space-y-4">
                         <div className="flex items-center justify-center gap-4 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                            <input type="time" value={slot.startTime} className="bg-transparent text-xs font-bold focus:outline-none" onChange={(e) => updatePeakTime(sIdx, 'startTime', e.target.value)} />
                            <ChevronDown size={14} className="text-gray-300" />
                            <input type="time" value={slot.endTime} className="bg-transparent text-xs font-bold focus:outline-none" onChange={(e) => updatePeakTime(sIdx, 'endTime', e.target.value)} />
                         </div>
                         <div className="bg-white border border-gray-100 rounded-xl overflow-hidden text-[11px]">
                            <table className="w-full text-left">
                               <tbody className="divide-y divide-gray-50">
                                 {DAYS_OF_WEEK.map(day => (
                                    <tr key={day} className="hover:bg-gray-50/50">
                                       <td className="px-4 py-2 bg-gray-50/50 font-black text-gray-400 uppercase tracking-widest border-r border-gray-50 w-20">{day.slice(0, 3)}</td>
                                       <td className="px-4 py-2 text-right">
                                          <div className="flex items-center justify-end gap-1">
                                             <input 
                                               type="number" 
                                               value={slot.dayAdjustments?.[day] || 0}
                                               onChange={(e) => updatePeakAdjust(sIdx, day, Number(e.target.value))}
                                               className="w-10 text-right font-bold text-gray-700 bg-transparent focus:outline-none"
                                             />
                                             <span className="text-gray-300">%</span>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                               </tbody>
                            </table>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between bg-white sticky bottom-0">
          <button 
            onClick={step === 1 ? onClose : handleBack}
            className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            {step === 1 ? 'Cancel' : <><ChevronLeft size={18} /> Back</>}
          </button>
          
          <button 
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={isSubmitting || (step === 1 && (!typeData.name || !typeData.displayName))}
            className="px-10 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : step === 3 ? 'Finalize Setup' : 'Continue'}
            {step !== 3 && !isSubmitting && <ChevronRight size={18} />}
            {step === 3 && !isSubmitting && <Check size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  function updatePeakTime(idx: number, field: 'startTime' | 'endTime', value: string) {
    setPeakSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }

  function updatePeakAdjust(idx: number, day: DayOfWeek, value: number) {
    setPeakSlots(prev => prev.map((s, i) => i === idx ? { ...s, dayAdjustments: { ...s.dayAdjustments, [day]: value } } : s));
  }
}

function StepIndicator({ current, step, label, icon: Icon }: { current: number; step: number; label: string; icon: any }) {
  const active = current === step;
  const completed = current > step;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
        active 
          ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
          : completed ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-300'
      }`}>
        <Icon size={20} />
      </div>
      <div className="hidden sm:block">
        <p className={`text-[10px] uppercase font-black tracking-widest ${active ? 'text-red-500' : 'text-gray-400'}`}>{label}</p>
      </div>
    </div>
  );
}

function HighFidelityInput({ label, value, onChange }: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void; 
}) {
  return (
    <div className="space-y-2">
       <div className="flex h-11 ring-1 ring-gray-100 rounded-xl overflow-hidden focus-within:ring-red-100 transition-all shadow-sm">
          <div className="w-[140px] bg-red-50/50 flex items-center px-4 border-r border-gray-100">
             <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{label}</span>
          </div>
          <input 
            type="number" 
            value={value} 
            onChange={e => onChange(Number(e.target.value))}
            className="flex-1 bg-white px-4 text-xs font-bold text-gray-700 focus:outline-none"
          />
       </div>
    </div>
  );
}
