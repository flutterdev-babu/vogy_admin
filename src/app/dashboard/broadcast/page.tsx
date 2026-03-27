'use client';

import { useEffect, useState } from 'react';
import { Send, History, Users, Bell, Radio, CheckCircle, Loader2 } from 'lucide-react';
import { broadcastService } from '@/services/enterpriseService';
import toast from 'react-hot-toast';

const AUDIENCES = [
  { label: 'All Users', value: 'ALL_USERS', icon: Users, desc: 'Send to all registered riders' },
  { label: 'All Partners', value: 'ALL_PARTNERS', icon: Radio, desc: 'Send to all registered drivers' },
  { label: 'Online Partners', value: 'ONLINE_PARTNERS', icon: Radio, desc: 'Only currently online drivers' },
  { label: 'All Vendors', value: 'ALL_VENDORS', icon: Users, desc: 'Send to all fleet vendors' },
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

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await broadcastService.getHistory();
        setHistory(res.data || []);
      } catch (e) {
        console.error('Failed to load broadcast history:', e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please fill in both title and body');
      return;
    }
    setIsSending(true);
    try {
      const res = await broadcastService.sendBroadcast({ title, body, imageUrl: imageUrl || undefined, targetAudience });
      if (res.success) {
        toast.success(`Broadcast sent to ${res.data.recipientCount} recipients!`);
        setTitle('');
        setBody('');
        setImageUrl('');
        // Reload history
        const histRes = await broadcastService.getHistory();
        setHistory(histRes.data || []);
      } else {
        toast.error(res.message || 'Failed to send broadcast');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Bell className="text-[#E32222]" size={28} /> Push Notification Broadcaster
        </h1>
        <p className="text-sm text-gray-500 mt-1">Send targeted push notifications to your users, partners, or vendors</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-200 w-fit">
        {([
          { key: 'compose' as const, label: 'Compose', icon: Send },
          { key: 'history' as const, label: 'History', icon: History },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.key
              ? 'bg-[#E32222] text-white shadow-md shadow-red-500/20'
              : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekend Special Offer! 🎉"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your notification message here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Image URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/promo-banner.jpg"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={isSending || !title.trim() || !body.trim()}
              className="w-full py-3.5 bg-[#E32222] text-white font-bold rounded-xl hover:bg-[#cc1f1f] transition-all shadow-md shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send Broadcast</>}
            </button>
          </div>

          {/* Audience Selector */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Target Audience</h3>
            <div className="space-y-3">
              {AUDIENCES.map((aud) => (
                <button
                  key={aud.value}
                  onClick={() => setTargetAudience(aud.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${targetAudience === aud.value
                    ? 'border-[#E32222] bg-red-50'
                    : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${targetAudience === aud.value ? 'bg-[#E32222] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <aud.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{aud.label}</p>
                      <p className="text-[11px] text-gray-400">{aud.desc}</p>
                    </div>
                    {targetAudience === aud.value && <CheckCircle size={18} className="text-[#E32222] ml-auto" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoadingHistory ? (
            <div className="py-16 text-center">
              <Loader2 size={24} className="mx-auto animate-spin text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">Loading broadcast history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Bell size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-bold">No broadcasts sent yet</p>
              <p className="text-sm">Compose your first notification above</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Title</th>
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Body</th>
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Audience</th>
                  <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Recipients</th>
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Sent By</th>
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-gray-800">{item.title}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 max-w-[200px] truncate">{item.body}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase">{item.targetAudience}</span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-800 text-right">{item.recipientCount}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.sentByName || 'Admin'}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">{new Date(item.sentAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
