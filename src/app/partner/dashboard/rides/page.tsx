'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { ExportButton } from '@/components/ui/ExportButton';
import { StatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { partnerService } from '@/services/partnerService';
import { Ride } from '@/types';

export default function PartnerRidesPage() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
    }, []);

    const columns = [
        { header: 'Ride ID', accessor: (ride: Ride) => <span className="font-mono text-xs">#{ride.id.slice(-8)}</span> },
        { header: 'Date', accessor: (ride: Ride) => new Date(ride.createdAt || '').toLocaleDateString() },
        {
            header: 'Route', accessor: (ride: Ride) => (
                <div className="flex flex-col text-xs max-w-[200px]">
                    <span className="truncate text-green-600 font-medium" title={ride.pickupAddress}>{ride.pickupAddress}</span>
                    <span className="text-gray-400 text-[10px] my-0.5">↓</span>
                    <span className="truncate text-red-600 font-medium" title={ride.dropAddress}>{ride.dropAddress}</span>
                </div>
            )
        },
        { header: 'Fare', accessor: (ride: Ride) => <span className="font-bold">₹{ride.totalFare}</span> },
        { header: 'My Earnings', accessor: (ride: Ride) => <span className="font-bold text-green-600">₹{ride.partnerEarnings || 0}</span> },
        { header: 'Status', accessor: (ride: Ride) => <StatusBadge status={ride.status} /> },
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
                searchKeys={['id', 'status']}
                itemsPerPage={10}
            />
        </div>
    );
}
