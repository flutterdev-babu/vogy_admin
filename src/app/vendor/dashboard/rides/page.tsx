'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { ExportButton } from '@/components/ui/ExportButton';
import { StatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { rideService } from '@/services/rideService';
import { Ride } from '@/types';

export default function VendorRidesPage() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, we would fetch rides specific to this vendor
        // utilizing a service method like rideService.getByVendor(vendorId)
        const fetchRides = async () => {
            try {
                const response = await rideService.getAll();
                setRides(response.data || []);
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
        { header: 'Customer', accessor: (ride: Ride) => ride.user?.name || 'N/A' },
        { header: 'Pickup', accessor: (ride: Ride) => <span className="truncate max-w-[150px] block" title={ride.pickupAddress}>{ride.pickupAddress}</span> },
        { header: 'Drop', accessor: (ride: Ride) => <span className="truncate max-w-[150px] block" title={ride.dropAddress}>{ride.dropAddress}</span> },
        { header: 'Fare', accessor: (ride: Ride) => <span className="font-bold">₹{ride.totalFare}</span> },
        { header: 'Status', accessor: (ride: Ride) => <StatusBadge status={ride.status} /> },
    ];

    if (isLoading) return <PageLoader />;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ride History</h1>
                    <p className="text-sm text-gray-500">View and manage all your fleet's trips.</p>
                </div>
                <ExportButton data={rides} filename="vendor_rides" />
            </div>

            <AdvancedTable
                data={rides}
                columns={columns}
                searchable={true}
                searchKeys={['id', 'status']}
                itemsPerPage={10}
                filters={[
                    {
                        label: 'All Status',
                        options: [
                            { label: 'Completed', value: 'COMPLETED' },
                            { label: 'Cancelled', value: 'CANCELLED' },
                            { label: 'Ongoing', value: 'ON_TRIP' }
                        ],
                        onFilterChange: (val) => console.log('Filter by', val) // To implement actual filtering, we'd need to filter the data prop or use client-side filtering in AdvancedTable
                    }
                ]}
            />
        </div>
    );
}
