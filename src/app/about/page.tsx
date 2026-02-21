'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Users, Target, Award } from 'lucide-react';
import { ReactNode } from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans text-white overflow-x-hidden selection:bg-[#E32222] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E32222]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <span className="text-xs font-medium text-white/80 tracking-wide uppercase">About ARA Travels</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold leading-tight mb-8"
          >
            Redefining <span className="text-[#E32222]">Mobility</span> <br />
            in Every Journey
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed"
          >
            ARA Travels is a premium cab service provider dedicated to offering safe, reliable, and affordable transportation solutions across major cities in India.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-neutral-900 border border-white/5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E32222]/10 flex items-center justify-center text-[#E32222] mb-6">
                <Target size={24} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-neutral-400 leading-relaxed text-lg">
                To provide seamless and transparent cab services that prioritize passenger safety and comfort while ensuring fair earnings for our partners. We strive to be the most trusted mobility partner for every Indian traveler.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-neutral-900 border border-white/5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E32222]/10 flex items-center justify-center text-[#E32222] mb-6">
                <Users size={24} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-neutral-400 leading-relaxed text-lg">
                To revolutionize the transportation industry by leveraging technology to create an ecosystem where everyone—customers, drivers, and vendors—experiences world-class service and mutual growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Core <span className="text-[#E32222]">Values</span></h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">The principles that drive us forward every single day.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              icon={<Shield size={24} />} 
              title="Safety First" 
              desc="We implement rigorous driver verification and real-time ride tracking to ensure your safety is never compromised."
            />
            <ValueCard 
              icon={<Award size={24} />} 
              title="Quality Service" 
              desc="From vehicle maintenance to driver behavior, we maintain high standards to provide a premium experience."
            />
            <ValueCard 
              icon={<Users size={24} />} 
              title="Transparency" 
              desc="No hidden charges, clear pricing, and honest communication are at the heart of our operations."
            />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
              <Image 
                src="/cab_image.png" 
                alt="Our Story" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">The ARA <span className="text-[#E32222]">Story</span></h2>
              <p className="text-neutral-400 text-lg leading-relaxed">
                Founded with a simple goal of making city travel less stressful, ARA Travels has grown from a small fleet to a major mobility service provider. 
              </p>
              <p className="text-neutral-400 text-lg leading-relaxed">
                We understood the challenges passengers faced with cancellations, surge pricing, and safety concerns. By listening to our customers and partners, we built a system that addresses these issues head-on, delivering a service that is both reliable for passengers and sustainable for drivers.
              </p>
              <div className="pt-4">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-3xl font-bold text-[#E32222]">10k+</h4>
                    <p className="text-sm text-neutral-500 uppercase tracking-wider">Happy Riders</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-[#E32222]">500+</h4>
                    <p className="text-sm text-neutral-500 uppercase tracking-wider">Driver Partners</p>
                  </div>
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

function ValueCard({ icon, title, desc }: { icon: ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-[#E32222]/30 transition-all duration-300">
      <div className="text-[#E32222] mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
