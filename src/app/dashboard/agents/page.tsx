'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Search, Eye, Phone, Mail, Plus, ChevronLeft, ChevronRight, RotateCcw, Edit2, X, AlertCircle, Loader2, MapPin, Ticket, CheckCircle } from 'lucide-react';
import { agentService } from '@/services/agentService';
import { Agent } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    couponCode: '',
    cityCodeId: ''
  });
  const [cityCodes, setCityCodes] = useState<{ id: string; code: string; cityName: string }[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const fetchCityCodes = async () => {
    try {
      const response = await agentService.getCityCodes();
      if (response.success) {
        setCityCodes(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load city codes:', error);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchCityCodes();
  }, []);

  const handleEditClick = (agent: Agent) => {
    setEditingAgent(agent);
    const firstCoupon = agent.coupons?.[0];
    setEditFormData({
      name: agent.name,
      couponCode: firstCoupon?.couponCode || '',
      cityCodeId: agent.cityCodeId || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setIsUpdating(true);
    try {
      const payload: any = { name: editFormData.name };

      if (editFormData.couponCode) {
        payload.agentCode = editFormData.couponCode;
      }
      if (editFormData.cityCodeId) {
        payload.cityCodeId = editFormData.cityCodeId;
      }

      const response = await agentService.updateAgentByAdmin(editingAgent.id, payload);
      if (response.success) {
        toast.success('Agent records successfully synchronized');
        setIsEditModalOpen(false);
        fetchAgents();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Synchronization failure');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Operations Command
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">City Operations & Growth Managers Registry</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agents/create"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs shadow-lg shadow-gray-100 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={16} />
            <span>AUTHORIZE NEW AGENT</span>
          </Link>
          <button
            onClick={fetchAgents}
            className="p-3 bg-white text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Agents Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 mb-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authorized Field Agents</h3>
          <div className="flex items-center gap-4">
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-100/50">
              {agents.length} AGENTS ACTIVE
            </span>
          </div>
        </div>

        <AdvancedTable
          data={agents}
          itemsPerPage={10}
          isLoading={isLoading}
          searchPlaceholder="Search by name, phone or agent code..."
          columns={[
            {
              header: 'AGENT IDENTITY',
              accessor: (item: Agent) => (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 font-black text-xs uppercase">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900 tracking-tight leading-none uppercase">{item.name}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mt-1.5 tracking-tighter">
                      {item.customId || 'TRK-NEW'}
                    </div>
                  </div>
                </div>
              )
            },
            {
              header: 'COMMUNICATIONS',
              accessor: (item: Agent) => (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={10} className="text-gray-400" />
                    <span className="text-[10px] font-black">{item.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail size={10} />
                    <span className="text-[9px] font-bold truncate max-w-[120px] uppercase font-mono">{item.email || 'N/A'}</span>
                  </div>
                </div>
              )
            },
            {
              header: 'COMMAND CODE',
              accessor: (item: Agent) => (
                <span className="px-3 py-1 bg-gray-50 text-[10px] font-black text-indigo-600 rounded-lg border border-indigo-100/30 uppercase tracking-widest font-mono">
                  {item.agentCode}
                </span>
              )
            },
            {
              header: 'JURISDICTION',
              accessor: (item: Agent) => (
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-gray-300" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                    {item.cityCode?.code || 'Global'}
                  </span>
                </div>
              )
            },
            {
              header: 'COMMISSIONED',
              accessor: (item: Agent) => (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-900">{new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Active since</span>
                </div>
              )
            },
            {
              header: 'COMMAND',
              accessor: (item: Agent) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <Link
                    href={`/dashboard/agents/${item.id}`}
                    className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Eye size={16} />
                  </Link>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Edit Agent Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Recalibrate Agent Profile"
        size="lg"
      >
        <form onSubmit={handleUpdateAgent} className="space-y-10 p-2">
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none">Identity Binding</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{editingAgent?.customId}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Assigned Jurisdiction</label>
                  <div className="relative">
                    <select
                      value={editFormData.cityCodeId}
                      onChange={e => setEditFormData({ ...editFormData, cityCodeId: e.target.value })}
                      className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all appearance-none"
                    >
                      <option value="">Global Operations</option>
                      {cityCodes.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.cityName} ({city.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100/50 space-y-6">
              <div className="flex items-center gap-4 text-indigo-600">
                <Ticket size={24} />
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest leading-none">Growth Binding</h4>
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block ml-1">Coupon Formula Override</label>
                <input
                  type="text"
                  value={editFormData.couponCode}
                  onChange={e => setEditFormData({ ...editFormData, couponCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. AGENTBLR50"
                  className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-indigo-200 font-mono uppercase"
                />
              </div>
              <p className="text-[9px] text-indigo-500/60 font-medium uppercase leading-relaxed font-mono">
                Linking a specific promotion formula to this agent profile enables algorithmic yield tracking and referral tracing.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-8 py-4 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black transition-all flex items-center gap-3 disabled:bg-gray-200 disabled:shadow-none min-w-[200px] flex items-center justify-center"
            >
              {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              <span>{isUpdating ? 'SYNCHRONIZING...' : 'COMMIT CHANGES'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
