'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
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
  Loader2,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRideService } from '@/services/adminRideService';
import { cityCodeService } from '@/services/cityCodeService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { corporateService } from '@/services/corporateService';
import { rideBookingService } from '@/services/rideBookingService';
import { userService } from '@/services/userService';
import { CityCode, VehicleType, Corporate, User } from '@/types';
import { useJsApiLoader } from '@react-google-maps/api';

const LIBRARIES: ("places")[] = ['places'];

type BookingType = 'AIRPORT' | 'LOCAL' | 'OUTSTATION' | 'RENTAL';

export default function CreateRidePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    altMobile: '',
    pickupAddress: '',
    dropAddress: '',
    vehicleTypeId: '',
    rideType: 'AIRPORT' as BookingType,
    agentCode: '',
    cityCodeId: '',
    corporateId: '',
    bookingDate: '',
    bookingTime: '',
    distanceKm: 0,
    paymentMode: 'CASH',
    pickupLat: 0,
    pickupLng: 0,
    dropLat: 0,
    dropLng: 0,
  });

  const [loading, setLoading] = useState(false);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [corporates, setCorporates] = useState<Corporate[]>([]);

  // User search state
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showUserNotFound, setShowUserNotFound] = useState(false);
  const userSearchRef = useRef<HTMLDivElement | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponId: string;
    discountAmount: number;
    couponCode: string;
  } | null>(null);

  // Google Maps Autocomplete refs
  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const pickupInputRef = useRef<HTMLInputElement | null>(null);
  const dropInputRef = useRef<HTMLInputElement | null>(null);

  // Distance calculation state
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [mapsDebugResult, setMapsDebugResult] = useState<string>('');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

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

  // Search users by phone number
  const handleUserSearch = async () => {
    if (formData.phone.length < 3) {
      toast.error('Enter at least 3 digits to search');
      return;
    }
    setIsSearchingUser(true);
    setShowUserDropdown(false);
    try {
      const response = await userService.search(formData.phone);
      const results = response.data || [];
      setUserSearchResults(results);
      if (results.length === 1) {
        // Auto-fill directly if single match
        selectUser(results[0]);
        toast.success(`User found: ${results[0].name}`);
      } else if (results.length > 1) {
        setShowUserDropdown(true);
        toast.success(`${results.length} users found, select one`);
      } else {
        setShowUserNotFound(true);
      }
    } catch (err: any) {
      console.error('User search error:', err);
      toast.error('Failed to search users');
    } finally {
      setIsSearchingUser(false);
    }
  };

  const selectUser = (user: User) => {
    const phoneWithout91 = user.phone?.startsWith('+91') ? user.phone.slice(3) : user.phone;
    setFormData(prev => ({
      ...prev,
      customerName: user.name || '',
      phone: phoneWithout91 || prev.phone,
      email: user.email || '',
    }));
    setShowUserDropdown(false);
    setUserSearchResults([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manual test function for Places API
  const testPlacesAPI = () => {
    setMapsDebugResult('Testing...');
    try {
      if (!google?.maps?.places) {
        setMapsDebugResult('❌ google.maps.places is NOT available');
        return;
      }
      const svc = new google.maps.places.AutocompleteService();
      svc.getPlacePredictions(
        { input: 'Bangalore', componentRestrictions: { country: 'in' } },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setMapsDebugResult(`✅ Working! Got ${predictions.length} results: ${predictions.map(p => p.description).slice(0, 3).join(' | ')}`);
          } else {
            setMapsDebugResult(`❌ API returned status: ${status}. This means Places API is NOT enabled or billing is missing in Google Cloud Console.`);
          }
        }
      );
    } catch (err: any) {
      setMapsDebugResult(`❌ Error: ${err.message}`);
    }
  };

  // Attach Google Places Autocomplete AFTER maps is loaded
  useEffect(() => {
    if (!isLoaded) return;

    // Pickup Autocomplete
    if (pickupInputRef.current && !pickupAutocompleteRef.current) {
      const ac = new google.maps.places.Autocomplete(pickupInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place?.geometry?.location) {
          setFormData(prev => ({
            ...prev,
            pickupAddress: place.formatted_address || place.name || '',
            pickupLat: place.geometry!.location!.lat(),
            pickupLng: place.geometry!.location!.lng(),
          }));
        }
      });
      pickupAutocompleteRef.current = ac;
    }

    // Drop Autocomplete
    if (dropInputRef.current && !dropAutocompleteRef.current) {
      const ac = new google.maps.places.Autocomplete(dropInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place?.geometry?.location) {
          setFormData(prev => ({
            ...prev,
            dropAddress: place.formatted_address || place.name || '',
            dropLat: place.geometry!.location!.lat(),
            dropLng: place.geometry!.location!.lng(),
          }));
        }
      });
      dropAutocompleteRef.current = ac;
    }
  }, [isLoaded]);

  // Distance calculation
  const calculateDistance = useCallback(() => {
    if (!formData.pickupLat || !formData.dropLat || !isLoaded) return;

    setIsCalculatingDistance(true);
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [{ lat: formData.pickupLat, lng: formData.pickupLng }],
        destinations: [{ lat: formData.dropLat, lng: formData.dropLng }],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        setIsCalculatingDistance(false);
        if (status === 'OK' && response) {
          const result = response.rows[0]?.elements[0];
          if (result?.status === 'OK') {
            const distKm = parseFloat((result.distance!.value / 1000).toFixed(1));
            setFormData(prev => ({ ...prev, distanceKm: distKm }));
            toast.success(`Distance calculated: ${distKm} km · ${result.duration!.text}`);
          }
        }
      }
    );
  }, [formData.pickupLat, formData.pickupLng, formData.dropLat, formData.dropLng, isLoaded]);

  // Auto-trigger distance calculation
  useEffect(() => {
    if (formData.pickupLat && formData.dropLat) {
      calculateDistance();
    }
  }, [formData.pickupLat, formData.dropLat, calculateDistance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.vehicleTypeId || !formData.cityCodeId || !formData.pickupAddress || !formData.dropAddress) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const scheduledDateTime = formData.bookingDate && formData.bookingTime 
        ? new Date(`${formData.bookingDate}T${formData.bookingTime}:00`).toISOString() 
        : new Date().toISOString();

      await adminRideService.createManualRide({
        userName: formData.customerName,
        userPhone: `+91${formData.phone}`,
        vehicleTypeId: formData.vehicleTypeId,
        cityCodeId: formData.cityCodeId,
        rideType: formData.rideType,
        paymentMode: formData.paymentMode,
        pickupAddress: formData.pickupAddress,
        dropAddress: formData.dropAddress,
        pickupLat: formData.pickupLat || 12.9716, // Fallback to default coordinates
        pickupLng: formData.pickupLng || 77.5946,
        dropLat: formData.dropLat || 12.9352,
        dropLng: formData.dropLng || 77.6245,
        distanceKm: Number(formData.distanceKm),
        scheduledDateTime,
        bookingNotes: `Email: ${formData.email}, Alt: ${formData.altMobile}, Agent: ${formData.agentCode}, Corporate: ${formData.corporateId}`,
        isManualBooking: true,
        couponCode: appliedCoupon ? appliedCoupon.couponCode : undefined
      });
      toast.success('Ride booked successfully!');
      router.push('/dashboard/rides');
    } catch (err: any) {
      console.error('Booking Error:', err);
      toast.error(err.response?.data?.message || 'Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode || !formData.cityCodeId) {
      toast.error('Enter a coupon code and select a city first');
      return;
    }
    setValidatingCoupon(true);
    try {
      // Calculate a more accurate fare based on selected vehicle if possible
      const selectedVehicle = vehicleTypes.find(v => v.id === formData.vehicleTypeId);
      const baseFare = selectedVehicle?.baseFare || 500;
      const pricePerKm = selectedVehicle?.pricePerKm || 15;
      const estimatedFare = formData.distanceKm > 0 
        ? Math.round(baseFare + (formData.distanceKm * pricePerKm))
        : 500;

      const payload = {
        couponCode: couponCode.trim(),
        cityCodeId: formData.cityCodeId,
        totalFare: estimatedFare
      };

      // 🔍 VERBOSE LOGGING FOR USER
      console.log("-----------------------------------------");
      console.log("🎟️ COUPON VALIDATION REQUEST");
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("Selected City ID:", formData.cityCodeId);
      const selectedCity = cityCodes.find(c => c.id === formData.cityCodeId);
      console.log("Selected City Name:", selectedCity?.cityName || "NOT FOUND");
      console.log("All Available Cities:");
      console.table(cityCodes.map(c => ({ id: c.id, name: c.cityName, code: c.code })));
      console.log("-----------------------------------------");
      
      const response = await rideBookingService.validateCoupon(payload);
      if (response.success && response.data) {
        setAppliedCoupon(response.data);
        toast.success(`Coupon applied! Discount: ₹${response.data.discountAmount}`);
      }
    } catch (err: any) {
      console.error("❌ Coupon Validation Error:", err.response?.data || err.message);
      console.error("Error Details:", JSON.stringify(err.response?.data || {}, null, 2));
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const inputGroupClass = "flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#E32222] focus-within:ring-1 focus-within:ring-[#E32222]/30 transition-all bg-white shadow-sm";
  const labelSideClass = "px-4 py-2 bg-gray-50 border-r border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wide min-w-[100px] whitespace-nowrap";
  const labelRequiredClass = "px-5 py-2 bg-gray-50 border-r border-gray-100 text-[10px] font-bold text-red-600 uppercase tracking-wide min-w-[100px] whitespace-nowrap";
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
          {/* Row 1: Mobile & Name */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative flex" ref={userSearchRef}>
              <div className={`${inputGroupClass} flex-1`}>
                <label className={labelRequiredClass}>Mobile</label>
                <div className="flex flex-1">
                  <span className="flex items-center pl-3 text-sm text-gray-400">+91</span>
                  <input type="tel" required value={formData.phone}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '');
                      if (v.length > 10 && v.startsWith('91')) v = v.slice(2);
                      setFormData({...formData, phone: v.slice(0, 10)});
                      setShowUserNotFound(false);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUserSearch(); } }}
                    className={fieldClass} placeholder="9876543210" maxLength={10} />
                </div>
              </div>
              <button type="button" onClick={handleUserSearch} disabled={isSearchingUser}
                className="ml-2 bg-[#E32222] text-white p-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50">
                {isSearchingUser ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              </button>

              {/* User Search Results Dropdown */}
              {showUserDropdown && userSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                  {userSearchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectUser(user)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.phone} {user.email ? `· ${user.email}` : ''}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* User Not Found Popup */}
              {showUserNotFound && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Search size={18} className="text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">User not found</p>
                      <p className="text-xs text-gray-500">No user exists with this number. You can add a new user or enter details manually.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Link href="/dashboard/users/create" target="_blank"
                      className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-red-700 transition-colors">
                      <UserPlus size={14} />
                      Add New User
                    </Link>
                    <button type="button" onClick={() => setShowUserNotFound(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors">
                      Continue Manually
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={inputGroupClass}>
              <label className={labelRequiredClass}>Name</label>
              <input type="text" required value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
                className={fieldClass} placeholder="Kiran Perepalle" />
            </div>
          </div>

          {/* Row 2: Email & Alt Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Vehicle Type</label>
              <select required value={formData.vehicleTypeId}
                onChange={e => setFormData({...formData, vehicleTypeId: e.target.value})}
                className={`${fieldClass} appearance-none bg-white`}>
                <option value="">Select Vehicle</option>
                {vehicleTypes.map((vt) => (
                  <option key={vt.id} value={vt.id}>{vt.displayName} ({vt.category})</option>
                ))}
              </select>
            </div>
          </div>



          {/* Pickup & Drop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Pickup</label>
                <input ref={pickupInputRef} type="text" required value={formData.pickupAddress}
                  onChange={e => setFormData({...formData, pickupAddress: e.target.value})}
                  className={fieldClass} placeholder="Search pickup location..." />
              </div>
            </div>
            <div className="space-y-4">
              <div className={inputGroupClass}>
                <label className={labelSideClass}>Drop</label>
                <input ref={dropInputRef} type="text" required value={formData.dropAddress}
                  onChange={e => setFormData({...formData, dropAddress: e.target.value})}
                  className={fieldClass} placeholder="Search drop location..." />
              </div>
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
            <div className={inputGroupClass}>
              <label className={labelSideClass}>Distance (Km)</label>
              <div className="flex-1 flex items-center pr-4">
                <input type="number" step="0.1" value={formData.distanceKm}
                  onChange={e => setFormData({...formData, distanceKm: parseFloat(e.target.value) || 0})}
                  className={`${fieldClass} pr-0`} placeholder="15.5" />
                {isCalculatingDistance && <Loader2 size={16} className="animate-spin text-[#E32222]" />}
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="grid grid-cols-1 gap-4 max-w-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className={`${inputGroupClass} flex-1 w-full`}>
                <label className={labelSideClass}>Coupon</label>
                <input type="text" value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className={fieldClass} placeholder="AGENTBLR50" />
              </div>
              {!appliedCoupon ? (
                <button type="button" onClick={handleValidateCoupon} disabled={validatingCoupon}
                  className="px-6 py-2.5 bg-gray-800 text-white rounded-xl font-bold text-sm uppercase shadow-sm hover:bg-gray-900 transition-colors disabled:opacity-50 h-[42px] w-full sm:w-auto">
                  {validatingCoupon ? 'Wait' : 'Apply'}
                </button>
              ) : (
                <button type="button" onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode('');
                  }}
                  className="px-6 py-2.5 bg-red-100 text-[#E32222] rounded-xl font-bold text-sm uppercase shadow-sm hover:bg-red-200 transition-colors h-[42px] w-full sm:w-auto">
                  Remove
                </button>
              )}
            </div>
            
            {/* 🔍 City ID Debug Info */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Active City ID:</span>
              <span className="text-[9px] font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                {formData.cityCodeId || 'NONE SELECTED'}
              </span>
            </div>
            
            {appliedCoupon && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between text-green-800 transition-all">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span className="text-sm font-semibold">Coupon <span className="font-mono">{appliedCoupon.couponCode}</span> applied!</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-600 block font-bold uppercase tracking-wide">Discount</span>
                  <span className="text-xl font-black">-₹{appliedCoupon.discountAmount}</span>
                </div>
              </div>
            )}
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
