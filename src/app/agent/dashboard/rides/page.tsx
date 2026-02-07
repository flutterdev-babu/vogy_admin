'use client';

import { useState, useEffect } from 'react';
import { Car, RefreshCw, ChevronLeft, ChevronRight, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { rideService } from '@/services/rideService';
import { Ride } from '@/types';
import toast from 'react-hot-toast';

export default function RidesListPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    id: '', customer: '', status: 'FUTURE' // Default to FUTURE as per guide
  });
  const itemsPerPage = 10;

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await rideService.getAll(searchFilters.status ? { status: searchFilters.status as any } : undefined);
      setRides(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [searchFilters.status]);

  const filteredRides = rides.filter(r => {
    const customerName = r.user?.name || '';
    return (
      r.id.toLowerCase().includes(searchFilters.id.toLowerCase()) &&
      customerName.toLowerCase().includes(searchFilters.customer.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredRides.length / itemsPerPage);
  const paginatedRides = filteredRides.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'STARTED': return 'bg-blue-100 text-blue-700';
      case 'ACCEPTED': return 'bg-yellow-100 text-yellow-700';
      case 'PENDING': return 'bg-orange-100 text-orange-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'FUTURE': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Ride Management</h1>
        <div className="flex gap-2">
          <Link
            href="/agent/dashboard/rides/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] transition-colors"
          >
            <Car size={18} />
            Book Ride
          </Link>
          <button
            onClick={fetchRides}
            className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex justify-end items-center gap-2 text-sm text-gray-600">
        <span>{filteredRides.length > 0 ? `${(page - 1) * itemsPerPage + 1}-${Math.min(page * itemsPerPage, filteredRides.length)}` : '0-0'}</span>
        <span className="text-[#E32222]">▼</span>
        <span>of {filteredRides.length}</span>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading && rides.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E32222]"></div>
          </div>
        ) : (
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="bg-[#E32222] text-white text-sm">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Pickup/Drop</th>
                <th className="px-4 py-3 text-left font-medium">Partner</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
              {/* Search Row */}
              <tr className="bg-white border-b">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search ID"
                    value={searchFilters.id}
                    onChange={(e) => setSearchFilters({...searchFilters, id: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search Customer"
                    value={searchFilters.customer}
                    onChange={(e) => setSearchFilters({...searchFilters, customer: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  />
                </td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2">
                  <select
                    value={searchFilters.status}
                    onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  >
                    <option value="FUTURE">Future/Ongoing</option>
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="STARTED">Started</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2 text-center">
                  <Search size={14} className="mx-auto text-gray-400" />
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedRides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <Car size={48} className="mx-auto text-gray-300 mb-4" />
                    <p>No rides found matching your filters</p>
                    <Link href="/agent/dashboard/rides/create" className="text-[#E32222] hover:underline mt-2 inline-block">
                      Click here to book a manual ride
                    </Link>
                  </td>
                </tr>
              ) : (
                paginatedRides.map((ride, idx) => (
                  <tr key={ride.id} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{ride.customId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{ride.user?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ride.user?.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px]">
                      <div className="truncate font-medium">P: {ride.pickupAddress}</div>
                      <div className="truncate text-xs">D: {ride.dropAddress}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ride.partner ? (
                        <div>
                          <p className="font-medium text-[#E32222]">{ride.partner.name}</p>
                          <p className="text-xs">{ride.partner.vehicleNumber}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div>{new Date(ride.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs">{new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-[#E32222] transition-colors" title="View Details">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
