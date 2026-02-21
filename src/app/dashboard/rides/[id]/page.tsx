'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Clock, User, Car, IndianRupee, 
  ShieldCheck, AlertCircle, CheckCircle2, XCircle,
  Key, Save, Loader2, RefreshCw, Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRideService } from '@/services/adminRideService';
import { partnerService } from '@/services/partnerService';
import { Ride, RideStatus, Partner, EntityStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/Badge';

export default function AdminRideDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<RideStatus | ''>('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rideRes, partnersRes] = await Promise.all([
        adminRideService.getRideById(id as string),
        partnerService.getAll({ status: 'APPROVED' })
      ]);
      
      if (rideRes.success) {
        setRide(rideRes.data);
        setSelectedPartnerId(rideRes.data.partner?.id || '');
        setNewStatus(rideRes.data.status);
      }
      if (partnersRes.success) {
        setPartners(partnersRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load ride details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAssignPartner = async () => {
    if (!selectedPartnerId) return;
    setIsUpdating(true);
    try {
      const selectedPartner = partners.find(p => p.id === selectedPartnerId);
      const res = await adminRideService.manualAssignPartner(ride!.id, selectedPartnerId, selectedPartner?.customId);
      if (res.success) {
        toast.success('Partner assigned successfully');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign partner');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === ride?.status) return;
    setIsUpdating(true);
    try {
      const res = await adminRideService.updateStatus(ride!.id, newStatus as RideStatus);
      if (res.success) {
        toast.success('Ride status updated');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShowOtp = async () => {
    try {
      const res = await adminRideService.getRideOtp(ride!.id);
      if (res.success) {
        setOtp(res.data.otp);
        setShowOtp(true);
      }
    } catch (error: any) {
      toast.error('Failed to retrieve OTP');
    }
  };

  if (isLoading) return <PageLoader />;
  if (!ride) return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
      <AlertCircle size={48} className="text-gray-300 mb-4" />
      <h2 className="text-lg font-bold text-gray-800">Ride Not Found</h2>
      <Link href="/dashboard/rides" className="mt-4 text-[#E32222] font-semibold hover:underline">Back to rides</Link>
    </div>
  );

  const sectionClass = "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6";
  const headerClass = "px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between";
  const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1";
  const valueClass = "text-sm font-semibold text-gray-800";

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/rides" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-800">Ride #{ride.customId}</h1>
              <StatusBadge status={ride.status} />
              {ride.isManualBooking && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wide border border-blue-100">Manual</span>
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Clock size={14} /> Created {new Date(ride.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-800 transition-colors">
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ride Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className={sectionClass}>
            <div className={headerClass}>
              <h2 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                <MapPin size={16} className="text-[#E32222]" /> Route Information
              </h2>
            </div>
            <div className="p-6">
              <div className="relative pl-8 border-l-2 border-dashed border-gray-100 space-y-8">
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm ring-4 ring-emerald-500/10" />
                  <div>
                    <span className={labelClass}>Pickup Point</span>
                    <p className="text-sm font-bold text-gray-800">{ride.pickupAddress}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[10px] text-gray-400 font-medium">Lat: {ride.pickupLat}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Lng: {ride.pickupLng}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm ring-4 ring-red-500/10" />
                  <div>
                    <span className={labelClass}>Drop Point</span>
                    <p className="text-sm font-bold text-gray-800">{ride.dropAddress}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[10px] text-gray-400 font-medium">Lat: {ride.dropLat}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Lng: {ride.dropLng}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div>
                  <span className={labelClass}>Estimated Distance</span>
                  <p className="text-base font-bold text-gray-800">{ride.distanceKm?.toFixed(2)} KM</p>
                </div>
                <div>
                  <span className={labelClass}>Vehicle Type Required</span>
                  <div className="flex items-center gap-2">
                    <Car size={16} className="text-gray-400" />
                    <p className="text-base font-bold text-gray-800 uppercase italic">
                      {ride.vehicleType?.displayName || 'Any Sedan'} ({ride.vehicleType?.category})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className={sectionClass}>
            <div className={headerClass}>
              <h2 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                <IndianRupee size={16} className="text-emerald-600" /> Pricing Breakdown
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className={labelClass}>Base Fare</span>
                  <p className="text-xl font-black text-gray-800">₹{ride.baseFare}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className={labelClass}>Per KM Price</span>
                  <p className="text-xl font-black text-gray-800">₹{ride.perKmPrice}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className={`${labelClass} text-emerald-600`}>Partner Earning</span>
                  <p className="text-xl font-black text-emerald-700">₹{ride.riderEarnings || ride.partnerEarnings}</p>
                </div>
                <div className="p-4 bg-[#E32222]/5 rounded-xl border border-[#E32222]/10">
                  <span className={`${labelClass} text-[#E32222]`}>Commission</span>
                  <p className="text-xl font-black text-[#E32222]">₹{ride.commission}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between p-4 bg-gray-800 rounded-xl text-white shadow-lg">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Charged To User</span>
                <span className="text-2xl font-black italic tracking-tighter">₹{ride.totalFare}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - User, Partner & Admin Actions */}
        <div className="space-y-6">
          {/* User Info */}
          <div className={sectionClass}>
            <div className={headerClass}>
              <h2 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                <User size={16} className="text-blue-500" /> Customer
              </h2>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg uppercase">
                {ride.user?.name?.[0] || 'C'}
              </div>
              <div>
                <p className="font-bold text-gray-800 leading-none mb-1">{ride.user?.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Smartphone size={10} /> {ride.user?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Partner Info & Assignment */}
          <div className={sectionClass}>
            <div className={headerClass}>
              <h2 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" /> Partner Assignment
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {ride.partner ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                    {ride.partner.name?.[0]}
                  </div>
                  <div>
                    <label className={`${labelClass} text-emerald-600`}>Assigned Partner</label>
                    <p className="font-bold text-gray-800">{ride.partner.name}</p>
                    <p className="text-xs text-gray-500">{ride.partner.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-center">
                  <p className="text-xs text-gray-400 font-medium italic">No partner assigned yet</p>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <label className={labelClass}>Manual Assignment</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E32222]"
                  >
                    <option value="">Select Partner</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.customId})</option>
                    ))}
                  </select>
                  <button 
                    disabled={isUpdating || !selectedPartnerId}
                    onClick={handleAssignPartner}
                    className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-black transition-all disabled:opacity-50"
                    title="Assign Partner"
                  >
                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Override */}
          <div className={sectionClass}>
            <div className={headerClass}>
              <h2 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-500" /> Status Management
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className={labelClass}>Override Ride Status</label>
                <div className="flex gap-2">
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as RideStatus)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E32222]"
                  >
                    <option value="PENDING">Upcoming</option>
                    <option value="ACCEPTED">Assigned</option>
                    <option value="ARRIVED">Arrived</option>
                    <option value="STARTED">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button 
                    disabled={isUpdating || newStatus === ride.status}
                    onClick={handleUpdateStatus}
                    className="p-2 bg-orange-500 text-white rounded-lg hover:bg-black transition-all disabled:opacity-50"
                    title="Update Status"
                  >
                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className={labelClass}>Security</label>
                {!showOtp ? (
                  <button 
                    onClick={handleShowOtp}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                  >
                    <Key size={16} className="text-emerald-400" /> Retrieve Ride OTP
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-400 flex flex-col items-center text-center animate-bounce-subtle">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Ride OTP</span>
                    <span className="text-2xl font-black text-gray-800 tracking-widest">{otp}</span>
                    <button onClick={() => setShowOtp(false)} className="mt-2 text-[10px] text-emerald-600 hover:underline">Hide OTP</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
