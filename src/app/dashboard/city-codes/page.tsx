'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, Globe, Plus, RotateCcw } from 'lucide-react';
import { cityCodeService } from '@/services/cityCodeService';
import { CityCode } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

export default function CityCodesPage() {
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ code: '', cityName: '' });

  const fetchCityCodes = async () => {
    try {
      setIsLoading(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.cityName) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (isEditMode && selectedCity) {
        response = await cityCodeService.update(selectedCity.id, form.code.toUpperCase(), form.cityName);
      } else {
        response = await cityCodeService.create(form.code.toUpperCase(), form.cityName);
      }

      if (response.success) {
        toast.success(isEditMode ? 'City code updated successfully' : 'City code created successfully');
        setIsModalOpen(false);
        setForm({ code: '', cityName: '' });
        setIsEditMode(false);
        setSelectedCity(null);
        fetchCityCodes();
      } else {
        toast.error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} city code`);
      }
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} city code:`, error);
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (city: CityCode) => {
    setSelectedCity(city);
    setForm({ code: city.code, cityName: city.cityName });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this city code?')) return;

    try {
      const response = await cityCodeService.delete(id);
      if (response.success) {
        toast.success('City code deleted successfully');
        fetchCityCodes();
      } else {
        toast.error(response.message || 'Failed to delete city code');
      }
    } catch (error) {
      console.error('Failed to delete city code:', error);
      toast.error('Failed to delete city code');
    }
  };

  const filteredCityCodes = cityCodes.filter(c =>
    c.cityName.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading && cityCodes.length === 0) return <PageLoader />;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">City Codes</h1>
          <p className="text-xs text-gray-500 mt-0.5">View and manage city codes for operations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold">
            {cityCodes.length} Cities
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20 text-sm font-semibold transition-all"
          >
            <Plus size={16} />
            Add City Code
          </button>
          <button 
            onClick={fetchCityCodes}
            className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city name or code..."
            className="input pl-11 text-sm h-10"
          />
        </div>
      </div>

      {/* City Codes Grid */}
      {filteredCityCodes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No city codes found</h3>
          <p className="text-gray-500 mt-1">Add your first city code to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCityCodes.map((city) => (
            <div
              key={city.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all group text-center shadow-sm relative"
            >
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(city)}
                  className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button
                  onClick={() => handleDelete(city.id)}
                  className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 group-hover:scale-110 transition-transform">
                <Globe size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-sm truncate">{city.cityName}</h3>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 text-[11px] font-bold rounded-full">
                {city.code}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedCity(null);
          setForm({ code: '', cityName: '' });
        }}
        title={isEditMode ? "Edit City Code" : "Add New City Code"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              City Code (e.g. NYC, LDN)
            </label>
            <input
              type="text"
              required
              placeholder="Enter code"
              className="input text-sm"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              City Name
            </label>
            <input
              type="text"
              required
              placeholder="Enter city name"
              className="input text-sm"
              value={form.cityName}
              onChange={(e) => setForm({ ...form, cityName: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditMode(false);
                setSelectedCity(null);
                setForm({ code: '', cityName: '' });
              }}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update City Code' : 'Create City Code')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
