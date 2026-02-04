'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Car,
  DollarSign,
  Route,
  Users,
  UserCheck,
  Calendar,
  LogOut,
  Menu,
  X,
  Building2,
  Briefcase,
  Truck,
  MapPin,
  CreditCard,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/dashboard/rides', label: 'All Rides', icon: Route },
      { href: '/dashboard/rides/scheduled', label: 'Scheduled Rides', icon: Calendar },
    ],
  },
  {
    title: 'Fleet Management',
    items: [
      { href: '/dashboard/vendors', label: 'Vendors', icon: Car },
      { href: '/dashboard/partners', label: 'Partners', icon: UserCheck },
      { href: '/dashboard/vehicles', label: 'Vehicles', icon: Truck },
      { href: '/dashboard/vehicle-types', label: 'Vehicle Types', icon: Car },
    ],
  },
  {
    title: 'Users & Agents',
    items: [
      { href: '/dashboard/users', label: 'Users', icon: Users },
      { href: '/dashboard/riders', label: 'Captains', icon: UserCheck },
      { href: '/dashboard/agents', label: 'Agents', icon: Briefcase },
      { href: '/dashboard/corporates', label: 'Corporates', icon: Building2 },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { href: '/dashboard/city-codes', label: 'City Codes', icon: MapPin },
      { href: '/dashboard/pricing', label: 'Pricing Config', icon: DollarSign },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(title)) {
      newCollapsed.delete(title);
    } else {
      newCollapsed.add(title);
    }
    setCollapsedSections(newCollapsed);
  };

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg border border-orange-200 hover:bg-orange-50 transition-colors"
      >
        {isMobileOpen ? <X size={24} className="text-orange-500" /> : <Menu size={24} className="text-orange-500" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-orange-100 shadow-xl z-40 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-orange-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ARA</h1>
              <p className="text-xs text-orange-500 font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navSections.map((section) => (
              <div key={section.title} className="mb-4">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    size={14}
                    className={`transform transition-transform ${collapsedSections.has(section.title) ? '-rotate-90' : ''}`}
                  />
                </button>

                {/* Section Items */}
                {!collapsedSections.has(section.title) && (
                  <div className="mt-1 space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            active
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30'
                              : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Admin info & logout - Fixed at bottom */}
        <div className="p-4 border-t border-orange-100 flex-shrink-0">
          {admin && (
            <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <p className="font-semibold text-gray-800 truncate">{admin.name}</p>
              <p className="text-xs text-gray-500 truncate">{admin.email}</p>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                {admin.role}
              </span>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
