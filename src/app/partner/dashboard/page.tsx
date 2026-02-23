'use client';

import { useState, useEffect, useCallback } from 'react';
import { partnerService } from '@/services/partnerService';
import { PartnerDashboardData, Partner, Ride } from '@/types';
import { 
  MapPin, DollarSign, Star, Car, AlertCircle, 
  Navigation, Activity, RefreshCw, Power, 
  Map as MapIcon, ChevronRight, Clock, ShieldCheck
} from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { USER_KEYS } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PartnerDashboard() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [stats, setStats] = useState<PartnerDashboardData | null>(null);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [startingKm, setStartingKm] = useState('');
  const [endingKm, setEndingKm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await partnerService.getDashboard();
      if (response.success) {
        setStats(response.data);
        
        // Check for active rides in history
        if (response.data.rides.active > 0) {
          const ridesRes = await partnerService.getRides();
          if (ridesRes.success) {
            const active = ridesRes.data.find(r => ['ASSIGNED', 'ARRIVED', 'STARTED', 'ONGOING'].includes(r.status));
            setActiveRide(active || null);
          }
        } else {
          setActiveRide(null);
        }

        // If online and no active ride, fetch available rides
        if (response.data.status.isOnline && response.data.rides.active === 0) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const ridesRes = await partnerService.getAvailableRides(pos.coords.latitude, pos.coords.longitude);
            if (ridesRes.success) setAvailableRides(ridesRes.data);
          }, (err) => {
            console.error('Location error:', err);
            toast.error('Could not get your location for available rides.');
          });
        } else {
          setAvailableRides([]);
        }
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      setError('An error occurred while loading dashboard statistics');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.partner);
    if (stored) setPartner(JSON.parse(stored));
    fetchData();
    
    // Auto refresh every 30 seconds if online
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleToggleOnline = async () => {
    if (!stats) return;
    const newStatus = !stats.status.isOnline;
    
    try {
      let lat = 0, lng = 0;
      if (newStatus) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }

      const res = await partnerService.toggleOnlineStatus(newStatus, lat, lng);
      if (res.success) {
        setStats(prev => prev ? {
          ...prev,
          status: { ...prev.status, isOnline: newStatus }
        } : null);
        toast.success(`You are now ${newStatus ? 'ONLINE' : 'OFFLINE'}`);
        if (newStatus) fetchData(true);
        else setAvailableRides([]);
      }
    } catch (err) {
      toast.error('Location access required to go online');
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    setIsSubmitting(true);
    try {
      const res = await partnerService.acceptRide(rideId);
      if (res.success) {
        toast.success('Ride Accepted! Navigate to pickup location.');
        fetchData(true);
      } else {
        toast.error(res.message || 'Could not accept ride');
      }
    } catch (err) {
      toast.error('Failed to accept ride');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: 'ARRIVED' | 'STARTED' | 'ONGOING') => {
    if (!activeRide) return;
    if (status === 'ONGOING' && otpValue.length !== 4) {
      toast.error('Please enter 4-digit User OTP');
      return;
    }

    if (status === 'ONGOING' && activeRide.serviceType === 'RENTAL') {
      if (!startingKm || Number(startingKm) < 0) {
        toast.error('Please enter a valid starting odometer reading (KM)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const options: any = {};
      if (status === 'ONGOING') {
        options.userOtp = otpValue;
        if (activeRide.serviceType === 'RENTAL') {
          options.startingKm = Number(startingKm);
        }
      }

      const res = await partnerService.updateRideStatus(activeRide.id, status, options);
      if (res.success) {
        toast.success(`Ride status updated to ${status}`);
        if (status === 'ONGOING') setOtpValue('');
        fetchData(true);
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    
    const options: any = {};
    if (activeRide.serviceType === 'RENTAL') {
      if (!endingKm || Number(endingKm) <= 0) {
        toast.error('Please enter a valid ending odometer reading (KM)');
        return;
      }
      options.endingKm = Number(endingKm);
    }

    setIsSubmitting(true);
    try {
      const res = await partnerService.updateRideStatus(activeRide.id, 'COMPLETED', options);
      if (res.success) {
        toast.success('Ride Completed successfully! 🎉');
        fetchData(true);
      } else {
        toast.error(res.message || 'Completion failed');
      }
    } catch (err) {
      toast.error('Failed to complete ride');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-red-50 rounded-3xl border border-red-100 animate-in fade-in zoom-in duration-300">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => fetchData()}
          className="px-6 py-2 bg-[#E32222] text-white rounded-xl font-medium hover:bg-red-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#121212] via-[#2A2A2A] to-[#121212] rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E32222]/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                 <span className="text-2xl">👋</span>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  {partner?.name || 'Partner'}
                </h1>
                <p className="text-gray-400 font-medium text-sm flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" /> Professional Partner • {partner?.customId}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => fetchData(true)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90 border border-white/10 shadow-lg"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            
            <div className={`flex items-center gap-4 p-2 pl-6 rounded-3xl border transition-all duration-500 backdrop-blur-xl shadow-lg ${stats?.status.isOnline ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-0.5">Live Status</p>
                <p className={`text-md font-black tracking-tight ${stats?.status.isOnline ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {stats?.status.isOnline ? 'ONLINE' : 'OFFLINE'}
                </p>
              </div>
              <button 
                onClick={handleToggleOnline}
                disabled={isSubmitting}
                className={`w-16 h-9 rounded-[1.25rem] transition-all duration-500 relative flex items-center ${stats?.status.isOnline ? 'bg-emerald-500' : 'bg-white/10 shadow-inner'}`}
              >
                <div className={`absolute w-7 h-7 bg-white rounded-full transition-all duration-500 flex items-center justify-center shadow-xl ${stats?.status.isOnline ? 'left-8 scale-100' : 'left-1 scale-90 opacity-80'}`}>
                  <Power size={14} className={stats?.status.isOnline ? 'text-emerald-600' : 'text-gray-400'} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatCard 
          title="Daily Rides" 
          value={stats?.rides.today.toString() || '0'} 
          icon={<MapPin className="text-[#3b82f6]" />}
          footer={`${stats?.rides.active || 0} active currently`}
          color="blue"
        />
        <ModernStatCard 
          title="Earnings" 
          value={`₹${stats?.earnings.todayEarnings.toLocaleString('en-IN') || '0'}`} 
          icon={<DollarSign className="text-[#10b981]" />}
          footer={`₹${stats?.earnings.total.toLocaleString('en-IN') || '0'} total career`}
          color="emerald"
        />
        <ModernStatCard 
          title="Satisfaction" 
          value={stats?.status.rating.toFixed(1) || '0.0'} 
          icon={<Star className="text-[#f59e0b]" />}
          footer={`${stats?.rides.completionRate}% completion rate`}
          color="amber"
          isHighlight
        />
        <ModernStatCard 
          title="Performance" 
          value={stats?.rides.completed.toString() || '0'} 
          icon={<Activity className="text-[#6366f1]" />}
          footer="All-time completions"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Action Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Ride Section */}
          {activeRide && (
            <div className="bg-[#121212] rounded-[2rem] p-8 text-white shadow-2xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black italic flex items-center gap-3">
                      <span className="flex h-3 w-3 bg-emerald-500 rounded-full animate-ping" />
                      Active Ride
                   </h2>
                   <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                      {activeRide.status}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <ActiveRidePoint label="Pickup Address" address={activeRide.pickupAddress} color="emerald" />
                    <ActiveRidePoint label="Drop Address" address={activeRide.dropAddress} color="red" />
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                       <p className="text-sm font-bold text-white/50">Expected Fare</p>
                       <p className="text-2xl font-black text-emerald-400">₹{activeRide.totalFare}</p>
                    </div>

                    {(activeRide.status === 'STARTED') && (
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          maxLength={4}
                          placeholder="Enter 4-digit OTP"
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-xl font-black tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        {activeRide.serviceType === 'RENTAL' && (
                          <input 
                            type="number" 
                            placeholder="Starting Odometer (KM)"
                            value={startingKm}
                            onChange={(e) => setStartingKm(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-xl font-black focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                        )}
                      </div>
                    )}

                    {(activeRide.status === 'ONGOING' && activeRide.serviceType === 'RENTAL') && (
                      <div className="space-y-4">
                          <input 
                            type="number" 
                            placeholder="Ending Odometer (KM)"
                            value={endingKm}
                            onChange={(e) => setEndingKm(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-xl font-black focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      {activeRide.status === 'ASSIGNED' && (
                        <ActionButton label="I have Arrived" onClick={() => handleUpdateStatus('ARRIVED')} loading={isSubmitting} color="bg-emerald-500" />
                      )}
                      {activeRide.status === 'ARRIVED' && (
                        <ActionButton label="Start Ride" onClick={() => handleUpdateStatus('STARTED')} loading={isSubmitting} color="bg-emerald-500" />
                      )}
                      {activeRide.status === 'STARTED' && (
                        <ActionButton label="Begin Trip (OTP)" onClick={() => handleUpdateStatus('ONGOING')} loading={isSubmitting} color="bg-emerald-500" />
                      )}
                      {activeRide.status === 'ONGOING' && (
                        <ActionButton label="Complete Ride" onClick={handleCompleteRide} loading={isSubmitting} color="bg-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Rides Section */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3 italic">
                {stats?.status.isOnline && !activeRide ? (
                  <><span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span> Live Opportunities</>
                ) : (
                  <><Navigation className="text-gray-400" /> Recent Activity</>
                )}
              </h2>
            </div>

            {!stats?.status.isOnline ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Power size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">You are currently Offline</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2">Go online to start receiving ride requests and tracking your earnings in real-time.</p>
                </div>
                <button 
                  onClick={handleToggleOnline}
                  className="mt-4 px-8 py-3 bg-[#121212] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                  Go Online Now
                </button>
              </div>
            ) : availableRides.length > 0 ? (
              <div className="space-y-4">
                {availableRides.map(ride => (
                  <RideRequestCard key={ride.id} ride={ride} onAccept={() => handleAcceptRide(ride.id)} loading={isSubmitting} />
                ))}
              </div>
            ) : activeRide ? (
              <div className="py-20 text-center space-y-4">
                 <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-300">
                  <Activity size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Focused on Active Ride</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2">Complete your current ride to see more opportunities.</p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 animate-pulse">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-300">
                  <MapIcon size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">Scanning for rides...</h3>
                  <p className="text-emerald-600/60 max-w-xs mx-auto mt-2 font-medium">New requests in your area will appear here automatically.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidemenu Info */}
        <div className="lg:col-span-4 space-y-8">
           {/* Current Vehicle */}
           <div className="group relative overflow-hidden bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-emerald-200 transition-all duration-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
            <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <Car className="text-emerald-500" size={20} /> My Vehicle
            </h2>
            {stats?.assignedVehicle ? (
              <div className="space-y-6">
                <div className="relative w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner">
                   <Car size={80} className="text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                   <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white shadow-sm">
                      <p className="text-[10px] font-black text-emerald-600 uppercase italic">Active Gear</p>
                   </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Model" value={stats.assignedVehicle.vehicleModel} />
                    <DetailItem label="Registration" value={stats.assignedVehicle.registrationNumber} isHighlight />
                  </div>
                  <DetailItem label="Category" value={stats.assignedVehicle.vehicleType.displayName} />
                  <DetailItem label="Vehicle ID" value={stats.assignedVehicle.customId} color="text-emerald-600" />
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <Car size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No vehicle assigned</p>
              </div>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-[#121212] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500" />
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 italic">
              <Activity className="text-white/40" size={20} /> Insights
            </h2>
            <div className="space-y-5">
              <InsightRow label="Success Rate" value={`${stats?.rides.completionRate}%`} color="emerald" />
              <InsightRow label="Cancelled Rides" value={stats?.rides.cancelled.toString() || '0'} color="red" />
              <div className="pt-5 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Gross Turnaround</p>
                  <p className="text-3xl font-black text-white italic">₹{stats?.earnings.totalFare.toLocaleString('en-IN') || '0'}</p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors pointer-events-auto cursor-pointer">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernStatCard({ title, value, icon, footer, color, isHighlight = false }: any) {
  const colors: any = {
    blue: 'border-blue-100 hover:border-blue-400 group-hover:bg-blue-50/50',
    emerald: 'border-emerald-100 hover:border-emerald-400 group-hover:bg-emerald-50/50',
    amber: 'border-amber-100 hover:border-amber-400 group-hover:bg-amber-50/50',
    indigo: 'border-indigo-100 hover:border-indigo-400 group-hover:bg-indigo-50/50',
  };

  const bgStyles: any = {
    blue: 'bg-blue-50 text-blue-500',
    emerald: 'bg-emerald-50 text-emerald-500',
    amber: 'bg-amber-50 text-amber-500',
    indigo: 'bg-indigo-50 text-indigo-500',
  };

  return (
    <div className={`group bg-white p-7 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl ${colors[color]} ${isHighlight ? 'ring-2 ring-emerald-50 ring-offset-2' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${bgStyles[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-800 tracking-tighter">{value}</h3>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
          <ChevronRight size={10} /> {footer}
        </p>
      </div>
    </div>
  );
}

function DetailItem({ label, value, isHighlight = false, color = 'text-gray-800' }: any) {
  return (
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-sm font-black ${isHighlight ? 'text-emerald-600 font-mono tracking-wider' : color}`}>{value}</p>
    </div>
  );
}

function InsightRow({ label, value, color }: any) {
  const colorMap: any = {
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
  };
  return (
    <div className="flex justify-between items-center group/item cursor-default">
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${colorMap[color]} shadow-[0_0_8px_rgba(0,0,0,0.3)] shadow-${color}-400/50`} />
        <span className="text-sm font-bold text-white/70 group-hover/item:text-white transition-colors">{label}</span>
      </div>
      <span className="font-black text-white">{value}</span>
    </div>
  );
}

function ActiveRidePoint({ label, address, color }: { label: string, address: string, color: 'emerald' | 'red' }) {
  return (
    <div className="flex items-start gap-4 group/point">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
      <div>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-white/90 line-clamp-2 leading-relaxed">{address}</p>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, loading, color, icon }: { label: string, onClick: () => void, loading?: boolean, color?: string, icon?: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 ${color || 'bg-white text-black'}`}
    >
      {loading ? (
        <RefreshCw size={16} className="animate-spin" />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}

function RideRequestCard({ ride, onAccept, loading }: { ride: Ride, onAccept: () => void, loading?: boolean }) {
  return (
    <div className="group relative bg-gray-50/50 hover:bg-emerald-50 p-6 rounded-3xl border border-gray-100 hover:border-emerald-200 transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
           <MapPin className="text-[#E32222]" size={24} />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">New Booking Request</p>
              <h4 className="text-lg font-black text-gray-800 tracking-tight italic">#{ride.customId}</h4>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-600">₹{ride.totalFare}</p>
              <p className="text-[10px] font-bold text-gray-400">Fixed Fare</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <p className="text-xs font-bold text-gray-600 line-clamp-2">{ride.pickupAddress}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <p className="text-xs font-medium text-gray-500 line-clamp-2">{ride.dropAddress}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
               <Navigation size={14} /> {ride.distanceKm.toFixed(1)} Km
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
               <Clock size={14} /> Instant
            </div>
          </div>
        </div>
        <button 
          onClick={onAccept}
          disabled={loading}
          className="w-full md:w-auto px-8 py-3 bg-[#E32222] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all hover:shadow-xl hover:shadow-red-200 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? <RefreshCw size={16} className="animate-spin mx-auto" /> : 'Accept & Drive'}
        </button>
      </div>
    </div>
  );
}
