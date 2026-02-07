'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, User, Car, DollarSign, Clock, Phone, Mail } from 'lucide-react';
import { rideService } from '@/services/rideService';
import { Ride } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';

export default function RideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await rideService.getById(params.id as string);
        setRide(response.data);
      } catch (error) {
        console.error('Failed to fetch ride:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRide();
    }
  }, [params.id]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!ride) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">Ride not found</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-orange-50 rounded-lg text-orange-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ride Details</h1>
          <p className="text-gray-500 font-mono text-sm">{ride.id}</p>
        </div>
        <StatusBadge status={ride.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Route Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-orange-500" />
            Route Details
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Pickup</p>
                <p className="text-gray-800">{ride.pickupAddress}</p>
              </div>
            </div>
            <div className="ml-1.5 border-l-2 border-dashed border-gray-200 h-6" />
            <div className="flex gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Drop</p>
                <p className="text-gray-800">{ride.dropAddress}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Distance</span>
                <span className="font-semibold">{ride.distanceKm?.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-green-500" />
            Fare Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Base Fare</span>
              <span className="font-medium">₹{ride.baseFare}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Per KM Rate</span>
              <span className="font-medium">₹{ride.perKmPrice}</span>
            </div>
            <div className="flex justify-between py-2 bg-orange-50 -mx-2 px-2 rounded">
              <span className="font-semibold text-gray-800">Total Fare</span>
              <span className="font-bold text-orange-600">₹{ride.totalFare?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-100">
              <span className="text-gray-500">Captain Earnings</span>
              <span className="font-semibold text-green-600">₹{ride.partnerEarnings?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">App Commission</span>
              <span className="font-semibold text-orange-600">₹{ride.commission?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            Customer
          </h3>
          {ride.user ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-gray-800">{ride.user.name}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span>{ride.user.phone}</span>
              </div>
              {ride.user.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  <span>{ride.user.email}</span>
                </div>
              )}
              {ride.userOtp && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Ride OTP</p>
                  <p className="text-2xl font-mono font-bold text-gray-800">{ride.userOtp}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No user information</p>
          )}
        </div>

        {/* Partner Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Car size={18} className="text-indigo-500" />
            Captain
          </h3>
          {ride.partner ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold text-gray-800">{ride.partner.name}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span>{ride.partner.phone}</span>
              </div>
              {ride.partner.vehicleNumber && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle</p>
                  <p className="font-semibold text-gray-800">{ride.partner.vehicleNumber}</p>
                  <p className="text-sm text-gray-500">{ride.partner.vehicleModel}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No captain assigned</p>
          )}
        </div>

        {/* Vehicle Type Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">Vehicle Type</h3>
          {ride.vehicleType && (
            <div className="flex items-center gap-4">
              <CategoryBadge category={ride.vehicleType.category} />
              <div>
                <p className="font-semibold text-gray-800">{ride.vehicleType.displayName}</p>
                <p className="text-sm text-gray-500">₹{ride.vehicleType.pricePerKm}/km</p>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-500" />
            Timeline
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Created</span>
              <span className="font-medium">{new Date(ride.createdAt).toLocaleString()}</span>
            </div>
            {ride.acceptedAt && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Accepted</span>
                <span className="font-medium">{new Date(ride.acceptedAt).toLocaleString()}</span>
              </div>
            )}
            {ride.arrivedAt && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Arrived</span>
                <span className="font-medium">{new Date(ride.arrivedAt).toLocaleString()}</span>
              </div>
            )}
            {ride.startTime && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Started</span>
                <span className="font-medium">{new Date(ride.startTime).toLocaleString()}</span>
              </div>
            )}
            {ride.endTime && (
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Completed</span>
                <span className="font-medium">{new Date(ride.endTime).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {(ride.isManualBooking || ride.scheduledDateTime || ride.bookingNotes) && (
        <div className="card p-6 mt-6">
          <h3 className="font-bold text-gray-800 mb-4">Additional Information</h3>
          <div className="space-y-3">
            {ride.isManualBooking && (
              <div className="badge badge-primary">Manual Booking</div>
            )}
            {ride.scheduledDateTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">Scheduled For</span>
                <span className="font-medium">{new Date(ride.scheduledDateTime).toLocaleString()}</span>
              </div>
            )}
            {ride.bookingNotes && (
              <div>
                <p className="text-gray-500 text-sm">Notes</p>
                <p className="text-gray-800">{ride.bookingNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
