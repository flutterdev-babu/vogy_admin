'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserAuth } from '@/contexts/UserAuthContext';
import {
    LayoutDashboard,
    Car,
    History,
    UserCircle,
    LogOut,
    Menu,
    X,
    MapPin,
    MessageCircle,
} from 'lucide-react';

const navItems = [
    { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/user/dashboard/book', label: 'Book a Ride', icon: Car },
    { href: '/user/dashboard/history', label: 'Ride History', icon: History },
    { href: '/user/dashboard/profile', label: 'My Profile', icon: UserCircle },
    { href: '/user/dashboard/support', label: 'Support', icon: MessageCircle },
];

export default function UserSidebar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useUserAuth();

    const handleLogout = () => {
        logout();
    };

    const isActive = (href: string) => pathname === href;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E32222, #ff4444)' }}>
                        <MapPin size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">ARA Travels</h2>
                        <p className="text-xs text-gray-400">Customer Portal</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="p-4 mx-3 mt-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E32222] to-[#ff6b6b] flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.phone || ''}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 mt-2 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                ? 'text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            style={active ? { background: 'linear-gradient(135deg, #E32222, #cc1e1e)' } : {}}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl text-white"
                style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)' }}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 z-40 transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{ background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a2e 100%)', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
