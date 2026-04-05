'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Car,
  MapPin,
  CheckCircle,
  Clock,
  Shield,
  Smartphone,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans text-white overflow-x-hidden selection:bg-[#E32222] selection:text-white">
      <Toaster position="top-center" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E32222]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {/* Hero Content */}
          <div className="space-y-8 flex flex-col items-center justify-center">
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
              className="text-5xl lg:text-8xl font-bold leading-tight"
            >
              Travel Better with <br />
              <span className="text-[#E32222] drop-shadow-[0_0_30px_rgba(227,34,34,0.3)]">ARA TRAVELS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
            >
              Affordable cab services across all major cities — Airport Transfers, Local, Outstation, and Rentals made simple.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/user/login" className="px-8 py-4 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-bold text-lg shadow-lg shadow-red-900/30 transition-all transform hover:-translate-y-1 text-center">
                Book a Ride Now
              </Link>
              <Link href="/about" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-sm transition-all transform hover:-translate-y-1 text-center">
                Learn More
              </Link>
            </motion.div>
          </div>
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
              href="/partner/register"
              delay={0}
            />
            <RoleCard
              title="Vendor"
              subtitle="Manage Fleet"
              icon={<Shield size={32} />}
              href="/vendor/register"
              delay={0.1}
            />
            <RoleCard
              title="Agent"
              subtitle="City Operations"
              icon={<MapPin size={32} />}
              href="/agent/register"
              delay={0.2}
            />
            <RoleCard
              title="Corporate"
              subtitle="Business Travel"
              icon={<Briefcase size={32} />}
              href="/corporate/register"
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
            <span>Get Started</span>
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
