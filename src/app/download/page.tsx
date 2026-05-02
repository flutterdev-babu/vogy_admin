'use client';

import { motion } from 'framer-motion';
import { Smartphone, Apple, PlayCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans text-white overflow-x-hidden selection:bg-[#E32222] selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E32222]/10 border border-[#E32222]/20 text-[#E32222]">
              <Smartphone size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">Mobile App</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Get the <span className="text-[#E32222]">ARA Travels</span> App
            </h1>
            
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Experience the future of ride-hailing. Book rides, track drivers, and manage your trips all from your pocket.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <a 
                href="#" 
                className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-white text-black hover:bg-neutral-200 transition-all transform hover:-translate-y-1 shadow-xl shadow-white/5 group"
              >
                <Apple size={32} />
                <div className="text-left">
                  <p className="text-xs font-medium opacity-70">Coming soon on</p>
                  <p className="text-xl font-bold">App Store</p>
                </div>
              </a>

              <a 
                href="#" 
                className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-neutral-900 border border-white/10 hover:bg-neutral-800 transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 group"
              >
                <PlayCircle size={32} className="text-[#E32222]" />
                <div className="text-left">
                  <p className="text-xs font-medium text-neutral-500">Coming soon on</p>
                  <p className="text-xl font-bold">Google Play</p>
                </div>
              </a>
            </div>
            
            <div className="pt-12">
              <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-[#E32222]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 -right-64 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      </main>

      <Footer />
    </div>
  );
}
