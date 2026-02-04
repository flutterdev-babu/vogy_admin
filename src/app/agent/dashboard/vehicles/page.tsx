'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { Car, RefreshCw, ChevronLeft, ChevronRight, MoreHorizontal, Search, Plus } from 'lucide-react';
import Link from 'next/link';

interface Vehicle {
  id: string;
  customId?: string;
  registrationNumber: string;
  vehicleModel: string;
  color?: string;
  fuelType?: string;
  seatingCapacity?: number;
  vendor?: { name: string; companyName: string };
  partner?: { name: string; firstName?: string; lastName?: string };
  vehicleType?: { displayName: string };
  createdAt: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    id: '', regNo: '', model: '', vendor: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await agentService.getVehicles();
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const vehicleId = v.customId || v.id;
    const vendorName = v.vendor?.companyName || v.vendor?.name || '';
    return (
      vehicleId.toLowerCase().includes(searchFilters.id.toLowerCase()) &&
      v.registrationNumber.toLowerCase().includes(searchFilters.regNo.toLowerCase()) &&
      v.vehicleModel.toLowerCase().includes(searchFilters.model.toLowerCase()) &&
      vendorName.toLowerCase().includes(searchFilters.vendor.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getPartnerName = (v: Vehicle) => {
    if (v.partner?.name) return v.partner.name;
    if (v.partner?.firstName) return `${v.partner.firstName} ${v.partner.lastName || ''}`.trim();
    return '-';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Vehicle List</h1>
        <div className="flex gap-2">
          <Link
            href="/agent/dashboard/vehicles/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] transition-colors"
          >
            <Plus size={18} />
            Add Vehicle
          </Link>
          <button
            onClick={fetchVehicles}
            className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex justify-end items-center gap-2 text-sm text-gray-600">
        <span>{(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredVehicles.length)}</span>
        <span className="text-[#E32222]">▼</span>
        <span>of {filteredVehicles.length}</span>
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E32222]"></div>
          </div>
        ) : (
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="bg-[#E32222] text-white text-sm">
                <th className="px-4 py-3 text-left font-medium">Vehicle ID</th>
                <th className="px-4 py-3 text-left font-medium">Reg. No.</th>
                <th className="px-4 py-3 text-left font-medium">Model</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Vendor</th>
                <th className="px-4 py-3 text-left font-medium">Partner</th>
                <th className="px-4 py-3 text-left font-medium">Color</th>
                <th className="px-4 py-3 text-left font-medium">Fuel</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
              {/* Search Row */}
              <tr className="bg-white border-b">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchFilters.id}
                    onChange={(e) => setSearchFilters({...searchFilters, id: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchFilters.regNo}
                    onChange={(e) => setSearchFilters({...searchFilters, regNo: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchFilters.model}
                    onChange={(e) => setSearchFilters({...searchFilters, model: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  />
                </td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchFilters.vendor}
                    onChange={(e) => setSearchFilters({...searchFilters, vendor: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  />
                </td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2">
                  <button className="p-1 bg-[#E32222] text-white rounded">
                    <Search size={14} />
                  </button>
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <Car size={48} className="mx-auto text-gray-300 mb-4" />
                    <p>No vehicles found</p>
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((vehicle, idx) => (
                  <tr key={vehicle.id} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 text-sm text-gray-700">{vehicle.customId || vehicle.id.slice(-8)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{vehicle.registrationNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vehicle.vehicleModel}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vehicle.vehicleType?.displayName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vehicle.vendor?.companyName || vehicle.vendor?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{getPartnerName(vehicle)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vehicle.color || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vehicle.fuelType || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal size={18} className="text-gray-500" />
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
