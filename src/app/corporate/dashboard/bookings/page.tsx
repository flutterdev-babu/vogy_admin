'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { ExportButton } from '@/components/ui/ExportButton';
import { StatusBadge } from '@/components/ui/Badge';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { corporateService } from '@/services/corporateService';
import { vehicleTypeService } from '@/services/vehicleTypeService';

import Modal from '@/components/ui/Modal';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';

export default function CorporateBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
    const [corporateProfile, setCorporateProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [estimation, setEstimation] = useState<{distance: number, fare: number} | null>(null);
    const [bookingForm, setBookingForm] = useState({
        employeeId: '',
        vehicleTypeId: '',
        cityCodeId: '',
        pickupAddress: '',
        pickupLat: 0,
        pickupLng: 0,
        dropAddress: '',
        dropLat: 0,
        dropLng: 0,
        guestName: '',
        guestPhone: '',
        scheduledDate: '',
        scheduledTime: '',
        bookingNotes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ridesRes, empRes, vtRes, profileRes] = await Promise.all([
                    corporateService.getRides(),
                    corporateService.getEmployees(),
                    vehicleTypeService.getAll(),
                    corporateService.getProfile()
                ]);
                
                if (ridesRes.success && ridesRes.data) {
                    setBookings(ridesRes.data.map((ride: any) => ({
                        ...ride,
                        employee: ride.corporateEmployeeId ? 'Staff' : 'Unknown',
                        date: new Date(ride.createdAt).toLocaleString(),
                        pickup: ride.pickupAddress,
                        drop: ride.dropAddress,
                        amount: ride.totalFare
                    })));
                }

                if (empRes.success && empRes.data) {
                    setEmployees(empRes.data);
                }

                if (vtRes.success && vtRes.data) {
                    setVehicleTypes(vtRes.data.filter((vt: any) => vt.isActive));
                }

                if (profileRes.success && profileRes.data) {
                    setCorporateProfile(profileRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Haversine formula for distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Auto-calculate fare when inputs change
    useEffect(() => {
        if (bookingForm.pickupLat && bookingForm.dropLat) {
            const dist = calculateDistance(bookingForm.pickupLat, bookingForm.pickupLng, bookingForm.dropLat, bookingForm.dropLng);
            
            let estFare = 0;
            if (bookingForm.vehicleTypeId) {
                const vType = vehicleTypes.find((vt: any) => vt.id === bookingForm.vehicleTypeId);
                if (vType) {
                    const baseFare = vType.baseFare || 50;
                    const pricePerKm = vType.pricePerKm || 12;
                    estFare = Math.round(baseFare + (Math.max(0, dist - 2) * pricePerKm));
                }
            }
            
            setEstimation({ distance: parseFloat(dist.toFixed(1)), fare: estFare });
        } else {
            setEstimation(null);
        }
    }, [bookingForm.pickupLat, bookingForm.dropLat, bookingForm.vehicleTypeId, vehicleTypes]);

    const columns: any[] = [
        { header: 'Booking ID', accessor: 'customId' },
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
        { 
            header: 'Driver Details', accessor: (item: any) => (
                item.partner ? (
                    <div className="text-xs">
                        <p className="font-bold text-gray-900">{item.partner.name}</p>
                        <p className="text-gray-500">{item.partner.phone}</p>
                        <p className="text-blue-600 font-medium">{item.vehicle?.registrationNumber || item.partner.vehicleNumber || 'Assigned'}</p>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 italic">Waiting for Assignment...</span>
                )
            ) 
        },
        { header: 'Amount', accessor: (item: any) => <span className="font-bold text-gray-900">₹{item.amount || '-'}</span> },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.status} /> },
    ];

    const handleBookRide = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Booking ride...');
        try {
            const scheduledDateTime = (bookingForm.scheduledDate && bookingForm.scheduledTime)
                ? `${bookingForm.scheduledDate}T${bookingForm.scheduledTime}:00`
                : undefined;

            const data = {
                ...bookingForm,
                distanceKm: estimation ? estimation.distance : Math.floor(Math.random() * 20) + 5, 
                cityCodeId: corporateProfile?.cityCodeId || '6996ffbbd1e9c000a1297434',
                scheduledDateTime,
                bookingNotes: bookingForm.bookingNotes
            };

            const response = await corporateService.bookRide(data);
            if (response.success) {
                toast.success('Ride booked successfully!', { id: toastId });
                setIsBookingModalOpen(false);
                setBookingForm({ 
                    employeeId: '', 
                    vehicleTypeId: '', 
                    cityCodeId: '', 
                    pickupAddress: '', 
                    pickupLat: 0,
                    pickupLng: 0,
                    dropAddress: '', 
                    dropLat: 0,
                    dropLng: 0,
                    guestName: '', 
                    guestPhone: '',
                    scheduledDate: '',
                    scheduledTime: '',
                    bookingNotes: ''
                });
                // Refresh bookings
                const ridesRes = await corporateService.getRides();
                if (ridesRes.success) setBookings(ridesRes.data.map((ride: any) => ({
                    ...ride,
                    employee: ride.corporateEmployeeId ? 'Staff' : 'Unknown',
                    date: new Date(ride.createdAt).toLocaleString(),
                    pickup: ride.pickupAddress,
                    drop: ride.dropAddress,
                    amount: ride.totalFare
                })));
            } else {
                toast.error(response.message || 'Failed to book ride', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Booking failed', { id: toastId });
        }
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
                        onClick={() => setIsBookingModalOpen(true)}
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

            <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Book Ride For Employee">
                <form onSubmit={handleBookRide} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                            <select 
                                required 
                                className="w-full px-3 py-2 border rounded-lg"
                                value={bookingForm.employeeId}
                                onChange={(e) => setBookingForm({...bookingForm, employeeId: e.target.value})}
                            >
                                <option value="">Select an employee...</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                            <select 
                                required 
                                className="w-full px-3 py-2 border rounded-lg"
                                value={bookingForm.vehicleTypeId}
                                onChange={(e) => setBookingForm({...bookingForm, vehicleTypeId: e.target.value})}
                            >
                                <option value="">Select a vehicle...</option>
                                {vehicleTypes.map(vt => (
                                    <option key={vt.id} value={vt.id}>{vt.displayName || vt.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name (Optional)</label>
                           <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Visitor Name" value={bookingForm.guestName} onChange={e => setBookingForm({...bookingForm, guestName: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Guest Phone (Optional)</label>
                           <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Visitor Phone" value={bookingForm.guestPhone} onChange={e => setBookingForm({...bookingForm, guestPhone: e.target.value})} />
                        </div>
                    </div>

                    <AddressAutocomplete 
                        label="Pickup Address"
                        placeholder="e.g. Airport Terminal 1"
                        required
                        onAddressSelect={(address, lat, lng) => setBookingForm({...bookingForm, pickupAddress: address, pickupLat: lat, pickupLng: lng})}
                    />

                    <AddressAutocomplete 
                        label="Drop Address"
                        placeholder="e.g. Corporate Head Office"
                        required
                        onAddressSelect={(address, lat, lng) => setBookingForm({...bookingForm, dropAddress: address, dropLat: lat, dropLng: lng})}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date (Optional)</label>
                           <input type="date" className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" min={new Date().toISOString().split('T')[0]} value={bookingForm.scheduledDate} onChange={e => setBookingForm({...bookingForm, scheduledDate: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time (Optional)</label>
                           <input type="time" className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" value={bookingForm.scheduledTime} onChange={e => setBookingForm({...bookingForm, scheduledTime: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Booking Notes (Optional)</label>
                        <input type="text" className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Park near Pillar 4" value={bookingForm.bookingNotes} onChange={e => setBookingForm({...bookingForm, bookingNotes: e.target.value})} />
                    </div>

                    {estimation && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between animate-fade-in my-2">
                            <div>
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Estimated Route</p>
                                <p className="text-sm font-medium text-blue-900">{estimation.distance} km</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Estimated Fare</p>
                                {estimation.fare > 0 ? (
                                    <p className="text-xl font-black text-blue-900">₹{estimation.fare}</p>
                                ) : (
                                    <p className="text-sm font-medium text-gray-500 italic mt-1">Select a vehicle...</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm Booking</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
