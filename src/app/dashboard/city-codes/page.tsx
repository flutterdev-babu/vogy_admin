'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, Globe, Plus, RotateCcw, Edit2, Trash2 } from 'lucide-react';
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
  const [form, setForm] = useState({ code: '', cityName: '', isAvailable: true });

  const cityMappings = [
    { cityName: 'Mumbai', code: 'BOM' },
    { cityName: 'Delhi', code: 'DEL' },
    { cityName: 'Bangalore', code: 'BLR' },
    { cityName: 'Hyderabad', code: 'HYD' },
    { cityName: 'Ahmedabad', code: 'AMD' },
    { cityName: 'Chennai', code: 'MAA' },
    { cityName: 'Kolkata', code: 'CCU' },
    { cityName: 'Surat', code: 'STV' },
    { cityName: 'Pune', code: 'PNQ' },
    { cityName: 'Jaipur', code: 'JAI' },
    { cityName: 'Lucknow', code: 'LKO' },
    { cityName: 'Kanpur', code: 'KNU' },
    { cityName: 'Nagpur', code: 'NAG' },
    { cityName: 'Indore', code: 'IDR' },
    { cityName: 'Thane', code: 'TNA' },
    { cityName: 'Bhopal', code: 'BHO' },
    { cityName: 'Visakhapatnam', code: 'VTZ' },
    { cityName: 'Pimpri-Chinchwad', code: 'PCW' },
    { cityName: 'Patna', code: 'PAT' },
    { cityName: 'Vadodara', code: 'BDQ' },
    { cityName: 'Ghaziabad', code: 'GZB' },
    { cityName: 'Ludhiana', code: 'LUH' },
    { cityName: 'Agra', code: 'AGR' },
    { cityName: 'Nashik', code: 'ISK' },
    { cityName: 'Faridabad', code: 'FDB' },
    { cityName: 'Meerut', code: 'MUT' },
    { cityName: 'Rajkot', code: 'RAJ' },
    { cityName: 'Kalyan-Dombivli', code: 'KDL' },
    { cityName: 'Vasai-Virar', code: 'VSR' },
    { cityName: 'Varanasi', code: 'VNS' },
    { cityName: 'Srinagar', code: 'SXR' },
    { cityName: 'Aurangabad', code: 'IXU' },
    { cityName: 'Dhanbad', code: 'DHN' },
    { cityName: 'Amritsar', code: 'ATQ' },
    { cityName: 'Navi Mumbai', code: 'NVM' },
    { cityName: 'Allahabad', code: 'IXD' },
    { cityName: 'Howrah', code: 'HWH' },
    { cityName: 'Ranchi', code: 'IXR' },
    { cityName: 'Gwalior', code: 'GWL' },
    { cityName: 'Jabalpur', code: 'JLR' },
    { cityName: 'Coimbatore', code: 'CJB' },
    { cityName: 'Vijayawada', code: 'VGA' },
    { cityName: 'Jodhpur', code: 'JDH' },
    { cityName: 'Madurai', code: 'IXM' },
    { cityName: 'Raipur', code: 'RPR' },
    { cityName: 'Kota', code: 'KOT' },
    { cityName: 'Chandigarh', code: 'IXC' },
    { cityName: 'Guwahati', code: 'GAU' },
    { cityName: 'Solapur', code: 'SOL' },
    { cityName: 'Hubli-Dharwad', code: 'HBL' },
    { cityName: 'Mysore', code: 'MYS' },
    { cityName: 'Tiruchirappalli', code: 'TRZ' },
    { cityName: 'Bareilly', code: 'BEH' },
    { cityName: 'Aligarh', code: 'ALI' },
    { cityName: 'Tiruppur', code: 'TUP' },
    { cityName: 'Gurgaon', code: 'GUR' },
    { cityName: 'Moradabad', code: 'MOR' },
    { cityName: 'Jalandhar', code: 'JAL' },
    { cityName: 'Bhubaneswar', code: 'BBI' },
    { cityName: 'Salem', code: 'SLM' },
    { cityName: 'Warangal', code: 'WGL' },
    { cityName: 'Guntur', code: 'GUN' },
    { cityName: 'Bhiwandi', code: 'BHI' },
    { cityName: 'Saharanpur', code: 'SAH' },
    { cityName: 'Gorakhpur', code: 'GOP' },
    { cityName: 'Bikaner', code: 'BIK' },
    { cityName: 'Amravati', code: 'AMR' },
    { cityName: 'Noida', code: 'NDA' },
    { cityName: 'Jamshedpur', code: 'IXW' },
    { cityName: 'Bhilai', code: 'BHN' },
    { cityName: 'Cuttack', code: 'CTC' },
    { cityName: 'Firozabad', code: 'FIR' },
    { cityName: 'Kochi', code: 'COK' },
    { cityName: 'Nellore', code: 'NLR' },
    { cityName: 'Dehradun', code: 'DED' },
    { cityName: 'Tirupati', code: 'TIR' },
  ];

  const fetchCityCodes = async () => {
    try {
      setIsLoading(true);
      const response = await cityCodeService.getAllAdmin();
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
        response = await cityCodeService.update(selectedCity.id, form.code.toUpperCase(), form.cityName, form.isAvailable);
      } else {
        response = await cityCodeService.create(form.code.toUpperCase(), form.cityName, form.isAvailable);
      }

      if (response.success) {
        toast.success(isEditMode ? 'City code updated successfully' : 'City code created successfully');
        setIsModalOpen(false);
        setForm({ code: '', cityName: '', isAvailable: true });
        setIsEditMode(false);
        setSelectedCity(null);
        fetchCityCodes();
      } else {
        toast.error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} city code`);
      }
    } catch (error: any) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} city code:`, error);
      toast.error(error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoAdd = async () => {
    if (!window.confirm(`Are you sure you want to add ${cityMappings.length} cities automatically?`)) return;

    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    const toastId = toast.loading('Starting bulk city addition...');

    try {
      for (let i = 0; i < cityMappings.length; i++) {
        const city = cityMappings[i];
        toast.loading(`Adding ${city.cityName} (${i + 1}/${cityMappings.length})...`, { id: toastId });

        try {
          // Check if already exists in local state to avoid redundant calls if possible
          const exists = cityCodes.some(c => c.code.toUpperCase() === city.code.toUpperCase());
          if (exists) {
            failCount++;
            continue;
          }

          const response = await cityCodeService.create(city.code, city.cityName);
          if (response.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          console.error(`Failed to add ${city.cityName}:`, err);
          failCount++;
        }

        // Small delay to prevent rate limiting or UI freezing
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      toast.success(`Completed: ${successCount} added, ${failCount} skipped/failed`, { id: toastId });
      fetchCityCodes();
    } catch (error) {
      console.error('Bulk add failed:', error);
      toast.error('Bulk addition encountered an error', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (city: CityCode) => {
    setSelectedCity(city);
    setForm({ code: city.code, cityName: city.cityName, isAvailable: city.isAvailable ?? true });
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
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Geographical Hub</h1>
          <p className="text-sm text-gray-500 font-medium">Service area management and operational city nodes</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xl font-black text-gray-900 leading-none">{cityCodes.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Total Nodes</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoAdd}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 font-bold text-xs hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <Globe size={14} />
              <span>BULK IMPORT</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs shadow-lg shadow-gray-200 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={16} />
              <span>ADD NEW CITY</span>
            </button>
            <button
              onClick={fetchCityCodes}
              className="p-3 bg-white text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              title="Refresh Network"
            >
              <RotateCcw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="max-w-2xl relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by city name, IATA code, or region..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-300 font-medium"
          />
        </div>
      </div>

      {/* City Nodes Grid */}
      {filteredCityCodes.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[3rem] p-24 text-center shadow-sm">
          <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <MapPin size={40} className="text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">No Active Nodes Found</h3>
          <p className="text-sm text-gray-400 font-medium mt-2">Initialize your service network by adding city codes</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredCityCodes.map((city) => (
            <div
              key={city.id}
              className="group bg-white border border-gray-100 rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-gray-100 transition-all duration-300 text-center relative overflow-hidden"
            >
              {/* Individual Actions - Hover Triggered */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <button
                  onClick={() => handleEdit(city)}
                  className="p-2 bg-white/80 backdrop-blur-md text-gray-600 rounded-xl hover:bg-gray-900 hover:text-white shadow-sm transition-all border border-gray-50"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(city.id)}
                  className="p-2 bg-white/80 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500 hover:text-white shadow-sm transition-all border border-gray-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Status Indicator Dot */}
              <div className={`absolute top-6 left-6 w-2 h-2 rounded-full ${city.isAvailable !== false ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />

              <div className="w-16 h-16 mx-auto rounded-[1.25rem] bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-xl shadow-gray-200 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Globe size={28} className="text-white opacity-90" />
              </div>

              <h3 className="font-black text-gray-900 text-sm tracking-tight truncate px-2">{city.cityName}</h3>

              <div className="mt-4 flex flex-col items-center gap-3">
                <span className="inline-block px-3 py-1 bg-gray-50 group-hover:bg-red-50 text-gray-500 group-hover:text-red-500 text-[10px] font-black rounded-lg border border-gray-100 transition-colors uppercase tracking-widest font-mono">
                  {city.code}
                </span>

                <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${city.isAvailable !== false ? 'text-emerald-500' : 'text-red-400'}`}>
                  {city.isAvailable !== false ? 'Operating' : 'Suspended'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modernized Specialized Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedCity(null);
          setForm({ code: '', cityName: '', isAvailable: true });
        }}
        title={isEditMode ? "Modify Node" : "Register Node"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="space-y-5">
            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Terminal Code (IATA)</label>
              <input
                type="text"
                required
                placeholder="e.g. BOM / DEL"
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase placeholder:normal-case font-mono"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                maxLength={10}
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Geographical Name</label>
              <input
                type="text"
                required
                placeholder="Enter city name"
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                value={form.cityName}
                onChange={(e) => setForm({ ...form, cityName: e.target.value })}
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Live Status</label>
              <div className="flex bg-gray-50 rounded-2xl p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isAvailable: true })}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.isAvailable ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isAvailable: false })}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!form.isAvailable ? 'bg-white shadow-sm text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gray-100 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing Network...' : (isEditMode ? 'COMMIT NODE CHANGES' : 'AUTHORIZE NEW NODE')}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full py-4 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Dismiss
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
