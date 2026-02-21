'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Car, 
  Shield, 
  MapPin, 
  Briefcase,
  LayoutDashboard
} from 'lucide-react';
import { TOKEN_KEYS } from '@/lib/api';

// Helper to get the correct href based on auth state
const getAuthAwareHref = (role: 'partner' | 'vendor' | 'agent' | 'corporate', isLoggedIn: boolean) => {
  const dashboardPaths = {
    partner: '/partner/dashboard',
    vendor: '/vendor/dashboard',
    agent: '/agent/dashboard',
    corporate: '/corporate/dashboard',
  };
  const loginPaths = {
    partner: '/partner/login',
    vendor: '/vendor/login',
    agent: '/agent/login',
    corporate: '/corporate/login',
  };
  return isLoggedIn ? dashboardPaths[role] : loginPaths[role];
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authState, setAuthState] = useState({
    partner: false,
    vendor: false,
    agent: false,
    corporate: false,
    admin: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthState({
        partner: !!localStorage.getItem(TOKEN_KEYS.partner),
        vendor: !!localStorage.getItem(TOKEN_KEYS.vendor),
        agent: !!localStorage.getItem(TOKEN_KEYS.agent),
        corporate: !!localStorage.getItem(TOKEN_KEYS.corporate),
        admin: !!localStorage.getItem(TOKEN_KEYS.admin),
      });
    }
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image 
                src="/logo_image.png" 
                alt="Ara Travels Logo" 
                fill
                className="object-contain rounded-xl"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">ARA <span className="text-[#E32222]">TRAVELS</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">About</Link>
            <Link href="/services" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">Services</Link>
            <Link href="/contact-us" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">Contact</Link>
            
            {/* Join Us Dropdown */}
            <div className="relative group">
              <button className="text-sm font-medium text-neutral-300 hover:text-white transition-colors flex items-center gap-1">
                Join Us
                <ChevronRight size={14} className="rotate-90 group-hover:rotate-[270deg] transition-transform" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 min-w-[180px] shadow-xl shadow-black/50">
                  <Link href={getAuthAwareHref('partner', authState.partner)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                    <Car size={18} className="text-[#E32222]" />
                    <div>
                      <p className="text-sm font-medium text-white">Partner</p>
                      <p className="text-xs text-neutral-500">{authState.partner ? 'Go to Dashboard' : 'Drive & Earn'}</p>
                    </div>
                  </Link>
                  <Link href={getAuthAwareHref('vendor', authState.vendor)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                    <Shield size={18} className="text-[#E32222]" />
                    <div>
                      <p className="text-sm font-medium text-white">Vendor</p>
                      <p className="text-xs text-neutral-500">{authState.vendor ? 'Go to Dashboard' : 'Manage Fleet'}</p>
                    </div>
                  </Link>
                  <Link href={getAuthAwareHref('agent', authState.agent)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                    <MapPin size={18} className="text-[#E32222]" />
                    <div>
                      <p className="text-sm font-medium text-white">Agent</p>
                      <p className="text-xs text-neutral-500">{authState.agent ? 'Go to Dashboard' : 'City Operations'}</p>
                    </div>
                  </Link>
                  <Link href={getAuthAwareHref('corporate', authState.corporate)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                    <Briefcase size={18} className="text-[#E32222]" />
                    <div>
                      <p className="text-sm font-medium text-white">Corporate</p>
                      <p className="text-xs text-neutral-500">{authState.corporate ? 'Go to Dashboard' : 'Business Travel'}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {authState.admin ? (
              <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white text-sm font-semibold transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/40">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                Admin Login
              </Link>
            )}
            <Link 
              href="/download"
              className="px-5 py-2.5 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white text-sm font-semibold transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
            >
              Download App
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#0a0a0a] border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <Link href="/" className="block text-base font-medium text-white/90">Home</Link>
              <Link href="/about" className="block text-base font-medium text-white/90">About</Link>
              <Link href="/services" className="block text-base font-medium text-white/90">Services</Link>
              <Link href="/contact-us" className="block text-base font-medium text-white/90">Contact</Link>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Join Us</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={getAuthAwareHref('partner', authState.partner)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/90">
                    <Car size={16} className="text-[#E32222]" />
                    <span className="text-sm">Partner</span>
                  </Link>
                  <Link href={getAuthAwareHref('vendor', authState.vendor)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/90">
                    <Shield size={16} className="text-[#E32222]" />
                    <span className="text-sm">Vendor</span>
                  </Link>
                  <Link href={getAuthAwareHref('agent', authState.agent)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/90">
                    <MapPin size={16} className="text-[#E32222]" />
                    <span className="text-sm">Agent</span>
                  </Link>
                  <Link href={getAuthAwareHref('corporate', authState.corporate)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/90">
                    <Briefcase size={16} className="text-[#E32222]" />
                    <span className="text-sm">Corporate</span>
                  </Link>
                </div>
              </div>
              
              {authState.admin ? (
                <Link href="/dashboard" className="flex items-center gap-2 text-base font-medium text-[#E32222] pt-2">
                  <LayoutDashboard size={16} /> Admin Dashboard
                </Link>
              ) : (
                <Link href="/login" className="block text-base font-medium text-[#E32222] pt-2">Admin Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
