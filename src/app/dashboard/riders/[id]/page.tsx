'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, Car, Star, MapPin, FileText, Route, DollarSign } from 'lucide-react';
import { riderService } from '@/services/riderService';
import { Rider } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { OnlineBadge, StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function RiderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [rider, setRider] = useState<Rider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRider = async () => {
      try {
        const response = await riderService.getById(params.id as string);
        setRider(response.data);
      } catch (error) {
        console.error('Failed to fetch rider:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRider();
    }
  }, [params.id]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!rider) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">Rider not found</p>
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
        <div className="flex items-center gap-4 flex-1">
          {rider.profileImage ? (
            <img
              src={rider.profileImage}
              alt={rider.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
              {rider.name?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{rider.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <OnlineBadge isOnline={rider.isOnline} />
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{rider.rating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Phone size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold text-gray-800">{rider.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-800">{rider.email || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign size={18} />
            Total Earnings
          </h3>
          <p className="text-4xl font-bold text-white">
            ₹{rider.totalEarnings?.toFixed(2) || '0.00'}
          </p>
        </div>

        {/* Vehicle Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Car size={18} className="text-indigo-500" />
            Vehicle Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Vehicle Number</p>
              <p className="text-xl font-bold text-gray-800">{rider.vehicleNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Model</p>
              <p className="font-semibold text-gray-600">{rider.vehicleModel}</p>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-purple-500" />
            Documents
          </h3>
          <div className="space-y-3">
            {rider.aadharNumber && (
              <div>
                <p className="text-xs text-gray-500">Aadhar Number</p>
                <p className="font-semibold text-gray-800">{rider.aadharNumber}</p>
              </div>
            )}
            {rider.licenseNumber && (
              <div>
                <p className="text-xs text-gray-500">License Number</p>
                <p className="font-semibold text-gray-800">{rider.licenseNumber}</p>
              </div>
            )}
            {rider.licenseImage && (
              <a
                href={rider.licenseImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:underline text-sm"
              >
                View License Image →
              </a>
            )}
          </div>
        </div>

        {/* Location Card */}
        {rider.currentLat && rider.currentLng && (
          <div className="card p-6 lg:col-span-2">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-red-500" />
              Current Location
            </h3>
            <p className="text-gray-600">
              Lat: {rider.currentLat?.toFixed(6)}, Lng: {rider.currentLng?.toFixed(6)}
            </p>
          </div>
        )}
      </div>

      {/* Ride History */}
      {rider.rides && rider.rides.length > 0 && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Route size={18} className="text-orange-500" />
              Ride History
            </h3>
            <span className="text-sm text-gray-500">{rider.rides.length} rides</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">ID</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Fare</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Earnings</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {rider.rides.map((ride) => (
                  <tr key={ride.id} className="border-b border-gray-50 hover:bg-orange-50/50">
                    <td className="py-2 px-4">
                      <Link
                        href={`/dashboard/rides/${ride.id}`}
                        className="text-orange-500 hover:underline font-mono text-sm"
                      >
                        {ride.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="py-2 px-4">
                      <StatusBadge status={ride.status} />
                    </td>
                    <td className="py-2 px-4 font-semibold text-gray-800">
                      ₹{ride.totalFare?.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 font-semibold text-green-600">
                      ₹{ride.riderEarnings?.toFixed(2) || '-'}
                    </td>
                    <td className="py-2 px-4 text-gray-500 text-sm">
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
