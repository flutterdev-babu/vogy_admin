'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Car, User, 
  Phone, Route, CreditCard, Loader2, Save, Info,
  Search, Zap, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRideService } from '@/services/adminRideService';
import { cityCodeService } from '@/services/cityCodeService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { CityCode, VehicleTypeSummary } from '@/types';

export default function ManualRideBookingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [cities, setCities] = useState<CityCode[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeSummary[]>([]);

  const [formData, setFormData] = useState({
    userPhone: '',
    userName: '',
    vehicleTypeId: '',
    cityCodeId: '',
    rideType: 'LOCAL',
    paymentMode: 'CASH',
    pickupAddress: '',
    pickupLat: 12.9716, // Default to BLR
    pickupLng: 77.5946,
    dropAddress: '',
    dropLat: 12.9352,
    dropLng: 77.6245,
    distanceKm: 0,
    scheduledDateTime: '',
    bookingNotes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityRes, vtRes] = await Promise.all([
          cityCodeService.getAll(),
          vehicleTypeService.getAll()
        ]);
        if (cityRes.success) setCities(cityRes.data || []);
        if (vtRes.success) setVehicleTypes(vtRes.data || []);
      } catch (err) {
        console.error('Failed to load form data:', err);
        toast.error('Failed to load required data');
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userPhone || !formData.vehicleTypeId || !formData.pickupAddress || !formData.dropAddress || !formData.cityCodeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Format data for API
      const submissionData = {
        ...formData,
        pickupLat: Number(formData.pickupLat),
        pickupLng: Number(formData.pickupLng),
        dropLat: Number(formData.dropLat),
        dropLng: Number(formData.dropLng),
        distanceKm: Number(formData.distanceKm),
        scheduledDateTime: formData.scheduledDateTime ? new Date(formData.scheduledDateTime).toISOString() : new Date().toISOString()
      };

      const res = await adminRideService.createManualRide(submissionData);
      if (res.success) {
        toast.success('Manual Ride Booked Successfully!');
        router.push('/dashboard/rides');
      } else {
        toast.error(res.message || 'Failed to book ride');
      }
    } catch (err: any) {
      console.error('Booking Error:', err);
      toast.error(err.response?.data?.message || 'Booking failed. Please check all fields.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 text-sm font-bold text-gray-800 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#E32222] focus:ring-4 focus:ring-[#E32222]/5 transition-all text-gray-700";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2";

  if (isDataLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 size={40} className="text-[#E32222] animate-spin" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Initializing Dispatcher...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <Link href="/dashboard/rides" className="text-[10px] font-black text-gray-400 hover:text-[#E32222] uppercase tracking-[0.2em] flex items-center gap-2 mb-2 transition-colors group">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Ride Management
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Manual Dispatch</h1>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Establish a direct booking for manual riders</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest">Pricing Engine Online</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: User & Service Info */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Details Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
               <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                   <User size={16} />
                 </div>
                 Rider Information
               </h2>
               
               <div className="space-y-4">
                 <div className="space-y-1.5">
                   <label className={labelClass}><Phone size={12}/> Primary Mobile *</label>
                   <input 
                     type="tel" 
                     className={inputClass} 
                     placeholder="+91 XXXXX XXXXX"
                     required
                     value={formData.userPhone}
                     onChange={e => setFormData({...formData, userPhone: e.target.value})}
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className={labelClass}><User size={12}/> Full Name (Optional)</label>
                   <input 
                     type="text" 
                     className={inputClass} 
                     placeholder="John Doe"
                     value={formData.userName}
                     onChange={e => setFormData({...formData, userName: e.target.value})}
                   />
                 </div>
               </div>
            </div>

            {/* Service Preferences */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
               <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                   <Zap size={16} />
                 </div>
                 Service Selection
               </h2>

               <div className="space-y-4">
                 <div className="space-y-1.5">
                   <label className={labelClass}><Car size={12}/> Vehicle Category *</label>
                   <select 
                     className={inputClass}
                     required
                     value={formData.vehicleTypeId}
                     onChange={e => setFormData({...formData, vehicleTypeId: e.target.value})}
                   >
                     <option value="">Choose Vehicle...</option>
                     {vehicleTypes.map(vt => (
                       <option key={vt.id} value={vt.id}>{vt.displayName} ({vt.category})</option>
                     ))}
                   </select>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className={labelClass}><MapPin size={12}/> City Code *</label>
                     <select 
                       className={inputClass}
                       required
                       value={formData.cityCodeId}
                       onChange={e => setFormData({...formData, cityCodeId: e.target.value})}
                     >
                        <option value="">Select City...</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.code}</option>
                        ))}
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className={labelClass}><Route size={12}/> Ride Type</label>
                     <select 
                        className={inputClass}
                        value={formData.rideType}
                        onChange={e => setFormData({...formData, rideType: e.target.value})}
                      >
                       <option value="LOCAL">Local</option>
                       <option value="AIRPORT">Airport</option>
                       <option value="OUTSTATION">Outstation</option>
                       <option value="RENTAL">Rental</option>
                     </select>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Route Section */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
             <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                 <Route size={16} />
               </div>
               Route Specification
             </h2>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
                <div className="absolute left-1/2 top-10 bottom-10 w-0.5 bg-gray-50 -translate-x-1/2 hidden md:block" />
                
                {/* Pickup */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3 text-[#E32222]">
                      <div className="w-3 h-3 rounded-full bg-[#E32222] ring-4 ring-red-100" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Entry Point (Pickup)</span>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Pick-up Address *</label>
                        <input 
                          type="text" 
                          className={inputClass} 
                          placeholder="Search or enter location..."
                          required
                          value={formData.pickupAddress}
                          onChange={e => setFormData({...formData, pickupAddress: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white px-3 py-2 rounded-xl border border-gray-100">
                           <span className="text-[8px] font-black text-gray-400 uppercase">Latitude</span>
                           <input 
                             type="number" 
                             step="0.000001"
                             className="w-full text-[10px] font-bold text-gray-700 outline-none bg-transparent"
                             value={formData.pickupLat}
                             onChange={e => setFormData({...formData, pickupLat: parseFloat(e.target.value) || 0})}
                           />
                         </div>
                         <div className="bg-white px-3 py-2 rounded-xl border border-gray-100">
                           <span className="text-[8px] font-black text-gray-400 uppercase">Longitude</span>
                           <input 
                             type="number" 
                             step="0.000001"
                             className="w-full text-[10px] font-bold text-gray-700 outline-none bg-transparent"
                             value={formData.pickupLng}
                             onChange={e => setFormData({...formData, pickupLng: parseFloat(e.target.value) || 0})}
                           />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Drop */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3 text-gray-800">
                      <div className="w-3 h-3 rounded-full bg-gray-900 ring-4 ring-gray-100" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Exit Point (Drop)</span>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className={labelClass}>Drop Address *</label>
                        <input 
                          type="text" 
                          className={inputClass} 
                          placeholder="Destination point..."
                          required
                          value={formData.dropAddress}
                          onChange={e => setFormData({...formData, dropAddress: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white px-3 py-2 rounded-xl border border-gray-100">
                           <span className="text-[8px] font-black text-gray-400 uppercase">Drop Lat</span>
                           <input 
                             type="number" 
                             step="0.000001"
                             className="w-full text-[10px] font-bold text-gray-700 outline-none bg-transparent"
                             value={formData.dropLat}
                             onChange={e => setFormData({...formData, dropLat: parseFloat(e.target.value) || 0})}
                           />
                         </div>
                         <div className="bg-white px-3 py-2 rounded-xl border border-gray-100">
                           <span className="text-[8px] font-black text-gray-400 uppercase">Drop Lng</span>
                           <input 
                             type="number" 
                             step="0.000001"
                             className="w-full text-[10px] font-bold text-gray-700 outline-none bg-transparent"
                             value={formData.dropLng}
                             onChange={e => setFormData({...formData, dropLng: parseFloat(e.target.value) || 0})}
                           />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white px-3 py-2 rounded-xl border border-gray-100">
                           <span className="text-[8px] font-black text-gray-400 uppercase">Distance (KM) *</span>
                           <input 
                             type="number" 
                             step="0.1"
                             className="w-full text-[10px] font-bold text-gray-700 outline-none bg-transparent"
                             required
                             value={formData.distanceKm}
                             onChange={e => setFormData({...formData, distanceKm: parseFloat(e.target.value) || 0})}
                           />
                         </div>
                         <div className="bg-white px-3 py-2 rounded-xl border border-gray-50">
                           <span className="text-[8px] font-black text-gray-400 uppercase">Estimated Travel</span>
                           <p className="text-[10px] font-bold text-gray-700">Manually Set</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Execution */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
           <div className="sticky top-6 space-y-6">
              
              {/* Scheduling Card */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                 <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                     <Calendar size={16} />
                   </div>
                   Timing & Payment
                 </h2>

                 <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className={labelClass}><Clock size={12}/> Schedule Date & Time *</label>
                      <input 
                        type="datetime-local" 
                        className={inputClass} 
                        required
                        value={formData.scheduledDateTime}
                        onChange={e => setFormData({...formData, scheduledDateTime: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelClass}><CreditCard size={12}/> Settlement Method</label>
                      <div className="grid grid-cols-2 gap-2">
                         {['CASH', 'UPI', 'CREDIT', 'ONLINE'].map((mode) => (
                           <button
                             key={mode}
                             type="button"
                             onClick={() => setFormData({...formData, paymentMode: mode})}
                             className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                               formData.paymentMode === mode 
                                 ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                                 : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                             }`}
                           >
                             {mode}
                           </button>
                         ))}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className={labelClass}>Internal Notes</label>
                      <textarea 
                        className={`${inputClass} min-h-[100px] resize-none py-3 font-medium`}
                        placeholder="Driver instructions, luggage info, etc..."
                        value={formData.bookingNotes}
                        onChange={e => setFormData({...formData, bookingNotes: e.target.value})}
                      />
                    </div>
                 </div>
              </div>

              {/* Action Board */}
              <div className="bg-white p-3 rounded-[3rem] border border-gray-100 shadow-xl space-y-4">
                 <button 
                   type="submit"
                   disabled={isLoading}
                   className="w-full h-16 bg-[#E32222] hover:bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-red-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                   {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                   {isLoading ? 'Processing Dispatch' : 'Commit Dispatch'}
                 </button>
              </div>

              <div className="p-6 bg-red-50/50 rounded-[2rem] border border-red-100">
                 <div className="flex items-start gap-3">
                   <AlertCircle size={20} className="text-[#E32222] shrink-0" />
                   <div>
                     <p className="text-[10px] font-black text-gray-800 uppercase tracking-widest leading-none">Security Protocol</p>
                     <p className="text-[9px] text-gray-500 font-medium mt-1 leading-relaxed">Manual bookings will be visible to all logged-in Admins. User and Partner will receive instant SMS notifications.</p>
                   </div>
                 </div>
              </div>

           </div>
        </div>
      </form>
    </div>
  );
}
