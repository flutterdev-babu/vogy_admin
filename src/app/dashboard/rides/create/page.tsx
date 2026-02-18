'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Car, 
  CheckCircle, 
  Info, 
  Search, 
  Plane, 
  Map, 
  Clock, 
  Building2,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rideService } from '@/services/rideService';
import { cityCodeService } from '@/services/cityCodeService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { corporateService } from '@/services/corporateService';
import { CityCode, VehicleType, Corporate } from '@/types';

type BookingType = 'AIRPORT' | 'LOCAL' | 'OUTSTATION' | 'RENTAL';

export default function CreateRidePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    altMobile: '',
    pickup: '',
    drop: '',
    vehicleTypeId: '',
    rideType: 'AIRPORT' as BookingType,
    agentCode: '',
    cityCodeId: '',
    corporateId: '',
    bookingDate: '',
    bookingTime: '',
    distanceKm: 10,
    paymentMode: 'CASH',
  });

  const [loading, setLoading] = useState(false);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [corporates, setCorporates] = useState<Corporate[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cityRes, typeRes, corpRes] = await Promise.all([
        cityCodeService.getAll(),
        vehicleTypeService.getAll(),
        corporateService.getAll ? corporateService.getAll() : Promise.resolve({ data: [] })
      ]);
      setCityCodes(cityRes.data || []);
      setVehicleTypes(typeRes.data || []);
      setCorporates((corpRes as any).data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const scheduledDateTime = formData.bookingDate && formData.bookingTime 
        ? `${formData.bookingDate}T${formData.bookingTime}:00` 
        : undefined;

      await rideService.createManualRide({
        ...formData,
        customerName: formData.customerName,
        phone: `+91${formData.phone}`,
        rideType: formData.rideType,
        corporateId: formData.corporateId,
        scheduledDateTime,
        isManualBooking: true
      });
      toast.success('Ride booked successfully!');
      router.push('/dashboard/rides');
    } catch (err) {
      toast.error('Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  const inputGroupClass = "flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#E32222] focus-within:ring-1 focus-within:ring-[#E32222]/30 transition-all bg-white shadow-sm";
  const labelSideClass = "px-4 py-2 bg-gray-50 border-r border-gray-100 text-[10px] font-bold text-red-600 uppercase tracking-wide min-w-[100px] whitespace-nowrap";
  const fieldClass = "flex-1 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none h-[42px]";

  const bookingTypes: { type: BookingType; label: string; icon: any }[] = [
    { type: 'AIRPORT', label: 'Airport', icon: Plane },
    { type: 'LOCAL', label: 'Local', icon: Building2 },
    { type: 'OUTSTATION', label: 'Outstation', icon: Map },
    { type: 'RENTAL', label: 'Rental', icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/rides" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Booking Details</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Row 1: Contact Info */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative flex">
              <div className={`${inputGroupClass} flex-1`}>
                <label className={labelSideClass}>Mobile</label>
                <div className="flex flex-1">
                  <span className="flex items-center pl-3 text-sm text-gray-400">+91</span>
                  <input type="tel" required value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    className={fieldClass} placeholder="97569645049" maxLength={10} />
                </div>
              </div>
              <button type="button" className="ml-2 bg-[#E32222] text-white p-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                <Search size={20} />
              </button>
            </div>

            <div className={inputGroupClass}>
              <label className={labelSideClass}>Name</label>
              <input type="text" required value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
                className={fieldClass} placeholder="Kiran Perepalle" />
            </div>

            <div className={inputGroupClass}>
              <label className={labelSideClass}>Email</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={fieldClass} placeholder="kiran@gmail.com" />
            </div>

            <div className={inputGroupClass}>
              <label className={labelSideClass}>Alt Mobile</label>
              <input type="tel" value={formData.altMobile}
                onChange={e => setFormData({...formData, altMobile: e.target.value})}
                className={fieldClass} placeholder="+917569645049" />
            </div>
          </div>

          {/* Booking Type Selector */}
          <div className="flex items-center gap-8">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Choose Booking Type</span>
            <div className="flex gap-4">
              {bookingTypes.map((bt) => {
                const Icon = bt.icon;
                const active = formData.rideType === bt.type;
                return (
                  <button
                    key={bt.type}
                    type="button"
                    onClick={() => setFormData({...formData, rideType: bt.type})}
                    className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-xl border transition-all duration-300 group ${
                      active 
                        ? 'bg-[#E32222] border-[#E32222] text-white shadow-lg shadow-red-500/20' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-[#E32222] hover:text-[#E32222]'
                    }`}
                  >
                    <Icon size={32} className={`mb-2 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{bt.label}</span>
                    {active && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#E32222] rotate-45" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent Code */}
          <div className="max-w-md">
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Agent Code</label>
              <input type="text" value={formData.agentCode}
                onChange={e => setFormData({...formData, agentCode: e.target.value})}
                className={fieldClass} placeholder="Optional" />
            </div>
          </div>

          {/* City & Corporate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={inputGroupClass}>
              <label className={labelSideClass}>City</label>
              <select required value={formData.cityCodeId}
                onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                className={`${fieldClass} appearance-none bg-white`}>
                <option value="">Select City</option>
                {cityCodes.map((cc) => (
                  <option key={cc.id} value={cc.id}>{cc.cityName} ({cc.code})</option>
                ))}
              </select>
            </div>
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Corporate Type</label>
              <select value={formData.corporateId}
                onChange={e => setFormData({...formData, corporateId: e.target.value})}
                className={`${fieldClass} appearance-none bg-white`}>
                <option value="">Select Corporate</option>
                {corporates.map((corp) => (
                  <option key={corp.id} value={corp.id}>{corp.companyName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pickup & Drop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Pickup</label>
              <input type="text" required value={formData.pickup}
                onChange={e => setFormData({...formData, pickup: e.target.value})}
                className={fieldClass} placeholder="Pickup Location" />
            </div>
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Drop</label>
              <input type="text" required value={formData.drop}
                onChange={e => setFormData({...formData, drop: e.target.value})}
                className={fieldClass} placeholder="Drop Location" />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Booking date</label>
              <div className="flex-1 flex items-center pr-4">
                <input type="date" value={formData.bookingDate}
                  onChange={e => setFormData({...formData, bookingDate: e.target.value})}
                  className={`${fieldClass} pr-0`} />
                <CalendarIcon size={18} className="text-gray-400" />
              </div>
            </div>
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Booking time</label>
              <div className="flex-1 flex items-center pr-4">
                <input type="time" value={formData.bookingTime}
                  onChange={e => setFormData({...formData, bookingTime: e.target.value})}
                  className={`${fieldClass} pr-0`} />
                <Clock size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading}
              className="px-12 py-3 bg-[#E32222] text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-3">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
