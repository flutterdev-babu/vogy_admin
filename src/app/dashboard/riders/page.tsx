'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Search, Star } from 'lucide-react';
import { riderService } from '@/services/riderService';
import { Rider } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { OnlineBadge } from '@/components/ui/Badge';

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<Rider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const response = await riderService.getAll();
        setRiders(response.data || []);
        setFilteredRiders(response.data || []);
      } catch (error) {
        console.error('Failed to fetch riders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiders();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = riders.filter(
        (rider) =>
          rider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rider.phone?.includes(searchTerm) ||
          rider.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRiders(filtered);
    } else {
      setFilteredRiders(riders);
    }
  }, [searchTerm, riders]);

  if (isLoading) {
    return <PageLoader />;
  }

  const onlineCount = riders.filter(r => r.isOnline).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Captains</h1>
          <p className="text-gray-500 mt-1">Manage platform riders/captains</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search captains..."
            className="input pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-6 bg-gradient-to-r from-indigo-500 to-indigo-600">
          <p className="text-indigo-100">Total Captains</p>
          <p className="text-4xl font-bold text-white">{riders.length}</p>
        </div>
        <div className="card p-6 bg-gradient-to-r from-green-500 to-green-600">
          <p className="text-green-100">Currently Online</p>
          <p className="text-4xl font-bold text-white">{onlineCount}</p>
        </div>
      </div>

      {/* Table */}
      {filteredRiders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'No captains match your search' : 'No captains found'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Captain</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Rating</th>
                <th>Earnings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiders.map((rider) => (
                <tr key={rider.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {rider.profileImage ? (
                        <img
                          src={rider.profileImage}
                          alt={rider.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                          {rider.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{rider.name}</p>
                        <p className="text-xs text-gray-500">{rider.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-600">{rider.phone}</td>
                  <td>
                    <div>
                      <p className="font-semibold text-gray-800">{rider.vehicleNumber}</p>
                      <p className="text-xs text-gray-500">{rider.vehicleModel}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{rider.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="font-bold text-green-600">
                    ₹{rider.totalEarnings?.toFixed(2) || '0.00'}
                  </td>
                  <td>
                    <OnlineBadge isOnline={rider.isOnline} />
                  </td>
                  <td>
                    <Link
                      href={`/dashboard/riders/${rider.id}`}
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
      )}
    </div>
  );
}
