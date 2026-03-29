'use client';

import { useState, useEffect, useCallback } from 'react';
import { userRideService, RideData } from '@/services/userRideService';
import {
    History,
    MapPin,
    Navigation,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertTriangle,
    RefreshCw,
    ArrowRight,
    Filter,
    Car,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: '', label: 'All Rides' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REQUESTED', label: 'Requested' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'SCHEDULED', label: 'Scheduled' },
];

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

const CANCELLABLE_STATUSES = ['REQUESTED', 'UPCOMING', 'SCHEDULED', 'ACCEPTED', 'ASSIGNED'];

export default function RideHistoryPage() {
    const [rides, setRides] = useState<RideData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const loadRides = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await userRideService.getRides(statusFilter || undefined);
            if (res.success) {
                setRides(res.data || []);
            } else {
                setError(res.message || 'Failed to load rides');
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || 'Failed to load rides');
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadRides();
    }, [loadRides]);

    const handleCancelRide = async (rideId: string) => {
        if (!confirm('Are you sure you want to cancel this ride?')) return;
        setCancellingId(rideId);
        try {
            const res = await userRideService.cancelRide(rideId);
            if (res.success) {
                toast.success('Ride cancelled successfully');
                loadRides(); // Refresh after cancellation
            } else {
                toast.error(res.message || 'Failed to cancel ride');
            }
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error(e.response?.data?.message || e.message || 'Failed to cancel ride');
        } finally {
            setCancellingId(null);
        }
    };

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <History size={24} className="text-[#E32222]" /> Ride History
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">{rides.length} ride{rides.length !== 1 ? 's' : ''} found</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadRides} className="p-2 rounded-xl text-gray-400 hover:text-white transition-all" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                <Filter size={16} className="text-gray-500 shrink-0" />
                {STATUS_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
                        style={{
                            background: statusFilter === opt.value ? 'rgba(227, 34, 34, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: statusFilter === opt.value ? '1px solid #E32222' : '1px solid rgba(255, 255, 255, 0.08)',
                            color: statusFilter === opt.value ? '#E32222' : '#9ca3af',
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-[#E32222] animate-spin" />
                </div>
            )}

            {/* Error */}
            {error && !isLoading && (
                <div className="text-center rounded-2xl p-8" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
                    <p className="text-white font-semibold">{error}</p>
                    <button onClick={loadRides} className="mt-3 px-4 py-2 rounded-xl text-white text-sm" style={{ background: '#E32222' }}>
                        Retry
                    </button>
                </div>
            )}

            {/* Empty */}
            {!isLoading && !error && rides.length === 0 && (
                <div className="text-center rounded-2xl p-12" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Car size={48} className="text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400 font-semibold">No rides found</p>
                    <p className="text-gray-600 text-sm mt-1">
                        {statusFilter ? 'Try changing the filter' : 'Book your first ride to see it here'}
                    </p>
                </div>
            )}

            {/* Rides List */}
            {!isLoading && !error && rides.length > 0 && (
                <div className="space-y-3">
                    {rides.map((ride) => {
                        const statusConf = getStatusConfig(ride.status);
                        const StatusIcon = statusConf.icon;
                        const canCancel = CANCELLABLE_STATUSES.includes(ride.status);

                        return (
                            <div
                                key={ride.id}
                                className="rounded-2xl p-4 sm:p-5 transition-all hover:bg-white/[0.02]"
                                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: statusConf.bg }}>
                                            <StatusIcon size={20} style={{ color: statusConf.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: statusConf.bg, color: statusConf.color }}>
                                                    {ride.status}
                                                </span>
                                                {ride.customId && (
                                                    <span className="text-gray-600 text-xs font-mono">{ride.customId}</span>
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-start gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                                                    <p className="text-white text-sm truncate">{ride.pickupAddress}</p>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                                    <p className="text-gray-400 text-sm truncate">{ride.dropAddress}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                                                <span>{formatDate(ride.createdAt)}</span>
                                                <span>{ride.distanceKm?.toFixed(1)} km</span>
                                                {ride.vehicleType && <span>{ride.vehicleType.displayName}</span>}
                                                <span>{ride.paymentMode}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        {ride.totalFare != null && (
                                            <p className="text-white font-bold text-lg">₹{ride.totalFare}</p>
                                        )}
                                        {canCancel && (
                                            <button
                                                onClick={() => handleCancelRide(ride.id)}
                                                disabled={cancellingId === ride.id}
                                                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-white hover:bg-red-500/20 transition-all"
                                                style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                            >
                                                {cancellingId === ride.id ? <Loader2 size={12} className="animate-spin" /> : 'Cancel'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
