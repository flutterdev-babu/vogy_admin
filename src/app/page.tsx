'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Shield, 
  Smartphone,
  Menu,
  X,
  ChevronRight,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bookingTab, setBookingTab] = useState<'local' | 'rental' | 'outstation'>('local');
  
  // Track login state for each role
  const [authState, setAuthState] = useState({
    partner: false,
    vendor: false,
    agent: false,
    corporate: false,
  });

  useEffect(() => {
    // Check auth tokens on mount
    if (typeof window !== 'undefined') {
      setAuthState({
        partner: !!localStorage.getItem(TOKEN_KEYS.partner),
        vendor: !!localStorage.getItem(TOKEN_KEYS.vendor),
        agent: !!localStorage.getItem(TOKEN_KEYS.agent),
        corporate: !!localStorage.getItem(TOKEN_KEYS.corporate),
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans text-white overflow-x-hidden selection:bg-[#E32222] selection:text-white">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E32222] to-[#b91c1c] flex items-center justify-center shadow-lg shadow-red-900/20">
                <span className="font-bold text-white text-xl">V</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">VOGY <span className="text-[#E32222]">CABS</span></span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">Home</Link>
              <Link href="#about" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">About</Link>
              <Link href="#services" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">Services</Link>
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
               <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                Admin Login
              </Link>
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
                <Link href="#about" className="block text-base font-medium text-white/90">About</Link>
                <Link href="#services" className="block text-base font-medium text-white/90">Services</Link>
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
                
                <Link href="/login" className="block text-base font-medium text-[#E32222] pt-2">Admin Login</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

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
              Ride Smarter with <br />
              <span className="text-[#E32222] drop-shadow-[0_0_30px_rgba(227,34,34,0.3)]">VOGY CABS</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Experience affordable, safe, and reliable cab services in Bangalore, Pune, Mumbai, and Hyderabad. Local, Outstation, or Rentals - we cover it all.
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
            <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
              {['local', 'rental', 'outstation'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBookingTab(tab as any)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                    bookingTab === tab 
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
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Pickup Location"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none"
                />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Drop Location"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors appearance-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={18} />
                    <input 
                      type="date"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors text-sm appearance-none"
                    />
                  </div>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-[#E32222] transition-colors" size={18} />
                    <input 
                      type="time" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E32222] transition-colors text-sm appearance-none"
                    />
                  </div>
              </div>

              <button className="w-full py-4 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-bold text-lg shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all transform hover:-translate-y-0.5 mt-2">
                Calculate Fare
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
              subtitle={authState.partner ? 'Go to Dashboard' : 'Drive & Earn'} 
              icon={<Car size={32} />} 
              href={getAuthAwareHref('partner', authState.partner)}
              delay={0}
            />
            <RoleCard 
              title="Vendor" 
              subtitle={authState.vendor ? 'Go to Dashboard' : 'Manage Fleet'} 
              icon={<Shield size={32} />} 
              href={getAuthAwareHref('vendor', authState.vendor)}
              delay={0.1}
            />
            <RoleCard 
              title="Agent" 
              subtitle={authState.agent ? 'Go to Dashboard' : 'City Operations'} 
              icon={<MapPin size={32} />} 
              href={getAuthAwareHref('agent', authState.agent)}
              delay={0.2}
            />
            <RoleCard 
              title="Corporate" 
              subtitle={authState.corporate ? 'Go to Dashboard' : 'Business Travel'} 
              icon={<Briefcase size={32} />} 
              href={getAuthAwareHref('corporate', authState.corporate)}
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
                 <FeatureCard icon={<Clock />} title="Faster Pickups" desc="Average 5 min wait time" />
                 <FeatureCard icon={<Shield />} title="Safe Rides" desc="Verified drivers & tracking" />
                 <FeatureCard icon={<Smartphone />} title="Easy Booking" desc="3-tap booking process" />
                 <FeatureCard icon={<CheckCircle />} title="Best Fares" desc="Transparent pricing" />
               </div>
             </div>
             
             <div className="relative hidden lg:block">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-neutral-600 font-medium">App Screenshot Placeholder</span>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">VOGY <span className="text-[#E32222]">CABS</span></h3>
            <p className="text-neutral-500 leading-relaxed text-sm">Redefining mobility in India with safety, comfort, and transparency at the core of our service.</p>
            <div className="flex gap-4">
              <SocialIcon icon={<Instagram size={20} />} />
              <SocialIcon icon={<Facebook size={20} />} />
              <SocialIcon icon={<Linkedin size={20} />} />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
            <ul className="space-y-4 text-neutral-500 text-sm">
              <li><Link href="#" className="hover:text-[#E32222] transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-[#E32222] transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-[#E32222] transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-lg mb-6 text-white">Services</h4>
            <ul className="space-y-4 text-neutral-500 text-sm">
              <li><Link href="#" className="hover:text-[#E32222] transition-colors">Local Rides</Link></li>
              <li><Link href="#" className="hover:text-[#E32222] transition-colors">Outstation</Link></li>
              <li><Link href="#" className="hover:text-[#E32222] transition-colors">Corporate</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-lg mb-6 text-white">Contact</h4>
            <ul className="space-y-4 text-neutral-500 text-sm">
              <li className="flex items-center gap-3"><Phone size={18} className="text-[#E32222]" /> +91 98765 43210</li>
              <li className="flex items-center gap-3"><Mail size={18} className="text-[#E32222]" /> support@vogycabs.in</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-neutral-600 text-xs">
          <p>&copy; 2026 Vogy Cabs. All rights reserved.</p>
        </div>
      </footer>

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

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:bg-[#E32222] hover:text-white transition-all transform hover:scale-110">
      {icon}
    </a>
  );
}
