'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { MapPin, Plus, Loader2, Pencil, Trash2, X, Check } from 'lucide-react';
import { CityCode } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CityMasterPage() {
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editCityName, setEditCityName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCityCodes();
  }, []);

  const fetchCityCodes = async () => {
    try {
      const res = await agentService.getCityCodes();
      setCityCodes(res.data);
    } catch (err) {
      console.error('Failed to fetch city codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cityCode: CityCode) => {
    setEditingId(cityCode.id);
    setEditCode(cityCode.code);
    setEditCityName(cityCode.cityName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCode('');
    setEditCityName('');
  };

  const saveEdit = async () => {
    if (!editingId || !editCode.trim() || !editCityName.trim()) return;
    
    setSaving(true);
    try {
      await agentService.updateCityCode(editingId, editCode.trim(), editCityName.trim());
      toast.success('City code updated successfully!');
      fetchCityCodes();
      cancelEdit();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update city code');
    } finally {
      setSaving(false);
    }
  };

  const deleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this city code?')) return;
    
    try {
      await agentService.deleteCityCode(id);
      toast.success('City code deleted successfully!');
      fetchCityCodes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete city code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-12 w-12 text-[#E32222]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <MapPin className="text-[#E32222]" />
          City Master
        </h1>
        <Link
          href="/agent/dashboard/city-codes/create"
          className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-xl shadow-lg shadow-red-500/30 font-medium hover:bg-[#cc1f1f] transition-colors"
        >
          <Plus size={18} />
          Add City Code
        </Link>
      </div>

      {cityCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100 h-64">
          <MapPin size={48} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No City Codes Found</h2>
          <p className="text-gray-400 mb-4">Add your first city code to get started.</p>
          <Link
            href="/agent/dashboard/city-codes/create"
            className="px-4 py-2 bg-[#E32222] text-white rounded-xl font-medium hover:bg-[#cc1f1f] transition-colors"
          >
            Add City Code
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cityCodes.map((city) => (
            <div
              key={city.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {editingId === city.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    placeholder="Code"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222]"
                  />
                  <input
                    type="text"
                    value={editCityName}
                    onChange={(e) => setEditCityName(e.target.value)}
                    placeholder="City Name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E32222] to-orange-500 flex items-center justify-center text-white font-bold">
                      {city.code.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{city.code}</h3>
                      <p className="text-gray-500 text-sm">{city.cityName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => startEdit(city)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCode(city.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
