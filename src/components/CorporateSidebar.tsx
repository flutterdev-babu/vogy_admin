'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  CreditCard,
  Briefcase,
  Users,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { TOKEN_KEYS, USER_KEYS } from '@/lib/api';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/corporate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/corporate/dashboard/bookings', label: 'Bookings', icon: Briefcase },
  { href: '/corporate/dashboard/employees', label: 'Employees', icon: Users },
  { href: '/corporate/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/corporate/dashboard/reports', label: 'Reports', icon: FileText },
];

export default function CorporateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [corporate, setCorporate] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.corporate);
    if (stored) setCorporate(JSON.parse(stored));
    else router.push('/corporate/login');
  }, [router]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEYS.corporate);
    localStorage.removeItem(USER_KEYS.corporate);
    router.push('/corporate/login');
  };

  const isActive = (href: string) => {
    return pathname === href || (href !== '/corporate/dashboard' && pathname.startsWith(href));
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg border border-blue-200 hover:bg-blue-50 transition-colors"
      >
        {isMobileOpen ? <X size={24} className="text-blue-500" /> : <Menu size={24} className="text-blue-500" />}
      </button>

      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-blue-100 shadow-xl z-40 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-blue-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E32222] to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ARA</h1>
              <p className="text-xs text-blue-500 font-medium">Corporate Portal</p>
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
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active ? 'bg-gradient-to-r from-[#E32222] to-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-blue-100 flex-shrink-0">
          {corporate && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="font-semibold text-gray-800 truncate">{corporate.companyName}</p>
              <p className="text-xs text-gray-500 truncate">{corporate.email}</p>
            </div>
          )}
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl transition-all duration-200 font-medium">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
