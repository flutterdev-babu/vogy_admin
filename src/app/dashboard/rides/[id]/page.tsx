'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Clock, User, Car, IndianRupee, 
  ShieldCheck, AlertCircle, CheckCircle2, XCircle,
  Key, Save, Loader2, RefreshCw, Smartphone, 
  Search, MessageCircle, MoreHorizontal, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRideService } from '@/services/adminRideService';
import { partnerService } from '@/services/partnerService';
import { Ride, RideStatus, Partner, EntityStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function AdminRideDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [newStatus, setNewStatus] = useState<RideStatus | ''>('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState<string>('');
  const [userUniqueOtp, setUserUniqueOtp] = useState<string>('');
  const [startingKm, setStartingKm] = useState<string>('');
  const [endingKm, setEndingKm] = useState<string>('');
  const [filterBy, setFilterBy] = useState<'VERIFIED' | 'NV' | 'NA'>('VERIFIED');
  const [isAssignMode, setIsAssignMode] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rideRes, partnersRes] = await Promise.all([
        adminRideService.getRideById(id as string),
        partnerService.getAll({ verificationStatus: filterBy === 'VERIFIED' ? 'VERIFIED' : undefined })
      ]);
      
      if (rideRes.success) {
        const rideData = rideRes.data;
        // Robust state mapping for legacy status values
        let status = rideData.status as any;
        if (status === 'PENDING') status = 'UPCOMING';
        if (status === 'ACCEPTED') status = 'ASSIGNED';
        
        setRide({ ...rideData, status });
        setSelectedPartnerId(rideData.partner?.id || '');
        setNewStatus(status);
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
  }, [id, filterBy]);

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

  const filteredPartners = partnerSearch.length > 1 ? partners.filter(p => 
    p.name.toLowerCase().includes(partnerSearch.toLowerCase()) || 
    p.customId?.toLowerCase().includes(partnerSearch.toLowerCase()) ||
    p.phone?.includes(partnerSearch)
  ) : [];

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
    if (!newStatus) return;
    
    // Validate OTP for ONGOING status
    if (newStatus === 'ONGOING' && ride?.status !== 'ONGOING') {
      if (!userUniqueOtp || userUniqueOtp.length !== 4) {
        toast.error('Please enter a valid 4-digit User OTP to start the ride');
        return;
      }
      if (ride?.serviceType === 'RENTAL') {
        if (!startingKm || Number(startingKm) < 0) {
          toast.error('Please enter a valid starting odometer reading (KM)');
          return;
        }
      }
    }

    if (newStatus === 'COMPLETED' && ride?.serviceType === 'RENTAL') {
      if (!endingKm || Number(endingKm) <= 0) {
        toast.error('Please enter a valid ending odometer reading (KM)');
        return;
      }
    }

    setIsUpdating(true);
    try {
      const options: any = {};
      if (newStatus === 'ONGOING' && ride?.status !== 'ONGOING') {
        options.userOtp = userUniqueOtp;
        if (ride?.serviceType === 'RENTAL') options.startingKm = Number(startingKm);
      }
      if (newStatus === 'COMPLETED' && ride?.serviceType === 'RENTAL') {
        options.endingKm = Number(endingKm);
      }

      const res = await adminRideService.updateStatus(ride!.id, newStatus as string, options);
      if (res.success) {
        toast.success('Ride status updated');
        if (newStatus === 'ONGOING') setUserUniqueOtp('');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyRideDetails = () => {
    if (!ride) return;

    const dateStr = new Date(ride.scheduledDateTime || ride.createdAt).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true
    });
    
    const pickupMapsLink = `https://www.google.com/maps/search/?api=1&query=${ride.pickupLat},${ride.pickupLng}`;
    const dropMapsLink = `https://www.google.com/maps/search/?api=1&query=${ride.dropLat},${ride.dropLng}`;
    
    const driverPayment = (ride.riderEarnings || ride.partnerEarnings || 0).toFixed(2);
    
    const vehicleName = ride.vehicleType?.displayName || ride.vehicleType?.category || '-';
    let vehicleText = vehicleName;
    if (ride.partner?.vehicleModel || ride.partner?.vehicleNumber) {
      const modelNum = [ride.partner?.vehicleModel, ride.partner?.vehicleNumber].filter(Boolean).join(' - ');
      if (modelNum) vehicleText += `\n${modelNum}`;
    }

    const text = `*TRIP ALERT*\n\n*Pickup* - ${dateStr}\n\n${ride.pickupAddress}\n${pickupMapsLink}\n\n*Drop*\n${ride.dropAddress}\n${dropMapsLink}\n\n*Vehicle Details*\n${vehicleText}\n\n*Distance*\n${ride.distanceKm || 0} KM\n\n*Driver Payment*\n₹${driverPayment}\n\n*Driver Must Follow*\n• AC to be ON\n• Help passengers with luggage\n• Keep the car clean\n• Follow app route only\n• No extra charges or tips`;

    navigator.clipboard.writeText(text);
    toast.success('Ride details copied to clipboard');
  };

  if (isLoading) return <PageLoader />;
  if (!ride) return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
      <AlertCircle size={48} className="text-gray-300 mb-4" />
      <h2 className="text-lg font-bold text-gray-800">Ride Not Found</h2>
      <Link href="/dashboard/rides" className="mt-4 text-[#E32222] font-semibold hover:underline">Back to rides</Link>
    </div>
  );

  const cardClass = "bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full";
  const labelClass = "text-xs font-semibold text-gray-800 mb-2 block";
  const detailLabelClass = "text-[11px] font-bold text-gray-600 w-32 shrink-0";
  const detailValueClass = "text-[11px] font-medium text-gray-600";

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Booking Details</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyRideDetails} 
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-sm text-xs font-bold uppercase tracking-wide"
          >
            <Copy size={16} />
            Copy Details
          </button>
          <button 
            onClick={fetchData} 
            className="p-2 bg-[#D32F2F] text-white rounded-lg hover:bg-[#b71c1c] transition-colors shadow-sm"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Top Row: User, Ride, Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Details */}
        <div className={cardClass}>
          <h2 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">User Details</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className={detailLabelClass}>Mobile Number</span>
              <span className={detailValueClass}>+{ride.user?.phone}</span>
            </div>
            <div className="flex items-center">
              <span className={detailLabelClass}>Full Name</span>
              <span className={detailValueClass}>{ride.user?.name}</span>
            </div>
            <div className="flex items-center">
              <span className={detailLabelClass}>Email Address</span>
              <span className={detailValueClass}>{ride.user?.email}</span>
            </div>
            <div className="flex items-center">
              <span className={detailLabelClass}>Alt. Mobile</span>
              <span className={detailValueClass}>-</span>
            </div>
            <div className="flex items-center">
              <span className={detailLabelClass}>Unique OTP</span>
              <span className="text-[11px] font-bold text-red-600">{ride.user?.uniqueOtp || '-'}</span>
            </div>
          </div>
        </div>

        {/* Ride Details */}
        <div className={cardClass}>
          <h2 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Ride Details</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className={detailLabelClass}>Booking ID</span>
              <span className="text-[11px] font-bold text-red-600 uppercase">{ride.customId}</span>
            </div>
            <div className="flex items-center">
              <span className={detailLabelClass}>Booking Type</span>
              <span className="text-[11px] font-bold text-red-600 capitalize">{ride.serviceType || 'Standard Booking'}</span>
            </div>
            <div className="flex items-center">
              <span className={detailLabelClass}>Booking Date/Time</span>
              <span className="text-[11px] font-bold text-red-700">
                {new Date(ride.scheduledDateTime || ride.createdAt).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', hour12: true
                }).toUpperCase()}
              </span>
            </div>
            <div className="flex items-start">
              <span className={detailLabelClass}>Pickup Location</span>
              <span className="text-[10px] font-medium text-gray-500 leading-tight">
                {ride.pickupAddress}
              </span>
            </div>
            <div className="flex items-start">
              <span className={detailLabelClass}>Drop Location</span>
              <span className="text-[10px] font-medium text-gray-500 leading-tight">
                {ride.dropAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Status */}
        <div className={cardClass}>
          <h2 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Booking Status</h2>
          <div className="space-y-4">
            <div>
              <select 
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RideStatus)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-gray-400 outline-none"
              >
                <option value="REQUESTED">Requested</option>
                <option value="UPCOMING">Future</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="STARTED">Started</option>
                <option value="ARRIVED">Arrived</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {newStatus === 'ONGOING' && ride?.status !== 'ONGOING' && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-red-600 uppercase tracking-tight">Enter User OTP to Start</label>
                  <input 
                    type="text"
                    maxLength={4}
                    placeholder="4-digit OTP"
                    value={userUniqueOtp}
                    onChange={(e) => setUserUniqueOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full border-2 border-red-100 rounded px-3 py-1.5 text-xs font-bold focus:border-red-400 outline-none text-center tracking-[0.5em]"
                  />
                </div>
                {ride?.serviceType === 'RENTAL' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">Starting Odometer (KM)</label>
                    <input 
                      type="number"
                      placeholder="Start KM"
                      value={startingKm}
                      onChange={(e) => setStartingKm(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-bold focus:border-gray-400 outline-none"
                    />
                  </div>
                )}
              </div>
            )}
            
            {(newStatus === 'COMPLETED' && ride?.serviceType === 'RENTAL') && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">Ending Odometer (KM)</label>
                <input 
                  type="number"
                  placeholder="End KM"
                  value={endingKm}
                  onChange={(e) => setEndingKm(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-bold focus:border-gray-400 outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={detailLabelClass}>OTP</span>
                <span className="text-xs font-bold text-red-600 tracking-wider">
                  {showOtp ? (otp || ride.user?.uniqueOtp || '-') : '****'}
                </span>
              </div>
              <button 
                onClick={() => showOtp ? setShowOtp(false) : handleShowOtp()} 
                className="text-[10px] text-blue-600 hover:underline font-bold uppercase tracking-tighter"
              >
                {showOtp ? 'Hide OTP' : 'Show OTP'}
              </button>
            </div>
            <div className="flex items-center">
              <span className={detailLabelClass}>Payment Type</span>
              <span className="text-xs font-bold text-blue-400 capitalize">{ride.paymentMode || '-'}</span>
            </div>
            <div className="flex items-center">
              <span className={detailLabelClass}>Payment Status</span>
              <span className="text-xs font-bold text-red-600 uppercase">
                {ride.status === 'COMPLETED' ? 'PAID' : 'PENDING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Partner Details, Vehicle Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Partner Details */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h2 className="text-sm font-bold text-gray-800">Partner Details</h2>
            <button 
              onClick={() => setIsAssignMode(!isAssignMode)}
              className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 font-bold uppercase text-gray-600 transition-colors"
            >
              {isAssignMode ? 'View Assigned' : (ride.partner ? 'Change Partner' : 'Assign Partner')}
            </button>
          </div>

          {!isAssignMode && ride.partner ? (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center">
                <span className={detailLabelClass}>Partner Name</span>
                <span className={detailValueClass}>{ride.partner.name}</span>
              </div>
              <div className="flex items-center">
                <span className={detailLabelClass}>Partner ID</span>
                <span className="text-[11px] font-bold text-red-600">{ride.partner.customId}</span>
              </div>
              <div className="flex items-center">
                <span className={detailLabelClass}>Phone Number</span>
                <span className={detailValueClass}>{ride.partner.phone}</span>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[11px] font-bold text-gray-600">Filter:</span>
                {(['VERIFIED', 'NV', 'NA'] as const).map((type) => (
                  <label key={type} className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="filter" 
                      checked={filterBy === type}
                      onChange={() => setFilterBy(type)}
                      className="w-3 h-3 text-red-600"
                    />
                    <span className="text-[11px] text-gray-600">{type === 'VERIFIED' ? 'Verified' : type}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    placeholder="Search Partner ID / Name / Phone"
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-400 font-medium"
                  />
                  {filteredPartners.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredPartners.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPartnerId(p.id);
                            setPartnerSearch(p.name);
                          }}
                          className={`w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 border-b border-gray-50 last:border-0 ${selectedPartnerId === p.id ? 'bg-red-50 font-bold' : ''}`}
                        >
                          <div className="flex justify-between">
                            <span>{p.name}</span>
                            <span className="text-red-600 font-mono">{p.customId}</span>
                          </div>
                          <div className="text-[9px] text-gray-400">{p.phone}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleAssignPartner}
                  disabled={isUpdating || !selectedPartnerId}
                  className="bg-[#2E7D32] text-white px-6 py-2 rounded text-xs font-bold hover:bg-[#1b5e20] transition-colors disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Details */}
        <div className={cardClass}>
          <h2 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Vehicle Details</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <Car size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Category</p>
                  <p className="text-xs font-bold text-gray-800 italic uppercase">
                    {ride.vehicleType?.displayName || ride.vehicleType?.category || '-'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Distance</p>
                <p className="text-sm font-black text-[#D32F2F]">{ride.distanceKm?.toFixed(1) || '0.0'} Km</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Model</p>
                <p className="text-[11px] font-bold text-gray-700">{ride.partner?.vehicleModel || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Plate Number</p>
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider font-mono">{ride.partner?.vehicleNumber || '-'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <a 
                href={ride.partner?.phone ? `https://wa.me/${ride.partner.phone.replace(/\D/g, '')}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-1.5 bg-[#4CAF50] text-white rounded-full hover:bg-[#388E3C] transition-shadow shadow-sm"
              >
                <MessageCircle size={14} fill="currentColor" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Chat with Partner</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Partner Price Details */}
        <div className={cardClass}>
          <h2 className="text-sm font-bold text-gray-800 mb-6 font-mono">Partner Price Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Partner Base Price</span>
              <span className="text-gray-800">₹ {(ride.baseFare * 0.8).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Extra Km</span>
              <span className="text-gray-800">{ride.distanceKm?.toFixed(2)} Km</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Extra Per Km Charge</span>
              <span className="text-gray-800">₹ {(ride.perKmPrice * 0.8).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Extra Km Charges</span>
              <span className="text-gray-800">₹ {(ride.perKmPrice * ride.distanceKm * 0.8).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Toll Charges</span>
              <span className="text-gray-800">₹ 0.00</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Additional Charges</span>
              <span className="text-gray-800">₹ 0.00</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Manual Driver Discount</span>
              <div className="flex items-center gap-2">
                <div className="flex border rounded overflow-hidden">
                  <button className="px-1 bg-gray-100 border-r text-gray-600">-</button>
                  <button className="px-1 bg-[#2E7D32] text-white text-[8px]">+</button>
                </div>
                <div className="flex items-center border rounded px-1 min-w-[60px]">
                  <span className="text-[8px] text-gray-400 mr-1">₹</span>
                  <input type="text" value="0" readOnly className="w-full text-right outline-none bg-transparent py-1" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-gray-100 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Partner Total Amount</span>
              <span className="text-lg font-bold text-gray-800 font-mono">₹ {(ride.riderEarnings || ride.partnerEarnings || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Price Details */}
        <div className={cardClass}>
          <div className="flex-1 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 mb-6 font-mono">Price Details</h2>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Base Price</span>
              <span className="text-gray-800">₹ {ride.baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Extra Km</span>
              <span className="text-gray-800">{ride.distanceKm?.toFixed(2)} Km</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Extra Per Km Charge</span>
              <span className="text-gray-800">₹ {ride.perKmPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Extra Km Charges</span>
              <span className="text-gray-800">₹ {(ride.perKmPrice * ride.distanceKm).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Taxes</span>
              <span className="text-gray-800">₹ {(Math.max(0, ride.totalFare - ride.baseFare - (ride.perKmPrice * ride.distanceKm))).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Toll Charges</span>
              <span className="text-gray-800">₹ 0.00</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Additional Charges</span>
              <span className="text-gray-800">₹ 0.00</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500">
              <span className="capitalize">Reason</span>
              <span className="text-gray-800">-</span>
            </div>

            <div className="pt-6 border-t-2 border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Total Amount</span>
                <span className="text-lg font-bold text-gray-800 font-mono">₹ {ride.totalFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="bg-[#673AB7] text-white px-10 py-2 rounded shadow-md font-bold text-xs hover:bg-[#512DA8] transition-colors active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 size={14} className="animate-spin inline mr-2" /> : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
