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
  ChevronDown,
  Paperclip,
  Bell,
  FileVideo,
  PlusCircle
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

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
      { href: '/dashboard/rides/create', label: 'Manual Booking', icon: PlusCircle },
    ],
  },
  {
    title: 'Partners',
    items: [
      { href: '/dashboard/partners/create', label: 'Create Partner', icon: PlusCircle },
      { href: '/dashboard/partners', label: 'Partner List', icon: UserCheck },
    ],
  },
  {
    title: 'Vehicles',
    items: [
      { href: '/dashboard/vehicles/create', label: 'Create Vehicle', icon: PlusCircle },
      { href: '/dashboard/vehicles', label: 'Vehicle List', icon: Truck },
      { href: '/dashboard/vehicle-types', label: 'Vehicle Types', icon: Car },
    ],
  },
  {
    title: 'Vendors',
    items: [
      { href: '/dashboard/vendors/create', label: 'Create Vendor', icon: PlusCircle },
      { href: '/dashboard/vendors', label: 'Vendor List', icon: Car },
    ],
  },
  {
    title: 'Attachments',
    items: [
      { href: '/dashboard/attachments/create', label: 'Create Attachment', icon: PlusCircle },
      { href: '/dashboard/attachments', label: 'Attachment List', icon: Paperclip },
    ],
  },
  {
    title: 'Users & Agents',
    items: [
      { href: '/dashboard/users', label: 'Users', icon: Users },
      { href: '/dashboard/agents', label: 'Agents', icon: Briefcase },
      { href: '/dashboard/corporates', label: 'Corporates', icon: Building2 },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { href: '/dashboard/city-codes', label: 'City Codes', icon: MapPin },
      { href: '/dashboard/pricing', label: 'Pricing Config', icon: DollarSign },
      { href: '/dashboard/permissions', label: 'Permissions', icon: UserCheck },
      { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileVideo },
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg border border-red-100 hover:bg-red-50 transition-colors"
      >
        {isMobileOpen ? <X size={24} className="text-red-500" /> : <Menu size={24} className="text-red-500" />}
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
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 shadow-sm z-40 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
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
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">ARA</h1>
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Admin Panel</p>
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
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${active
                            ? 'bg-[#E32222] text-white shadow-md shadow-red-500/30'
                            : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
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
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          {admin && (
            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="font-bold text-gray-800 truncate text-sm">{admin.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{admin.email}</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">
                {admin.role}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-200 font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside >
    </>
  );
}
