'use client';

import { useEffect, useState } from 'react';
import { Calendar, UserPlus, Loader2 } from 'lucide-react';
import { rideService } from '@/services/rideService';
import { riderService } from '@/services/riderService';
import { Ride, Rider } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function ScheduledRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchData = async () => {
    try {
      const [ridesRes, ridersRes] = await Promise.all([
        rideService.getScheduled(),
        riderService.getAll(),
      ]);
      setRides(ridesRes.data || []);
      setRiders(ridersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load scheduled rides');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignRider = async () => {
    if (!selectedRide || !selectedRiderId) {
      toast.error('Please select a rider');
      return;
    }

    setIsAssigning(true);
    try {
      await rideService.assignRider(selectedRide.id, selectedRiderId);
      toast.success('Rider assigned successfully');
      setSelectedRide(null);
      setSelectedRiderId('');
      fetchData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to assign rider');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  // Filter online riders
  const onlineRiders = riders.filter(r => r.isOnline);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Calendar className="text-orange-500" />
          Scheduled Rides
        </h1>
        <p className="text-gray-500 mt-1">Manage upcoming scheduled rides and assign captains</p>
      </div>

      {/* Table */}
      {rides.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No scheduled rides at the moment</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Scheduled For</th>
                <th>User</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Vehicle</th>
                <th>Fare</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride.id}>
                  <td>
                    <div>
                      <p className="font-semibold text-orange-600">
                        {ride.scheduledDateTime
                          ? new Date(ride.scheduledDateTime).toLocaleDateString()
                          : '-'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ride.scheduledDateTime
                          ? new Date(ride.scheduledDateTime).toLocaleTimeString()
                          : ''}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-gray-800">{ride.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{ride.user?.phone}</p>
                    </div>
                  </td>
                  <td className="max-w-[200px]">
                    <p className="text-gray-700 truncate">{ride.pickupAddress}</p>
                  </td>
                  <td className="max-w-[200px]">
                    <p className="text-gray-700 truncate">{ride.dropAddress}</p>
                  </td>
                  <td>
                    <CategoryBadge category={ride.vehicleType?.category || 'CAR'} />
                  </td>
                  <td className="font-bold text-green-600">₹{ride.totalFare?.toFixed(2)}</td>
                  <td><StatusBadge status={ride.status} /></td>
                  <td>
                    {ride.status === 'SCHEDULED' && !ride.rider && (
                      <button
                        onClick={() => setSelectedRide(ride)}
                        className="btn-primary py-2 px-3 text-sm flex items-center gap-1"
                      >
                        <UserPlus size={16} />
                        Assign
                      </button>
                    )}
                    {ride.rider && (
                      <span className="text-sm text-gray-500">
                        Assigned: {ride.rider.name}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Rider Modal */}
      <Modal
        isOpen={!!selectedRide}
        onClose={() => { setSelectedRide(null); setSelectedRiderId(''); }}
        title="Assign Captain to Ride"
      >
        {selectedRide && (
          <div className="space-y-4">
            {/* Ride Info */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-500">Scheduled Ride</p>
              <p className="font-semibold text-gray-800">{selectedRide.pickupAddress}</p>
              <p className="text-sm">→ {selectedRide.dropAddress}</p>
              <p className="text-sm text-orange-600 mt-2">
                {selectedRide.scheduledDateTime
                  ? new Date(selectedRide.scheduledDateTime).toLocaleString()
                  : 'No date'}
              </p>
            </div>

            {/* Rider Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Captain ({onlineRiders.length} online)
              </label>
              <select
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className="input"
              >
                <option value="">Select a captain...</option>
                {riders.map((rider) => (
                  <option key={rider.id} value={rider.id}>
                    {rider.name} - {rider.vehicleNumber} {rider.isOnline ? '(Online)' : '(Offline)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setSelectedRide(null); setSelectedRiderId(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRider}
                disabled={isAssigning || !selectedRiderId}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isAssigning && <Loader2 size={18} className="animate-spin" />}
                <span>Assign Captain</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
