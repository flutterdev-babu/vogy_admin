'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  RefreshCw, ChevronLeft, ChevronRight, Search, 
  RotateCcw, Plus, MoreHorizontal, X, Filter 
} from 'lucide-react';
import { adminRideService } from '@/services/adminRideService';
import { Ride, RideStatus, RideFilters } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';

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

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Booking List</h1>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/rides/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#cc1f1f] shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            Add New Booking
          </Link>
          <button 
            onClick={fetchRides}
            className="p-2 bg-[#D32F2F] text-white rounded-lg hover:bg-[#b71c1c] transition-colors shadow-sm"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Modern Tabs Design */}
      <div className="flex items-center justify-between bg-white px-2 py-1 rounded-t-xl border border-gray-200 border-b-0">
        <div className="flex overflow-x-auto scrollbar-hide gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-3 text-[13px] font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.value 
                  ? 'text-[#E32222] border-b-2 border-[#E32222]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-4 px-6 text-[11px] font-bold text-gray-500">
          <span className="text-[#E32222]">1-{filteredRides.length}</span> of {filteredRides.length}
          <div className="flex gap-1">
            <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14}/></button>
            <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            {/* Red Table Header */}
            <thead className="bg-[#D32F2F] text-white">
              <tr>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider w-[100px]">Req ID</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Source</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Destination</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider w-[130px]">Date</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Name</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Mobile</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Service</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Payment</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider w-[80px]">Distance</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Driver</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider w-[100px]">Cost</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Status</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">CNR</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider">Agent Code</th>
                <th className="px-3 py-4 text-[11px] font-black uppercase tracking-wider w-[60px] text-center">Action</th>
              </tr>
            </thead>
            
            {/* Filter Input Row */}
            <tbody className="bg-[#FFF5F5] border-b border-gray-200">
              <tr className="divide-x divide-red-50">
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" 
                    className="w-full text-[10px] p-1.5 border border-red-200 rounded outline-none focus:border-red-500"
                    value={filters.reqId} onChange={e => setFilters({...filters, reqId: e.target.value})}
                  />
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <input type="date" className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none" />
                </td>
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" 
                    className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none"
                    value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})}
                  />
                </td>
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" 
                    className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none"
                    value={filters.mobile} onChange={e => setFilters({...filters, mobile: e.target.value})}
                  />
                </td>
                <td className="px-2 py-2">
                  <select className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none bg-white">
                    <option value="">Select</option>
                  </select>
                </td>
                <td className="px-2 py-2">
                  <select className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none bg-white">
                    <option value="">Select</option>
                  </select>
                </td>
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" 
                    className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none"
                    value={filters.vehicle} onChange={e => setFilters({...filters, vehicle: e.target.value})}
                  />
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" 
                    className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none"
                    value={filters.driver} onChange={e => setFilters({...filters, driver: e.target.value})}
                  />
                </td>
                <td className="px-2 py-2">
                  <select className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none bg-white">
                    <option value="">Select</option>
                  </select>
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <select className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none bg-white">
                    <option value="">Select</option>
                  </select>
                </td>
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" 
                    className="w-full text-[10px] p-1.5 border border-gray-200 rounded outline-none"
                  />
                </td>
                <td className="px-2 py-2 flex gap-1 justify-center">
                  <button className="p-1.5 bg-gray-200 text-gray-500 rounded"><Search size={12}/></button>
                  <button onClick={() => setFilters({reqId:'', name:'', mobile:'', service:'', payment:'', driver:'', status:'', date:'', vehicle:'', agentCode:''})} className="p-1.5 bg-gray-200 text-gray-500 rounded"><X size={12}/></button>
                </td>
              </tr>
            </tbody>

            {/* Data Rows */}
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan={16} className="px-6 py-16 text-center text-gray-400 italic text-sm">No bookings found for this category.</td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-red-50/20 transition-colors group">
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-800">{ride.customId || 'N/A'}</span>
                        <span className="text-[9px] text-red-500 font-bold uppercase">{ride.isManualBooking ? 'Dashboard' : 'Web'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 max-w-[150px]">
                      <span className="text-[10px] font-medium text-gray-600 leading-tight block truncate" title={ride.pickupAddress}>{ride.pickupAddress || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-4 max-w-[150px]">
                      <span className="text-[10px] font-medium text-gray-600 leading-tight block truncate" title={ride.dropAddress}>{ride.dropAddress || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-700">{new Date(ride.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[9px] text-gray-500 font-medium lowercase italic">{new Date(ride.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4"><span className="text-[11px] font-bold text-gray-800">{ride.user?.name || 'N/A'}</span></td>
                    <td className="px-3 py-4"><span className="text-[10px] font-medium text-gray-600">+{ride.user?.phone || 'N/A'}</span></td>
                    <td className="px-3 py-4"><span className="text-[10px] font-medium text-gray-600">{ride.serviceType || 'City To Airport'}</span></td>
                    <td className="px-3 py-4"><span className="text-[10px] font-medium text-gray-600 uppercase">{ride.paymentMode || 'Cash'}</span></td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-700">{ride.vehicleType?.displayName || 'SEDAN'}</span>
                        <span className="text-[9px] text-gray-400 italic">
                          {ride.vehicleType?.category === 'CAR' ? '4+1' : ride.vehicleType?.category || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4"><span className="text-[11px] font-bold text-gray-700">{ride.distanceKm?.toFixed(1) || '0'} km</span></td>
                    <td className="px-3 py-4"><span className="text-[11px] font-medium text-gray-700">{ride.partner?.name || '-'}</span></td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[11px] font-black text-red-600">₹{ride.totalFare?.toFixed(2)}</span>
                        {ride.discountAmount && ride.discountAmount > 0 ? (
                          <span className="text-[9px] text-green-600 font-bold">-₹{ride.discountAmount.toFixed(2)} Off</span>
                        ) : null}
                        <span className={`px-2 py-0.5 text-white text-[8px] font-bold rounded-sm uppercase tracking-tighter ${
                          ride.status === 'COMPLETED' ? 'bg-green-600' : 'bg-[#D32F2F]'
                        }`}>
                          {ride.status === 'COMPLETED' ? 'Paid' : 'Not Paid'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`px-3 py-1 text-white text-[9px] font-bold rounded-md uppercase ${
                        ride.status === 'CANCELLED' ? 'bg-red-600' : 
                        ride.status === 'COMPLETED' ? 'bg-green-600' : 
                        'bg-orange-500'
                      }`}>
                        {ride.status === 'UPCOMING' ? 'Confirmed' : ride.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`px-2 py-1 text-white text-[9px] font-bold rounded-md uppercase whitespace-nowrap ${
                        ride.status === 'COMPLETED' ? 'bg-green-600' : 'bg-[#D32F2F]'
                      }`}>
                        {ride.status === 'COMPLETED' ? 'Received' : 'Not Received'}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-800 tracking-tighter">{ride.couponCode || ride.agentCode || '-'}</span>
                        {ride.couponCode && (
                          <span className="text-[8px] text-blue-600 font-medium uppercase">Coupon</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 relative">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === ride.id ? null : ride.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                      
                      {/* Action Menu Dropdown */}
                      {openMenuId === ride.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-full mr-2 top-0 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-right-2 duration-150">
                            <Link 
                              href={`/dashboard/rides/${ride.id}`}
                              className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-b last:border-0"
                            >
                              Edit/View Info
                            </Link>
                          </div>
                        </>
                      )}
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
