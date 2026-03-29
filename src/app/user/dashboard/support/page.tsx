'use client';

import { useState, useEffect } from 'react';
import {
    MessageCircle,
    Send,
    Plus,
    Loader2,
    History,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    Smartphone,
    ChevronLeft
} from 'lucide-react';
import { userApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
}

const STATUS_MAP = {
    OPEN: { label: 'Open', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    IN_PROGRESS: { label: 'In Progress', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    RESOLVED: { label: 'Resolved', color: 'text-green-400', bg: 'bg-green-400/10' },
    CLOSED: { label: 'Closed', color: 'text-gray-400', bg: 'bg-gray-400/10' },
};

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [step, setStep] = useState<'list' | 'create'>('list');

    // Create Form State
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await userApi.get('/support-tickets');
            if (res.data.success) {
                setTickets(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !description) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await userApi.post('/support-tickets', {
                subject,
                description,
                priority,
                category: 'GENERAL'
            });
            if (res.data.success) {
                toast.success('Ticket created successfully');
                setSubject('');
                setDescription('');
                setStep('list');
                fetchTickets();
            }
        } catch (err) {
            toast.error('Failed to create ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="text-[#E32222] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Help & Support</h1>
                    <p className="text-gray-400 mt-1">We&apos;re here to help with your journey</p>
                </div>
                {step === 'list' && (
                    <button
                        onClick={() => setStep('create')}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#E32222] text-white font-bold text-sm shadow-lg shadow-red-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={18} /> New Ticket
                    </button>
                )}
            </div>

            {step === 'create' ? (
                <div className="rounded-3xl p-8 bg-[#0D0D0D] border border-white/5 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <button onClick={() => setStep('list')} className="text-gray-500 hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-white">Create Support Ticket</h2>
                    </div>

                    <form onSubmit={handleCreateTicket} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="What can we help you with?"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-[#E32222] transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none appearance-none cursor-pointer"
                                    style={{ colorScheme: 'dark' }}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell us more details about your issue..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-[#E32222] transition-colors resize-none"
                            />
                        </div>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-[#E32222] text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-red-900/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            Submit Ticket
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.length === 0 ? (
                        <div className="text-center py-20 rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                            <MessageCircle size={48} className="text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">No active support tickets</p>
                            <p className="text-gray-600 text-sm mt-1">If you have any issues, feel free to reach out.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {tickets.map((ticket) => {
                                const status = STATUS_MAP[ticket.status] || STATUS_MAP.OPEN;
                                return (
                                    <div
                                        key={ticket.id}
                                        className="group rounded-2xl p-6 bg-[#0D0D0D] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.bg} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                                    #{ticket.id.slice(-6)}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-600 font-medium">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-bold group-hover:text-[#E32222] transition-colors">{ticket.subject}</h3>
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{ticket.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                                                    <AlertCircle size={12} className={ticket.priority === 'URGENT' ? 'text-red-500' : 'text-gray-600'} />
                                                    {ticket.priority}
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Quick Contact Options */}
                    <div className="grid sm:grid-cols-2 gap-4 mt-8">
                        <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">WhatsApp Direct</h4>
                                <p className="text-gray-500 text-xs mt-0.5">Instant chat with support</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-700 ml-auto" />
                        </div>
                        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">24/7 Helpline</h4>
                                <p className="text-gray-500 text-xs mt-0.5">Give us a call anytime</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-700 ml-auto" />
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}

function ArrowLeft({ size }: { size: number }) {
    return <ChevronLeft size={size} />;
}
