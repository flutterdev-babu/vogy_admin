'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { ExportButton } from '@/components/ui/ExportButton';
import { StatusBadge } from '@/components/ui/Badge';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { corporateService } from '@/services/corporateService';

export default function CorporateBookingsPage() {
    // Using any for now to match Ride type with table accessor expectation
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await corporateService.getRides();
                if (response.success && response.data) {
                    setBookings(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch bookings');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const columns: any[] = [
        { header: 'Booking ID', accessor: 'id' },
        { header: 'Employee', accessor: 'employee' },
        { header: 'Date & Time', accessor: 'date' },
        {
            header: 'Route', accessor: (item: any) => (
                <div className="flex flex-col text-xs max-w-[200px]">
                    <span className="truncate text-green-600 font-medium" title={item.pickup}>{item.pickup}</span>
                    <span className="text-gray-400 text-[10px] my-0.5">↓</span>
                    <span className="truncate text-red-600 font-medium" title={item.drop}>{item.drop}</span>
                </div>
            )
        },
        { header: 'Amount', accessor: (item: any) => <span className="font-bold">₹{item.amount || '-'}</span> },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.status} /> },
    ];

    const handleBookRide = () => {
        toast.success('Booking feature coming soon!');
        // In future: Open modal to book ride for employee/guest
        // corporateService.bookRide(...)
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Corporate Bookings</h1>
                    <p className="text-sm text-gray-500">Track and manage rides booked by your employees.</p>
                </div>
                <div className="flex gap-3">
                    <ExportButton data={bookings} filename="corporate_bookings" />
                    <button
                        onClick={handleBookRide}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        Book for Others
                    </button>
                </div>
            </div>

            <AdvancedTable
                data={bookings}
                columns={columns}
                searchable={true}
                searchKeys={['id', 'employee', 'status']}
                itemsPerPage={10}
            />
        </div>
    );
}
