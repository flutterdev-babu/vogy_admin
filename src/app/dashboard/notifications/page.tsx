'use client';

import { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle, AlertTriangle, Loader2, Megaphone, Shield, Zap, RotateCcw, Users, UserCheck, Building2 } from 'lucide-react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { toast } from 'react-hot-toast';
import { notificationService, Notification } from '@/services/notificationService';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function NotificationCenterPage() {
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [notification, setNotification] = useState({
        title: '',
        message: '',
        target: 'ALL', // ALL, PARTNERS, VENDORS, USERS
    });

    const [history, setHistory] = useState<Notification[]>([]);

    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const response = await notificationService.getAll();
            if (response.success && response.data) {
                setHistory(response.data);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notification.title || !notification.message) {
            toast.error('Please fill in all protocol fields');
            return;
        }

        setIsSending(true);
        const toastId = toast.loading('Initiating global broadcast protocol...');
        try {
            const response = await notificationService.send({
                title: notification.title,
                message: notification.message,
                type: 'INFO',
                targetAudience: notification.target as any,
            });

            if (response.success) {
                toast.success(`Broadcasting initiated successfully`, { id: toastId });
                setNotification({ title: '', message: '', target: 'ALL' });
                setActiveTab('history');
            } else {
                toast.error(response.message || 'Broadcast authorization failure', { id: toastId });
            }
        } catch (error) {
            toast.error('System synchronization failure', { id: toastId });
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
                        Notification Command
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">High-Priority Transmission & Push Alert Architecture</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-[1.5rem] border border-gray-100 shadow-inner overflow-hidden">
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'compose'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        COMPOSE
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        LOGS
                    </button>
                </div>
            </div>

            {activeTab === 'compose' ? (
                <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Main Compose Card */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSend} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm space-y-10">
                            <div className="space-y-10">
                                {/* Target Selection */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Distribution Target</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { id: 'ALL', icon: Megaphone },
                                            { id: 'PARTNERS', icon: UserCheck },
                                            { id: 'VENDORS', icon: Building2 },
                                            { id: 'USERS', icon: Users }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setNotification({ ...notification, target: opt.id })}
                                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${notification.target === opt.id
                                                    ? 'bg-gray-900 border-gray-900 text-white shadow-2xl shadow-gray-200 scale-[1.02]'
                                                    : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:border-gray-200'
                                                    }`}
                                            >
                                                <opt.icon size={20} className={notification.target === opt.id ? 'text-red-500' : 'text-gray-300'} />
                                                {opt.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Title Field */}
                                    <div className="group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Transmission Header</label>
                                        <input
                                            type="text"
                                            value={notification.title}
                                            onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                                            className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-300"
                                            placeholder="e.g. Critical System Update Notice"
                                        />
                                    </div>

                                    {/* Message Field */}
                                    <div className="group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Payload Payload</label>
                                        <textarea
                                            value={notification.message}
                                            onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                                            rows={8}
                                            className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all resize-none placeholder:text-gray-300"
                                            placeholder="Enter the detailed announcement payload content here..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-between border-t border-gray-50">
                                <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200" />
                                    Synchronized & Ready
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="flex items-center gap-3 px-10 py-5 bg-red-600 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-red-100 transition-all active:scale-95 disabled:bg-gray-100 disabled:shadow-none min-w-[240px] justify-center"
                                >
                                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    <span>{isSending ? 'DISPATCHING...' : 'AUTHORIZE TRANSMISSION'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl shadow-gray-200 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-red-600/20 transition-all" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Broadcast Integrity</h3>
                                    <Shield size={20} className="text-red-500" />
                                </div>
                                <div className="space-y-4">
                                    <div className="p-5 bg-gray-800 rounded-2xl border border-gray-700/50">
                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Estimated Reach</p>
                                        <p className="text-3xl font-black text-white">4.2k <span className="text-[10px] font-bold text-emerald-400">NODES</span></p>
                                    </div>
                                    <div className="p-5 bg-gray-800 rounded-2xl border border-gray-700/50">
                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Latency Proxy</p>
                                        <p className="text-xl font-black text-white">&lt; 45ms <span className="text-[10px] font-bold text-amber-400">GLOBAL</span></p>
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-400 font-medium uppercase leading-relaxed font-mono">
                                    Distribution via low-latency WebSocket clusters and FCM priority channels.
                                </p>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-[2.5rem] border border-amber-100 p-8 space-y-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                                <AlertTriangle size={24} />
                            </div>
                            <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">Compliance Protocol</h4>
                            <ul className="space-y-3">
                                {[
                                    'IMMUTABILITY: Post-transmission content cannot be altered.',
                                    'FREQUENCY: Limit broadcasts to 2 per 24h cycle.',
                                    'ENCRYPTION: All payloads are TLS 1.3 secured.'
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3">
                                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 shrink-0" />
                                        <p className="text-[10px] leading-relaxed text-amber-800 font-bold uppercase tracking-tighter">{step}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
                    <div className="px-8 py-8 flex items-center justify-between border-b border-gray-50 mb-2">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transmission Logs</h3>
                            <p className="text-[10px] font-bold text-gray-900 mt-1 uppercase tracking-tighter">Audit trail of global distributive announcements</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {isLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
                            <button onClick={loadHistory} className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-all">
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>
                    <AdvancedTable
                        data={history}
                        isLoading={isLoading}
                        columns={[
                            {
                                header: 'LOG IDENTITY',
                                accessor: (item: any) => (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <Megaphone size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-gray-900 tracking-tight leading-none uppercase">{item.title}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase mt-1.5 tracking-tighter font-mono">
                                                TRX-{item.id.slice(-8).toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                header: 'PAYLOAD SNIPPET',
                                accessor: (item: any) => (
                                    <p className="text-[11px] text-gray-500 font-medium line-clamp-1 max-w-xs uppercase tracking-tighter">{item.message}</p>
                                )
                            },
                            {
                                header: 'TARGET SEGMENT',
                                accessor: (item: any) => (
                                    <span className="px-4 py-1.5 bg-indigo-50 text-[10px] font-black text-indigo-600 rounded-xl border border-indigo-100/50 uppercase tracking-widest">
                                        {item.targetAudience}
                                    </span>
                                )
                            },
                            {
                                header: 'DISTRIBUTION TIME',
                                accessor: (item: any) => (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-900">{new Date(item.sentAt).toLocaleDateString()}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter font-mono">{new Date(item.sentAt).toLocaleTimeString()}</span>
                                    </div>
                                )
                            },
                            {
                                header: 'NETWORK STATUS',
                                accessor: (item: any) => (
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                                        <CheckCircle size={10} /> {item.status}
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
