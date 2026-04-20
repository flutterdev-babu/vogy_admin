'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { partnerService } from '@/services/partnerService';
import { adminRideService } from '@/services/adminRideService';
import { adminApi } from '@/lib/api';
import { Partner, Ride } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ChevronLeft, Wallet, Car, Star, CheckCircle, Clock, FileText, BarChart3, MessageSquare, X, Check, XCircle, Pencil, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PartnerProfileView() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [partner, setPartner] = useState<Partner | null>(null);
    const [rides, setRides] = useState<Ride[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [earnings, setEarnings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // UI State
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'financials'>('overview');
    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
    const [notifyMessage, setNotifyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPartnerDetails();
        }
    }, [id]);

    const fetchPartnerDetails = async () => {
        setIsLoading(true);
        try {
            const [partnerRes, ridesRes, analyticsRes, earningsRes] = await Promise.all([
                partnerService.getById(id),
                adminRideService.getAllRides(),
                adminApi.get(`/partners/${id}/analytics`).then(res => res.data).catch(() => ({ data: null })),
                partnerService.getEarningsStats(id).catch(() => ({ data: null }))
            ]);

            setPartner(partnerRes.data);
            setAnalytics(analyticsRes.data);
            setEarnings(earningsRes.data);

            // Filter rides for this specific partner
            const partnerRides = (ridesRes.data || []).filter(
                (r: Ride) => r.partner?.id === id || r.partner?.customId === id
            );
            setRides(partnerRides);
        } catch (error) {
            console.error('Failed to fetch partner details:', error);
            toast.error('Failed to fetch some partner details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!notifyMessage.trim()) return;
        setIsSending(true);
        try {
            await partnerService.sendPartnerNotification(id, notifyMessage);
            toast.success('Message sent to partner');
            setIsNotifyModalOpen(false);
            setNotifyMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyDocument = async (docId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await partnerService.verifyPartnerDocument(id, docId, status);
            toast.success(`Document ${status.toLowerCase()} successfully`);
            fetchPartnerDetails(); // Refresh to update status
        } catch (error) {
            toast.error('Failed to update document status');
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
            <div className="flex justify-between items-center">
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
                <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/partners/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Pencil size={16} />
                        Edit Partner
                    </Link>
                    <button 
                        onClick={() => setIsNotifyModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <MessageSquare size={16} />
                        Send Message
                    </button>
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

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-[#D32F2F] text-[#D32F2F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'documents' ? 'border-[#D32F2F] text-[#D32F2F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Documents & KYC
                </button>
                <button
                    onClick={() => setActiveTab('financials')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'financials' ? 'border-[#D32F2F] text-[#D32F2F]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Financials
                </button>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
                <>
                    {/* Analytics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Car size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Rides</p>
                                <p className="text-2xl font-bold text-gray-800">{analytics?.rides?.total || rides.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Completion %</p>
                                <p className="text-2xl font-bold text-gray-800">{analytics?.rides?.completionRate || 0}%</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Cancel %</p>
                                <p className="text-2xl font-bold text-gray-800">{analytics?.rides?.cancellationRate || 0}%</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <Check size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Accept %</p>
                                <p className="text-2xl font-bold text-gray-800">100%</p>
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
          </>
        )}
            {/* TAB CONTENT: DOCUMENTS */}
            {activeTab === 'documents' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 text-center">
                    <h2 className="text-xl font-bold mb-4">Document Verification</h2>
                    <p className="text-gray-500 mb-6">Manage and approve KYC documents here.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'driving_license', name: 'Driving License', status: partner.licenseImage ? 'UPLOADED' : 'MISSING', url: partner.licenseImage },
                            { id: 'pan_card', name: 'PAN Card', status: partner.panCardPhoto ? 'UPLOADED' : 'MISSING', url: partner.panCardPhoto },
                            { id: 'aadhaar_card_front', name: 'Aadhaar (Front)', status: partner.aadhaarFrontPhoto ? 'UPLOADED' : 'MISSING', url: partner.aadhaarFrontPhoto },
                            { id: 'aadhaar_card_back', name: 'Aadhaar (Back)', status: partner.aadhaarBackPhoto ? 'UPLOADED' : 'MISSING', url: partner.aadhaarBackPhoto }
                        ].map(doc => (
                            <div key={doc.id} className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between items-start text-left bg-gray-50">
                                <div className="flex justify-between w-full items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{doc.name}</h3>
                                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full ${doc.status === 'UPLOADED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                    {doc.status === 'UPLOADED' && (
                                        <button 
                                            onClick={() => doc.url && window.open(doc.url, '_blank')}
                                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm"
                                            title="View Document"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2 w-full">
                                    <button 
                                        onClick={() => handleVerifyDocument(doc.id, 'APPROVED')}
                                        disabled={doc.status === 'MISSING'}
                                        className="flex-1 py-1.5 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 disabled:opacity-50"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleVerifyDocument(doc.id, 'REJECTED')}
                                        disabled={doc.status === 'MISSING'}
                                        className="flex-1 py-1.5 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: FINANCIALS */}
            {activeTab === 'financials' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
                    <h2 className="text-xl font-bold mb-6">Earnings Breakdown</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <p className="text-sm font-medium text-gray-500 mb-1">Session Earnings</p>
                            <p className="text-2xl font-black text-gray-800">₹{(earnings?.earnings?.sessionEarnings || 0).toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Fares</p>
                            <p className="text-2xl font-black text-gray-800">₹{(earnings?.earnings?.totalFare || 0).toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-sm font-medium text-red-800 mb-1">Lifetime Earnings</p>
                            <p className="text-2xl font-black text-[#D32F2F]">₹{(earnings?.earnings?.totalEarnings || partner.totalEarnings || 0).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            {isNotifyModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">Message to Partner</h3>
                            <button onClick={() => setIsNotifyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                            <textarea 
                                value={notifyMessage}
                                onChange={(e) => setNotifyMessage(e.target.value)}
                                rows={4}
                                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#D32F2F] focus:border-[#D32F2F] outline-none transition-all resize-none"
                                placeholder="E.g. Please update your insurance document..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-2">This will send an immediate notification to the partner's app.</p>
                        </div>
                        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end bg-gray-50 rounded-b-2xl">
                            <button 
                                onClick={() => setIsNotifyModalOpen(false)}
                                className="px-5 py-2.5 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendMessage}
                                disabled={isSending || !notifyMessage.trim()}
                                className="px-5 py-2.5 bg-[#D32F2F] hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
