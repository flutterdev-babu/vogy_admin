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

const LIBRARIES: ("places")[] = ['places'];

export default function LandingPage() {
  const [bookingTab, setBookingTab] = useState<'local' | 'rental' | 'outstation' | 'airport'>('local');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Any');
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [passengers, setPassengers] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    if (!isLoaded) return;

    if (pickupInputRef.current && !pickupAutocompleteRef.current) {
      const ac = new google.maps.places.Autocomplete(pickupInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
      });
      pickupAutocompleteRef.current = ac;
    }

    if (dropInputRef.current && !dropAutocompleteRef.current) {
      const ac = new google.maps.places.Autocomplete(dropInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
      });
      dropAutocompleteRef.current = ac;
    }
  }, [isLoaded]);

  const handleEnquireNow = async () => {
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
      alert("Please enter a pickup location.");
      return;
    }

    if (!pickupDateTime) {
      alert("Please select a pickup date and time.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Send enquiry to backend to store in Audit Logs
      await enquiryService.submitEnquiry({
        name,
        phone,
        pickup,
        drop: drop || undefined,
        rideType: bookingTab.toUpperCase(),
        vehicleType,
        pickupDateTime,
        passengers: passengers || undefined,
      });

      // 2. Format message for WhatsApp
      let whatsappMessage = `*New Ride Enquiry*\n`;
      whatsappMessage += `*Name:* ${name}\n`;
      whatsappMessage += `*Phone:* ${phone}\n`;
      whatsappMessage += `*Ride Type:* ${bookingTab.toUpperCase()}\n`;
      whatsappMessage += `*Vehicle:* ${vehicleType}\n`;
      whatsappMessage += `*Date & Time:* ${pickupDateTime}\n`;
      whatsappMessage += `*Pickup:* ${pickup}\n`;
      if (drop) whatsappMessage += `*Drop:* ${drop}\n`;
      if (passengers) whatsappMessage += `*Passengers:* ${passengers}`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const ownerWhatsAppPhone = '917569645049';
      const whatsappUrl = `https://wa.me/${ownerWhatsAppPhone}?text=${encodedMessage}`;

      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error('Failed to submit enquiry:', error);
      alert("There was an error submitting your enquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans text-white overflow-x-hidden selection:bg-[#E32222] selection:text-white">

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
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Any" className="bg-neutral-900">Any Vehicle</option>
                    <option value="Hatchback" className="bg-neutral-900">Hatchback</option>
                    <option value="Sedan" className="bg-neutral-900">Sedan</option>
                    <option value="SUV" className="bg-neutral-900">SUV</option>
                    <option value="Innova/Ertiga" className="bg-neutral-900">Innova/Ertiga</option>
                    <option value="Tempo Traveller" className="bg-neutral-900">Tempo Traveller</option>
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

              <button 
                onClick={handleEnquireNow}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-bold text-lg shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all transform hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? 'Processing...' : 'Enquire Now'}
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
