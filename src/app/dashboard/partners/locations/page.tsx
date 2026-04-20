'use client';

import { useState, useEffect } from 'react';
import PartnerLocationsMap, { RideMarker, PartnerLocation } from '@/components/PartnerLocationsMap';
import { adminRideService } from '@/services/adminRideService';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Globe,
  Shield,
  Zap,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  UserPlus,
  Loader2,
  Car,
  Phone,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function PartnerLocationsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Ride assignment state
  const [unassignedRides, setUnassignedRides] = useState<RideMarker[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideMarker | null>(null);
  const [isLoadingRides, setIsLoadingRides] = useState(true);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    partner: PartnerLocation;
    ride: RideMarker;
  } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchUnassignedRides();
  };

  const fetchUnassignedRides = async () => {
    setIsLoadingRides(true);
    try {
      // Use the new dynamic time-based query
      const res = await adminRideService.getLiveUnassignedRides();
      
      const unassigned = (res.data || []).map((r: any) => ({
        id: r.id,
        customId: r.customId || r.id.slice(-6),
        pickupLat: r.pickupLat,
        pickupLng: r.pickupLng,
        pickupAddress: r.pickupAddress,
        dropAddress: r.dropAddress,
        totalFare: r.totalFare || 0,
        distanceKm: r.distanceKm || 0,
        status: r.status,
        userName: r.user?.name || 'Walk-in',
        userPhone: r.user?.phone || 'N/A',
        vehicleCategory: r.vehicleType?.category || 'CAR',
        scheduledDateTime: r.scheduledDateTime,
        // New Expiry fields
        effectivePickupTime: r.effectivePickupTime,
        expiresAt: r.expiresAt,
        timeRemainingMinutes: r.timeRemainingMinutes,
        urgencyLevel: r.urgencyLevel,
      }));

      setUnassignedRides(unassigned);
    } catch (error) {
      console.error('Failed to fetch unassigned rides:', error);
    } finally {
      setIsLoadingRides(false);
    }
  };

  useEffect(() => {
    fetchUnassignedRides();
    // Poll every 30s for new rides
    const interval = setInterval(fetchUnassignedRides, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRideSelect = (ride: RideMarker) => {
    setSelectedRide(prev => prev?.id === ride.id ? null : ride);
  };

  const handlePartnerSelect = (partner: PartnerLocation, ride: RideMarker) => {
    setConfirmModal({ partner, ride });
  };

  const handleConfirmAssign = async () => {
    if (!confirmModal) return;
    setIsAssigning(true);
    try {
      await adminRideService.manualAssignPartner(confirmModal.ride.id, confirmModal.partner.id);
      toast.success(`${confirmModal.partner.name} assigned to ride ${confirmModal.ride.customId}`);
      setConfirmModal(null);
      setSelectedRide(null);
      // Remove from list
      setUnassignedRides(prev => prev.filter(r => r.id !== confirmModal.ride.id));
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to assign captain';
      toast.error(msg);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in space-y-6 max-w-[1800px] mx-auto pb-6 px-2 lg:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Fleet Intelligence
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Real-Time Geospatial Tracking & Ride Assignment</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={14} className={refreshTrigger > 0 ? 'animate-spin' : ''} />
            Sync Telemetry
          </button>
          {unassignedRides.length > 0 && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
            >
              <AlertTriangle size={14} />
              {unassignedRides.length} Unassigned
              {sidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
          <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gray-100">
            <Globe size={16} className="text-red-500" />
            Global Fleet View
          </div>
        </div>
      </div>

      {/* Map + Sidebar Container */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Map Terminal */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-2xl shadow-gray-100 border border-gray-100 p-2 overflow-hidden relative">
          {/* Assignment mode indicator */}
          {selectedRide && (
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3 px-5 py-3 bg-blue-600/90 backdrop-blur-sm text-white rounded-2xl shadow-xl animate-fade-in">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Assignment Mode — Click a nearby driver to assign
              </span>
              <button onClick={() => setSelectedRide(null)} className="ml-2 hover:bg-white/20 rounded-lg p-1 transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="w-full h-full rounded-[1.75rem] overflow-hidden">
            <PartnerLocationsMap
              refreshTrigger={refreshTrigger}
              rides={unassignedRides}
              selectedRide={selectedRide}
              onRideSelect={handleRideSelect}
              onPartnerSelect={handlePartnerSelect}
              assignMode={!!selectedRide}
            />
          </div>
        </div>

        {/* Right Sidebar — Unassigned Rides */}
        {sidebarOpen && unassignedRides.length > 0 && (
          <div className="w-[340px] shrink-0 bg-white rounded-[2rem] shadow-2xl shadow-gray-100 border border-gray-100 flex flex-col overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-5 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-amber-500 rounded-full" />
                  <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Ride Queue</h2>
                </div>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                  {unassignedRides.length}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-2 ml-5">
                Tap a ride to locate on map, then assign a nearby captain.
              </p>
            </div>

            {/* Rides List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {isLoadingRides ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-gray-300" />
                </div>
              ) : (
                unassignedRides.map((ride) => {
                  const isActive = selectedRide?.id === ride.id;
                  const emoji = ride.vehicleCategory === 'BIKE' ? '🏍️' : ride.vehicleCategory === 'AUTO' ? '🛺' : '🚗';

                  return (
                    <button
                      key={ride.id}
                      onClick={() => handleRideSelect(ride)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-50'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      {/* Ride Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{emoji}</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                            {ride.customId}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          ride.status === 'SCHEDULED'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {ride.status}
                        </span>
                      </div>

                        {/* Pickup / Drop */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          <p className="text-[11px] font-bold text-gray-700 line-clamp-1">{ride.pickupAddress}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0" />
                          <p className="text-[11px] font-medium text-gray-400 line-clamp-1">{ride.dropAddress}</p>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold mb-3">
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} />
                          ₹{ride.totalFare?.toFixed(0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation size={10} />
                          {ride.distanceKm?.toFixed(1)} km
                        </span>
                      </div>

                      {/* Expiry/Urgency Row */}
                      <div className="flex items-center justify-between border-t border-gray-50 pt-2.5">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pickup</span>
                          <span className="text-[10px] font-medium text-gray-600">
                            {ride.effectivePickupTime ? new Date(ride.effectivePickupTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${
                          ride.urgencyLevel === 'RED' ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' :
                          ride.urgencyLevel === 'GREEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {ride.timeRemainingMinutes !== undefined 
                            ? `Expires in ${ride.timeRemainingMinutes}m` 
                            : 'Computing...'}
                        </div>
                      </div>

                      {/* User */}
                      <div className="mt-2.5 pt-2.5 border-t border-gray-50 flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                        <UserPlus size={10} />
                        {ride.userName} • {ride.userPhone}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Terminal Footer Info */}
      <div className="flex items-center justify-center gap-6 px-8 py-3 bg-gray-50 rounded-full border border-gray-100 w-fit mx-auto shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-amber-500" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Node Sync: Instantaneous</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Grid Status: NOMINAL
        </p>
      </div>

      {/* ====== ASSIGNMENT CONFIRMATION MODAL ====== */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title="Confirm Assignment"
      >
        {confirmModal && (
          <div className="space-y-6 p-2">
            {/* Ride Info */}
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                <MapPin size={12} />
                Ride {confirmModal.ride.customId}
              </div>
              <div className="space-y-1.5 ml-4">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm font-bold text-gray-700">{confirmModal.ride.pickupAddress}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm text-gray-500">{confirmModal.ride.dropAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4 text-xs text-gray-500 font-bold">
                <span>₹{confirmModal.ride.totalFare?.toFixed(0)}</span>
                <span>{confirmModal.ride.distanceKm?.toFixed(1)} km</span>
                <span>{confirmModal.ride.userName}</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <ChevronRight size={20} className="text-emerald-600 rotate-90" />
              </div>
            </div>

            {/* Partner Info */}
            <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <UserPlus size={12} />
                Assigning Captain
              </div>
              <div className="ml-4 space-y-2">
                <p className="text-lg font-black text-gray-900">{confirmModal.partner.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><Phone size={10} /> {confirmModal.partner.phone}</span>
                  <span className="flex items-center gap-1"><Car size={10} /> {confirmModal.partner.registrationNumber}</span>
                </div>
                <p className="text-xs font-bold text-emerald-600">{confirmModal.partner.vehicleType} • {confirmModal.partner.customId}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmAssign}
                disabled={isAssigning}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAssigning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Confirm Assignment
              </button>
              <button
                onClick={() => setConfirmModal(null)}
                className="w-full py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
