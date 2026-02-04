'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, Globe } from 'lucide-react';
import { cityCodeService } from '@/services/cityCodeService';
import { CityCode } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CityCodesPage() {
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCityCodes = async () => {
    try {
      const response = await cityCodeService.getAll();
      if (response.success) {
        setCityCodes(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch city codes:', error);
      toast.error('Failed to load city codes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCityCodes();
  }, []);

  const filteredCityCodes = cityCodes.filter(c =>
    c.cityName.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">City Codes</h1>
          <p className="text-gray-500 mt-1">View city codes for operations</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-600 text-sm font-semibold">
          {cityCodes.length} Cities
        </span>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city name or code..."
            className="input pl-11"
          />
        </div>
      </div>

      {/* City Codes Grid */}
      {filteredCityCodes.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No city codes found</h3>
          <p className="text-gray-500 mt-1">Agents can create new city codes</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCityCodes.map((city) => (
            <div
              key={city.id}
              className="card p-5 hover:border-purple-300 transition-all group text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 group-hover:scale-110 transition-transform">
                <Globe size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{city.cityName}</h3>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 text-sm font-semibold rounded-full">
                {city.code}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
