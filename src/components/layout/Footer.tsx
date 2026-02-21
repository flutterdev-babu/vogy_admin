'use client';

import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Linkedin 
} from 'lucide-react';
import { ReactNode } from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">ARA <span className="text-[#E32222]">TRAVELS</span></h3>
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
            <li><Link href="/about" className="hover:text-[#E32222] transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-[#E32222] transition-colors">Careers</Link></li>
            <li><Link href="#" className="hover:text-[#E32222] transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
           <h4 className="font-bold text-lg mb-6 text-white">Services</h4>
          <ul className="space-y-4 text-neutral-500 text-sm">
            <li><Link href="/services" className="hover:text-[#E32222] transition-colors">Local Rides</Link></li>
            <li><Link href="/services" className="hover:text-[#E32222] transition-colors">Outstation</Link></li>
            <li><Link href="/services" className="hover:text-[#E32222] transition-colors">Corporate</Link></li>
          </ul>
        </div>

        <div>
           <h4 className="font-bold text-lg mb-6 text-white">Contact</h4>
          <ul className="space-y-4 text-neutral-500 text-sm">
            <li className="flex items-center gap-3"><Phone size={18} className="text-[#E32222]" /> +91 98765 43210</li>
            <li className="flex items-center gap-3"><Mail size={18} className="text-[#E32222]" /> support@aratravels.in</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-neutral-600 text-xs">
        <p>&copy; {new Date().getFullYear()} Ara Travels. All rights reserved.</p>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: ReactNode }) {
  return (
    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:bg-[#E32222] hover:text-white transition-all transform hover:scale-110">
      {icon}
    </a>
  );
}
