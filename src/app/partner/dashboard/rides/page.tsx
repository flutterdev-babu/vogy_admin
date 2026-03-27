'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { ExportButton } from '@/components/ui/ExportButton';
import { StatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { partnerService } from '@/services/partnerService';
import { socketService } from '@/services/socketService';
import { TOKEN_KEYS } from '@/lib/api';
import { Ride } from '@/types';
import { Eye, X, MapPin, User, Car as CarIcon, CreditCard } from 'lucide-react';

export default function PartnerRidesPage() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

    useEffect(() => {
        const fetchRides = async () => {
            try {
                // Using partnerService to get *my* rides
                const response = await partnerService.getRides();
                if (response.success && response.data) {
                    setRides(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch rides', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRides();

        // Connect socket for real-time updates
        socketService.connect(TOKEN_KEYS.partner);

        const handleRideEvent = (data: { ride: Ride }) => {
            if (data?.ride) {
                setRides(prev => {
                    const exists = prev.some(r => r.id === data.ride.id);
                    if (exists) {
                        return prev.map(r => r.id === data.ride.id ? { ...r, ...data.ride } : r);
                    }
                    return [data.ride, ...prev];
                });
            }
        };

        socketService.on('ride:new_request', handleRideEvent);
        socketService.on('ride:status_changed', handleRideEvent);
        socketService.on('ride:assigned', handleRideEvent);

        return () => {
            socketService.off('ride:new_request', handleRideEvent);
            socketService.off('ride:status_changed', handleRideEvent);
            socketService.off('ride:assigned', handleRideEvent);
            // Optional: socketService.disconnect(); if we want to drop connection on unmount
        };
    }, []);

    const columns = [
        { header: 'Ride ID', accessor: (ride: Ride) => <span className="font-mono text-xs">#{ride.customId || ride.id.slice(-8)}</span> },
        { header: 'Date', accessor: (ride: Ride) => new Date(ride.createdAt || '').toLocaleDateString() },
        {
            header: 'Route & Type', accessor: (ride: Ride) => (
                <div className="flex flex-col text-xs max-w-[200px]">
                    <span className="truncate text-green-600 font-medium" title={ride.pickupAddress}>{ride.pickupAddress}</span>
                    <span className="text-gray-400 text-[10px] my-0.5 font-semibold">↓ {ride.distanceKm?.toFixed(1) || 0} km • {ride.rideType || 'Standard'}</span>
                    <span className="truncate text-red-600 font-medium" title={ride.dropAddress}>{ride.dropAddress}</span>
                </div>
            )
        },
        {
            header: 'Vehicle & Vendor', accessor: (ride: Ride) => (
                <div className="flex flex-col text-xs">
                    <span className="font-semibold text-gray-800">{ride.vehicle?.registrationNumber || 'N/A'}</span>
                    <span className="text-gray-500 truncate max-w-[150px]" title={ride.vendor?.companyName}>{ride.vendor?.companyName || 'Ara Travels'}</span>
                </div>
            )
        },
        {
            header: 'Fare Breakup', accessor: (ride: Ride) => (
                <div className="flex flex-col text-xs">
                    <span className="font-bold text-gray-800">₹{ride.totalFare}</span>
                    <span className="text-[10px] text-gray-400 font-medium">Fee: ₹{ride.commission || 0}</span>
                </div>
            )
        },
        {
            header: 'Payment', accessor: (ride: Ride) => (
                <div className="flex flex-col text-xs">
                    <span className="font-bold text-gray-800">{ride.paymentMode || 'N/A'}</span>
                    <span className={`text-[9px] uppercase font-bold tracking-widest ${ride.paymentStatus === 'COMPLETED' ? 'text-emerald-500' : 'text-orange-500'}`}>{ride.paymentStatus || 'PENDING'}</span>
                </div>
            )
        },
        { header: 'My Earnings', accessor: (ride: Ride) => <span className="font-bold text-green-600">₹{ride.riderEarnings ?? ride.partnerEarnings ?? 0}</span> },
        { header: 'Status', accessor: (ride: Ride) => <StatusBadge status={ride.status} /> },
        {
            header: 'Actions', accessor: (ride: Ride) => (
                <button
                    onClick={() => setSelectedRide(ride)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                    <Eye size={14} /> Details
                </button>
            )
        },
    ];

    if (isLoading) return <PageLoader />;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Rides</h1>
                    <p className="text-sm text-gray-500">History of your completed trips.</p>
                </div>
                <ExportButton data={rides} filename="my_rides" />
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-8">
                <div>
                    <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Total Rides</p>
                    <p className="text-2xl font-black text-emerald-900">{rides.length}</p>
                </div>
                <div>
                    <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Total Distance</p>
                    <p className="text-2xl font-black text-emerald-900">{rides.reduce((acc, r) => acc + (r.distanceKm || 0), 0).toFixed(1)} km</p>
                </div>
            </div>

            <AdvancedTable
                data={rides}
                columns={columns}
                searchable={true}
                searchKeys={['id', 'status', 'pickupAddress', 'dropAddress']}
                itemsPerPage={10}
            />

            {selectedRide && <RideDetailsModal ride={selectedRide} onClose={() => setSelectedRide(null)} />}
        </div>
    );
}

function RideDetailsModal({ ride, onClose }: { ride: Ride; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in relative">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Ride Details</h2>
                        <p className="text-sm text-gray-500 font-mono mt-1">ID: {ride.customId || ride.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                    {/* Header Summary */}
                    <div className="flex justify-between items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <StatusBadge status={ride.status} />
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Fare</p>
                            <p className="text-2xl font-black text-emerald-600">₹{ride.totalFare}</p>
                        </div>
                    </div>

                    {/* Route Details */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin className="text-emerald-500 w-5 h-5" /> Location & Time
                        </h3>
                        <div className="relative pl-6 space-y-6">
                            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                            <div className="relative">
                                <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500 z-10"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pickup</p>
                                <p className="text-sm font-semibold text-gray-800">{ride.pickupAddress}</p>
                                {ride.startTime && <p className="text-xs text-gray-500 mt-1">{new Date(ride.startTime).toLocaleString()}</p>}
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-red-100 border-2 border-red-500 z-10"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Drop</p>
                                <p className="text-sm font-semibold text-gray-800">{ride.dropAddress}</p>
                                {ride.endTime && <p className="text-xs text-gray-500 mt-1">{new Date(ride.endTime).toLocaleString()}</p>}
                            </div>
                        </div>
                        <div className="mt-4 flex gap-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Distance</p>
                                <p className="text-sm font-semibold text-gray-800">{ride.distanceKm?.toFixed(1) || 0} km</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Ride Type</p>
                                <p className="text-sm font-semibold text-gray-800">{ride.rideType || 'Standard'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fare Breakdown */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="text-blue-500 w-5 h-5" /> Payment & Earnings
                        </h3>
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="grid grid-cols-2 p-4 gap-4 bg-gray-50 border-b border-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Payment Mode</p>
                                    <p className="text-sm font-semibold text-gray-800">{ride.paymentMode || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Payment Status</p>
                                    <p className={`text-[10px] uppercase font-bold tracking-widest ${ride.paymentStatus === 'COMPLETED' ? 'text-emerald-600' : 'text-orange-500'}`}>{ride.paymentStatus || 'PENDING'}</p>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Base Fare</span>
                                    <span className="font-semibold">₹{ride.baseFare || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Distance Fare</span>
                                    <span className="font-semibold">₹{((ride.totalFare || 0) - (ride.baseFare || 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                                    <span className="text-gray-800 font-bold">Total Collected Fare</span>
                                    <span className="font-bold">₹{ride.totalFare}</span>
                                </div>
                                <div className="flex justify-between text-sm text-red-500">
                                    <span>Platform Commission</span>
                                    <span>-₹{ride.commission || 0}</span>
                                </div>
                                <div className="flex justify-between text-lg font-black text-emerald-600 border-t border-gray-100 pt-3">
                                    <span>My Net Earnings</span>
                                    <span>₹{ride.riderEarnings ?? ride.partnerEarnings ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Entities */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="text-purple-500 w-5 h-5" /> Customer Info
                            </h3>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="font-bold text-gray-800">{ride.user?.name || 'Unknown User'}</p>
                                <p className="text-sm text-gray-500 mt-1">{ride.user?.phone || 'No phone'}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CarIcon className="text-orange-500 w-5 h-5" /> Vehicle & Vendor
                            </h3>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Vehicle</p>
                                    <p className="text-sm font-bold text-gray-800">{ride.vehicle?.vehicleModel || 'N/A'} • {ride.vehicle?.registrationNumber}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Managed By</p>
                                    <p className="text-sm font-medium text-gray-600">{ride.vendor?.companyName || 'Ara Travels'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
