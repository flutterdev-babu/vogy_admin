'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Mail, RefreshCw, Loader2, Route } from 'lucide-react';
import { userService } from '@/services/userService';
import { User } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await userService.getById(params.id as string);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleRegenerateOtp = async () => {
    if (!user) return;
    
    setIsRegenerating(true);
    try {
      const response = await userService.regenerateOtp(user.id);
      setUser(response.data);
      toast.success('OTP regenerated successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to regenerate OTP');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">User not found</p>
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
          <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-500">User Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Info Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Phone size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold text-gray-800">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Mail size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-800">{user.email || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* OTP Card */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">Unique OTP</h3>
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-3xl font-mono font-bold text-center text-gray-800">
              {user.uniqueOtp}
            </p>
          </div>
          <button
            onClick={handleRegenerateOtp}
            disabled={isRegenerating}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {isRegenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            <span>Regenerate OTP</span>
          </button>
        </div>

        {/* Account Info Card */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-4">Account Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">User ID</p>
              <p className="font-mono text-sm text-gray-600">{user.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Joined</p>
              <p className="font-semibold text-gray-800">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="font-semibold text-gray-800">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ride History */}
      {user.rides && user.rides.length > 0 && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Route size={18} className="text-orange-500" />
              Ride History
            </h3>
            <span className="text-sm text-gray-500">{user.rides.length} rides</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">ID</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Fare</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {user.rides.map((ride) => (
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
                    <td className="py-2 px-4 font-semibold text-green-600">
                      ₹{ride.totalFare?.toFixed(2)}
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
