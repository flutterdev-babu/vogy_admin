'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  Car,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Shield,
  Smartphone,
  ChevronRight,
  Briefcase,
  User
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useJsApiLoader } from '@react-google-maps/api';
import { enquiryService } from '@/services/enquiryService';
import { publicRideService } from '@/services/publicRideService';
import { toast, Toaster } from 'react-hot-toast';

const LIBRARIES: ("places")[] = ['places'];

export default function LandingPage() {
  const [bookingTab, setBookingTab] = useState<'local' | 'rental' | 'outstation' | 'airport'>('local');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Any');
  const [vehicleTypesData, setVehicleTypesData] = useState<any[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState('');
  const [cityCodes, setCityCodes] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [passengers, setPassengers] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [dropCoords, setDropCoords] = useState<{lat: number, lng: number} | null>(null);

  const pickupInputRef = useRef<HTMLInputElement | null>(null);
  const dropInputRef = useRef<HTMLInputElement | null>(null);
  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [vtRes, ccRes] = await Promise.all([
        publicRideService.getVehicleTypes(),
        publicRideService.getCityCodes()
      ]);
      if (vtRes.success) setVehicleTypesData(vtRes.data || []);
      if (ccRes.success) setCityCodes(ccRes.data || []);
    } catch (err) {
      console.error("Error fetching initial landing page data:", err);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (pickupInputRef.current && !pickupAutocompleteRef.current) {
      const ac = new google.maps.places.Autocomplete(pickupInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'address_components', 'name'],
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setPickupCoords({ lat, lng });
          
          // Try to determine city from address components
          const cityComp = place.address_components?.find(c => 
            c.types.includes('locality') || c.types.includes('administrative_area_level_2')
          );
          if (cityComp) {
            const cityName = cityComp.long_name;
            const matchedCity = cityCodes.find(c => 
              c.cityName.toLowerCase() === cityName.toLowerCase() ||
              cityName.toLowerCase().includes(c.cityName.toLowerCase())
            );
            if (matchedCity) setSelectedCityId(matchedCity.id);
          }
        }
      });
      pickupAutocompleteRef.current = ac;
    }

    if (dropInputRef.current && !dropAutocompleteRef.current) {
      const ac = new google.maps.places.Autocomplete(dropInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place.geometry?.location) {
          setDropCoords({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
        }
      });
      dropAutocompleteRef.current = ac;
    }
  }, [isLoaded, cityCodes]);

  // Handle distance and price calculation
  useEffect(() => {
    if (pickupCoords && dropCoords) {
      calculateDistance();
    }
  }, [pickupCoords, dropCoords]);

  useEffect(() => {
    if (distanceKm) {
      updatePriceEstimate();
    }
  }, [distanceKm, selectedVehicleTypeId, selectedCityId, cityCodes]);

  const calculateDistance = async () => {
    if (!pickupCoords || !dropCoords || !isLoaded) return;

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [new google.maps.LatLng(pickupCoords.lat, pickupCoords.lng)],
      destinations: [new google.maps.LatLng(dropCoords.lat, dropCoords.lng)],
      travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
      if (status === 'OK' && response?.rows[0]?.elements[0]?.distance) {
        const dist = response.rows[0].elements[0].distance.value / 1000;
        setDistanceKm(Number(dist.toFixed(1)));
      }
    });
  };

  const updatePriceEstimate = async () => {
    if (!distanceKm) return;
    
    // We need a city ID. If matching failed, use the first active city.
    let cityId = selectedCityId;
    if (!cityId && cityCodes && cityCodes.length > 0) {
      cityId = cityCodes[0].id;
    }
    
    if (!cityId) {
      console.log("No city found for pricing yet");
      return;
    }

    try {
      const res = await publicRideService.estimateFare({
        distanceKm,
        cityCodeId: cityId,
        pickupLat: pickupCoords?.lat,
        pickupLng: pickupCoords?.lng
      });

      if (res.success && res.data?.fareEstimates) {
        // Find by selected ID or fallback to first one if none selected
        let estimate = null;
        if (selectedVehicleTypeId) {
          estimate = res.data.fareEstimates.find((f: any) => f.vehicleTypeId === selectedVehicleTypeId);
        }
        
        if (estimate) {
          setEstimatedPrice(estimate.estimatedFare);
        } else if (res.data.fareEstimates.length > 0) {
          setEstimatedPrice(res.data.fareEstimates[0].estimatedFare);
          // If no type was selected, auto-select the first one for the user
          if (!selectedVehicleTypeId) {
            const firstVt = res.data.fareEstimates[0];
            setSelectedVehicleTypeId(firstVt.vehicleTypeId);
            setVehicleType(firstVt.vehicleTypeName || firstVt.name);
          }
        }
      }
    } catch (err) {
      console.error("Error estimating fare:", err);
    }
  };

  const handleBookNow = async () => {
    const pickup = pickupInputRef.current?.value;
    const drop = dropInputRef.current?.value;

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }

    if (!pickup) {
      toast.error("Please enter a pickup location.");
      return;
    }

    if (!pickupDateTime) {
      toast.error("Please select a pickup date and time.");
      return;
    }

    // Use local variables to avoid state race conditions
    let cityId = selectedCityId;
    if (!cityId) {
      if (cityCodes.length > 0) {
        cityId = cityCodes[0].id;
        setSelectedCityId(cityId);
      } else {
        toast.error("City not detected. Please select city or confirm locations.");
        return;
      }
    }

    const vehicleId = selectedVehicleTypeId;
    if (!vehicleId) {
      toast.error("Please select a vehicle type.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create actual Ride in backend
      const bookingPayload = {
        userName: name,
        userPhone: phone,
        pickupAddress: pickup,
        dropAddress: drop || "Not specified",
        pickupLat: pickupCoords?.lat || 0,
        pickupLng: pickupCoords?.lng || 0,
        dropLat: dropCoords?.lat || 0,
        dropLng: dropCoords?.lng || 0,
        distanceKm: distanceKm || 0,
        scheduledDateTime: new Date(pickupDateTime).toISOString(),
        rideType: bookingTab.toUpperCase(),
        vehicleTypeId: vehicleId,
        cityCodeId: cityId,
        passengers: passengers || undefined,
      };

      let bookingId = 'PENDING';
      try {
        const res = await publicRideService.bookRide(bookingPayload);
        if (res.success) {
          bookingId = res.data?.customId || 'PENDING';
        }
      } catch (apiErr) {
        // Backend failed — log it but DON'T block the customer
        console.error('Backend booking API failed, proceeding to WhatsApp:', apiErr);
      }

      // 2. Format message for WhatsApp — ALWAYS runs
      let whatsappMessage = `*New Ride Booking*\n`;
      whatsappMessage += `*Booking ID:* ${bookingId}\n`;
      whatsappMessage += `*Name:* ${name}\n`;
      whatsappMessage += `*Phone:* ${phone}\n`;
      whatsappMessage += `*Ride Type:* ${bookingTab.toUpperCase()}\n`;
      whatsappMessage += `*Vehicle:* ${vehicleType}\n`;
      whatsappMessage += `*Date & Time:* ${pickupDateTime}\n`;
      whatsappMessage += `*Pickup:* ${pickup}\n`;
      if (drop) whatsappMessage += `*Drop:* ${drop}\n`;
      if (distanceKm) whatsappMessage += `*Distance:* ${distanceKm} KM\n`;
      if (estimatedPrice) whatsappMessage += `*Est. Fare:* ₹${estimatedPrice}\n`;
      if (passengers) whatsappMessage += `*Passengers:* ${passengers}`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const ownerWhatsAppPhone = '917569645049';
      const whatsappUrl = `https://wa.me/${ownerWhatsAppPhone}?text=${encodedMessage}`;

      toast.success("Ride booked! Redirecting to WhatsApp...");
      
      // Delay slightly for toast visibility
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        setIsLoading(false);
      }, 1500);
      
    } catch (error: any) {
      console.error('Failed to book ride:', error);
      toast.error(error.message || "There was an error booking your ride. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans text-white overflow-x-hidden selection:bg-[#E32222] selection:text-white">
      <Toaster position="top-center" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E32222]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Hero Content */}
          <div className="text-center lg:text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#E32222] animate-pulse" />
              <span className="text-xs font-medium text-white/80 tracking-wide uppercase">#Trusted by Thousands</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold leading-tight"
            >
              Travel Better with <br />
              <span className="text-[#E32222] drop-shadow-[0_0_30px_rgba(227,34,34,0.3)]">ARA TRAVELS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Affordable cab services across all major cities — Airport Transfers, Local, Outstation, and Rentals made simple.
            </motion.p>
          </div>

          {/* Booking Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-md mx-auto bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5"
          >
            {/* Tabs */}
            <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5 overflow-x-auto">
              {['local', 'rental', 'outstation', 'airport'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBookingTab(tab as any)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${bookingTab === tab
                    ? 'bg-[#E32222] text-white shadow-lg shadow-red-900/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none"
                />
              </div>

              <div className="relative group">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                  <select
                    value={selectedVehicleTypeId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedVehicleTypeId(id);
                      const vt = vehicleTypesData.find(v => v.id === id);
                      if (vt) setVehicleType(vt.displayName || vt.name);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-neutral-900">Any Vehicle</option>
                    {vehicleTypesData.map((vt) => (
                      <option key={vt.id} value={vt.id} className="bg-neutral-900">
                        {vt.displayName || vt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                  <input
                    type="number"
                    placeholder="Passengers"
                    min="1"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none"
                  />
                </div>
              </div>

              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                <input
                  type="datetime-local"
                  value={pickupDateTime}
                  onChange={(e) => setPickupDateTime(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                <input
                  ref={pickupInputRef}
                  type="text"
                  placeholder="Pickup Location"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none"
                />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                <input
                  ref={dropInputRef}
                  type="text"
                  placeholder="Drop Location"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none"
                />
              </div>

              {selectedVehicleTypeId && (
                <div className="mt-4 p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-widest text-neutral-500">
                    <span>Trip Summary</span>
                    {distanceKm ? (
                      <span className="text-white/80">{distanceKm} KM</span>
                    ) : (
                      <span className="animate-pulse">Awaiting Locations...</span>
                    )}
                  </div>
                  
                  <div className="flex items-end justify-between pt-2 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase">Estimated Fare</span>
                      <span className="text-sm text-white/40 italic">Incl. all taxes</span>
                    </div>
                    <div className="text-right">
                      {estimatedPrice !== null ? (
                        <motion.span 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-black text-[#E32222] tabular-nums drop-shadow-[0_0_15px_rgba(227,34,34,0.3)]"
                        >
                          ₹{estimatedPrice}
                        </motion.span>
                      ) : (
                        <span className="text-xl font-bold text-neutral-600 italic">Calculating...</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleBookNow}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-bold text-lg shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all transform hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? 'Processing...' : 'Book Now'}
              </button>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20 px-4 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Join Our <span className="text-[#E32222]">Ecosystem</span></h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Whether you're a driver, fleet owner, or business, we have the perfect solution for you.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RoleCard
              title="Partner"
              subtitle="Drive & Earn"
              icon={<Car size={32} />}
              href="/partner/login"
              delay={0}
            />
            <RoleCard
              title="Vendor"
              subtitle="Manage Fleet"
              icon={<Shield size={32} />}
              href="/vendor/login"
              delay={0.1}
            />
            <RoleCard
              title="Agent"
              subtitle="City Operations"
              icon={<MapPin size={32} />}
              href="/agent/login"
              delay={0.2}
            />
            <RoleCard
              title="Corporate"
              subtitle="Business Travel"
              icon={<Briefcase size={32} />}
              href="/corporate/login"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Top Reasons to <br />
                <span className="text-[#E32222]">Ride with Us</span>
              </h2>
              <p className="text-lg text-neutral-400">
                Experience fast, safe, and affordable rides with reliable service wherever you go.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <FeatureCard icon={<Clock />} title="Advanced Pickups" desc="No Peak Hour Charges" />
                <FeatureCard icon={<Shield />} title="Safe Rides" desc="Verified drivers & tracking" />
                <FeatureCard icon={<Smartphone />} title="Easy Booking" desc="3-tap booking process" />
                <FeatureCard icon={<CheckCircle />} title="Best Fares" desc="Transparent pricing" />
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 relative group">
                <Image
                  src="/cab_image.png"
                  alt="Ara Travels Cab"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}

function RoleCard({ title, subtitle, icon, href, delay }: { title: string, subtitle: string, icon: React.ReactNode, href: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href} className="group block h-full">
        <div className="h-full p-8 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-[#E32222]/50 hover:bg-[#E32222]/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-red-900/10">
          <div className="w-14 h-14 rounded-2xl bg-[#E32222]/10 flex items-center justify-center text-[#E32222] mb-6 group-hover:bg-[#E32222] group-hover:text-white transition-colors">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
          <p className="text-neutral-400 group-hover:text-neutral-300 transition-colors text-sm">{subtitle}</p>
          <div className="mt-6 flex items-center gap-2 text-[#E32222] font-semibold text-sm">
            <span>Login / Register</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
      <div className="text-[#E32222] mt-1 p-2 bg-[#E32222]/10 rounded-lg">{icon}</div>
      <div>
        <h4 className="font-bold text-lg text-white">{title}</h4>
        <p className="text-sm text-neutral-500">{desc}</p>
      </div>
    </div>
  );
}
