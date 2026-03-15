'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { partnerService } from '@/services/partnerService';
import { adminRideService } from '@/services/adminRideService';
import { Partner, Ride } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ChevronLeft, Wallet, Car, Star, CheckCircle, Clock } from 'lucide-react';

export default function PartnerProfileView() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [partner, setPartner] = useState<Partner | null>(null);
    const [rides, setRides] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchPartnerDetails();
        }
    }, [id]);

    const fetchPartnerDetails = async () => {
        setIsLoading(true);
        try {
            const partnerRes = await partnerService.getById(id);
            setPartner(partnerRes.data);

            const ridesRes = await adminRideService.getAllRides();
            // Filter rides for this specific partner
            const partnerRides = (ridesRes.data || []).filter(
                (r: Ride) => r.partner?.id === id || r.partner?.customId === id
            );
            setRides(partnerRides);
        } catch (error) {
            console.error('Failed to fetch partner details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <PageLoader />;

    if (!partner) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <p className="text-gray-500 mb-4">Partner not found.</p>
                <button onClick={() => router.back()} className="text-red-500 font-medium">Go Back</button>
            </div>
        );
    }

    const completedRides = rides.filter(r => r.status === 'COMPLETED');
    const cancelledRides = rides.filter(r => r.status === 'CANCELLED');
    const totalEarnings = completedRides.reduce((sum, ride) => sum + (ride.totalFare || 0), 0);

    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                    <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Driver Profile</h1>
                    <p className="text-sm text-gray-500">View performance and ride history</p>
                </div>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#D32F2F] h-24"></div>
                <div className="px-8 pb-8 flex flex-col md:flex-row gap-8 items-start relative -mt-12">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                        {partner.profileImage ? (
                            <img src={partner.profileImage} alt={partner.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-3xl font-bold">
                                {partner.name?.charAt(0) || 'P'}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-12 md:pt-14 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{partner.name}</h2>
                            <p className="text-sm text-gray-500">{partner.email}</p>
                            <p className="text-sm text-gray-500 font-medium mt-1">+{partner.phone}</p>
                            <span className={`inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full ${partner.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {partner.status}
                            </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wallet size={16} className="text-[#D32F2F]" />
                                    <span className="text-xs font-bold text-gray-600 uppercase">Total Earnings</span>
                                </div>
                                <p className="text-xl font-black text-[#D32F2F]">₹{totalEarnings.toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star size={16} className="text-amber-500" />
                                    <span className="text-xs font-bold text-gray-600 uppercase">Rating</span>
                                </div>
                                <p className="text-xl font-black text-gray-800">{(partner.rating || 5.0).toFixed(1)} / 5</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Car size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Rides</p>
                        <p className="text-2xl font-bold text-gray-800">{rides.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-gray-800">{completedRides.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Cancelled</p>
                        <p className="text-2xl font-bold text-gray-800">{cancelledRides.length}</p>
                    </div>
                </div>
            </div>

            {/* Ride History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Ride History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase">Route</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase">Rider</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase">Vehicle Type</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase text-right">Fare</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-600 uppercase text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rides.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No rides found for this partner.</td>
                                </tr>
                            ) : (
                                rides.map(ride => (
                                    <tr key={ride.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-gray-800">
                                                    {new Date(ride.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-[11px] text-gray-500">
                                                    {new Date(ride.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[12px] text-gray-600 truncate"><span className="font-bold text-green-600 mr-1">•</span>{ride.pickupAddress || 'Unknown'}</span>
                                                <span className="text-[12px] text-gray-600 truncate"><span className="font-bold text-red-600 mr-1">•</span>{ride.dropAddress || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-medium text-gray-800">{ride.user?.name || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[12px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {ride.vehicleType?.displayName || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-[13px] font-bold text-[#D32F2F]">₹{(ride.totalFare || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${ride.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                ride.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {ride.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
