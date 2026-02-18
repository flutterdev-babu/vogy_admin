'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Search, Eye, Phone, Mail, Plus, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { agentService } from '@/services/agentService';
import { Agent } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    email: '',
    agentCode: '',
  });

  const fetchAgents = async () => {
    setIsLoading(true);
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

  const filteredAgents = agents.filter(agent => {
    const nameMatch = !filters.name || agent.name.toLowerCase().includes(filters.name.toLowerCase());
    const phoneMatch = !filters.phone || agent.phone.includes(filters.phone);
    const emailMatch = !filters.email || (agent.email && agent.email.toLowerCase().includes(filters.email.toLowerCase()));
    const codeMatch = !filters.agentCode || agent.agentCode.toLowerCase().includes(filters.agentCode.toLowerCase());
    return nameMatch && phoneMatch && emailMatch && codeMatch;
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      {/* Page Title & Actions */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Agents</h1>
          <p className="text-xs text-gray-500 mt-0.5">City operations and pricing managers</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold">
            {agents.length} Agents
          </span>
          <Link
            href="/dashboard/agents/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20 text-sm font-semibold transition-all"
          >
            <Plus size={16} />
            Add Agent
          </Link>
          <button 
            onClick={fetchAgents}
            className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            {/* Header */}
            <thead className="bg-[#E32222] text-white">
              <tr>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[100px]">Custom ID</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Name</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Phone</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Email</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[120px]">Agent Code</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[120px]">Created</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[80px]">Actions</th>
              </tr>
            </thead>
            {/* Filter Row */}
            <tbody className="bg-gray-50 border-b border-gray-200">
              <tr>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-red-200 rounded outline-none focus:border-red-400"
                    value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.phone} onChange={e => setFilters({...filters, phone: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.email} onChange={e => setFilters({...filters, email: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.agentCode} onChange={e => setFilters({...filters, agentCode: e.target.value})} />
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
            </tbody>
            {/* Data Rows */}
            <tbody className="divide-y divide-gray-100">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">No agents found.</td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-3 py-3">
                      <span className="text-[11px] font-bold text-violet-600 font-mono">{agent.customId}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-sm">
                          <Briefcase size={14} className="text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-800">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-medium text-gray-600">{agent.phone}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-medium text-gray-600 truncate block max-w-[180px]">{agent.email || '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-[10px] font-bold font-mono">{agent.agentCode}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-medium text-gray-500">{new Date(agent.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </td>
                    <td className="px-3 py-3">
                      <button className="flex items-center gap-1 text-violet-500 hover:text-violet-600 text-[10px] font-medium transition-colors">
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500">Showing <span className="font-bold text-[#E32222]">{filteredAgents.length}</span> of {agents.length} agents</span>
          <div className="flex gap-1">
            <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14}/></button>
            <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
