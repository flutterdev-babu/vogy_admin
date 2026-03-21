'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Send, 
    User, 
    Clock, 
    CheckCircle2, 
    UserPlus, 
    ShieldAlert,
    AlertCircle,
    Loader2,
    Calendar,
    Phone,
    MapPin,
    Tag,
    ChevronDown,
    Lock,
    ExternalLink
} from 'lucide-react';
import { supportTicketService, SupportTicket, TicketMessage } from '@/services/supportTicketService';
import { adminManagementService } from '@/services/adminManagementService';
import { Admin as AdminType } from '@/types';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function TicketDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { admin: currentUser } = useAuth();
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [admins, setAdmins] = useState<AdminType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [resolution, setResolution] = useState('');
    const [showResolveModal, setShowResolveModal] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
        loadAdmins();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await supportTicketService.getTicketById(id as string);
            if (response.success && response.data) {
                setTicket(response.data);
            } else {
                toast.error('Ticket not found');
                router.push('/dashboard/support-tickets');
            }
        } catch (error) {
            toast.error('Failed to load ticket details');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAdmins = async () => {
        try {
            const response = await adminManagementService.getAllAdmins();
            if (response.success && response.data) {
                setAdmins(response.data);
            }
        } catch (error) {
            console.error('Failed to load admins');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await supportTicketService.addMessage(id as string, {
                message: newMessage,
                isInternal
            });

            if (response.success) {
                setNewMessage('');
                setIsInternal(false);
                loadData(); // Reload to get updated messages
            } else {
                toast.error(response.message || 'Failed to send message');
            }
        } catch (error) {
            toast.error('Error sending message');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssign = async (adminId: string) => {
        try {
            const response = await supportTicketService.assignTicket(id as string, adminId);
            if (response.success) {
                toast.success('Ticket assigned');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to assign ticket');
        }
    };

    const handleUpdateStatus = async (status: string) => {
        try {
            const response = await supportTicketService.updateTicket(id as string, { status });
            if (response.success) {
                toast.success('Status updated');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolution.trim()) return;

        try {
            const response = await supportTicketService.resolveTicket(id as string, resolution);
            if (response.success) {
                toast.success('Ticket marked as resolved');
                setShowResolveModal(false);
                setResolution('');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to resolve ticket');
        }
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                <p className="text-gray-500 font-medium">Loading ticket conversation...</p>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="animate-fade-in flex flex-col h-[calc(100vh-120px)] pb-4">
            {/* Header */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/dashboard/support-tickets')}
                        className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-gray-400">{ticket.ticketNumber}</span>
                            <h1 className="text-lg font-bold text-gray-900">{ticket.subject}</h1>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
                                ticket.status === 'OPEN' ? 'bg-red-50 text-red-600 border-red-100' :
                                ticket.status === 'RESOLVED' ? 'bg-green-50 text-green-600 border-green-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Tag size={10} />
                                {ticket.category.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                        <button 
                            onClick={() => setShowResolveModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
                        >
                            <CheckCircle2 size={18} />
                            Resolve Ticket
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Initial Description */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 border-dashed">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Original Issue Description</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                            <div className="mt-3 text-[10px] text-gray-400 flex items-center gap-2">
                                <Clock size={12} />
                                {new Date(ticket.createdAt).toLocaleString()}
                            </div>
                        </div>

                        {/* Messages Thread */}
                        {ticket.messages?.map((msg) => {
                            const isAdmin = msg.senderType === 'ADMIN' || msg.senderType === 'SYSTEM';
                            const isMe = msg.senderId === currentUser?.id;

                            return (
                                <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                                        msg.isInternal 
                                        ? 'bg-yellow-50 border border-yellow-100 text-yellow-900 border-dashed' 
                                        : isAdmin 
                                          ? 'bg-[#E32222] text-white shadow-md shadow-red-500/20' 
                                          : 'bg-white border border-gray-200 text-gray-800'
                                    }`}>
                                        <div className="flex items-center justify-between gap-4 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-tight opacity-70">
                                                {msg.senderName} 
                                                {msg.isInternal && ' • INTERNAL NOTE'}
                                            </span>
                                            <span className="text-[10px] opacity-60">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions & Input */}
                    {ticket.status !== 'CLOSED' && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            <form onSubmit={handleSendMessage} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsInternal(!isInternal)}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                                isInternal 
                                                ? 'bg-yellow-100 border-yellow-300 text-yellow-700 shadow-inner' 
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                            }`}
                                        >
                                            <Lock size={12} />
                                            {isInternal ? 'INTERNAL NOTE ACTIVE' : 'MAKE INTERNAL NOTE'}
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">Shift + Enter for new line</span>
                                </div>
                                <div className="relative group">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={isInternal ? "Write a private note only visible to admins..." : "Type your reply to the customer..."}
                                        className={`w-full p-4 pr-14 rounded-2xl border bg-white outline-none transition-all resize-none shadow-sm ${
                                            isInternal 
                                            ? 'border-yellow-200 focus:ring-4 focus:ring-yellow-500/5' 
                                            : 'border-gray-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/5'
                                        }`}
                                        rows={3}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || isSubmitting}
                                        className={`absolute bottom-3 right-3 p-3 rounded-xl transition-all shadow-lg ${
                                            !newMessage.trim() || isSubmitting
                                            ? 'bg-gray-100 text-gray-400'
                                            : isInternal 
                                              ? 'bg-yellow-500 text-white shadow-yellow-500/30' 
                                              : 'bg-red-600 text-white shadow-red-500/30 active:scale-95'
                                        }`}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Info & Controls */}
                <div className="w-80 flex flex-col gap-4 overflow-y-auto no-scrollbar">
                    {/* Customer Info Card */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{ticket.customerName}</h3>
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">{ticket.customerType}</p>
                            </div>
                        </div>
                        <div className="space-y-3 pb-4 border-b border-gray-50">
                            {ticket.customerPhone && (
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone size={14} className="text-gray-400" />
                                    <span className="text-xs font-semibold">{ticket.customerPhone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-gray-600">
                                <Clock size={14} className="text-gray-400" />
                                <span className="text-xs font-semibold">Joined {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button 
                                onClick={() => router.push(`/dashboard/users?search=${ticket.customerPhone}`)}
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-50"
                            >
                                <ExternalLink size={14} />
                                View Profile
                            </button>
                        </div>
                    </div>

                    {/* Assignment Card */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Assignment</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Assign To</label>
                                <select 
                                    value={ticket.assignedToId || ''}
                                    onChange={(e) => handleAssign(e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/10"
                                >
                                    <option value="">Unassigned</option>
                                    {admins.map(admin => (
                                        <option key={admin.id} value={admin.id}>{admin.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Priority</label>
                                <select 
                                    value={ticket.priority}
                                    onChange={(e) => handleUpdateStatus(e.target.value)} 
                                    className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none font-bold"
                                >
                                    <option value="LOW" className="text-gray-500">LOW</option>
                                    <option value="MEDIUM" className="text-blue-600">MEDIUM</option>
                                    <option value="HIGH" className="text-orange-600">HIGH</option>
                                    <option value="URGENT" className="text-red-700">URGENT</option>
                                </select>
                            </div>
                            {ticket.rideId && (
                                <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3">
                                    <ShieldAlert size={18} className="text-red-600" />
                                    <div>
                                        <p className="text-[10px] font-black text-red-800 uppercase leading-none">Linked Ride</p>
                                        <button 
                                            onClick={() => router.push(`/dashboard/rides/${ticket.rideId}`)}
                                            className="text-[11px] font-bold text-red-600 hover:underline"
                                        >
                                            View Ride #{ticket.rideId.slice(-6)}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Resolve Modal */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-pop-in">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 mx-auto">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-center text-gray-900 mb-2">Resolve Ticket</h2>
                        <p className="text-center text-gray-500 text-sm mb-6">Describe how the issue was addressed. This will be visible to the customer.</p>
                        
                        <form onSubmit={handleResolve} className="space-y-4">
                            <textarea
                                required
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                placeholder="Resolution details..."
                                rows={4}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all resize-none"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowResolveModal(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black transition-all shadow-lg shadow-green-600/30"
                                >
                                    Confirm Resolution
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
