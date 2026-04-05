'use client';
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { userRideService, RideData } from '@/services/userRideService';
import { userProfileService, SavedPlace } from '@/services/userProfileService';
import {
    Car,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Navigation,
    Loader2,
    AlertTriangle,
    RefreshCw,
    Wallet,
    ArrowRight,
    History,
    Bookmark,
    ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RideSummary {
    totalRides: number;
    completedRides: number;
    cancelledRides: number;
    activeRides: number;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
    COMPLETED: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle2 },
    CANCELLED: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle },
    ONGOING: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: Navigation },
    STARTED: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: Navigation },
    ACCEPTED: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock },
    ASSIGNED: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock },
    ARRIVED: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: MapPin },
    REQUESTED: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock },
    UPCOMING: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', icon: Clock },
    SCHEDULED: { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', icon: Clock },
};

export default function UserDashboardPage() {
    const { user } = useUserAuth();
    const [summary, setSummary] = useState<RideSummary | null>(null);
    const [activeRide, setActiveRide] = useState<RideData | null>(null);
    const [recentRides, setRecentRides] = useState<RideData[]>([]);
    const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [summaryRes, activeRes, ridesRes, placesRes] = await Promise.allSettled([
                userRideService.getRideSummary(),
                userRideService.getActiveRide(),
                userRideService.getRides(),
                userProfileService.getSavedPlaces(),
            ]);

            if (summaryRes.status === 'fulfilled' && summaryRes.value.success) {
                setSummary(summaryRes.value.data);
            }

            if (activeRes.status === 'fulfilled' && activeRes.value.success) {
                setActiveRide(activeRes.value.data || null);
            }

            if (ridesRes.status === 'fulfilled' && ridesRes.value.success) {
                const rides = ridesRes.value.data || [];
                setRecentRides(rides.slice(0, 5));
            }

            if (placesRes.status === 'fulfilled' && placesRes.value.success) {
                setSavedPlaces(placesRes.value.data || []);
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status] || { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', icon: Clock };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-[#E32222] animate-spin" />
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center rounded-2xl p-8" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
                    <p className="text-white font-semibold mb-2">Failed to Load Dashboard</p>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <button onClick={loadDashboard} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: '#E32222' }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Welcome, <span className="text-[#E32222]">{user?.name?.split(' ')[0] || 'User'}</span> 👋
                    </h1>
                    <p className="text-gray-400 mt-1">Here&apos;s your ride overview</p>
                </div>
                <button onClick={loadDashboard} className="p-2 rounded-xl text-gray-400 hover:text-white transition-all" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Active Ride Banner */}
            {activeRide && (() => {
                const rideTime = new Date(activeRide.scheduledDateTime || activeRide.createdAt).getTime();
                const now = Date.now();
                const diffMs = now - rideTime;

                // Triggers if ride time is in the past
                const isPast = diffMs > 0;

                // Statuses that are "Active" but haven't actually started the physical journey
                const isPreJourney = ['UPCOMING', 'SCHEDULED', 'REQUESTED', 'ASSIGNED', 'ACCEPTED'].includes(activeRide.status);

                // If it's a pre-journey ride and it's more than 2 hours past due, hide it from the "Active Ride" highlight
                // This prevents stale rides from previous days (like the Mar 31 ride mentioned by the user) from cluttering the dashboard on Apr 2.
                if (isPast && isPreJourney && diffMs > 2 * 60 * 60 * 1000) {
                    return null;
                }

                // Also if it's in the past and NOT in an ongoing state, mark it as past due UI-wise
                const isPastDue = isPast && isPreJourney;

                return (
                    <div className="rounded-2xl p-5 animate-fade-in" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Navigation size={20} className="text-blue-400 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Active Ride</h3>
                                <p className="text-blue-300 text-xs">
                                    {isPastDue
                                        ? 'Ride time has passed'
                                        : (activeRide.status === 'UPCOMING' || activeRide.status === 'SCHEDULED' || activeRide.status === 'REQUESTED'
                                            ? 'You have an upcoming ride'
                                            : 'Your ride is in progress')}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-gray-400 text-xs">Pickup</p>
                                    <p className="text-white truncate">{activeRide.pickupAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-gray-400 text-xs">Drop</p>
                                    <p className="text-white truncate">{activeRide.dropAddress}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    background: isPastDue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                    color: isPastDue ? '#ef4444' : '#93c5fd'
                                }}>
                                {isPastDue ? 'EXPIRED / MISSED' : activeRide.status}
                            </span>
                            <div className="flex items-center gap-1.5 text-blue-200 text-xs font-medium">
                                <Clock size={12} />
                                {formatDate(activeRide.scheduledDateTime || activeRide.createdAt)}
                            </div>
                            {activeRide.totalFare && (
                                <span className="text-white font-bold text-sm bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-400/20 ml-auto">₹{Math.round(activeRide.totalFare)}</span>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Rides', value: summary?.totalRides || 0, icon: Car, color: '#E32222' },
                    { label: 'Completed', value: summary?.completedRides || 0, icon: CheckCircle2, color: '#22c55e' },
                    { label: 'Active', value: summary?.activeRides || 0, icon: Navigation, color: '#3b82f6' },
                    { label: 'Cancelled', value: summary?.cancelledRides || 0, icon: XCircle, color: '#ef4444' },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl p-4 sm:p-5" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                                <stat.icon size={20} style={{ color: stat.color }} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    href="/user/dashboard/book"
                    className="group rounded-2xl p-5 transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #E32222, #cc1e1e)' }}
                >
                    <Car size={28} className="text-white mb-3" />
                    <p className="text-white font-semibold">Book a Ride</p>
                    <p className="text-white/70 text-xs mt-1">
                        Start a new journey
                    </p>
                </Link>

                <Link
                    href="/user/dashboard/history"
                    className="group rounded-2xl p-5 transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                    <History size={28} className="text-gray-400 mb-3 group-hover:text-white transition-colors" />
                    <p className="text-white font-semibold">Ride History</p>
                    <p className="text-gray-400 text-xs mt-1">View all past rides</p>
                </Link>

                <div
                    className="group rounded-2xl p-5 transition-all hover:scale-[1.02] cursor-default"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                    <ShieldCheck size={28} className="text-[#3b82f6] mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-white font-semibold">Unique Ride OTP</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            {user?.uniqueOtp || '----'}
                        </p>
                    </div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mt-2">
                        Life-long verification code
                    </p>
                </div>

            </div>

            {/* Recent Rides */}
            <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-white">Recent Rides</h2>
                    <Link href="/user/dashboard/history" className="text-[#E32222] text-sm font-medium hover:underline inline-flex items-center gap-1">
                        View All <ArrowRight size={14} />
                    </Link>
                </div>

                {recentRides.length === 0 ? (
                    <div className="text-center py-10">
                        <Car size={48} className="text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-400">No rides yet</p>
                        <p className="text-gray-600 text-sm mt-1">Book your first ride to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentRides.map((ride) => {
                            const statusConf = getStatusConfig(ride.status);
                            const StatusIcon = statusConf.icon;
                            return (
                                <div
                                    key={ride.id}
                                    className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-white/5"
                                    style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: statusConf.bg }}>
                                        <StatusIcon size={18} style={{ color: statusConf.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white text-sm font-medium truncate">{ride.pickupAddress}</p>
                                            <ArrowRight size={12} className="text-gray-600 shrink-0" />
                                            <p className="text-gray-400 text-sm truncate">{ride.dropAddress}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-500">{formatDate(ride.scheduledDateTime || ride.createdAt)}</span>
                                            {(() => {
                                                const rideTime = new Date(ride.scheduledDateTime || ride.createdAt).getTime();
                                                const isPastDue = rideTime < Date.now() && ['UPCOMING', 'SCHEDULED', 'REQUESTED', 'ASSIGNED', 'ACCEPTED'].includes(ride.status);

                                                return (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                        style={{
                                                            background: isPastDue ? 'rgba(239, 68, 68, 0.1)' : statusConf.bg,
                                                            color: isPastDue ? '#ef4444' : statusConf.color
                                                        }}>
                                                        {isPastDue ? 'EXPIRED / MISSED' : ride.status}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {ride.totalFare && (
                                            <p className="text-white font-semibold text-sm">₹{Math.round(ride.totalFare)}</p>
                                        )}
                                        <p className="text-gray-600 text-xs">{ride.distanceKm?.toFixed(1)} km</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
