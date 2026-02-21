'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, RefreshCw, ChevronLeft, ChevronRight, Search, RotateCcw, Plus } from 'lucide-react';
import { adminRideService } from '@/services/adminRideService';
import { Ride, RideStatus, RideFilters } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/Badge';

const STATUS_TABS: { label: string; value: RideStatus | 'ALL' }[] = [
  { label: 'Upcoming', value: 'PENDING' },
  { label: 'Assigned', value: 'ACCEPTED' },
  { label: 'Started', value: 'STARTED' },
  { label: 'Arrived', value: 'ARRIVED' },
  { label: 'Ongoing', value: 'INITIATED' },
  { label: 'Stopped', value: 'FUTURE' }, // Mapping dummy for Stopped as per mockup
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'CNR', value: 'ALL' }, // Mapping dummy for CNR
];

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RideStatus | 'ALL'>('PENDING');
  const [filters, setFilters] = useState({
    reqId: '',
    name: '',
    mobile: '',
    service: '',
    payment: '',
    driver: '',
    status: '',
    date: ''
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
    
    return statusMatch && reqIdMatch && nameMatch && mobileMatch && driverMatch;
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      {/* Page Title & Refresh */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-gray-800">Booking List</h1>
        <div className="flex gap-2">
          <Link 
            href="/dashboard/rides/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            Add New Booking
          </Link>
          <button 
            onClick={fetchRides}
            className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh List"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.value)}
              className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                activeTab === tab.value 
                  ? 'text-[#E32222]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#E32222]" />
              )}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-4 px-6 text-xs font-bold text-gray-500">
            <span className="text-[#E32222]">1-{filteredRides.length}</span> of {filteredRides.length}
            <div className="flex gap-1">
              <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14}/></button>
              <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto border-b border-gray-200">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            {/* Header Row */}
            <thead className="bg-[#E32222] text-white">
              <tr>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[120px]">Req ID</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Source</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Destination</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[140px]">Date</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Name</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Mobile</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Service</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Payment</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[80px]">Distance</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Driver</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[100px]">Cost</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            {/* Filter Row */}
            <tbody className="bg-gray-50 border-b border-gray-200">
              <tr>
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-red-200 rounded outline-none focus:border-red-400"
                    value={filters.reqId} onChange={e => setFilters({...filters, reqId: e.target.value})}
                  />
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <input type="date" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none" />
                </td>
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})}
                  />
                </td>
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.mobile} onChange={e => setFilters({...filters, mobile: e.target.value})}
                  />
                </td>
                <td className="px-2 py-2"><select className="w-full text-[11px] p-1 border border-gray-200 rounded"><option>Select</option></select></td>
                <td className="px-2 py-2"><select className="w-full text-[11px] p-1 border border-gray-200 rounded"><option>Select</option></select></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <input 
                    type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.driver} onChange={e => setFilters({...filters, driver: e.target.value})}
                  />
                </td>
                <td className="px-2 py-2"><select className="w-full text-[11px] p-1 border border-gray-200 rounded"><option>Select</option></select></td>
                <td className="px-2 py-2"></td>
              </tr>
            </tbody>
            {/* Data Rows */}
            <tbody className="divide-y divide-gray-100">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-gray-500 italic">No bookings found for this category.</td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-800">{ride.customId || 'N/A'}</span>
                        <span className="text-[9px] text-red-500 font-bold uppercase">Dashboard</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 max-w-[150px]">
                      <span className="text-[10px] text-gray-600 leading-tight block">{ride.pickupAddress || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-4 max-w-[150px]">
                      <span className="text-[10px] text-blue-500 font-medium leading-tight block">{ride.dropAddress || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-700">{new Date(ride.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[9px] text-gray-500 font-medium">{new Date(ride.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-[11px] font-bold text-gray-800">{ride.user?.name || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-[10px] font-medium text-gray-600">{ride.user?.phone || 'N/A'}</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-[10px] font-medium text-gray-600">{ride.serviceType || 'One Way'}</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-[10px] font-medium text-gray-600 uppercase">{ride.paymentMode || 'CASH'}</span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-700">{ride.vehicleType?.displayName || 'SEDAN'}</span>
                        <span className="text-[9px] text-gray-500 font-medium">{ride.vehicleType?.category || '4+1'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-[11px] font-bold text-gray-700">{ride.distanceKm?.toFixed(1) || '0'} km</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-[11px] font-medium text-gray-700">{ride.partner?.name || '-'}</span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-black text-gray-800">₹{Math.round(ride.totalFare || 0)}</span>
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-sm text-center uppercase tracking-tighter">Not Paid</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <Link 
                          href={`/dashboard/rides/${ride.id}`}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-black hover:text-white transition-all"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Link>
                        <span className="px-3 py-1 bg-orange-500 text-white text-[9px] font-bold rounded-md uppercase">Confirmed</span>
                        <button className="px-2 py-1 bg-red-600 text-white text-[9px] font-bold rounded-md uppercase">No Ref</button>
                      </div>
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
