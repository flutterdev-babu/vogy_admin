'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, CheckCircle, Car, User, MessageCircle, AlertCircle, Plus, Copy, RefreshCw, Loader2, X, Phone, Star, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRideService } from '@/services/adminRideService';
import { partnerService } from '@/services/partnerService';
import { supportTicketService } from '@/services/supportTicketService';
import { adminApi } from '@/lib/api';
import { Ride, Partner, RideStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import InvoiceExport from '@/components/InvoiceExport';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Unlock } from 'lucide-react';

export default function CleanAdminRideDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { admin } = useAuth();
  const [isLocked, setIsLocked] = useState(false);

  // Status & Partner States
  const [newStatus, setNewStatus] = useState<RideStatus>('REQUESTED');
  const [bookingNotes, setBookingNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState<string>('');
  const [userUniqueOtp, setUserUniqueOtp] = useState<string>('');
  const [startingKm, setStartingKm] = useState<string>('');
  const [endingKm, setEndingKm] = useState<string>('');

  const [filterBy, setFilterBy] = useState<'VERIFIED' | 'NV' | 'NA'>('VERIFIED');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isAssignMode, setIsAssignMode] = useState(false);

  // Editable Pricing States
  const [taxes, setTaxes] = useState<number>(0);
  const [tollCharges, setTollCharges] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [manualAdj, setManualAdj] = useState<number>(0);

  // Computed Pricing States
  const [frontendTotal, setFrontendTotal] = useState<number>(0);
  const [frontendGst, setFrontendGst] = useState<number>(0);
  const [frontendExtraKmCharges, setFrontendExtraKmCharges] = useState<number>(0);

  // Add Partner Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);
  const [isSearchingPartners, setIsSearchingPartners] = useState(false);
  const [suggestedPartners, setSuggestedPartners] = useState<Partner[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rideRes, partnerRes] = await Promise.all([
        adminRideService.getRideById(id as string),
        partnerService.getAll({ verificationStatus: filterBy === 'VERIFIED' ? 'VERIFIED' : undefined })
      ]);
      if (rideRes.success) {
        const r = rideRes.data;
        let status = r.status as any;
        if (status === 'PENDING') status = 'UPCOMING';
        if (status === 'ACCEPTED') status = 'ASSIGNED';

        setRide(r);
        setNewStatus(status);
        setBookingNotes(r.bookingNotes || '');
        setTaxes((r as any).taxes || 0);
        setTollCharges((r as any).tollCharges || 0);
        setAdditionalCharges((r as any).additionalCharges || 0);
        setManualAdj(-((r as any).partnerManualDiscount || 0));
        setPaymentStatus((r as any).paymentStatus || 'PENDING');
        setSelectedPartnerId(r.partner?.id || '');
        setIsLocked(r.isLocked || false);
      }
      if (partnerRes.success) setPartners(partnerRes.data);
    } catch (error) {
      toast.error('Failed to fetch ride');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, filterBy]);

  useEffect(() => {
    if (ride) {
      const extraKm = Math.max(0, (ride.distanceKm || 0) * (ride.perKmPrice || 0));
      const taxableAmount = ride.baseFare + extraKm;
      const gstAmount = taxableAmount * 0.05;

      setFrontendExtraKmCharges(extraKm);
      setFrontendGst(gstAmount);

      const newTotal = ride.baseFare + extraKm + gstAmount + (taxes || 0) + (tollCharges || 0) + (additionalCharges || 0);
      setFrontendTotal(newTotal);
    }
  }, [ride, taxes, tollCharges, additionalCharges, manualAdj]);

  const handleLockToggle = async () => {
    if (!ride) return;
    const confirmMsg = isLocked
      ? "Are you sure you want to UNLOCK this ride? This will allow modifications again."
      : "Are you sure you want to FINALIZE and LOCK this ride? Once locked, only a SuperAdmin can make changes.";

    if (!confirm(confirmMsg)) return;

    setIsUpdating(true);
    try {
      const res = await adminRideService.updateRideDetails(id as string, { isLocked: !isLocked });
      if (res.success) {
        setIsLocked(!isLocked);
        toast.success(isLocked ? 'Ride unlocked successfully' : 'Ride finalized and locked');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update lock status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Debounced Partner Search
  useEffect(() => {
    if (partnerSearch.length < 2) {
      setSuggestedPartners([]);
      setIsSearchingPartners(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingPartners(true);
      try {
        const res = await partnerService.getAll({
          search: partnerSearch,
        });
        if (res.success) {
          setSuggestedPartners(res.data);
        }
      } catch (error) {
        console.error("Partner search failed", error);
      } finally {
        setIsSearchingPartners(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [partnerSearch]);

  const handleShowOtp = async () => {
    if (ride?.user?.uniqueOtp) {
      setOtp(ride.user.uniqueOtp);
      setShowOtp(true);
      return;
    }
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

  const handleAssignPartner = async () => {
    if (!selectedPartnerId) return;
    setIsUpdating(true);
    try {
      const partnerToAssign = selectedPartner ||
        partners.find(p => p.id === selectedPartnerId) ||
        suggestedPartners.find(p => p.id === selectedPartnerId);

      const res = await adminRideService.manualAssignPartner(ride!.id, selectedPartnerId, partnerToAssign?.customId);
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

  const handleUpdateStatusAndDetails = async () => {
    setIsUpdating(true);
    try {
      // 1. Process Status Update (if changed)
      if (newStatus && newStatus !== ride?.status) {
        if (newStatus === 'ONGOING') {
          if (!userUniqueOtp || userUniqueOtp.length !== 4) {
            toast.error('Please enter a valid 4-digit User OTP to start the ride');
            setIsUpdating(false);
            return;
          }
          if (ride?.serviceType === 'RENTAL' && (!startingKm || Number(startingKm) < 0)) {
            toast.error('Please enter a valid starting odometer reading');
            setIsUpdating(false);
            return;
          }
        }
        if (newStatus === 'COMPLETED' && ride?.serviceType === 'RENTAL' && (!endingKm || Number(endingKm) <= 0)) {
          toast.error('Please enter a valid ending odometer reading');
          setIsUpdating(false);
          return;
        }

        const statusOptions: any = { manualDiscount: -manualAdj };
        if (newStatus === 'ONGOING') {
          statusOptions.userOtp = userUniqueOtp;
          if (ride?.serviceType === 'RENTAL') statusOptions.startingKm = Number(startingKm);
        }
        if (newStatus === 'COMPLETED' && ride?.serviceType === 'RENTAL') {
          statusOptions.endingKm = Number(endingKm);
        }

        await adminRideService.updateStatus(ride!.id, newStatus as string, statusOptions);
      }

      // 2. Process Pricing / Details Update
      const payload = {
        taxes,
        tollCharges,
        additionalCharges,
        driverDiscount: -manualAdj,
        paymentStatus,
        bookingNotes,
        partnerId: ride?.partner?.id === selectedPartnerId ? undefined : selectedPartnerId
      };

      const res = await adminRideService.updateRideDetails(ride!.id, payload);
      if (res.success) {
        toast.success("Ride details updated successfully");
        if (newStatus === 'ONGOING') setUserUniqueOtp('');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreatePartner = async () => {
    if (!newPartnerName || !newPartnerPhone) {
      toast.error('Name and Phone are required');
      return;
    }

    setIsCreatingPartner(true);
    try {
      const res = await partnerService.adminCreatePartner({
        name: newPartnerName,
        phone: newPartnerPhone
      });

      if (res.success) {
        toast.success('Partner created successfully');
        setIsModalOpen(false);
        setNewPartnerName('');
        setNewPartnerPhone('');

        // Auto select and refresh
        const newPartnerId = res.data.id;
        setSelectedPartnerId(newPartnerId);
        setPartnerSearch(newPartnerName);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create partner');
    } finally {
      setIsCreatingPartner(false);
    }
  };

  const handleCopyRideDetails = () => {
    if (!ride) return;
    const dateStr = new Date(ride.scheduledDateTime || ride.createdAt).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true
    });
    const pickupMapsLink = `https://www.google.com/maps/search/?api=1&query=${ride.pickupLat},${ride.pickupLng}`;
    const dropMapsLink = `https://www.google.com/maps/search/?api=1&query=${ride.dropLat},${ride.dropLng}`;
    const driverPayment = ((ride.riderEarnings || ride.partnerEarnings || 0) + manualAdj).toFixed(2);
    const vehicleText = `${ride.vehicleType?.displayName || ride.vehicleType?.category || '-'}\n${[ride.partner?.vehicleModel, ride.partner?.vehicleNumber].filter(Boolean).join(' - ')}`;

    const text = `*TRIP ALERT*\n\n*Pickup* - ${dateStr}\n\n${ride.pickupAddress}\n${pickupMapsLink}\n\n*Drop*\n${ride.dropAddress}\n${dropMapsLink}\n\n*Vehicle Details*\n${vehicleText}\n\n*Distance*\n${ride.distanceKm || 0} KM\n\n*Driver Payment*\n₹${driverPayment}\n\n*Driver Must Follow*\n• AC to be ON\n• Help passengers with luggage\n• Keep the car clean\n• Follow app route only\n• No extra charges or tips`;

    navigator.clipboard.writeText(text);
    toast.success('Ride details copied to clipboard');
  };

  const filteredPartners = suggestedPartners;

  if (isLoading) return <PageLoader />;
  if (!ride) return <div className="p-10 text-center text-lg"><AlertCircle className="mx-auto text-red-500 mb-4 w-12 h-12" />Ride Not Found</div>;

  const cardStyle = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col";
  const headerStyle = "text-sm md:text-base font-bold text-gray-800 uppercase tracking-tight mb-4 pb-3 border-b border-gray-100 flex items-center justify-between";
  const detailRow = "flex w-full items-start py-2.5 border-b border-gray-50 last:border-0 gap-2";
  const detailLabelClass = "text-[11px] font-bold text-gray-500 uppercase tracking-tighter w-[110px] shrink-0";
  const detailValueClass = "text-sm font-semibold text-gray-800 text-left flex-1 break-all";

  const inputStyle = "w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#673AB7]/20 outline-none transition-all";

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50/50 min-h-screen text-base animate-in fade-in duration-300">

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-5 w-full md:w-auto overflow-hidden">
          <button onClick={() => router.back()} className="p-2.5 hover:bg-gray-100 rounded-full transition shrink-0"><ArrowLeft size={20} /></button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight truncate">Booking #{ride.customId}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-sm uppercase font-bold px-3 py-1 rounded-full ${ride.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {ride.status}
              </span>
              <span className="text-sm uppercase font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                {ride.rideType || ride.serviceType || 'Standard'}
              </span>
              {ride.isManualBooking && (
                <span className="text-sm uppercase font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                  Manual
                </span>
              )}
              {isLocked && (
                <span className="text-sm uppercase font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1.5 shadow-sm ring-1 ring-red-200">
                  <Lock size={14} /> Locked
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 shrink-0">
          <button
            onClick={handleLockToggle}
            disabled={isUpdating || (isLocked && admin?.role !== 'SUPERADMIN')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition shadow-sm text-sm font-bold uppercase whitespace-nowrap ${isLocked
              ? (admin?.role === 'SUPERADMIN' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-red-50 text-red-400 cursor-not-allowed')
              : 'bg-[#673AB7] text-white hover:bg-[#5E35B1]'
              }`}
          >
            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : (
              isLocked
                ? (admin?.role === 'SUPERADMIN' ? <><Unlock size={18} /> Unlock Ride</> : <><Lock size={18} /> Ride Finalized</>)
                : <><CheckCircle size={18} /> Finalize & Lock</>
            )}
          </button>
          <button
            onClick={handleCopyRideDetails}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition shadow-sm text-sm font-bold uppercase whitespace-nowrap"
          >
            <Copy size={18} /> Copy
          </button>
          <button onClick={fetchData} disabled={isUpdating} className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition shadow-sm shrink-0">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <InvoiceExport ride={{ ...ride, taxes, tollCharges, additionalCharges, partnerManualDiscount: -manualAdj }} computedTotal={frontendTotal} computedGst={frontendGst} />
          <button
            onClick={handleUpdateStatusAndDetails}
            disabled={isUpdating || isLocked}
            className="flex items-center gap-2 bg-[#673AB7] text-white px-8 py-3 rounded-lg text-sm font-bold uppercase hover:bg-[#512DA8] transition-all shadow-md disabled:opacity-50 whitespace-nowrap"
          >
            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : 'Save Updates'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Customer Details */}
        <div className={cardStyle}>
          <h2 className={headerStyle}>
            <span className="flex items-center gap-3"><User size={20} className="text-gray-400" /> Customer Details</span>
          </h2>
          <div className="space-y-2">
            <div className={detailRow}>
              <span className={detailLabelClass}>Full Name</span>
              <span className={detailValueClass}>{ride.user?.name || (ride as any).corporateEmployee?.name || '-'}</span>
            </div>
            <div className={detailRow}>
              <span className={detailLabelClass}>Mobile / Acc</span>
              <span className={detailValueClass}>{(ride.user?.phone || '').toString() ? '+' + (ride.user?.phone || '').toString().replace(/^\+/, '') : ((ride as any).corporate?.companyName || '-')}</span>
            </div>
            <div className={detailRow}>
              <span className={detailLabelClass}>Email Address</span>
              <span className={detailValueClass}>{ride.user?.email || (ride as any).corporateEmployee?.email || '-'}</span>
            </div>
            {ride.altMobile && (
              <div className={detailRow}>
                <span className={detailLabelClass}>Alt Mobile</span>
                <span className={detailValueClass}>+{ride.altMobile.replace(/^\+/, '')}</span>
              </div>
            )}
            <div className={detailRow}>
              <span className={detailLabelClass}>Unique OTP</span>
              <span className="text-sm font-mono text-red-600 font-bold tracking-widest text-left flex-1">{ride.user?.uniqueOtp || '-'}</span>
            </div>
            {(ride as any).transactionId && (
              <div className={detailRow}>
                <span className={detailLabelClass}>Transaction ID</span>
                <span className="text-sm font-mono font-bold text-blue-600 break-all text-left flex-1">{(ride as any).transactionId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle & Trip Info */}
        <div className={cardStyle}>
          <h2 className={headerStyle}>
            <span className="flex items-center gap-3"><Car size={20} className="text-gray-400" /> Vehicle Details</span>
          </h2>
          <div className="space-y-2">
            <div className={detailRow}>
              <span className={detailLabelClass}>Category Req.</span>
              <span className={`${detailValueClass} italic`}>{ride.vehicleType?.displayName || ride.vehicleType?.category || '-'}</span>
            </div>
            <div className={detailRow}>
              <span className={detailLabelClass}>Total Distance</span>
              <span className={`${detailValueClass} text-red-600`}>{ride.distanceKm?.toFixed(2) || '0.00'} KM</span>
            </div>
            <div className={detailRow}>
              <span className={detailLabelClass}>Date / Time</span>
              <span className={detailValueClass}>{new Date(ride.scheduledDateTime || ride.createdAt).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
              })}</span>
            </div>
            <div className={detailRow}>
              <span className={detailLabelClass}>Model</span>
              <span className={detailValueClass}>{(ride as any).vehicle?.vehicleModel || ride.partner?.vehicleModel || '-'}</span>
            </div>
            <div className={detailRow}>
              <span className={detailLabelClass}>Plate Number</span>
              <span className="text-base font-bold text-red-600 uppercase tracking-wider font-mono text-left flex-1">{(ride as any).vehicle?.registrationNumber || ride.partner?.vehicleNumber || '-'}</span>
            </div>
          </div>
        </div>

        {/* Booking Status & Actions */}
        <div className={cardStyle}>
          <h2 className={headerStyle}>
            <span className="flex items-center gap-3"><CheckCircle size={20} className="text-gray-400" /> Booking Status</span>
          </h2>
          <div className="space-y-5 flex-1">
            <div>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RideStatus)}
                disabled={isLocked}
                className={inputStyle}
              >
                <option value="REQUESTED">Requested</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="ARRIVED">Arrived</option>
                <option value="STARTED">Started</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="CNR">CNR (No Show)</option>
              </select>
            </div>

            {newStatus === 'ONGOING' && ride?.status !== 'ONGOING' && (
              <div className="space-y-4 bg-red-50 p-4 rounded-xl border border-red-100">
                <div>
                  <label className="text-xs md:text-sm font-bold text-red-600 uppercase tracking-tight block mb-2">Enter User OTP to Start</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="4-digit OTP"
                    value={userUniqueOtp}
                    disabled={isLocked}
                    onChange={(e) => setUserUniqueOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full border-2 border-red-200 bg-white rounded-lg px-4 py-3 text-lg font-bold text-center tracking-[0.5em] focus:border-red-400 outline-none transition-colors"
                  />
                </div>
                {ride?.serviceType === 'RENTAL' && (
                  <div>
                    <label className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-tight block mb-2">Starting Odometer (KM)</label>
                    <input
                      type="number"
                      placeholder="Start KM"
                      value={startingKm}
                      disabled={isLocked}
                      onChange={(e) => setStartingKm(e.target.value)}
                      className={inputStyle}
                    />
                  </div>
                )}
              </div>
            )}

            {(newStatus === 'COMPLETED' && ride?.serviceType === 'RENTAL') && (
              <div className="bg-gray-100 p-4 rounded-xl">
                <label className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-tight block mb-2">Ending Odometer (KM)</label>
                <input
                  type="number"
                  placeholder="End KM"
                  value={endingKm}
                  disabled={isLocked}
                  onChange={(e) => setEndingKm(e.target.value)}
                  className={inputStyle}
                />
              </div>
            )}

            <div className="pt-3">
              <div className="flex items-center justify-between">
                <span className={detailLabelClass}>Payment</span>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  disabled={isLocked}
                  className="bg-gray-100 border border-gray-200 text-sm font-bold uppercase text-gray-700 px-3 py-1.5 rounded outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed / Received</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Route & Timeline Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Route Info Card */}
        <div className={`${cardStyle} lg:col-span-2 flex-col md:flex-row items-center gap-8 md:p-8`}>
          <div className="md:w-36 shrink-0 w-full text-center md:text-left">
            <h2 className="text-base font-bold text-gray-800 uppercase tracking-tight flex items-center justify-center md:justify-start gap-3">
              <MapPin size={22} className="text-gray-400" /> Route Info
            </h2>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full relative">
            <div className="hidden md:block absolute top-[36px] left-[20px] right-[50%] h-[3px] bg-gray-100 -z-10"></div>
            <div className="relative bg-green-50/50 p-5 rounded-xl border border-green-100/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3.5 h-3.5 bg-green-500 rounded-full shrink-0"></div>
                <span className="text-sm font-bold text-green-700 uppercase tracking-tight">Pickup Location</span>
              </div>
              <p className="text-base font-medium text-gray-700 leading-snug pl-6">{ride?.pickupAddress}</p>
            </div>
            <div className="relative bg-red-50/50 p-5 rounded-xl border border-red-100/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3.5 h-3.5 bg-red-500 rounded-[4px] shrink-0"></div>
                <span className="text-sm font-bold text-red-700 uppercase tracking-tight">Drop Location</span>
              </div>
              <p className="text-base font-medium text-gray-700 leading-snug pl-6">{ride?.dropAddress}</p>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className={cardStyle}>
          <h2 className={headerStyle}>
            <span className="flex items-center gap-3"><Clock size={20} className="text-gray-400" /> Ride Timeline</span>
          </h2>
          <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            <div className="pl-8 relative">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white"></div>
              <p className="text-xs font-bold text-gray-400 uppercase">Requested</p>
              <p className="text-sm font-bold text-gray-800">{new Date(ride?.createdAt || '').toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            </div>
            {ride?.acceptedAt && (
              <div className="pl-8 relative">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-500 ring-4 ring-white"></div>
                <p className="text-xs font-bold text-gray-400 uppercase">Accepted</p>
                <p className="text-sm font-bold text-gray-800">{new Date(ride.acceptedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
            )}
            {ride?.arrivedAt && (
              <div className="pl-8 relative">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-yellow-500 ring-4 ring-white"></div>
                <p className="text-xs font-bold text-gray-400 uppercase">Arrived</p>
                <p className="text-sm font-bold text-gray-800">{new Date(ride.arrivedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
            )}
            {ride?.startTime && (
              <div className="pl-8 relative">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-white"></div>
                <p className="text-xs font-bold text-gray-400 uppercase">Started</p>
                <p className="text-sm font-bold text-gray-800">{new Date(ride.startTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
            )}
            {ride?.status === 'COMPLETED' && ride?.endTime && (
              <div className="pl-8 relative">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-green-600 ring-4 ring-white"></div>
                <p className="text-xs font-bold text-gray-400 uppercase">Completed</p>
                <p className="text-sm font-bold text-gray-800">{new Date(ride.endTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Grid: Partner Assignment & Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Partner Management */}
        <div className="col-span-1 lg:col-span-4 h-full">
          <div className={cardStyle}>
            <div className={headerStyle}>
              <span>Partner Assignment</span>
              <button
                onClick={() => setIsAssignMode(!isAssignMode)}
                disabled={isLocked}
                className="text-xs bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200 font-bold uppercase tracking-wider text-gray-700 transition-colors disabled:opacity-50"
              >
                {isAssignMode ? 'View Assigned' : (ride.partner ? 'Change Partner' : 'Assign Partner')}
              </button>
            </div>

            {!isAssignMode && ride.partner ? (
              <div className="space-y-6 flex-1">
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-800">{ride.partner.name}</p>
                    <p className="text-lg font-bold text-red-600 font-mono mt-2">{ride.partner.customId}</p>
                    <p className="text-base text-gray-600 font-medium mt-2">+{ride.partner.phone}</p>
                  </div>
                </div>

                <a
                  href={ride.partner?.phone ? `https://wa.me/91${ride.partner.phone.replace(/\D/g, '')}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-[#4CAF50] text-white rounded-lg hover:bg-[#388E3C] transition shadow-md text-base font-bold uppercase tracking-tight"
                >
                  <MessageCircle size={22} fill="currentColor" /> Chat via WhatsApp
                </a>
                <button
                  onClick={async () => {
                    try {
                      const res = await supportTicketService.getTicketByRideId(ride.id);
                      if (res.success && res.data) {
                        router.push(`/dashboard/support-tickets/${res.data.id}`);
                      } else {
                        // Create a new support ticket for this ride
                        const createRes = await supportTicketService.createTicket({
                          category: 'RIDE_ISSUE',
                          priority: 'MEDIUM',
                          subject: `Internal Chat for Ride #${ride.customId}`,
                          description: `Internal chat initiated for ride ${ride.customId} with partner ${ride.partner?.name}`,
                          customerType: 'PARTNER',
                          customerId: ride.partner?.id || '',
                          customerName: ride.partner?.name || 'Partner',
                          customerPhone: ride.partner?.phone,
                          rideId: ride.id
                        });
                        if (createRes.success && createRes.data) {
                          router.push(`/dashboard/support-tickets/${createRes.data.id}`);
                        }
                      }
                    } catch (err) {
                      console.error("Failed to handle internal chat:", err);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 px-5 py-4 border border-gray-300 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition text-base font-bold uppercase tracking-tight shadow-sm"
                >
                  <MessageCircle size={22} className="text-blue-500" /> Internal Chat
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4 mb-5 flex-wrap">
                  <span className="text-sm font-bold text-gray-500 uppercase">Filter:</span>
                  {(['VERIFIED', 'NV', 'NA'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded shadow-sm border border-gray-100">
                      <input
                        type="radio"
                        name="filter"
                        checked={filterBy === type}
                        onChange={() => setFilterBy(type)}
                        className="w-4 h-4 text-red-600 focus:ring-0"
                      />
                      <span className="text-sm font-bold text-gray-800">{type === 'VERIFIED' ? 'Verified' : type}</span>
                    </label>
                  ))}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="ml-auto bg-gray-200 p-2 rounded hover:bg-gray-300 transition text-gray-800 flex items-center gap-1 shadow-sm"
                    title="Add New Partner"
                  >
                    <Plus size={18} />
                    <span className="text-xs uppercase font-bold pr-1">Add</span>
                  </button>
                </div>

                <div className="relative mb-5">
                  <input
                    type="text"
                    placeholder="Search ID, Name, Phone..."
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    className={inputStyle}
                  />
                  {partnerSearch.length >= 2 && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                      {isSearchingPartners ? (
                        <div className="p-8 text-center">
                          <Loader2 className="mx-auto animate-spin text-gray-400 mb-2" />
                          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Searching Backend...</p>
                        </div>
                      ) : filteredPartners.length > 0 ? (
                        filteredPartners.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPartnerId(p.id);
                              setSelectedPartner(p);
                              setPartnerSearch(p.name);
                              setSuggestedPartners([]);
                            }}
                            className={`w-full text-left px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-red-50 transition-colors ${selectedPartnerId === p.id ? 'bg-red-50' : ''}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-gray-900 text-base">{p.name}</span>
                              <span className="text-red-700 font-mono text-sm font-bold bg-white px-2 py-1 rounded shadow-sm border border-gray-100">{p.customId}</span>
                            </div>
                            <div className="text-sm text-gray-600 font-medium">{p.phone}</div>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center text-red-500">
                          <AlertCircle className="mx-auto mb-2 w-8 h-8 opacity-50" />
                          <p className="text-lg font-black uppercase tracking-tighter">Not there</p>
                          <p className="text-xs font-bold text-gray-400 uppercase mt-1">No partners found with these details</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4">
                  <button
                    onClick={handleAssignPartner}
                    disabled={isUpdating || !selectedPartnerId || isLocked}
                    className="w-full bg-[#1e293b] text-white px-5 py-4 rounded-xl text-base font-bold uppercase hover:bg-black transition-colors disabled:opacity-50 shadow-md"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Tables (2 Columns on large screens) */}
        <div className="col-span-1 lg:col-span-8 flex flex-col md:flex-row gap-8">

          {/* User Price Details */}
          <div className={`${cardStyle} flex-1`}>
            <h2 className={headerStyle}>User Price Details</h2>

            <table className="w-full mb-6 text-base font-medium text-gray-700">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5">Base Price</td>
                  <td className="py-3.5 text-right font-mono font-bold text-gray-900 text-lg">₹ {ride.baseFare.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5">Extra Km</td>
                  <td className="py-3.5 text-right font-mono font-bold text-red-600 text-lg">{ride.distanceKm?.toFixed(2)} KM</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5">Per Km Charge</td>
                  <td className="py-3.5 text-right font-mono font-bold text-gray-900 text-lg">₹ {ride.perKmPrice.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5">Extra Km Charges</td>
                  <td className="py-3.5 text-right font-mono font-bold text-gray-900 text-lg">₹ {frontendExtraKmCharges.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <td className="py-3.5 px-3">GST (5%)</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-gray-600 text-lg">₹ {frontendGst.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="space-y-4 mt-auto bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">Permit</span>
                <div className="flex items-center bg-white border border-gray-300 rounded shadow-sm focus-within:ring-2 focus-within:ring-[#673AB7]/30 transition-all">
                  <span className="pl-3 pr-2 text-gray-400 text-base font-bold">₹</span>
                  <input type="number" min="0" value={taxes || ''} disabled={isLocked} onChange={e => setTaxes(Math.max(0, Number(e.target.value)))} className="w-24 text-right outline-none py-2 pr-3 font-mono text-base font-bold text-gray-900 bg-transparent disabled:opacity-50" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">Toll Charges</span>
                <div className="flex items-center bg-white border border-gray-300 rounded shadow-sm focus-within:ring-2 focus-within:ring-[#673AB7]/30 transition-all">
                  <span className="pl-3 pr-2 text-gray-400 text-base font-bold">₹</span>
                  <input type="number" min="0" value={tollCharges || ''} disabled={isLocked} onChange={e => setTollCharges(Math.max(0, Number(e.target.value)))} className="w-24 text-right outline-none py-2 pr-3 font-mono text-base font-bold text-gray-900 bg-transparent disabled:opacity-50" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">Additional</span>
                <div className="flex items-center bg-white border border-gray-300 rounded shadow-sm focus-within:ring-2 focus-within:ring-[#673AB7]/30 transition-all">
                  <span className="pl-3 pr-2 text-gray-400 text-base font-bold">₹</span>
                  <input type="number" min="0" value={additionalCharges || ''} disabled={isLocked} onChange={e => setAdditionalCharges(Math.max(0, Number(e.target.value)))} className="w-24 text-right outline-none py-2 pr-3 font-mono text-base font-bold text-gray-900 bg-transparent disabled:opacity-50" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t-2 border-gray-200 flex justify-between items-end">
              <span className="text-base font-black text-gray-800 uppercase tracking-tight">Total Amount</span>
              <span className="text-3xl lg:text-4xl font-black text-gray-900 font-mono tracking-tighter">₹ {frontendTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Partner Price Details */}
          <div className={`${cardStyle} flex-1 bg-gradient-to-br from-white to-gray-50 border-gray-200`}>
            <h2 className={headerStyle}>Partner Price Details</h2>

            <table className="w-full mb-6 text-base font-medium text-gray-700">
              <tbody>
                <tr className="border-b border-gray-100 px-3">
                  <td className="py-3.5">Partner Base (80%)</td>
                  <td className="py-3.5 text-right font-mono font-bold text-gray-900 text-lg">₹ {(ride.baseFare * 0.8).toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5">Extra Km</td>
                  <td className="py-3.5 text-right font-mono font-bold text-red-600 text-lg">{ride.distanceKm?.toFixed(2)} KM</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5">Per Km Charge (80%)</td>
                  <td className="py-3.5 text-right font-mono font-bold text-gray-900 text-lg">₹ {(ride.perKmPrice * 0.8).toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5">Extra Km Charges</td>
                  <td className="py-3.5 text-right font-mono font-bold text-gray-900 text-lg">₹ {(frontendExtraKmCharges * 0.8).toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5">Toll Charges</td>
                  <td className="py-3.5 text-right font-mono font-bold text-gray-900 text-lg">₹ {tollCharges.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5">Additional Charges</td>
                  <td className="py-3.5 text-right font-mono font-bold text-gray-900 text-lg">₹ {additionalCharges.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-auto bg-blue-50/80 p-5 rounded-xl border border-blue-200 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-700 uppercase tracking-tight">Manual Adjustment (+/-)</span>
                <div className="flex items-center bg-white border border-blue-300 rounded shadow-sm focus-within:ring-2 focus-within:ring-blue-400/50 transition-all">
                  <span className="pl-3 pr-2 text-blue-500 text-base font-bold">₹</span>
                  <input
                    type="number"
                    value={manualAdj || ''}
                    disabled={isLocked}
                    onChange={e => setManualAdj(Number(e.target.value))}
                    className="w-24 text-right outline-none py-2 pr-3 font-mono text-base font-bold text-blue-700 bg-transparent disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t-2 border-gray-300 flex justify-between items-end">
              <span className="text-base font-black text-gray-800 uppercase tracking-tight">Partner Pay</span>
              <span className="text-3xl lg:text-4xl font-black text-[#2E7D32] font-mono tracking-tighter">
                ₹ {(((ride.riderEarnings || ride.partnerEarnings || 0) + tollCharges + additionalCharges + manualAdj) || 0).toFixed(2)}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Add Partner Modal */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Add New Partner</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Partner Full Name</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="E.g. Ramesh Kumar"
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 focus:border-[#673AB7] outline-none transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 border-2 border-gray-200 text-gray-600 px-4 py-3 rounded-xl text-lg font-bold">
                      +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={newPartnerPhone}
                      onChange={(e) => setNewPartnerPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 font-mono tracking-widest focus:border-[#673AB7] outline-none transition-colors shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors uppercase tracking-tight"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePartner}
                  disabled={isCreatingPartner || !newPartnerName || newPartnerPhone.length < 10}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-[#673AB7] text-white rounded-xl text-sm font-bold uppercase tracking-tight hover:bg-[#512DA8] shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {isCreatingPartner ? <Loader2 className="animate-spin" size={20} /> : 'Create Partner'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
