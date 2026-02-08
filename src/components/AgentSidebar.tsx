'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  ChevronDown,
  Car,
  Briefcase,
  Building2,
  FileText,
  DollarSign,
  Users,
  Headphones,
  Paperclip,
  Tag
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { TOKEN_KEYS, USER_KEYS } from '@/lib/api';

interface NavSection {
  title?: string; // Optional title for grouped items
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
      { href: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/agent/dashboard/profile', label: 'Profile', icon: User },
    ],
  },
  {
    title: 'Referral Program',
    items: [
      { href: '/agent/dashboard/referrals', label: 'Referral Rewards', icon: DollarSign },
    ],
  },
];

export default function AgentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedAgent = localStorage.getItem(USER_KEYS.agent);
    if (storedAgent) {
      setAgent(JSON.parse(storedAgent));
    } else {
      router.push('/agent/login');
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEYS.agent);
    localStorage.removeItem(USER_KEYS.agent);
    router.push('/agent/login');
  };

  const isActive = (href: string) => {
    // Exact match for dashboard home
    if (href === '/agent/dashboard') {
      return pathname === href;
    }
    // For other routes, check exact match only
    return pathname === href;
  };

  const toggleSection = (title: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(title)) {
      newCollapsed.delete(title);
    } else {
      newCollapsed.add(title);
    }
    setCollapsedSections(newCollapsed);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg border border-purple-200 hover:bg-purple-50 transition-colors"
      >
        {isMobileOpen ? <X size={24} className="text-purple-500" /> : <Menu size={24} className="text-purple-500" />}
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
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-purple-100 shadow-xl z-40 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-purple-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E32222] to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ARA</h1>
              <p className="text-xs text-purple-500 font-medium">Agent Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {navSections.map((section, index) => (
              <div key={section.title || index} className="mb-2">
                {/* Section Header */}
                {section.title && (
                  <button
                    onClick={() => section.title && toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                  >
                    <span>{section.title}</span>
                    {/* Only show chevron if collapsible logic is desired, for now keeping it simple or consistent with admin sidebar */}
                  </button>
                )}

                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-[#E32222] to-purple-600 text-white shadow-md shadow-purple-500/30'
                            : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Agent info & logout */}
        <div className="p-4 border-t border-purple-100 flex-shrink-0">
          {agent && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <p className="font-semibold text-gray-800 truncate">{agent.name}</p>
              <p className="text-xs text-gray-500 truncate">{agent.email || agent.phone}</p>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full">
                Agent
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
