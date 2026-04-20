'use client';

import { useEffect, useState } from 'react';
import { Send, History, Users, Bell, Radio, CheckCircle, Loader2, Image as ImageIcon, Zap, AlertTriangle } from 'lucide-react';
import { broadcastService } from '@/services/enterpriseService';
import toast from 'react-hot-toast';
import { AdvancedTable } from '@/components/ui/AdvancedTable';

const AUDIENCES = [
  { label: 'ALL RIDERS', value: 'ALL_USERS', icon: Users, desc: 'Global distribution to all registered customers' },
  { label: 'ALL CAPTAINS', value: 'ALL_PARTNERS', icon: Radio, desc: 'Full broadcast to the entire partner fleet' },
  { label: 'ONLINE CAPTAINS', value: 'ONLINE_PARTNERS', icon: Radio, desc: 'Real-time dispatch to active fleet members' },
  { label: 'ALL VENDORS', value: 'ALL_VENDORS', icon: Users, desc: 'Administrative circular for corporate vendors' },
];

interface BroadcastHistoryItem {
  id: string;
  title: string;
  body: string;
  targetAudience: string;
  recipientCount: number;
  sentByName: string;
  sentAt: string;
}

export default function BroadcastPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL_USERS');
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await broadcastService.getHistory();
      setHistory(res.data || []);
    } catch (e) {
      console.error('Failed to load broadcast history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both title and body');
      return;
    }
    setIsSending(true);
    const toastId = toast.loading('Initiating system broadcast...');
    try {
      const res = await broadcastService.sendBroadcast({ title, body, imageUrl: imageUrl || undefined, targetAudience });
      if (res.success) {
        toast.success(`Broadcast successfully dispatched to ${res.data.recipientCount} nodes!`, { id: toastId });
        setTitle('');
        setBody('');
        setImageUrl('');
        setActiveTab('history');
      } else {
        toast.error(res.message || 'Failed to send broadcast', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send broadcast', { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Broadcast Hub
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">High-Priority Mass Communication Engine</p>
        </div>

        {/* Premium Segmented Control */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200/50 shadow-inner overflow-hidden">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-10 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'compose'
              ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-100'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            COMPOSE
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-10 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-100'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            HISTORY
          </button>
        </div>
      </div>

      {activeTab === 'compose' ? (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Compose Form */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm space-y-10">
            <div className="space-y-8">
              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Announcement Header</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekend Special Offer! 🎉"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Payload Content</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your detailed announcement message here..."
                  rows={5}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-300 resize-none"
                />
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Visual Asset URL (Optional)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                    <ImageIcon size={18} />
                  </span>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://assets.ara-travels.com/promo/banner-1.jpg"
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                System Ready for Dispatch
              </div>
              <button
                onClick={handleSend}
                disabled={isSending || !title.trim() || !body.trim()}
                className="px-10 py-4 bg-red-600 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-red-100 transition-all active:scale-95 disabled:bg-gray-100 disabled:shadow-none min-w-[200px] flex items-center justify-center gap-3"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {isSending ? 'DISPATCHING...' : 'AUTHORIZE BROADCAST'}
              </button>
            </div>
          </div>

          {/* Audience Selector */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl shadow-gray-200">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Selection</h3>
              <div className="space-y-3">
                {AUDIENCES.map((aud) => (
                  <button
                    key={aud.value}
                    onClick={() => setTargetAudience(aud.value)}
                    className={`w-full text-left p-5 rounded-[1.5rem] border transition-all ${targetAudience === aud.value
                      ? 'bg-red-600 border-red-500 shadow-lg shadow-red-900/20'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${targetAudience === aud.value ? 'bg-white/20' : 'bg-gray-700'}`}>
                        <aud.icon size={18} className={targetAudience === aud.value ? 'text-white' : 'text-gray-400'} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-wider">{aud.label}</p>
                        <p className={`text-[10px] mt-0.5 line-clamp-1 ${targetAudience === aud.value ? 'text-white/60' : 'text-gray-500'}`}>{aud.desc}</p>
                      </div>
                      {targetAudience === aud.value && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-[2rem] border border-amber-100/50 p-8 space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <AlertTriangle size={20} />
                <h4 className="text-xs font-black uppercase tracking-widest">Broadcast Protocols</h4>
              </div>
              <p className="text-[10px] leading-relaxed text-amber-800/80 font-medium uppercase font-mono">
                1. Verify segment reach before transmission. <br />
                2. Announcements are logged for forensic audit. <br />
                3. High-priority push bypasses DND filters.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="animate-fade-in bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
          <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 mb-2">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Transmission Logs</h3>
              <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase">Audit trail of global announcements</p>
            </div>
            {isLoadingHistory && <Loader2 size={16} className="animate-spin text-gray-400" />}
          </div>

          <AdvancedTable
            data={history}
            itemsPerPage={10}
            isLoading={isLoadingHistory}
            columns={[
              {
                header: 'ANNOUNCEMENT',
                accessor: (item: BroadcastHistoryItem) => (
                  <div className="max-w-xs">
                    <div className="text-sm font-black text-gray-900 tracking-tight leading-tight">{item.title}</div>
                    <div className="text-[10px] text-gray-400 mt-1.5 font-medium line-clamp-1 uppercase leading-none">{item.body}</div>
                  </div>
                )
              },
              {
                header: 'SEGMENT',
                accessor: (item: BroadcastHistoryItem) => (
                  <span className="px-3 py-1 bg-gray-50 text-[10px] font-black text-gray-500 rounded-lg border border-gray-100 uppercase tracking-widest">
                    {item.targetAudience.replace('ALL_', '').replace('_', ' ')}
                  </span>
                )
              },
              {
                header: 'REACH',
                accessor: (item: BroadcastHistoryItem) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-900">{item.recipientCount.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Confirmed Delivery</span>
                  </div>
                )
              },
              {
                header: 'ORIGIN',
                accessor: (item: BroadcastHistoryItem) => (
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{item.sentByName || 'SYSTEM_ROOT'}</span>
                )
              },
              {
                header: 'TIMESTAMP',
                accessor: (item: BroadcastHistoryItem) => (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-900">{new Date(item.sentAt).toLocaleDateString()}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(item.sentAt).toLocaleTimeString()}</span>
                  </div>
                )
              },
              {
                header: 'STATUS',
                accessor: (item: BroadcastHistoryItem) => (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                    <CheckCircle size={10} /> DISPATCHED
                  </span>
                )
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
