'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { Star, Phone, UserCheck, Plus, Loader2 } from 'lucide-react';
import { vendorService } from '@/services/vendorService';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

export default function VendorDriversPage() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDriver, setNewDriver] = useState({ name: '', phone: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        setIsLoading(true);
        try {
            const response = await vendorService.getDrivers();
            if (response.success && response.data) {
                setDrivers(response.data);
            }
        } catch (error) {
            console.error('Failed to load drivers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await vendorService.addDriver(newDriver);
            if (response.success) {
                toast.success('Driver invitation sent');
                setIsModalOpen(false);
                setNewDriver({ name: '', phone: '', email: '' });
                loadDrivers();
            } else {
                toast.error(response.message || 'Failed to add driver');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: any[] = [
        {
            header: 'Driver Name', accessor: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs">
                        {item.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                </div>
            )
        },
        { header: 'Phone', accessor: (item: any) => <div className="flex items-center gap-1 text-gray-600 text-sm"><Phone size={12} />{item.phone}</div> },
        {
            header: 'Rating', accessor: (item: any) => (
                <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold w-fit">
                    {item.rating || 'N/A'} <Star size={10} fill="currentColor" />
                </span>
            )
        },
        { header: 'Total Rides', accessor: (item: any) => item.rides || 0 },
        {
            header: 'Status', accessor: (item: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.status || 'OFFLINE'}
                </span>
            )
        },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
                    <p className="text-sm text-gray-500">Manage your employed drivers and view their performance.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Add Driver
                </button>
            </div>

            <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Driver List
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </h2>
                <AdvancedTable data={drivers} columns={columns} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Driver">
                <form onSubmit={handleAddDriver} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                        <input
                            required
                            type="text"
                            value={newDriver.name}
                            onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            placeholder="e.g. Ramesh Kumar"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            required
                            type="tel"
                            value={newDriver.phone}
                            onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            placeholder="e.g. 9876543210"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            required
                            type="email"
                            value={newDriver.email}
                            onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            placeholder="e.g. ramesh@example.com"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-red-400"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Driver'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
