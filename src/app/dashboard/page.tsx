'use client';

import { useEffect, useState } from 'react';
import { 
  Car, 
  DollarSign, 
  Route, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Briefcase, 
  AlertCircle,
  UserPlus,
  Zap,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { adminDashboardService } from '@/services/adminDashboardService';
import { AdminDashboardData } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutomating, setIsAutomating] = useState(false);

  const handleAutomation = async () => {
    setIsAutomating(true);
    const toastId = toast.loading('Starting Automation...');

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('admin_token');

      if (!token) throw new Error('No admin token found. Please login again.');

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      toast.loading('Fetching Lookups...', { id: toastId });

      const [cityRes, vtRes] = await Promise.all([
        fetch(`${baseURL}/admin/city-codes`, { headers }),
        fetch(`${baseURL}/admin/vehicle-types`, { headers })
      ]);

      const cities = (await cityRes.json()).data;
      const vts = (await vtRes.json()).data;

      const blrCity = cities.find((c: any) => c.code === 'BLR');
      const sedanType = vts.find((t: any) => 
        t.name.includes('SEDAN') || t.displayName.includes('Sedan')
      );

      if (!blrCity) throw new Error('BLR City Code not found');
      if (!sedanType) throw new Error('Sedan Vehicle Type not found');

      toast.loading('Registering Partner...', { id: toastId });

      const pRegRes = await fetch(`${baseURL}/admin/partners`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          firstName: "Kiran",
          lastName: "Perepalle",
          name: "Kiran Perepalle",
          phone: "+91" + Math.floor(7000000000 + Math.random() * 2000000000),
          password: "Password@123",
          cityCodeId: blrCity.id,
          gender: "MALE",
          dateOfBirth: "1990-01-01",
          localAddress: "Bangalore, India",
          hasLicense: true,
          licenseNumber: "KA01" + Math.floor(1000000000 + Math.random() * 9000000000),
          licenseImage: "https://via.placeholder.com/600x400?text=Driving+License"
        })
      });

      const partner = (await pRegRes.json()).data;

      toast.loading('Registering Vehicle...', { id: toastId });

      const vRegRes = await fetch(`${baseURL}/admin/vehicles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          registrationNumber: "KA01" + Math.floor(1000 + Math.random() * 9000),
          vehicleModel: "Toyota Etios",
          vehicleTypeId: sedanType.id,
          cityCodeId: blrCity.id,
          fuelType: "PETROL",
          rcImage: "https://via.placeholder.com/600x400?text=Registration+Certificate"
        })
      });

      const vehicle = (await vRegRes.json()).data;

      toast.loading('Registering Vendor...', { id: toastId });

      const vnRegRes = await fetch(`${baseURL}/admin/vendors`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: "Raju Kumar",
          companyName: "Raju Travels",
          phone: "+91" + Math.floor(7000000000 + Math.random() * 2000000000),
          password: "Password@123",
          cityCodeId: blrCity.id,
          address: "Bangalore, India"
        })
      });

      const vendor = (await vnRegRes.json()).data;

      toast.loading('Creating Attachment...', { id: toastId });

      await fetch(`${baseURL}/admin/attachments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          partnerCustomId: partner.customId,
          vehicleCustomId: vehicle.customId,
          vendorCustomId: vendor.customId,
          cityCode: blrCity.code
        })
      });

      toast.success('Automation Completed Successfully!', { id: toastId });
      window.location.reload();
    } catch (err: any) {
      console.error('Automation failed:', err);
      toast.error(err.message || 'Automation failed', { id: toastId });
    } finally {
      setIsAutomating(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await adminDashboardService.getDashboard();

        if (statsRes.success) {
          setStats(statsRes.data);
        } else {
          setError(statsRes.message || 'Failed to fetch dashboard statistics');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('An error occurred while loading dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard Error</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#E32222] text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const entityCards = [
    { label: 'Total Users', value: stats?.entities.users || 0, icon: Users, color: 'from-blue-500 to-blue-600', href: '/dashboard/users' },
    { label: 'Partners', value: stats?.entities.partners || 0, icon: UserCheck, color: 'from-emerald-500 to-emerald-600', href: '/dashboard/partners', subValue: `${stats?.entities.onlinePartners || 0} Online` },
    { label: 'Vehicles', value: stats?.entities.vehicles || 0, icon: Car, color: 'from-purple-500 to-purple-600', href: '/dashboard/vehicles' },
    { label: 'Vendors', value: stats?.entities.vendors || 0, icon: ShieldCheck, color: 'from-orange-500 to-orange-600', href: '/dashboard/vendors' },
    { label: 'Corporates', value: stats?.entities.corporates || 0, icon: Briefcase, color: 'from-gray-700 to-gray-800', href: '/dashboard/corporates' },
    { label: 'Agents', value: stats?.entities.agents || 0, icon: UserPlus, color: 'from-pink-500 to-pink-600', href: '/dashboard/agents' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Overview</h1>
            <p className="text-gray-500 mt-1">Global statistics overview for the platform.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#E32222] transition-colors shadow-sm"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/rides/manual"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 text-xs italic uppercase"
          >
            <Route size={14} className="text-[#E32222]" />
            Manual Dispatch
          </Link>

          <button
            onClick={handleAutomation}
            disabled={isAutomating}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg text-xs italic uppercase ${
              isAutomating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-[#E32222] text-white hover:scale-105 active:scale-95 shadow-red-500/20'
            }`}
          >
            {isAutomating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
            {isAutomating ? 'Running Automation...' : 'Automation'}
          </button>
        </div>
      </div>

      {/* Entity Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {entityCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-4 block hover:shadow-md transition-all group border border-gray-100">
            <div className="flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{stat.value}</p>
                {stat.subValue && <p className="text-[10px] font-bold text-emerald-500 mt-0.5">{stat.subValue}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}