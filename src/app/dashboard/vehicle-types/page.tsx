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
  Bike,
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
  CreatePeakHourChargeRequest,
  PeakHourSlot,
  DayOfWeek,
  ServiceType
} from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ActiveBadge } from '@/components/ui/Badge';
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
    name: '',
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
    // Rental
    rentalHalfDayBaseHr: 4,
    rentalHalfDayBaseKm: 40,
    rentalHalfDayBaseFare: 0,
    rentalFullDayBaseHr: 8,
    rentalFullDayBaseKm: 80,
    rentalFullDayBaseFare: 0,
    rentalExtraHrPrice: 0,
    rentalExtraKmPrice: 0,
    // Outstation
    outstationOnewayPricePerKm: 0,
    outstationRoundTripPricePerKm: 0,
    outstationDriverAllowance: 300,
    outstationMinBaseKmPerDay: 300
  });

  // Peak Hour State for ACTIVE Group
  const [peakCharges, setPeakCharges] = useState<PeakHourCharge[]>([]);
  const [isPeakLoading, setIsPeakLoading] = useState(false);

  // Bulk Edit State (Apply to All)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [allPricingGroups, setAllPricingGroups] = useState<VehiclePricingGroup[]>([]);
  const [bulkFormData, setBulkFormData] = useState<any>({
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
    // Rental
    rentalHalfDayBaseHr: 4,
    rentalHalfDayBaseKm: 40,
    rentalHalfDayBaseFare: 0,
    rentalFullDayBaseHr: 8,
    rentalFullDayBaseKm: 80,
    rentalFullDayBaseFare: 0,
    rentalExtraHrPrice: 0,
    rentalExtraKmPrice: 0,
    // Outstation
    outstationOnewayPricePerKm: 0,
    outstationRoundTripPricePerKm: 0,
    outstationDriverAllowance: 300,
    outstationMinBaseKmPerDay: 300
  });
  const [bulkServiceFilter, setBulkServiceFilter] = useState<ServiceType | 'ALL'>('ALL');
  const [selectedBulkFields, setSelectedBulkFields] = useState<string[]>([]);

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
      const sortedTypes = (response.data || []).sort((a: any, b: any) => {
        const baseA = a.baseFare || 0;
        const baseB = b.baseFare || 0;
        
        if (baseA !== baseB) {
          return baseA - baseB;
        }
        
        const perKmA = a.pricePerKm || 0;
        const perKmB = b.pricePerKm || 0;
        return perKmA - perKmB;
      });
      
      setVehicleTypes(sortedTypes);
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
        const response = await vehicleTypeService.update(editingType.id, {
          name: formData.name,
          category: formData.category,
          displayName: formData.displayName,
          pricePerKm: formData.pricePerKm,
          baseFare: formData.baseFare,
        });
        console.log('Update response:', response);
        toast.success('Vehicle type updated');
      } else {
        const response = await vehicleTypeService.create(formData);
        console.log('Create response:', response);
        toast.success('Vehicle type created');
      }
      setIsModalOpen(false);
      resetForm();
      await fetchVehicleTypes();
    } catch (error: any) {
      console.error('Operation failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Operation failed');
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
      name: group.name || '',
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
      cityCodeIds: group.cityCodeIds || [],
      serviceType: group.serviceType || 'LOCAL',
      // Rental
      rentalHalfDayBaseHr: group.rentalHalfDayBaseHr || 4,
      rentalHalfDayBaseKm: group.rentalHalfDayBaseKm || 40,
      rentalHalfDayBaseFare: group.rentalHalfDayBaseFare || 0,
      rentalFullDayBaseHr: group.rentalFullDayBaseHr || 8,
      rentalFullDayBaseKm: group.rentalFullDayBaseKm || 80,
      rentalFullDayBaseFare: group.rentalFullDayBaseFare || 0,
      rentalExtraHrPrice: group.rentalExtraHrPrice || 0,
      rentalExtraKmPrice: group.rentalExtraKmPrice || 0,
      // Outstation
      outstationOnewayPricePerKm: group.outstationOnewayPricePerKm || 0,
      outstationRoundTripPricePerKm: group.outstationRoundTripPricePerKm || 0,
      outstationDriverAllowance: group.outstationDriverAllowance || 300,
      outstationMinBaseKmPerDay: group.outstationMinBaseKmPerDay || 300
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

  // Bulk: Fetch ALL pricing groups across all vehicle types
  const fetchAllPricingGroups = async () => {
    setIsPricingLoading(true);
    try {
      const response = await vehiclePricingGroupService.getAll();
      setAllPricingGroups(response.data || []);
    } catch (error) {
      toast.error('Failed to load all pricing groups');
    } finally {
      setIsPricingLoading(false);
    }
  };

  const openBulkPricingModal = () => {
    setSelectedBulkFields([]);
    setBulkServiceFilter('ALL');
    setBulkFormData({
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
    });
    fetchAllPricingGroups();
    setIsBulkModalOpen(true);
  };

  const toggleBulkField = (field: string) => {
    setSelectedBulkFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedBulkFields.length === 0) {
      toast.error('Select at least one field to update');
      return;
    }
    setIsBulkSubmitting(true);
    try {
      const groupsToUpdate = allPricingGroups.filter(g =>
        bulkServiceFilter === 'ALL' || g.serviceType === bulkServiceFilter
      );
      const updatePayload: any = {};
      selectedBulkFields.forEach(field => {
        updatePayload[field] = bulkFormData[field];
      });

      let successCount = 0;
      for (const group of groupsToUpdate) {
        try {
          await vehiclePricingGroupService.update(group.id, updatePayload);
          successCount++;
        } catch (e: any) {
          console.error(`Failed to update group ${group.id}:`, e.response?.data);
          const errMsg = e.response?.data?.message || JSON.stringify(e.response?.data) || 'Unknown error';
          toast.error(`Group ${group.name} failed: ${errMsg}`);
        }
      }
      if (successCount > 0) {
        toast.success(`Updated ${successCount} of ${groupsToUpdate.length} clusters`);
        fetchAllPricingGroups();
      }
    } catch (error: any) {
      console.error('Bulk update error details:', error.response?.data);
      const errMsg = error.response?.data?.message || JSON.stringify(error.response?.data) || 'Bulk update failed';
      toast.error(errMsg);
    } finally {
      setIsBulkSubmitting(false);
    }
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
        // Defaults
        rentalHalfDayBaseHr: 4,
        rentalHalfDayBaseKm: 40,
        rentalHalfDayBaseFare: 1200,
        rentalFullDayBaseHr: 8,
        rentalFullDayBaseKm: 80,
        rentalFullDayBaseFare: 2200,
        rentalExtraHrPrice: 150,
        rentalExtraKmPrice: 15,
        outstationOnewayPricePerKm: 14,
        outstationRoundTripPricePerKm: 12,
        outstationDriverAllowance: 300,
        outstationMinBaseKmPerDay: 300
      };

      await vehiclePricingGroupService.create(newGroupReq);
      toast.success('New city cluster created');
      fetchPricingGroups(selectedTypeForPricing.id);
    } catch (error: any) {
      console.error('Create cluster error details:', error.response?.data);
      const errMsg = error.response?.data?.message || JSON.stringify(error.response?.data) || 'Failed to create cluster';
      toast.error(errMsg);
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
      const payload: any = { ...pricingFormData };
      if (payload.name === '') delete payload.name;

      await vehiclePricingGroupService.update(activeGroupId, payload);
      toast.success('Pricing details updated successfully');
      fetchPricingGroups(selectedTypeForPricing!.id);
    } catch (error: any) {
      console.error('Pricing update error details:', error.response?.data);
      const errMsg = error.response?.data?.message || JSON.stringify(error.response?.data) || 'Failed to update cluster rates';
      toast.error(errMsg);
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

  const createNewPeakCharge = async () => {
    if (!selectedTypeForPricing) return;
    try {
      const newCharge: CreatePeakHourChargeRequest = {
        name: `Peak Surge ${peakCharges.length + 1}`,
        vehicleTypeId: selectedTypeForPricing.id,
        cityCodeIds: pricingFormData.cityCodeIds || [],
        days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        slots: [
          {
            startTime: '08:00',
            endTime: '11:00',
            dayAdjustments: { MONDAY: 0, TUESDAY: 0, WEDNESDAY: 0, THURSDAY: 0, FRIDAY: 0, SATURDAY: 0, SUNDAY: 0 }
          }
        ]
      };
      await peakHourChargeService.create(newCharge);
      toast.success('Peak pricing charge added');
      const peakRes = await peakHourChargeService.getAll(selectedTypeForPricing.id);
      setPeakCharges(peakRes.data || []);
    } catch (e: any) {
      toast.error('Failed to create peak charge');
    }
  };

  const updateSlotTime = (chargeId: string, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setPeakCharges(prev => prev.map(charge => {
      if (charge.id !== chargeId) return charge;
      const newSlots = [...charge.slots];
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
      return { ...charge, slots: newSlots };
    }));
  };

  const updateDayAdjustment = (chargeId: string, slotIndex: number, day: DayOfWeek, value: number) => {
    setPeakCharges(prev => prev.map(charge => {
      if (charge.id !== chargeId) return charge;
      const newSlots = [...charge.slots];
      const newDayAdj = { ...newSlots[slotIndex].dayAdjustments, [day]: value };
      newSlots[slotIndex] = { ...newSlots[slotIndex], dayAdjustments: newDayAdj };
      return { ...charge, slots: newSlots };
    }));
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
    <div className="flex flex-col gap-8 pb-20">
      {/* Header & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Fleet Segments</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Classification and dynamic pricing clusters</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-gray-50 rounded-2xl border border-gray-100 p-1 px-4 py-2 flex-col items-center">
                <span className="text-xl font-black text-gray-900 leading-none">{vehicleTypes.length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Active</span>
              </div>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs shadow-lg shadow-gray-200 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
              >
                <PlusCircle size={16} />
                <span>QUICK SETUP</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-gray-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Settings size={80} className="text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-white text-lg font-bold mb-2">Global Controls</h3>
            <p className="text-gray-400 text-xs mb-6 max-w-[200px]">Apply pricing updates across all vehicle segments simultaneously.</p>
            <button
              onClick={openBulkPricingModal}
              className="bg-white text-gray-900 px-6 py-3 rounded-xl transition-all font-bold flex items-center justify-center gap-2 text-xs shadow-lg hover:scale-105 active:scale-95"
            >
              <Settings size={16} />
              <span>BULK APPLY RATES</span>
            </button>
          </div>
        </div>
      </div>

      <SegmentSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        cities={cities}
        onComplete={() => fetchVehicleTypes()}
      />

      {/* Main Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-red-500 rounded-full" />
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Active Fleet Hierarchy</h2>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 text-gray-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all"
          >
            <Plus size={14} />
            <span>Add Segment</span>
          </button>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4 text-center">Class</th>
                <th className="px-6 py-4">Segment Identity</th>
                <th className="px-6 py-4 text-center">Pricing Model</th>
                <th className="px-6 py-4 text-center">Lifecycle</th>
                <th className="px-6 py-4 text-right pr-12">Operations</th>
              </tr>
            </thead>
            <tbody>
              {vehicleTypes.map((type) => (
                <tr key={type.id} className="group bg-white hover:bg-gray-50 transition-all border border-gray-100">
                  <td className="px-6 py-4 first:rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        type.category === 'CAR' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        type.category === 'AUTO' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {type.category === 'CAR' ? <Car size={12} /> : type.category === 'BIKE' ? <Bike size={12} /> : null}
                        {type.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-transparent group-hover:border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{type.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{type.displayName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-transparent group-hover:border-gray-100">
                    <div className="flex items-center justify-center gap-8">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-900">₹{type.baseFare || '0'}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Entry</span>
                      </div>
                      <div className="w-px h-8 bg-gray-100" />
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-emerald-600">₹{type.pricePerKm}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Per KM</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-transparent group-hover:border-gray-100">
                    <div className="flex justify-center">
                      <button onClick={() => toggleActive(type)} className="hover:scale-105 transition-transform active:scale-95">
                        <ActiveBadge isActive={type.isActive} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right pr-8 last:rounded-r-2xl border-y border-r border-transparent group-hover:border-gray-100">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openPricingManager(type)}
                        className="p-2.5 bg-gray-50 hover:bg-gray-900 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-100 shadow-sm"
                        title="Manage Rate Clusters"
                      >
                        <DollarSign size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(type)}
                        className="p-2.5 bg-gray-50 hover:bg-gray-900 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-100 shadow-sm"
                        title="Edit Identity"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this segment? This action cannot be undone.')) {
                            try {
                              await vehicleTypeService.delete(type.id);
                              toast.success('Vehicle segment deleted successfully');
                              fetchVehicleTypes();
                            } catch (error: any) {
                              const errMsg = error.response?.data?.message || 'Failed to delete segment';
                              toast.error(errMsg);
                            }
                          }
                        }}
                        className="p-2.5 bg-gray-50 hover:bg-red-500 text-gray-400 hover:text-white rounded-xl transition-all border border-gray-100 shadow-sm"
                        title="Delete Segment"
                      >
                        <Trash2 size={16} />
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
                  <span>BACK TO CLUSTERS</span>
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
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Pricing Settings</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active nodes (Cities)</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setPricingFormData({ ...pricingFormData, cityCodeIds: cities.map(c => c.id) })}
                                className="text-[8px] font-black text-red-500 hover:text-red-700 uppercase"
                              >
                                Select All
                              </button>
                              <button
                                onClick={() => setPricingFormData({ ...pricingFormData, cityCodeIds: [] })}
                                className="text-[8px] font-black text-gray-400 hover:text-gray-600 uppercase"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
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
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Trip Category</label>
                            <select
                              value={pricingFormData.serviceType}
                              onChange={e => setPricingFormData({ ...pricingFormData, serviceType: e.target.value as ServiceType })}
                              className="w-full h-14 bg-gray-50 border-none rounded-2xl px-5 text-xs font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase appearance-none"
                            >
                              <option value="LOCAL">Local</option>
                              <option value="AIRPORT">Airport</option>
                              <option value="OUTSTATION">Outstation</option>
                              <option value="RENTAL">Rental</option>
                            </select>
                          </div>

                          <MockInput label="Base KM" value={pricingFormData.baseKm} onChange={v => setPricingFormData({ ...pricingFormData, baseKm: v })} />
                          <MockInput label="Base Fare (₹)" value={pricingFormData.baseFare} onChange={v => setPricingFormData({ ...pricingFormData, baseFare: v })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 pt-4 border-t border-gray-50">
                        <MockInput label="Extra KM Price (₹/KM)" value={pricingFormData.perKmPrice} onChange={v => setPricingFormData({ ...pricingFormData, perKmPrice: v })} />
                        <MockInput label="Commission (%)" value={pricingFormData.commissionPercentage} onChange={v => setPricingFormData({ ...pricingFormData, commissionPercentage: v })} />

                        <MockInput label="Toll Charge (₹)" value={pricingFormData.tollRate} onChange={v => setPricingFormData({ ...pricingFormData, tollRate: v })} />
                        <MockInput label="GST (%)" value={pricingFormData.gstRate} onChange={v => setPricingFormData({ ...pricingFormData, gstRate: v })} />
                      </div>

                      {/* Conditional Rental Section */}
                      {pricingFormData.serviceType === 'RENTAL' && (
                        <div className="space-y-6 pt-6 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                            <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Rental Package Details</h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                            <div className="space-y-4">
                              <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">Half Day (4/40)</p>
                              <MockInput label="Base Hours" value={pricingFormData.rentalHalfDayBaseHr} onChange={v => setPricingFormData({ ...pricingFormData, rentalHalfDayBaseHr: v })} />
                              <MockInput label="Base KM" value={pricingFormData.rentalHalfDayBaseKm} onChange={v => setPricingFormData({ ...pricingFormData, rentalHalfDayBaseKm: v })} />
                              <MockInput label="Base Fare (₹)" value={pricingFormData.rentalHalfDayBaseFare} onChange={v => setPricingFormData({ ...pricingFormData, rentalHalfDayBaseFare: v })} />
                            </div>
                            <div className="space-y-4">
                              <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">Full Day (8/80)</p>
                              <MockInput label="Base Hours" value={pricingFormData.rentalFullDayBaseHr} onChange={v => setPricingFormData({ ...pricingFormData, rentalFullDayBaseHr: v })} />
                              <MockInput label="Base KM" value={pricingFormData.rentalFullDayBaseKm} onChange={v => setPricingFormData({ ...pricingFormData, rentalFullDayBaseKm: v })} />
                              <MockInput label="Base Fare (₹)" value={pricingFormData.rentalFullDayBaseFare} onChange={v => setPricingFormData({ ...pricingFormData, rentalFullDayBaseFare: v })} />
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-x-10">
                              <MockInput label="Extra Hour Price (₹)" value={pricingFormData.rentalExtraHrPrice} onChange={v => setPricingFormData({ ...pricingFormData, rentalExtraHrPrice: v })} />
                              <MockInput label="Extra KM Price (₹)" value={pricingFormData.rentalExtraKmPrice} onChange={v => setPricingFormData({ ...pricingFormData, rentalExtraKmPrice: v })} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Conditional Outstation Section */}
                      {pricingFormData.serviceType === 'OUTSTATION' && (
                        <div className="space-y-6 pt-6 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                            <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Outstation Parameters</h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                            <MockInput label="Min KM / Day" value={pricingFormData.outstationMinBaseKmPerDay} onChange={v => setPricingFormData({ ...pricingFormData, outstationMinBaseKmPerDay: v })} />
                            <MockInput label="Driver Allowance (₹)" value={pricingFormData.outstationDriverAllowance} onChange={v => setPricingFormData({ ...pricingFormData, outstationDriverAllowance: v })} />
                            <MockInput label="Oneway Price/KM (₹)" value={pricingFormData.outstationOnewayPricePerKm} onChange={v => setPricingFormData({ ...pricingFormData, outstationOnewayPricePerKm: v })} />
                            <MockInput label="Roundtrip Price/KM (₹)" value={pricingFormData.outstationRoundTripPricePerKm} onChange={v => setPricingFormData({ ...pricingFormData, outstationRoundTripPricePerKm: v })} />
                          </div>
                        </div>
                      )}
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
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Peak Pricing</h4>
                      </div>
                      <button onClick={createNewPeakCharge} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
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
                                  <input type="time" value={slot.startTime} onChange={(e) => updateSlotTime(charge.id, sIdx, 'startTime', e.target.value)} className="bg-transparent text-[10px] font-black text-gray-900" />
                                  <span className="text-gray-300">/</span>
                                  <input type="time" value={slot.endTime} onChange={(e) => updateSlotTime(charge.id, sIdx, 'endTime', e.target.value)} className="bg-transparent text-[10px] font-black text-gray-900" />
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
                                              onChange={(e) => updateDayAdjustment(charge.id, sIdx, day, Number(e.target.value))}
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
              />
            </div>

            {/* Pricing Fields */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Price Per KM (₹)</label>
                <input
                  type="number"
                  value={formData.pricePerKm}
                  onChange={(e) => setFormData({ ...formData, pricePerKm: Number(e.target.value) })}
                  className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl text-sm font-black text-emerald-700 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="15"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Base Fare (₹)</label>
                <input
                  type="number"
                  value={formData.baseFare || ''}
                  onChange={(e) => setFormData({ ...formData, baseFare: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-5 py-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl text-sm font-black text-blue-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-100 hover:bg-black transition-all flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {editingType ? 'COMMIT REFINEMENTS' : 'AUTHORIZE SEGMENT'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all">Dismiss</button>
          </div>
        </form>
      </Modal>

      {/* BULK PRICING MODAL - Apply to All Vehicle Types */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Apply Pricing to All Vehicle Types"
        size="xl"
      >
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Settings size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">Bulk Update</p>
              <p className="text-xs text-amber-600 mt-1">Select the fields you want to update, set the values, and apply to all pricing clusters at once. Only checked fields will be changed.</p>
            </div>
          </div>

          {/* Service Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Filter:</span>
            {['ALL', 'LOCAL', 'AIRPORT', 'OUTSTATION', 'RENTAL'].map(tab => (
              <button
                key={tab}
                onClick={() => setBulkServiceFilter(tab as ServiceType | 'ALL')}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${bulkServiceFilter === tab ? 'bg-red-100 text-red-700 shadow-sm border border-red-200' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Affected clusters count */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">
              Clusters affected: <span className="text-red-600">{allPricingGroups.filter(g => bulkServiceFilter === 'ALL' || g.serviceType === bulkServiceFilter).length}</span> of {allPricingGroups.length}
            </span>
            <span className="text-xs font-bold text-gray-400">across {vehicleTypes.length} vehicle types</span>
          </div>

          {/* Editable Fields with Checkboxes */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Fields & Set Values</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'baseKm', label: 'Base KM' },
                  { key: 'baseFare', label: 'Base Fare' },
                  { key: 'perKmPrice', label: 'Extra Price/KM' },
                  { key: 'driverBaseKm', label: 'Driver Base KM' },
                  { key: 'driverBasePrice', label: 'Driver Base Price' },
                  { key: 'driverExtraPricePerKm', label: 'Driver Extra/KM' },
                  { key: 'commissionPercentage', label: 'Commission %' },
                  { key: 'tollRate', label: 'Toll Rate' },
                  { key: 'parkingRate', label: 'Parking Rate' },
                  { key: 'gstRate', label: 'GST Rate' },
                ].map(({ key, label }) => (
                  <div key={key} className={`flex items-center gap-3 h-11 ring-1 rounded-xl overflow-hidden transition-all ${selectedBulkFields.includes(key) ? 'ring-red-200 bg-red-50/30' : 'ring-gray-100'}`}>
                    <label className="w-[180px] flex items-center gap-2.5 px-4 border-r border-gray-50 bg-red-50/50 h-full cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBulkFields.includes(key)}
                        onChange={() => toggleBulkField(key)}
                        className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{label}</span>
                    </label>
                    <input
                      type="number"
                      value={bulkFormData[key]}
                      onChange={e => setBulkFormData({ ...bulkFormData, [key]: Number(e.target.value) })}
                      disabled={!selectedBulkFields.includes(key)}
                      className={`flex-1 bg-transparent px-4 text-xs font-bold focus:outline-none h-full ${selectedBulkFields.includes(key) ? 'text-gray-700' : 'text-gray-300'}`}
                    />
                  </div>
                ))}

                {/* Advanced Fields in Bulk */}
                <div className="md:col-span-2 h-px bg-gray-100 my-2"></div>

                {[
                  { key: 'rentalHalfDayBaseFare', label: 'Rental Half Day' },
                  { key: 'rentalFullDayBaseFare', label: 'Rental Full Day' },
                  { key: 'rentalExtraHrPrice', label: 'Rental Ex Hr' },
                  { key: 'rentalExtraKmPrice', label: 'Rental Ex Km' },
                  { key: 'outstationOnewayPricePerKm', label: 'Outstation One Way' },
                  { key: 'outstationRoundTripPricePerKm', label: 'Outstation Round' },
                  { key: 'outstationDriverAllowance', label: 'Driver Allowance' },
                ].map(({ key, label }) => (
                  <div key={key} className={`flex items-center gap-3 h-11 ring-1 rounded-xl overflow-hidden transition-all ${selectedBulkFields.includes(key) ? 'ring-blue-200 bg-blue-50/30' : 'ring-gray-100'}`}>
                    <label className="w-[180px] flex items-center gap-2.5 px-4 border-r border-gray-50 bg-blue-50/50 h-full cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBulkFields.includes(key)}
                        onChange={() => toggleBulkField(key)}
                        className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{label}</span>
                    </label>
                    <input
                      type="number"
                      value={bulkFormData[key]}
                      onChange={e => setBulkFormData({ ...bulkFormData, [key]: Number(e.target.value) })}
                      disabled={!selectedBulkFields.includes(key)}
                      className={`flex-1 bg-transparent px-4 text-xs font-bold focus:outline-none h-full ${selectedBulkFields.includes(key) ? 'text-gray-700' : 'text-gray-300'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setSelectedBulkFields(['baseKm', 'baseFare', 'perKmPrice', 'driverBaseKm', 'driverBasePrice', 'driverExtraPricePerKm', 'commissionPercentage', 'tollRate', 'parkingRate', 'gstRate'])}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Select All Fields
            </button>
            <button
              onClick={() => setSelectedBulkFields([])}
              className="text-xs font-bold text-gray-400 hover:text-gray-500 transition-colors"
            >
              Clear Selection
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setIsBulkModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpdate}
              disabled={isBulkSubmitting || selectedBulkFields.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-100 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isBulkSubmitting && <Loader2 size={14} className="animate-spin" />}
              <span>Apply to {allPricingGroups.filter(g => bulkServiceFilter === 'ALL' || g.serviceType === bulkServiceFilter).length} Clusters</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MockInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex min-h-[44px] ring-1 ring-gray-100 rounded-xl overflow-hidden focus-within:ring-red-100 transition-all">
        <div className="w-[150px] shrink-0 bg-red-50/50 flex items-center px-4 py-2 border-r border-gray-50">
          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-tight">{label}</span>
        </div>
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 min-w-0 bg-white px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none"
        />
      </div>
    </div>
  );
}
