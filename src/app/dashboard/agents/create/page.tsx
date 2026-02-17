'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { agentService } from '@/services/agentService';
import { AgentRegisterRequest } from '@/types';

export default function AdminCreateAgentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }
    setIsLoading(true);
    try {
      const submitData: AgentRegisterRequest = {
        name: formData.name,
        phone: `+91${formData.phone}`,
        email: formData.email || undefined,
        password: formData.password,
      };
      const response = await agentService.createAgentByAdmin(submitData);
      if (response.success) {
        toast.success('Agent created successfully!');
        router.push('/dashboard/agents');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all bg-white";
  const labelClass = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block";

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Link href="/dashboard/agents" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 group text-sm">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Agents
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create New Agent</h1>
        <p className="text-sm text-gray-500 mt-1">Register a new operations agent</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#E32222] uppercase tracking-wide mb-2">Agent Information</h3>
          <div>
            <label className={labelClass}>Full Name *</label>
            <input type="text" required value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className={inputClass} placeholder="Agent Name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium">+91</span>
                <input type="tel" required value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  className="w-full border border-gray-200 rounded-r-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/30 transition-all"
                  placeholder="9876543210" maxLength={10} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={inputClass} placeholder="agent@aratravels.com" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Password *</label>
            <input type="password" required value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className={inputClass} placeholder="Create a password" />
          </div>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-semibold text-sm shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
          <span>{isLoading ? 'Creating Agent...' : 'Create Agent'}</span>
        </button>
      </form>
    </div>
  );
}
