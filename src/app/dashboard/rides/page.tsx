'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Filter, X } from 'lucide-react';
import { rideService } from '@/services/rideService';
import { Ride, RideStatus, RideFilters } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';

const STATUS_OPTIONS: RideStatus[] = ['PENDING', 'SCHEDULED', 'ACCEPTED', 'ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED'];

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RideFilters>({});

  const fetchRides = async () => {
    setIsLoading(true);
    try {
      const response = await rideService.getAll(filters);
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

  const applyFilters = () => {
    fetchRides();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    fetchRides();
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">All Rides</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">View and manage all platform rides</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 flex-1 sm:flex-initial justify-center ${hasActiveFilters ? 'border-orange-500 bg-orange-50' : ''}`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 sm:p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filter Rides</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as RideStatus || undefined })}
                className="input"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Vehicle Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <input
                type="text"
                value={filters.vehicleType || ''}
                onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value || undefined })}
                className="input"
                placeholder="e.g., SEDAN"
              />
            </div>

            {/* User ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <input
                type="text"
                value={filters.userId || ''}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value || undefined })}
                className="input"
                placeholder="User ID"
              />
            </div>

            {/* Rider ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rider ID</label>
              <input
                type="text"
                value={filters.riderId || ''}
                onChange={(e) => setFilters({ ...filters, riderId: e.target.value || undefined })}
                className="input"
                placeholder="Rider ID"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={applyFilters} className="btn-primary">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn-secondary">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="card p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{rides.length}</p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Completed</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {rides.filter(r => r.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">In Progress</p>
          <p className="text-xl sm:text-2xl font-bold text-orange-600">
            {rides.filter(r => ['ACCEPTED', 'ARRIVED', 'STARTED'].includes(r.status)).length}
          </p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Cancelled</p>
          <p className="text-xl sm:text-2xl font-bold text-red-600">
            {rides.filter(r => r.status === 'CANCELLED').length}
          </p>
        </div>
      </div>

      {/* Content */}
      {rides.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <p className="text-gray-500">No rides found</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {rides.map((ride) => (
              <Link key={ride.id} href={`/dashboard/rides/${ride.id}`} className="card p-4 block">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={ride.status} />
                      <CategoryBadge category={ride.vehicleType?.category || 'CAR'} />
                    </div>
                    <p className="font-semibold text-gray-800 mt-2">{ride.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{ride.user?.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">₹{ride.totalFare?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{ride.distanceKm?.toFixed(1)} km</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {new Date(ride.createdAt).toLocaleDateString()}
                  </span>
                  {ride.rider && (
                    <span className="text-xs text-gray-600">Captain: {ride.rider.name}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Captain</th>
                  <th>Vehicle</th>
                  <th>Distance</th>
                  <th>Fare</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.id}>
                    <td className="font-mono text-sm text-gray-600">{ride.id.slice(-8)}</td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-800">{ride.user?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{ride.user?.phone}</p>
                      </div>
                    </td>
                    <td>
                      {ride.rider ? (
                        <div>
                          <p className="font-medium text-gray-800">{ride.rider.name}</p>
                          <p className="text-xs text-gray-500">{ride.rider.phone}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <CategoryBadge category={ride.vehicleType?.category || 'CAR'} />
                        <span className="text-xs text-gray-500">{ride.vehicleType?.displayName}</span>
                      </div>
                    </td>
                    <td className="font-medium">{ride.distanceKm?.toFixed(1)} km</td>
                    <td className="font-bold text-green-600">₹{ride.totalFare?.toFixed(2)}</td>
                    <td><StatusBadge status={ride.status} /></td>
                    <td className="text-gray-500 text-sm">
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/rides/${ride.id}`}
                        className="p-2 hover:bg-orange-50 rounded-lg text-orange-500 inline-flex"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
