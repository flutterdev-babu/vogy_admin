'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Car,
  Calendar,
  User,
  Smartphone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useJsApiLoader } from '@react-google-maps/api';
import { publicRideService } from '@/services/publicRideService';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const LIBRARIES: ("places")[] = ['places'];

export default function ContactPage() {
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
  const [pickupCoords, setPickupCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number, lng: number } | null>(null);

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
    const fetchInitialData = async () => {
      try {
        const [vtRes, ccRes] = await Promise.all([
          publicRideService.getVehicleTypes(),
          publicRideService.getCityCodes()
        ]);
        if (vtRes.success) setVehicleTypesData(vtRes.data || []);
        if (ccRes.success) setCityCodes(ccRes.data || []);
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };
    fetchInitialData();
  }, []);

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

  useEffect(() => {
    if (pickupCoords && dropCoords) {
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
    }
  }, [pickupCoords, dropCoords, isLoaded]);

  useEffect(() => {
    const updatePriceEstimate = async () => {
      if (!distanceKm) return;
      let cityId = selectedCityId;
      if (!cityId && cityCodes && cityCodes.length > 0) {
        cityId = cityCodes[0].id;
      }
      if (!cityId) return;

      try {
        const res = await publicRideService.estimateFare({
          distanceKm,
          cityCodeId: cityId,
          pickupLat: pickupCoords?.lat,
          pickupLng: pickupCoords?.lng
        });

        if (res.success && res.data?.fareEstimates) {
          let estimate = null;
          if (selectedVehicleTypeId) {
            estimate = res.data.fareEstimates.find((f: any) => f.vehicleTypeId === selectedVehicleTypeId);
          }
          if (estimate) {
            setEstimatedPrice(estimate.estimatedFare);
          } else if (res.data.fareEstimates.length > 0) {
            setEstimatedPrice(res.data.fareEstimates[0].estimatedFare);
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
    updatePriceEstimate();
  }, [distanceKm, selectedVehicleTypeId, selectedCityId, cityCodes, pickupCoords]);

  const handleBookNow = async () => {
    const pickup = pickupInputRef.current?.value;
    const drop = dropInputRef.current?.value;

    if (!name || !phone || !pickup || !pickupDateTime || !selectedVehicleTypeId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    let cityId = selectedCityId;
    if (!cityId && cityCodes.length > 0) cityId = cityCodes[0].id;

    setIsLoading(true);
    try {
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
        vehicleTypeId: selectedVehicleTypeId,
        cityCodeId: cityId || '',
        passengers: passengers || undefined,
      };

      let bookingId = 'PENDING';
      try {
        const res = await publicRideService.bookRide(bookingPayload);
        if (res.success) bookingId = res.data?.customId || 'PENDING';
      } catch (apiErr) {
        console.error('Backend booking API failed, proceeding to WhatsApp:', apiErr);
      }

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
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        setIsLoading(false);
      }, 1500);
    } catch (error: any) {
      console.error('Failed to book ride:', error);
      toast.error(error.message || "There was an error booking your ride.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans text-white overflow-x-hidden selection:bg-[#E32222] selection:text-white">
      <Toaster position="top-center" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E32222]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl lg:text-7xl font-bold leading-tight mb-8"
          >
            Get in <span className="text-[#E32222]">Touch</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed"
          >
            Book your next ride or reach out for any queries. We're here to provide you with the best travel experience.
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <ContactInfoCard
              icon={<Phone size={24} className="text-[#E32222]" />}
              title="Call Us"
              content="+91 7569645049"
              subContent="Mon-Sun, 24/7"
            />
            <ContactInfoCard
              icon={<Mail size={24} className="text-[#E32222]" />}
              title="Email Us"
              content="bookings.aratravels@gmail.com"
              subContent="We'll respond within 24 hours"
            />
            <ContactInfoCard
              icon={<MapPin size={24} className="text-[#E32222]" />}
              title="Visit Us"
              content="63, 5th cross, Manjunatha Layout, Munnekollal, Bengaluru 560037"
              subContent="Multiple city operations"
            />
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Book a <span className="text-[#E32222]">Ride</span></h2>
                <p className="text-neutral-400 text-sm">Fill in the details below to book your ride instantly.</p>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5 overflow-x-auto">
                {['local', 'rental', 'outstation', 'airport'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setBookingTab(tab as any)}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all capitalize whitespace-nowrap ${bookingTab === tab
                      ? 'bg-[#E32222] text-white shadow-lg'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#E32222] transition-colors"
                    />
                  </div>
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#E32222] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#E32222] cursor-pointer appearance-none"
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
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#E32222]"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                  <input
                    type="datetime-local"
                    value={pickupDateTime}
                    onChange={(e) => setPickupDateTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#E32222]"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                    <input
                      ref={pickupInputRef}
                      type="text"
                      placeholder="Pickup Location"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#E32222]"
                    />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                    <input
                      ref={dropInputRef}
                      type="text"
                      placeholder="Drop Location"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#E32222]"
                    />
                  </div>
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
                          <span className="text-3xl font-black text-[#E32222] tabular-nums drop-shadow-[0_0_15px_rgba(227,34,34,0.3)]">
                            ₹{estimatedPrice}
                          </span>
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
                  className="w-full py-4 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-bold text-lg shadow-lg hover:shadow-red-900/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Processing...' : 'Book Now'}
                  {!isLoading && <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ContactInfoCard({ icon, title, content, subContent }: { icon: React.ReactNode, title: string, content: string, subContent: string }) {
  return (
    <div className="flex gap-6 p-6 rounded-3xl bg-neutral-900/50 border border-white/5 hover:bg-neutral-800/50 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-[#E32222]/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-white font-medium mb-1 break-all">{content}</p>
        <p className="text-sm text-neutral-500">{subContent}</p>
      </div>
    </div>
  );
}
