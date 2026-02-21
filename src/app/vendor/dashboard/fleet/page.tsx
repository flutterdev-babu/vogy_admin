'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { Car, AlertTriangle, CheckCircle, Clock, Plus, Loader2 } from 'lucide-react';
import { vendorService } from '@/services/vendorService';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { cityCodeService } from '@/services/cityCodeService';
import { Vehicle } from '@/types';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

export default function VendorFleetPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
    const [cityCodes, setCityCodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ 
        vehicleModel: '', 
        registrationNumber: '', 
        vehicleTypeId: '', 
        cityCodeId: '',
        color: '',
        fuelType: '',
        seatingCapacity: '',
        insuranceExpiry: '', 
        permitExpiry: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadVehicles();
        loadLookups();
    }, []);

    const loadLookups = async () => {
        try {
            const [typesRes, codesRes] = await Promise.all([
                vehicleTypeService.getAll(),
                cityCodeService.getAll()
            ]);
            if (typesRes.success) setVehicleTypes(typesRes.data || []);
            if (codesRes.success) setCityCodes(codesRes.data || []);
        } catch (error) {
            console.error('Failed to load lookups:', error);
        }
    };

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
        console.log('Submitting vehicle data (Vendor):', newVehicle);
        try {
            const response = await vendorService.addVehicle({
                registrationNumber: newVehicle.registrationNumber.toUpperCase(),
                vehicleModel: newVehicle.vehicleModel,
                vehicleTypeId: newVehicle.vehicleTypeId,
                cityCodeId: newVehicle.cityCodeId,
                color: newVehicle.color || undefined,
                fuelType: newVehicle.fuelType || undefined,
                seatingCapacity: newVehicle.seatingCapacity ? parseInt(newVehicle.seatingCapacity) : undefined,
                rtoTaxExpiryDate: newVehicle.permitExpiry || undefined, // Mapping permitExpiry to rtoTaxExpiry as placeholder if needed
                status: 'ACTIVE'
            });

            if (response.success) {
                toast.success('Vehicle added successfully');
                setIsModalOpen(false);
                setNewVehicle({ 
                    vehicleModel: '', registrationNumber: '', vehicleTypeId: '', cityCodeId: '',
                    color: '', fuelType: '', seatingCapacity: '', insuranceExpiry: '', permitExpiry: '' 
                });
                loadVehicles();
            } else {
                toast.error(response.message || 'Failed to add vehicle');
            }
        } catch (error: any) {
            console.error('Failed to add vehicle - Full Error:', error);
            if (error.response) {
                console.error('Error Status:', error.response.status);
                console.error('Error Data:', error.response.data);
            }
            toast.error(error.response?.data?.message || 'An error occurred');
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model *</label>
                        <input
                            required
                            type="text"
                            value={newVehicle.vehicleModel}
                            onChange={(e) => setNewVehicle({ ...newVehicle, vehicleModel: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            placeholder="e.g. Toyota Innova"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                        <input
                            required
                            type="text"
                            value={newVehicle.registrationNumber}
                            onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
                            placeholder="e.g. KA-01-AB-1234"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                            <select
                                required
                                value={newVehicle.vehicleTypeId}
                                onChange={(e) => setNewVehicle({ ...newVehicle, vehicleTypeId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none bg-white"
                            >
                                <option value="">Select Type</option>
                                {vehicleTypes.map(vt => (
                                    <option key={vt.id} value={vt.id}>{vt.displayName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City Code *</label>
                            <select
                                required
                                value={newVehicle.cityCodeId}
                                onChange={(e) => setNewVehicle({ ...newVehicle, cityCodeId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none bg-white"
                            >
                                <option value="">Select City</option>
                                {cityCodes.map(cc => (
                                    <option key={cc.id} value={cc.id}>{cc.cityName}</option>
                                ))}
                            </select>
                        </div>
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
