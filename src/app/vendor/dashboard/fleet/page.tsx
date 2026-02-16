'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { Car, AlertTriangle, CheckCircle, Clock, Plus, Loader2 } from 'lucide-react';
import { vendorService } from '@/services/vendorService';
import { Vehicle } from '@/types';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

export default function VendorFleetPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ model: '', number: '', insuranceExpiry: '', permitExpiry: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        setIsLoading(true);
        try {
            const response = await vendorService.getVehicles();
            if (response.success && response.data) {
                setVehicles(response.data);
            }
        } catch (error) {
            console.error('Failed to load vehicles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await vendorService.addVehicle({
                ...newVehicle,
                status: 'ACTIVE'
            });

            if (response.success) {
                toast.success('Vehicle added successfully');
                setIsModalOpen(false);
                setNewVehicle({ model: '', number: '', insuranceExpiry: '', permitExpiry: '' });
                loadVehicles();
            } else {
                toast.error(response.message || 'Failed to add vehicle');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12} /> Available</span>;
            case 'ON_TRIP': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Car size={12} /> On Trip</span>;
            case 'MAINTENANCE': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertTriangle size={12} /> Maintenance</span>;
            default: return status;
        }
    };

    const columns: any[] = [
        { header: 'Vehicle No', accessor: (item: any) => <span className="font-mono font-bold">{item.number}</span> },
        { header: 'Model', accessor: 'model' },
        { header: 'Status', accessor: (item: any) => getStatusBadge(item.status) },
        {
            header: 'Insurance Exp', accessor: (item: any) => (
                <span className={`text-xs font-medium ${item.insuranceExpiry && new Date(item.insuranceExpiry) < new Date() ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                    {item.insuranceExpiry}
                </span>
            )
        },
        { header: 'Permit Exp', accessor: 'permitExpiry' },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
                    <p className="text-sm text-gray-500">Track your vehicles and document compliance.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Add Vehicle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-4 flex items-center gap-4 border-l-4 border-green-500">
                    <div className="p-3 bg-green-50 rounded-full text-green-600"><Car size={24} /></div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{vehicles.length}</h3>
                        <p className="text-xs text-gray-500">Total Vehicles</p>
                    </div>
                </div>
                {/* Simplified stats for now */}
            </div>

            <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Vehicle List
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </h2>
                <AdvancedTable data={vehicles} columns={columns} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
                <form onSubmit={handleAddVehicle} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
                        <input
                            required
                            type="text"
                            value={newVehicle.model}
                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            placeholder="e.g. Toyota Innova"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                        <input
                            required
                            type="text"
                            value={newVehicle.number}
                            onChange={(e) => setNewVehicle({ ...newVehicle, number: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            placeholder="e.g. KA-01-AB-1234"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
                            <input
                                required
                                type="date"
                                value={newVehicle.insuranceExpiry}
                                onChange={(e) => setNewVehicle({ ...newVehicle, insuranceExpiry: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Permit Expiry</label>
                            <input
                                required
                                type="date"
                                value={newVehicle.permitExpiry}
                                onChange={(e) => setNewVehicle({ ...newVehicle, permitExpiry: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-red-400"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Vehicle'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
