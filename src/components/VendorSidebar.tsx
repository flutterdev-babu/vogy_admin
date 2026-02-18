'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Car,
  Users,
  DollarSign,
  Settings,
  Truck,
  FileText,
  HelpCircle
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { TOKEN_KEYS, USER_KEYS } from '@/lib/api';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/dashboard/rides', label: 'Ride History', icon: Car },
  { href: '/vendor/dashboard/fleet', label: 'Fleet Management', icon: Truck },
  { href: '/vendor/dashboard/drivers', label: 'My Drivers', icon: Users },
  { href: '/vendor/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/vendor/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/vendor/dashboard/support', label: 'Support', icon: HelpCircle },
  { href: '/vendor/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function VendorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.vendor);
    if (stored) setVendor(JSON.parse(stored));
    else router.push('/vendor/login');
  }, [router]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEYS.vendor);
    localStorage.removeItem(USER_KEYS.vendor);
    router.push('/vendor/login');
  };

  const isActive = (href: string) => {
    return pathname === href || (href !== '/vendor/dashboard' && pathname.startsWith(href));
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg border border-orange-200 hover:bg-orange-50 transition-colors"
      >
        {isMobileOpen ? <X size={24} className="text-orange-500" /> : <Menu size={24} className="text-orange-500" />}
      </button>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-orange-100 shadow-xl z-40 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-orange-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image 
                src="/logo_image.png" 
                alt="Ara Travels Logo" 
                fill
                className="object-contain rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ARA</h1>
              <p className="text-xs text-orange-500 font-medium">Vendor Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-gradient-to-r from-[#E32222] to-orange-600 text-white shadow-md shadow-orange-500/30' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-orange-100 flex-shrink-0">
          {vendor && (
            <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
              <p className="font-semibold text-gray-800 truncate">{vendor.name}</p>
              <p className="text-xs text-gray-500 truncate">{vendor.companyName}</p>
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-200 font-medium">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
