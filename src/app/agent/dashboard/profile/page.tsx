'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { User, Phone, Mail, MapPin, Edit, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { USER_KEYS } from '@/lib/api';
import { CityCode } from '@/types';

export default function AgentProfilePage() {
  const [agent, setAgent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cityCodeId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch city codes
      const cityRes = await agentService.getCityCodes();
      setCityCodes(cityRes.data);

      // Load agent from localStorage
      const stored = localStorage.getItem(USER_KEYS.agent);
      if (stored) {
        const data = JSON.parse(stored);
        setAgent(data);
        setFormData({ 
          name: data.name, 
          email: data.email || '', 
          phone: data.phone,
          cityCodeId: data.cityCodeId || data.cityCode?.id || ''
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email || undefined,
      };
      
      // Include cityCodeId if changed
      if (formData.cityCodeId) {
        updateData.cityCodeId = formData.cityCodeId;
      }

      await agentService.updateProfile(updateData);
      
      // Find the selected city code to update display
      const selectedCityCode = cityCodes.find(cc => cc.id === formData.cityCodeId);
      const updatedAgent = { 
        ...agent, 
        ...formData,
        cityCode: selectedCityCode || agent.cityCode 
      };
      
      setAgent(updatedAgent);
      localStorage.setItem(USER_KEYS.agent, JSON.stringify(updatedAgent));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (agent) {
      setFormData({
        name: agent.name,
        email: agent.email || '',
        phone: agent.phone,
        cityCodeId: agent.cityCodeId || agent.cityCode?.id || ''
      });
    }
  };

  // Get current city code display value
  const getCurrentCityCode = () => {
    if (agent?.cityCode?.code) return agent.cityCode.code;
    if (agent?.cityCodeId) {
      const cc = cityCodes.find(c => c.id === agent.cityCodeId);
      return cc?.code || 'N/A';
    }
    return 'N/A';
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E32222]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-32 bg-gradient-to-r from-[#E32222] to-purple-600"></div>
        <div className="px-8 pb-8">
           <div className="relative -mt-16 mb-6 flex justify-between items-end">
              <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-lg">
                 <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <User size={64} />
                 </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <X size={18}/> Cancel
                    </button>
                    <button 
                      onClick={handleUpdate}
                      disabled={saving}
                      className="px-6 py-2 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={18}/>
                      )}
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  >
                    <Edit size={18}/> Edit Profile
                  </button>
                )}
              </div>
           </div>

           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="text-sm text-gray-500 block mb-1">Full Name</label>
                    {isEditing ? (
                      <input 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222]"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-gray-800">{agent.name}</h2>
                    )}
                 </div>
                 
                 <div>
                    <label className="text-sm text-gray-500 block mb-1">Email</label>
                    {isEditing ? (
                      <input 
                        type="email"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222]"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600">
                         <Mail size={16} />
                         {agent.email || 'N/A'}
                      </div>
                    )}
                 </div>

                 <div>
                    <label className="text-sm text-gray-500 block mb-1">Phone</label>
                    <div className="flex items-center gap-2 text-gray-600">
                       <Phone size={16} />
                       {agent.phone}
                    </div>
                 </div>

                 <div>
                    <label className="text-sm text-gray-500 block mb-1">City Code</label>
                    {isEditing ? (
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E32222]/20 focus:border-[#E32222] appearance-none bg-white"
                          value={formData.cityCodeId}
                          onChange={(e) => setFormData({...formData, cityCodeId: e.target.value})}
                        >
                          <option value="">Select city code</option>
                          {cityCodes.map((cc) => (
                            <option key={cc.id} value={cc.id}>{cc.code} - {cc.cityName}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                         {getCurrentCityCode()}
                      </div>
                    )}
                 </div>

                 <div>
                    <label className="text-sm text-gray-500 block mb-1">Agent Code</label>
                    <div className="inline-block px-3 py-1 rounded-full bg-purple-50 text-purple-600 font-semibold text-sm">
                       {agent.agentCode || agent.customId || agent.id?.slice(-8)?.toUpperCase() || 'N/A'}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
