'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw, ChevronLeft, ChevronRight, Search,
  RotateCcw, Plus, MoreHorizontal, X, Filter, Download,
  Calendar, Car, User, Briefcase, Route
} from 'lucide-react';
import { adminRideService } from '@/services/adminRideService';
import { Ride, RideStatus, RideFilters } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { exportToCSV } from '@/utils/csvExport';

const STATUS_TABS: { label: string; value: RideStatus | 'ALL' }[] = [
  { label: 'Requested', value: 'REQUESTED' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Initiated', value: 'INITIATED' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Arrived', value: 'ARRIVED' },
  { label: 'Started', value: 'STARTED' },
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Stopped', value: 'FUTURE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'All', value: 'ALL' },
];

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RideStatus | 'ALL'>('ALL'); // Default to ALL as requested
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    reqId: '',
    name: '',
    mobile: '',
    service: '',
    payment: '',
    driver: '',
    status: '',
    date: '',
    vehicle: '',
    agentCode: ''
  });

  const fetchRides = async () => {
    setIsLoading(true);
    try {
      const response = await adminRideService.getAllRides();
      setRides(response.data || []);
    } catch (error) {
      console.error('Failed to fetch rides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const filteredRides = rides.filter(ride => {
    const statusMatch = activeTab === 'ALL' || ride.status === activeTab;
    const reqIdMatch = !filters.reqId || ride.customId?.toLowerCase().includes(filters.reqId.toLowerCase());
    const nameMatch = !filters.name || ride.user?.name?.toLowerCase().includes(filters.name.toLowerCase());
    const mobileMatch = !filters.mobile || ride.user?.phone?.includes(filters.mobile);
    const driverMatch = !filters.driver || ride.partner?.name?.toLowerCase().includes(filters.driver.toLowerCase());
    const vehicleMatch = !filters.vehicle || ride.vehicleType?.displayName?.toLowerCase().includes(filters.vehicle.toLowerCase());

    return statusMatch && reqIdMatch && nameMatch && mobileMatch && driverMatch && vehicleMatch;
  });

  const handleExport = () => {
    const dataToExport = filteredRides.map(ride => ({
      'Req ID': ride.customId || 'N/A',
      'Source': ride.pickupAddress || 'N/A',
      'Destination': ride.dropAddress || 'N/A',
      'Date': new Date(ride.createdAt).toLocaleDateString(),
      'Name': ride.user?.name || 'N/A',
      'Mobile': ride.user?.phone || 'N/A',
      'Service': ride.serviceType || 'City To Airport',
      'Payment Mode': ride.paymentMode || 'Cash',
      'Vehicle': ride.vehicleType?.displayName || 'SEDAN',
      'Distance (km)': ride.distanceKm?.toFixed(1) || '0',
      'Driver': ride.partner?.name || 'N/A',
      'Total Cost': ride.totalFare?.toFixed(2) || '0',
      'Conf. Fee Paid': ride.advanceAmount?.toFixed(2) || '0',
      'Ref No.': ride.transactionId || 'N/A',
      'Status': ride.status
    }));
    exportToCSV(dataToExport, `Rides_Export_${new Date().toISOString().slice(0, 10)}`);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Booking Management</h1>
          <p className="text-sm text-gray-500 font-medium">View, filter, and manage all incoming and historical rides.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-green-100 hover:shadow-sm border border-green-200 transition-all active:scale-95"
            title="Download currently filtered rides as CSV"
          >
            <Download size={16} /> Export CSV
          </button>
          <Link
            href="/dashboard/rides/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E32222] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#cc1f1f] shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            New Booking
          </Link>
          <button
            onClick={fetchRides}
            className="p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Modern Tabs Design */}
      <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide gap-1 w-full">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 text-[13px] font-bold transition-all whitespace-nowrap rounded-xl ${
                activeTab === tab.value
                  ? 'bg-red-50 text-[#E32222] shadow-sm ring-1 ring-red-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Filter size={16} className="text-[#E32222]" /> Advanced Filters
          </div>
          <div className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            Showing <span className="text-[#E32222]">{filteredRides.length}</span> results
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 2xl:grid-cols-6 gap-3">
          <input
            type="text" placeholder="Req ID"
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:bg-white transition-all font-medium"
            value={filters.reqId} onChange={e => setFilters({ ...filters, reqId: e.target.value })}
          />
          <input 
            type="date" 
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:bg-white transition-all font-medium text-gray-600" 
          />
          <input
            type="text" placeholder="Passenger Name"
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:bg-white transition-all font-medium"
            value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })}
          />
          <input
            type="text" placeholder="Mobile Number"
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:bg-white transition-all font-medium"
            value={filters.mobile} onChange={e => setFilters({ ...filters, mobile: e.target.value })}
          />
          <input
            type="text" placeholder="Driver Name"
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:bg-white transition-all font-medium"
            value={filters.driver} onChange={e => setFilters({ ...filters, driver: e.target.value })}
          />
          <input
            type="text" placeholder="Vehicle Category"
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:bg-white transition-all font-medium"
            value={filters.vehicle} onChange={e => setFilters({ ...filters, vehicle: e.target.value })}
          />
          <div className="flex gap-2 lg:col-span-5 2xl:col-span-6 justify-end mt-1">
            <button 
              onClick={() => setFilters({ reqId: '', name: '', mobile: '', service: '', payment: '', driver: '', status: '', date: '', vehicle: '', agentCode: '' })} 
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Trip Cards Feed */}
      <div className="space-y-4">
        {filteredRides.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-4">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Bookings Found</h3>
            <p className="text-sm font-medium text-gray-500 max-w-sm">We couldn't find any rides matching your current filters. Try clearing them to see all bookings.</p>
          </div>
        ) : (
          filteredRides.map((ride) => (
            <div key={ride.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col xl:flex-row relative">
              
              {/* Status Accent Line (Left border effect) */}
              <div className={`w-1.5 hidden xl:block shrink-0 ${
                ride.status === 'COMPLETED' ? 'bg-green-500' :
                ride.status === 'CANCELLED' ? 'bg-red-500' :
                ride.status === 'ONGOING' || ride.status === 'STARTED' ? 'bg-blue-500' :
                'bg-orange-400'
              }`} />

              {/* SECTION 1: Identity & Status (15%) */}
              <div className="p-5 border-b xl:border-b-0 xl:border-r border-gray-100 xl:w-[220px] shrink-0 flex flex-row xl:flex-col justify-between xl:justify-start items-center xl:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-black text-gray-900 tracking-tight">{ride.customId || 'N/A'}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md tracking-wider ${ride.isManualBooking ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                      {ride.isManualBooking ? 'DASH' : 'WEB'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 mb-3">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400" />
                      {new Date(ride.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 ml-4">
                      {new Date(ride.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
                
                <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-lg shadow-sm border ${
                  ride.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                  ride.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                  ride.status === 'ONGOING' || ride.status === 'STARTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                  {ride.status === 'UPCOMING' ? 'CONFIRMED' : ride.status}
                </span>
              </div>

              {/* SECTION 2: Route & Services (30%) */}
              <div className="p-5 border-b xl:border-b-0 xl:border-r border-gray-100 flex-1 flex flex-col justify-center">
                <div className="flex items-start gap-3 mb-4 relative">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-green-200 z-10" />
                    <div className="w-0.5 h-8 bg-gray-200 my-0.5" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-red-500 border-2 border-red-200 z-10" />
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pickup</p>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1 leading-snug" title={ride.pickupAddress}>{ride.pickupAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Drop</p>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1 leading-snug" title={ride.dropAddress}>{ride.dropAddress || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pl-6">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md flex items-center gap-1">
                    <Route size={10} /> {ride.distanceKm?.toFixed(1) || '0'} km
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                    <Briefcase size={10} /> {ride.serviceType || 'City To Airport'}
                  </span>
                </div>
              </div>

              {/* SECTION 3: People & Vehicles (25%) */}
              <div className="p-5 border-b xl:border-b-0 xl:border-r border-gray-100 flex-1 flex flex-col gap-4">
                {/* Passenger */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User size={16} strokeWidth={2.5}/>
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Passenger</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{ride.user?.name || 'Unknown'}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5 truncate">+{ride.user?.phone || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Driver */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Car size={16} strokeWidth={2.5}/>
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Assigned Asset</p>
                    {ride.partner ? (
                      <Link href={`/dashboard/partners/${ride.partner.id}/view`} className="text-sm font-bold text-red-600 hover:text-red-800 hover:underline truncate transition-colors">
                        {ride.partner.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-gray-400 italic">Unassigned</span>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-bold text-gray-700 truncate">{ride.vehicleType?.displayName || 'SEDAN'}</span>
                      <span className="text-[10px] font-medium text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded-md">
                        {ride.vehicleType?.category === 'CAR' ? '4+1' : ride.vehicleType?.category || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Financials & Action (20%) */}
              <div className="p-5 xl:w-[260px] shrink-0 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Fare</p>
                    {ride.discountAmount && ride.discountAmount > 0 ? (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-wider rounded">
                        -₹{ride.discountAmount.toFixed(0)} Off
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">
                    ₹{ride.totalFare?.toFixed(0) || '0'}
                  </h3>
                  
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="px-2 py-1 bg-white border border-gray-200 text-gray-700 text-[10px] font-bold uppercase rounded-md shadow-sm">
                        {ride.paymentMode || 'CASH'}
                      </span>
                      {ride.advanceAmount && ride.advanceAmount > 0 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-md shadow-sm border border-green-200">
                          FEE PAID: ₹{ride.advanceAmount}
                        </span>
                      ) : (
                        <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-md shadow-sm border ${
                          ride.status === 'COMPLETED' ? 'bg-green-500 text-white border-green-600' : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {ride.status === 'COMPLETED' ? 'PAID' : 'UNPAID'}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md shadow-sm border ${
                        ride.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200'
                      }`}>
                        CNR: {ride.status === 'COMPLETED' ? 'RCVD' : 'PEND'}
                      </span>
                    </div>
                  
                  {(ride.couponCode || ride.agentCode || ride.transactionId) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(ride.couponCode || ride.agentCode) && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg">
                          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Ref:</span>
                          <span className="text-xs font-black text-blue-700">{ride.couponCode || ride.agentCode}</span>
                        </div>
                      )}
                      {ride.transactionId && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-lg">
                          <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">UPI:</span>
                          <span className="text-xs font-black text-green-700" title={ride.transactionId}>{ride.transactionId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-gray-200">
                  <Link
                    href={`/dashboard/rides/${ride.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl hover:border-red-400 hover:text-red-600 transition-all shadow-sm active:scale-95 group-hover:bg-red-50 group-hover:border-red-200 group-hover:text-red-600"
                  >
                    View Details <ChevronRight size={14} />
                  </Link>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
