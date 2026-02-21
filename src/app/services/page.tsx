'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Car, MapPin, Calendar, Clock, CheckCircle, Shield, TrendingDown, ZapOff } from 'lucide-react';
import { ReactNode } from 'react';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans text-white overflow-x-hidden selection:bg-[#E32222] selection:text-white">
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
            Our <span className="text-[#E32222]">Services</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed"
          >
            We provide a wide range of cab services tailored to your needs, ensuring transparency and comfort in every ride.
          </motion.p>
        </div>
      </section>

      {/* Unique Selling Points */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-gradient-to-br from-[#E32222]/20 to-transparent border border-[#E32222]/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E32222] flex items-center justify-center text-white mb-6">
              <ZapOff size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Peak Hour Charges</h2>
            <p className="text-neutral-300 text-lg leading-relaxed">
              Tired of surge pricing? At ARA Travels, we believe in fair pricing. Whether it's the morning rush or a late-night commute, our rates stay consistent. No more paying double just because it's busy.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-600/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-6">
              <TrendingDown size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Low Fare Charges</h2>
            <p className="text-neutral-300 text-lg leading-relaxed">
              We offer some of the most competitive rates in the industry. Our goal is to make premium cab services accessible to everyone without burning a hole in your pocket.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your <span className="text-[#E32222]">Ride</span></h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Flexible options for all your travel requirements.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<MapPin size={32} />} 
              title="Local Rides" 
              desc="Book a ride for your daily commute within the city. Fast, reliable, and always on time."
              features={["Point-to-point", "Live Tracking", "Affordable Fares"]}
            />
            <ServiceCard 
              icon={<Car size={32} />} 
              title="Outstation" 
              desc="Planning a trip outside the city? Our outstation services offer comfortable long-distance travel."
              features={["One-way/Round trip", "Experienced Drivers", "Inter-city safety"]}
            />
            <ServiceCard 
              icon={<Clock size={32} />} 
              title="Rentals" 
              desc="Need a cab for several hours? Book our rental service for flexible hourly packages."
              features={["Flexible Hours", "Multiple Stops", "Professional Chauffeurs"]}
            />
          </div>
        </div>
      </section>

      {/* Why ARA Travels */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-neutral-900 rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E32222]/5 rounded-full blur-[100px]" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8">What Makes Us <br /><span className="text-[#E32222]">Different?</span></h2>
                <div className="space-y-6">
                  <CheckItem title="24/7 Availability" desc="Our support and services are available round the clock." />
                  <CheckItem title="Safe & Secure" desc="All rides are monitored and drivers are thoroughly vetted." />
                  <CheckItem title="Transparent Invoicing" desc="Receive detailed digital receipts for every trip." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                  <Shield size={40} className="text-[#E32222] mb-4" />
                  <p className="font-bold">Safe</p>
                </div>
                <div className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                  <TrendingDown size={40} className="text-blue-500 mb-4" />
                  <p className="font-bold">Cheap</p>
                </div>
                <div className="aspect-square bg-white/5 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                  <ZapOff size={40} className="text-yellow-500 mb-4" />
                  <p className="font-bold">No Surge</p>
                </div>
                <div className="aspect-square bg-[#E32222] rounded-3xl flex flex-col items-center justify-center p-6 text-center text-white">
                  <CheckCircle size={40} className="mb-4" />
                  <p className="font-bold">Reliable</p>
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

function ServiceCard({ icon, title, desc, features }: { icon: ReactNode, title: string, desc: string, features: string[] }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-[#E32222]/30 transition-all duration-300">
      <div className="w-14 h-14 rounded-2xl bg-[#E32222]/10 flex items-center justify-center text-[#E32222] mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-neutral-400 mb-8 leading-relaxed">{desc}</p>
      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-neutral-300">
            <CheckCircle size={16} className="text-[#E32222]" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex-shrink-0">
        <CheckCircle size={20} className="text-[#E32222]" />
      </div>
      <div>
        <h4 className="font-bold text-white">{title}</h4>
        <p className="text-sm text-neutral-500">{desc}</p>
      </div>
    </div>
  );
}
