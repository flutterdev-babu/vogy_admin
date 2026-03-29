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
    <div className="animate-fade-in space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
             Vehicle Management
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Define segments and city-based pricing clusters</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setIsWizardOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-red-100 transition-all font-bold flex items-center justify-center gap-2 group text-sm"
          >
            <Plus size={18} />
            <span>Quick Setup: New Segment</span>
          </button>
        </div>
      </div>

      <SegmentSetupWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        cities={cities}
        onComplete={() => fetchVehicleTypes()}
      />

      {/* Table View */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Display Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Base Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Price/KM</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicleTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center"><CategoryBadge category={type.category} /></td>
                  <td className="px-6 py-4 font-bold text-gray-800">{type.displayName}</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-700">₹{type.baseFare || '-'}</td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">₹{type.pricePerKm}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button onClick={() => toggleActive(type)}>
                        <ActiveBadge isActive={type.isActive} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                          onClick={() => openPricingManager(type)}
                          className="bg-white border border-gray-200 text-gray-700 p-2 rounded-lg hover:text-red-600 hover:border-red-200 shadow-sm transition-all"
                          title="Edit Pricing Clusters"
                       >
                         <DollarSign size={16} />
                       </button>
                       <button onClick={() => openEditModal(type)} className="bg-white border border-gray-200 text-gray-700 p-2 rounded-lg hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"><Edit2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLUSTER BASED PRICING MODAL */}
      <Modal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        title={pricingModalView === 'LIST_CLUSTERS' ? 'Pricing Clusters' : 'Edit Price'}
        size="xl"
      >
        <div className="min-h-[400px]">
           {pricingModalView === 'LIST_CLUSTERS' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg text-red-600"><Globe size={20} /></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Active Rate Groups</h3>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Grouping: {selectedTypeForPricing?.displayName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={createNewCluster}
                    disabled={isPricingSubmitting}
                    className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                  >
                    {isPricingSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    <span>Add New Cluster</span>
                  </button>
               </div>

               <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                 {['ALL', 'LOCAL', 'AIRPORT', 'OUTSTATION', 'RENTAL'].map(tab => (
                   <button
                     key={tab}
                     onClick={() => setActiveServiceTab(tab as ServiceType | 'ALL')}
                     className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeServiceTab === tab ? 'bg-red-100 text-red-700 shadow-sm border border-red-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                   >
                     {tab}
                   </button>
                 ))}
               </div>

               <div className="grid grid-cols-1 gap-4">
                  {pricingGroups.filter(g => activeServiceTab === 'ALL' || g.serviceType === activeServiceTab).length === 0 && !isPricingLoading && (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                       <p className="text-gray-400 font-bold">No city clusters defined for this criteria.</p>
                    </div>
                  )}
                  {pricingGroups.filter(g => activeServiceTab === 'ALL' || g.serviceType === activeServiceTab).map((group, idx) => (
                    <div key={group.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-red-200 transition-all shadow-sm flex items-center justify-between group">
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100">{idx + 1}</div>
                             <h4 className="font-bold text-gray-800">{group.name}</h4>
                             {group.serviceType && (
                               <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-black text-blue-600 rounded border border-blue-100 uppercase tracking-tight ml-2">
                                 {group.serviceType}
                               </span>
                             )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {group.cityCodeIds.map(cityId => (
                               <span key={cityId} className="px-2 py-0.5 bg-gray-50 text-[10px] font-bold text-gray-500 rounded border border-gray-100 uppercase tracking-tight">
                                  {cities.find(c => c.id === cityId)?.cityName || cityId}
                               </span>
                             ))}
                             {group.cityCodeIds.length === 0 && <span className="text-[10px] text-gray-300 font-bold uppercase">No cities assigned</span>}
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <button 
                           onClick={async () => {
                             if(confirm('Are you sure you want to delete this cluster?')) {
                               try {
                                 await vehiclePricingGroupService.delete(group.id);
                                 toast.success('Cluster deleted');
                                 fetchPricingGroups(selectedTypeForPricing!.id);
                               } catch (err) {
                                 toast.error('Failed to delete cluster');
                               }
                             }
                           }}
                           className="bg-white border text-gray-400 p-2.5 rounded-xl border-gray-100 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all"
                           title="Delete Cluster"
                         >
                           <Trash2 size={16} />
                         </button>
                         <button 
                           onClick={() => loadGroupForEdit(group)}
                           className="bg-white border border-gray-100 text-gray-400 p-2.5 rounded-xl group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-500 transition-all flex items-center gap-2 font-bold text-xs"
                         >
                           <span>Edit Rates</span>
                           <ChevronRight size={16} />
                         </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              {/* Toolbar in Edit mode as seen in mockup */}
              <div className="flex items-center justify-between bg-white sticky top-0 z-10 pb-4 border-b border-gray-100">
                 <button 
                   onClick={() => setPricingModalView('LIST_CLUSTERS')}
                   className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                 >
                   <ArrowLeft size={16} />
                   <span>Back to Clusters</span>
                 </button>
                 <button className="bg-red-600 p-2 rounded-lg text-white hover:bg-red-700 transition-all shadow-md shadow-red-100">
                    <RefreshCw size={18} />
                 </button>
              </div>

              {/* Price Details Section (High-Fidelity Mockup) */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                   <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Price Details</h3>
                   </div>
                   <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                         {/* Row 1 */}
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">City Code</label>
                           <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50/50 rounded-xl border border-gray-100 max-h-32 overflow-y-auto custom-scrollbar">
                              {cities.map(city => (
                                 <label key={city.id} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-transparent cursor-pointer hover:border-red-100 transition-all shadow-sm">
                                   <input 
                                     type="checkbox" 
                                     checked={pricingFormData.cityCodeIds.includes(city.id)}
                                     onChange={() => toggleCityInForm(city.id)}
                                     className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500"
                                   />
                                   <span className="text-[11px] font-bold text-gray-700">{city.cityName}</span>
                                 </label>
                              ))}
                           </div>
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Service Type</label>
                           <select 
                             value={pricingFormData.serviceType}
                             onChange={e => setPricingFormData({...pricingFormData, serviceType: e.target.value as ServiceType})}
                             className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-100 transition-all"
                           >
                              <option value="LOCAL">📍 Local Hourly</option>
                              <option value="AIRPORT">✈ Airport Transfers</option>
                              <option value="OUTSTATION">🛣 Outstation Trips</option>
                              <option value="RENTAL">📅 Long-Term Rental</option>
                           </select>
                         </div>

                         {/* Row 2 */}
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Vehicle Category</label>
                           <div className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 flex items-center text-xs font-bold text-gray-600">
                             {selectedTypeForPricing?.displayName || 'N/A'}
                           </div>
                         </div>
                         <MockInput label="Base KM" value={pricingFormData.baseKm} onChange={v => setPricingFormData({...pricingFormData, baseKm: v})} />

                         {/* Row 3 */}
                         <MockInput label="Base Price" value={pricingFormData.baseFare} onChange={v => setPricingFormData({...pricingFormData, baseFare: v})} />
                         <MockInput label="Extra Price/KM" value={pricingFormData.perKmPrice} onChange={v => setPricingFormData({...pricingFormData, perKmPrice: v})} />

                         {/* Row 4 */}
                         <MockInput label="Driver Base KM" value={pricingFormData.driverBaseKm} onChange={v => setPricingFormData({...pricingFormData, driverBaseKm: v})} />
                         <MockInput label="Driver Base Price" value={pricingFormData.driverBasePrice} onChange={v => setPricingFormData({...pricingFormData, driverBasePrice: v})} />

                         {/* Row 5 */}
                         <MockInput label="Driver Extra Price/KM" value={pricingFormData.driverExtraPricePerKm} onChange={v => setPricingFormData({...pricingFormData, driverExtraPricePerKm: v})} />
                         <MockInput label="Commission Percentage" value={pricingFormData.commissionPercentage} onChange={v => setPricingFormData({...pricingFormData, commissionPercentage: v})} />

                         {/* Row 6 */}
                         <MockInput label="Toll Rate" value={pricingFormData.tollRate} onChange={v => setPricingFormData({...pricingFormData, tollRate: v})} />
                         <MockInput label="Parking Rate" value={pricingFormData.parkingRate} onChange={v => setPricingFormData({...pricingFormData, parkingRate: v})} />

                         {/* Row 7 */}
                         <MockInput label="gstRate" value={pricingFormData.gstRate} onChange={v => setPricingFormData({...pricingFormData, gstRate: v})} />
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">Vehicle Status</label>
                            <select className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-100 transition-all">
                               <option>Active</option>
                               <option>Inactive</option>
                            </select>
                         </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={handlePricingUpdate}
                          disabled={isPricingSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-100 transition-all flex items-center gap-2"
                        >
                          {isPricingSubmitting && <Loader2 size={14} className="animate-spin" />}
                          <span>Update</span>
                        </button>
                      </div>
                   </div>
                </div>
              </div>

              {/* Peak Hr Section (High-Fidelity Mockup) */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                 <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Peak Hr</h3>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-50">
                       Add Peak Hour
                    </button>
                 </div>
                 <div className="p-6">
                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                       <div className="flex gap-4 min-w-max pr-6">
                          {peakCharges.map((charge, cIdx) => (
                            <div key={charge.id} className="flex gap-4">
                               {charge.slots.map((slot, sIdx) => (
                                 <div key={sIdx} className="w-[380px] border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
                                    <div className="bg-gray-50/80 py-3 text-center border-b border-gray-100">
                                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Section {sIdx + 1}</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                       <div className="flex items-center justify-center gap-4 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
                                          <input type="time" value={slot.startTime} className="bg-transparent text-xs font-bold focus:outline-none" onChange={() => {}} />
                                          <ChevronDown size={14} className="text-gray-300" />
                                          <input type="time" value={slot.endTime} className="bg-transparent text-xs font-bold focus:outline-none" onChange={() => {}} />
                                       </div>
                                       <div className="bg-white border border-gray-100 rounded-xl overflow-hidden text-[11px] ring-1 ring-gray-100">
                                          <table className="w-full text-left">
                                             <tbody className="divide-y divide-gray-50">
                                                {DAYS_OF_WEEK.map(day => (
                                                   <tr key={day} className="hover:bg-gray-50/50">
                                                      <td className="px-4 py-2.5 font-black text-gray-500 uppercase tracking-widest border-r border-gray-50 w-24 bg-gray-50/30">{day.slice(0, 3)}</td>
                                                      <td className="px-4 py-2.5 text-right font-bold text-gray-700">
                                                         <div className="flex items-center justify-end gap-1">
                                                            <input 
                                                              type="number" 
                                                              value={slot.dayAdjustments?.[day] || 0} 
                                                              className="w-10 text-right bg-transparent focus:outline-none"
                                                              onChange={() => {}} 
                                                            />
                                                            <span className="text-gray-300 font-medium">%</span>
                                                         </div>
                                                      </td>
                                                   </tr>
                                                ))}
                                                <tr className="bg-gray-50/80">
                                                   <td className="px-4 py-3 font-black text-gray-900 uppercase tracking-widest">Actions</td>
                                                   <td className="px-4 py-3 text-right">
                                                      <button 
                                                        onClick={() => handlePeakUpdate(charge.id, charge.slots)}
                                                        className="w-full h-8 bg-[#9ea7ad] hover:bg-[#8d969b] text-white rounded font-black text-[10px] uppercase tracking-widest shadow-sm shadow-gray-200 transition-all"
                                                      >
                                                         UPDATE
                                                      </button>
                                                   </td>
                                                </tr>
                                             </tbody>
                                          </table>
                                       </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          ))}
                          {peakCharges.length === 0 && (
                            <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-[10px] font-black text-gray-300 uppercase italic">
                               No slots configured
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

      {/* Basic Meta Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingType ? 'Edit Vehicle Type' : 'Create Vehicle Type'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-4">
             <div className="grid grid-cols-3 gap-3">
               {['CAR', 'AUTO', 'BIKE'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({...formData, category: c as any})}
                    className={`py-3 rounded-xl border-2 transition-all font-black text-xs tracking-widest ${formData.category === c ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-100 text-gray-400'}`}
                  >
                    {c}
                  </button>
               ))}
             </div>
             <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
               <input
                 type="text"
                 value={formData.displayName}
                 onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                 className="w-full h-11 bg-white border border-gray-200 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-100"
                 placeholder="e.g., Sedan"
               />
             </div>
          </div>
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 h-12 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
              {editingType ? 'Save Changes' : 'Create Type'}
            </button>
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
