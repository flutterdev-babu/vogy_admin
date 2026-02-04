'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Search, Eye, Phone, Mail, MapPin, Plus, Building2, Users } from 'lucide-react';
import { agentService } from '@/services/agentService';
import { Agent } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAgents = async () => {
    try {
      const response = await agentService.getAll();
      if (response.success) {
        setAgents(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(search.toLowerCase()) ||
    agent.phone.includes(search) ||
    (agent.email && agent.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Agents</h1>
          <p className="text-gray-500 mt-1">City operations and pricing managers</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-violet-100 text-violet-600 text-sm font-semibold">
          {agents.length} Agents
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
            placeholder="Search by name, phone, or email..."
            className="input pl-11"
          />
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No agents found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="card p-6 hover:border-violet-300 transition-all group">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                  <Briefcase size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{agent.name}</h3>
                  <p className="text-xs text-violet-500 font-medium">Operations Agent</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Phone size={14} className="text-violet-500" />
                  </div>
                  <span className="text-sm">{agent.phone}</span>
                </div>
                {agent.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                      <Mail size={14} className="text-violet-500" />
                    </div>
                    <span className="text-sm truncate">{agent.email}</span>
                  </div>
                )}
              </div>

              {/* Stats Placeholder */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-violet-50 rounded-xl">
                  <div className="flex items-center gap-2 text-violet-600 mb-1">
                    <MapPin size={14} />
                    <span className="text-xs font-medium">Cities</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">-</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Building2 size={14} />
                    <span className="text-xs font-medium">Vendors</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">-</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl text-sm font-medium transition-colors">
                  <Plus size={16} />
                  Assign
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-medium transition-colors">
                  <Eye size={16} />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
