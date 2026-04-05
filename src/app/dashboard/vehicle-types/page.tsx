'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  DollarSign,
  MapPin,
  X,
  Save,
  ChevronDown,
  Clock,
  Car,
  Settings,
  RefreshCw,
  PlusCircle,
  Globe,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { vehiclePricingGroupService } from '@/services/vehiclePricingGroupService';
import { peakHourChargeService } from '@/services/peakHourChargeService';
import { cityCodeService } from '@/services/cityCodeService';
import {
  VehicleType,
  CreateVehicleTypeRequest,
  UpdateVehicleTypeRequest,
  VehiclePricingGroup,
  CityCode,
  CreateVehiclePricingGroupRequest,
  UpdateVehiclePricingGroupRequest,
  PeakHourCharge,
  PeakHourSlot,
  DayOfWeek,
  ServiceType
} from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { CategoryBadge, ActiveBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import SegmentSetupWizard from '@/components/pricing/SegmentSetupWizard';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
];

type PricingModalView = 'LIST_CLUSTERS' | 'EDIT_CLUSTER';

export default function VehicleTypesPage() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<VehicleType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Pricing Cluster Logic
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingModalView, setPricingModalView] = useState<PricingModalView>('LIST_CLUSTERS');
  const [selectedTypeForPricing, setSelectedTypeForPricing] = useState<VehicleType | null>(null);
  const [pricingGroups, setPricingGroups] = useState<VehiclePricingGroup[]>([]);
  const [activeServiceTab, setActiveServiceTab] = useState<ServiceType | 'ALL'>('ALL');
  const [cities, setCities] = useState<CityCode[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isPricingSubmitting, setIsPricingSubmitting] = useState(false);

  // Active Group within Pricing Modal
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [pricingFormData, setPricingFormData] = useState<any>({
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
    cityCodeIds: [],
    serviceType: 'LOCAL' as ServiceType,
    bookingType: 'AIRPORT_TO_CITY'
  });

  // Peak Hour State for ACTIVE Group
  const [peakCharges, setPeakCharges] = useState<PeakHourCharge[]>([]);
  const [isPeakLoading, setIsPeakLoading] = useState(false);

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
    if (!formData.name || !formData.displayName) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingType) {
        await vehicleTypeService.update(editingType.id, {
          displayName: formData.displayName,
          pricePerKm: formData.pricePerKm,
          baseFare: formData.baseFare,
        });
        toast.success('Vehicle type updated');
      } else {
        await vehicleTypeService.create(formData);
        toast.success('Vehicle type created');
      }
      setIsModalOpen(false);
      fetchVehicleTypes();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pricing Group Handlers (Cluster Based)
  const fetchPricingGroups = async (typeId: string) => {
    setIsPricingLoading(true);
    try {
      const response = await vehiclePricingGroupService.getAll(typeId);
      setPricingGroups(response.data || []);
    } catch (error) {
      toast.error('Failed to load pricing groups');
    } finally {
      setIsPricingLoading(false);
    }
  };

  const loadGroupForEdit = async (group: VehiclePricingGroup) => {
    setActiveGroupId(group.id);
    setPricingFormData({
      baseKm: group.baseKm,
      baseFare: group.baseFare,
      perKmPrice: group.perKmPrice,
      driverBaseKm: group.driverBaseKm || 0,
      driverBasePrice: group.driverBasePrice || 0,
      driverExtraPricePerKm: group.driverExtraPricePerKm || 0,
      commissionPercentage: group.commissionPercentage || 0,
      tollRate: group.tollRate || 0,
      parkingRate: group.parkingRate || 0,
      gstRate: group.gstRate || 0,
      cityCodeIds: group.cityCodeIds,
      serviceType: group.serviceType || 'LOCAL',
      bookingType: group.bookingType || 'AIRPORT_TO_CITY'
    });

    setIsPeakLoading(true);
    try {
      const peakRes = await peakHourChargeService.getAll(selectedTypeForPricing?.id);
      setPeakCharges(peakRes.data || []);
    } catch (e) {
      console.error('Peak fetch error', e);
    } finally {
      setIsPeakLoading(false);
    }
    setPricingModalView('EDIT_CLUSTER');
  };

  const createNewCluster = async () => {
    if (!selectedTypeForPricing) return;
    setIsPricingSubmitting(true);
    try {
      const newGroupReq: CreateVehiclePricingGroupRequest = {
        name: `New Cluster - ${cities.find(c => !pricingGroups.some(g => g.cityCodeIds.includes(c.id)))?.cityName || 'General'}`,
        vehicleTypeId: selectedTypeForPricing.id,
        cityCodeIds: [],
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
        serviceType: 'LOCAL',
        bookingType: 'AIRPORT_TO_CITY'
      };
      await vehiclePricingGroupService.create(newGroupReq);
      toast.success('New city cluster created');
      fetchPricingGroups(selectedTypeForPricing.id);
    } catch (error) {
      toast.error('Failed to create cluster');
    } finally {
      setIsPricingSubmitting(false);
    }
  };

  const openPricingManager = (type: VehicleType) => {
    setSelectedTypeForPricing(type);
    setPricingModalView('LIST_CLUSTERS');
    setActiveServiceTab('ALL');
    fetchPricingGroups(type.id);
    setIsPricingModalOpen(true);
  };

  const handlePricingUpdate = async () => {
    if (!activeGroupId) return;
    setIsPricingSubmitting(true);
    try {
      await vehiclePricingGroupService.update(activeGroupId, pricingFormData);
      toast.success('Pricing details updated successfully');
      fetchPricingGroups(selectedTypeForPricing!.id);
    } catch (error) {
      toast.error('Failed to update cluster rates');
    } finally {
      setIsPricingSubmitting(false);
    }
  };

  const handlePeakUpdate = async (peakId: string, slots: PeakHourSlot[]) => {
    try {
      await peakHourChargeService.update(peakId, { slots });
      toast.success('Peak timing updated');
    } catch (error) {
      toast.error('Failed to update peak timings');
    }
  };

  const toggleCityInForm = (cityId: string) => {
    setPricingFormData((prev: any) => {
      const cityCodeIds = prev.cityCodeIds.includes(cityId)
        ? prev.cityCodeIds.filter((id: string) => id !== cityId)
        : [...prev.cityCodeIds, cityId];
      return { ...prev, cityCodeIds };
    });
  };

  const toggleActive = async (type: VehicleType) => {
    try {
      await vehicleTypeService.update(type.id, { isActive: !type.isActive });
      fetchVehicleTypes();
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Fleet Segments</h1>
          <p className="text-sm text-gray-500 font-medium">Vehicle classification and dynamic pricing clusters</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xl font-black text-gray-900 leading-none">{vehicleTypes.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Active Segments</span>
            </div>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs shadow-lg shadow-gray-200 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
          >
            <PlusCircle size={16} />
            <span>QUICK SETUP WIZARD</span>
          </button>
        </div>
      </div>

      <SegmentSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        cities={cities}
        onComplete={() => fetchVehicleTypes()}
      />

      {/* Main Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono text-center">Class</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Segment Identity</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono text-center">Basics</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono text-center">Status</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicleTypes.map((type) => (
                <tr key={type.id} className="group transition-all duration-200 hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <CategoryBadge category={type.category} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900 tracking-tight">{type.displayName}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{type.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-gray-900">₹{type.baseFare || '0'}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Base</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-emerald-600">₹{type.pricePerKm}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Per KM</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button onClick={() => toggleActive(type)} className="transition-transform active:scale-90">
                        <ActiveBadge isActive={type.isActive} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right pr-8">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                      <button
                        onClick={() => openPricingManager(type)}
                        className="p-2.5 bg-white hover:bg-gray-900 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-100 shadow-sm"
                        title="Manage Rate Clusters"
                      >
                        <DollarSign size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(type)}
                        className="p-2.5 bg-white hover:bg-gray-900 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-100 shadow-sm"
                        title="Edit Identity"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLUSTER BASED PRICING MODAL (PREMIUM RE-IMAGINED) */}
      <Modal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        title={pricingModalView === 'LIST_CLUSTERS' ? 'Service Rate Network' : 'Configure cluster'}
        size="xl"
      >
        <div className="min-h-[500px] p-2">
          {pricingModalView === 'LIST_CLUSTERS' ? (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-gray-200">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Regional Clusters</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{selectedTypeForPricing?.displayName} fleet</p>
                  </div>
                </div>
                <button
                  onClick={createNewCluster}
                  disabled={isPricingSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                >
                  {isPricingSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>INITIALIZE CLUSTER</span>
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                {['ALL', 'LOCAL', 'AIRPORT', 'OUTSTATION', 'RENTAL'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveServiceTab(tab as ServiceType | 'ALL')}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeServiceTab === tab ? 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {pricingGroups.filter(g => activeServiceTab === 'ALL' || g.serviceType === activeServiceTab).length === 0 && !isPricingLoading && (
                  <div className="py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                    <MapPin size={32} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">No nodes configured for this filter</p>
                  </div>
                )}
                {pricingGroups.filter(g => activeServiceTab === 'ALL' || g.serviceType === activeServiceTab).map((group, idx) => (
                  <div key={group.id} className="group bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-gray-50 transition-all flex items-center justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-[11px] font-black text-gray-400 border border-gray-100 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">{idx + 1}</div>
                        <div className="flex flex-col">
                          <h4 className="font-black text-gray-900 tracking-tight">{group.name}</h4>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{group.serviceType || 'GLOBAL'}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.cityCodeIds.map(cityId => (
                          <span key={cityId} className="px-3 py-1 bg-gray-50 text-[10px] font-black text-gray-500 rounded-lg border border-gray-100 uppercase tracking-widest">
                            {cities.find(c => c.id === cityId)?.cityName || cityId}
                          </span>
                        ))}
                        {group.cityCodeIds.length === 0 && <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic ml-1">Universal Cluster</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          if (confirm('Destructive Action: Remove this cluster permanently?')) {
                            try {
                              await vehiclePricingGroupService.delete(group.id);
                              toast.success('Cluster purged');
                              fetchPricingGroups(selectedTypeForPricing!.id);
                            } catch (err) {
                              toast.error('Deletion failed');
                            }
                          }
                        }}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        title="Purge Cluster"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => loadGroupForEdit(group)}
                        className="flex items-center gap-3 pl-6 pr-4 py-3 bg-gray-50 group-hover:bg-gray-900 text-gray-400 group-hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-gray-100 group-hover:border-gray-900 shadow-sm"
                      >
                        <span>ADJUST RATES</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              {/* Specialized Header for Rate Adjustment */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <button
                  onClick={() => setPricingModalView('LIST_CLUSTERS')}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all text-[10px] font-black text-gray-400 uppercase tracking-widest"
                >
                  <ArrowLeft size={16} />
                  <span>NETWORK DIRECTORY</span>
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-lg">Sync Active</span>
                  <button onClick={() => fetchPricingGroups(selectedTypeForPricing!.id)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                    <RefreshCw size={18} className={isPricingLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* High-Contrast Rate Card */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Field Adjustments (3/5 width) */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Rate Parameters</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Active Nodes</label>
                          <div className="flex flex-wrap gap-2 p-4 bg-gray-50/50 rounded-2xl border border-gray-50 min-h-[100px] max-h-[200px] overflow-y-auto custom-scrollbar">
                            {cities.map(city => (
                              <button
                                key={city.id}
                                type="button"
                                onClick={() => toggleCityInForm(city.id)}
                                className={`px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all ${pricingFormData.cityCodeIds.includes(city.id) ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                              >
                                {city.cityName}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="group">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Service Topology</label>
                            <select
                              value={pricingFormData.serviceType}
                              onChange={e => setPricingFormData({ ...pricingFormData, serviceType: e.target.value as ServiceType })}
                              className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 text-xs font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase appearance-none"
                            >
                              <option value="LOCAL">Local Hourly</option>
                              <option value="AIRPORT">Airport Express</option>
                              <option value="OUTSTATION">Inter-City Hub</option>
                              <option value="RENTAL">Subscription/Rental</option>
                            </select>
                          </div>

                          <MockInput label="Mileage Cap (KM)" value={pricingFormData.baseKm} onChange={v => setPricingFormData({ ...pricingFormData, baseKm: v })} />
                          <MockInput label="Initial Fare (₹)" value={pricingFormData.baseFare} onChange={v => setPricingFormData({ ...pricingFormData, baseFare: v })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 pt-4 border-t border-gray-50">
                        <MockInput label="Excess Rate (₹/KM)" value={pricingFormData.perKmPrice} onChange={v => setPricingFormData({ ...pricingFormData, perKmPrice: v })} />
                        <MockInput label="Commission (%)" value={pricingFormData.commissionPercentage} onChange={v => setPricingFormData({ ...pricingFormData, commissionPercentage: v })} />

                        <MockInput label="Toll Overhead (₹)" value={pricingFormData.tollRate} onChange={v => setPricingFormData({ ...pricingFormData, tollRate: v })} />
                        <MockInput label="GST Quotient (%)" value={pricingFormData.gstRate} onChange={v => setPricingFormData({ ...pricingFormData, gstRate: v })} />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={handlePricingUpdate}
                        disabled={isPricingSubmitting}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isPricingSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span>RE-CALCULATE & DEPLOY RATES</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Peak Hour Engine (2/5 width) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Surge Engine</h4>
                      </div>
                      <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
                        <PlusCircle size={20} />
                      </button>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto max-h-[600px] pr-2 no-scrollbar">
                      {peakCharges.map((charge, cIdx) => (
                        <div key={charge.id} className="space-y-4">
                          {charge.slots.map((slot, sIdx) => (
                            <div key={sIdx} className="bg-gray-50/50 rounded-3xl border border-gray-50 overflow-hidden">
                              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 border-b border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Slot {sIdx + 1}</span>
                                <div className="flex items-center gap-3">
                                  <input type="time" value={slot.startTime} className="bg-transparent text-[10px] font-black text-gray-900" readOnly />
                                  <span className="text-gray-300">/</span>
                                  <input type="time" value={slot.endTime} className="bg-transparent text-[10px] font-black text-gray-900" readOnly />
                                </div>
                              </div>
                              <div className="p-5">
                                <table className="w-full">
                                  <tbody>
                                    {DAYS_OF_WEEK.map(day => (
                                      <tr key={day} className="border-b border-gray-100 last:border-none">
                                        <td className="py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">{day.slice(0, 3)}</td>
                                        <td className="py-2.5 text-right">
                                          <div className="flex items-center justify-end gap-1">
                                            <input
                                              type="number"
                                              value={slot.dayAdjustments?.[day] || 0}
                                              className="w-8 text-right bg-transparent text-[10px] font-black text-gray-900 focus:outline-none"
                                              onChange={() => { }}
                                            />
                                            <span className="text-gray-300 text-[10px] font-bold">%</span>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <button
                                  onClick={() => handlePeakUpdate(charge.id, charge.slots)}
                                  className="w-full mt-4 py-2 bg-gray-900/5 hover:bg-gray-900 hover:text-white text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] rounded-xl transition-all"
                                >
                                  APPLY SURGE
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                      {peakCharges.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                          <Clock size={32} className="text-gray-300 mb-4" />
                          <p className="text-[9px] font-black uppercase tracking-widest">No Surge Slots Configured</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Segment Meta Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingType ? 'Refine Segment' : 'Initialize Segment'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="space-y-6">
            <div className="flex bg-gray-50 rounded-[1.5rem] p-1.5 gap-1 shadow-inner ring-1 ring-gray-100">
              {['CAR', 'AUTO', 'BIKE'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: c as any })}
                  className={`flex-1 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${formData.category === c ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Market Identity</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                placeholder="e.g. Premium Sedan"
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Internal Reference</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all font-mono"
                placeholder="e.g. premium_sedan"
                disabled={!!editingType}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-100 hover:bg-black transition-all">
              {editingType ? 'COMMIT REFINEMENTS' : 'AUTHORIZE SEGMENT'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all">Dismiss</button>
          </div>
        </form>
      </Modal>
    </div>

  );
}

function MockInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex h-11 ring-1 ring-gray-100 rounded-xl overflow-hidden focus-within:ring-red-100 transition-all">
        <div className="w-[140px] bg-red-50/50 flex items-center px-4 border-r border-gray-50">
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
