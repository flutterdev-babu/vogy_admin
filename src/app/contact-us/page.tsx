'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
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
            Get in <span className="text-[#E32222]">Touch</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed"
          >
            Have questions? We're here to help. Reach out to us for any queries about our services or partnership opportunities.
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <ContactInfoCard 
              icon={<Phone size={24} className="text-[#E32222]" />}
              title="Call Us"
              content="+91 98765 43210"
              subContent="Mon-Sun, 24/7"
            />
            <ContactInfoCard 
              icon={<Mail size={24} className="text-[#E32222]" />}
              title="Email Us"
              content="support@aratravels.in"
              subContent="We'll respond within 24 hours"
            />
            <ContactInfoCard 
              icon={<MapPin size={24} className="text-[#E32222]" />}
              title="Visit Us"
              content="Bangalore, Pune, Mumbai, Hyderabad"
              subContent="Multiple city operations"
            />
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 lg:p-12">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[#E32222] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[#E32222] transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-400">Subject</label>
                  <input 
                    type="text" 
                    placeholder="General Inquiry"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[#E32222] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-400">Message</label>
                  <textarea 
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[#E32222] transition-colors resize-none"
                  ></textarea>
                </div>
                <button className="w-full py-4 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-bold text-lg shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 group">
                  Send Message
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ContactInfoCard({ icon, title, content, subContent }: { icon: React.ReactNode, title: string, content: string, subContent: string }) {
  return (
    <div className="flex gap-6 p-6 rounded-3xl bg-neutral-900/50 border border-white/5">
      <div className="w-12 h-12 rounded-2xl bg-[#E32222]/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-white font-medium mb-1">{content}</p>
        <p className="text-sm text-neutral-500">{subContent}</p>
      </div>
    </div>
  );
}
