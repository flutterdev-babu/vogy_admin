'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { 
    MessageSquare, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    Filter, 
    Search, 
    RefreshCw,
    AlertTriangle,
    LifeBuoy
} from 'lucide-react';
import { supportTicketService, SupportTicket, TicketStats } from '@/services/supportTicketService';
import { toast } from 'react-hot-toast';

export default function SupportTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [stats, setStats] = useState<TicketStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        category: ''
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [ticketsRes, statsRes] = await Promise.all([
                supportTicketService.getAllTickets(filters),
                supportTicketService.getTicketStats()
            ]);

            if (ticketsRes.success && ticketsRes.data) {
                // The backend returns { tickets: [], pagination: {} }
                const ticketData = (ticketsRes.data as any).tickets || ticketsRes.data;
                setTickets(Array.isArray(ticketData) ? ticketData : []);
            }
            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            toast.error('Failed to load support tickets');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-red-50 text-red-700 border-red-100';
            case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'WAITING_ON_CUSTOMER': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'RESOLVED': return 'bg-green-50 text-green-700 border-green-100';
            case 'CLOSED': return 'bg-gray-50 text-gray-700 border-gray-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'text-red-600 font-black';
            case 'HIGH': return 'text-orange-600 font-bold';
            case 'MEDIUM': return 'text-blue-600 font-semibold';
            case 'LOW': return 'text-gray-500';
            default: return 'text-gray-500';
        }
    };

    const columns: any[] = [
        {
            header: 'Ticket #',
            accessor: (item: SupportTicket) => (
                <span className="font-mono text-[11px] font-bold text-gray-500">{item.ticketNumber}</span>
            )
        },
        {
            header: 'Subject & Category',
            accessor: (item: SupportTicket) => (
                <div className="max-w-xs">
                    <div className="font-bold text-gray-900 truncate">{item.subject}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.category.replace('_', ' ')}</div>
                </div>
            )
        },
        {
            header: 'Customer',
            accessor: (item: SupportTicket) => (
                <div>
                    <div className="font-semibold text-gray-800 text-sm">{item.customerName}</div>
                    <div className="text-[10px] text-gray-500">{item.customerType} • {item.customerPhone || 'No Phone'}</div>
                </div>
            )
        },
        {
            header: 'Priority',
            accessor: (item: SupportTicket) => (
                <span className={`text-[11px] tracking-tight ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (item: SupportTicket) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                </span>
            )
        },
        {
            header: 'Created',
            accessor: (item: SupportTicket) => (
                <div className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}<br/>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: (item: SupportTicket) => (
                <button
                    onClick={() => router.push(`/dashboard/support-tickets/${item.id}`)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-xs font-bold transition-all border border-gray-100 hover:border-red-100"
                >
                    View Details
                </button>
            )
        }
    ];

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
                    <p className="text-sm text-gray-500">Manage customer queries, complaints, and technical issues.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Open Tickets</p>
                        <p className="text-2xl font-black text-gray-900">{stats?.open || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">In Progress</p>
                        <p className="text-2xl font-black text-gray-900">{stats?.inProgress || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resolved Today</p>
                        <p className="text-2xl font-black text-gray-900">{stats?.resolvedToday || 0}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                        <LifeBuoy size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Tickets</p>
                        <p className="text-2xl font-black text-gray-900">{stats?.total || 0}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-gray-400 mr-2">
                    <Filter size={18} />
                    <span className="text-sm font-bold uppercase tracking-tighter">Filters</span>
                </div>
                
                <select 
                    value={filters.status}
                    onChange={e => setFilters({...filters, status: e.target.value})}
                    className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/10"
                >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_ON_CUSTOMER">Waiting on Customer</option>
                    <option value="RESOLVED">Resolved</option>
                </select>

                <select 
                    value={filters.priority}
                    onChange={e => setFilters({...filters, priority: e.target.value})}
                    className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/10"
                >
                    <option value="">All Priorities</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>

                <select 
                    value={filters.category}
                    onChange={e => setFilters({...filters, category: e.target.value})}
                    className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/10"
                >
                    <option value="">All Categories</option>
                    <option value="RIDE_ISSUE">Ride Issue</option>
                    <option value="PAYMENT_ISSUE">Payment Issue</option>
                    <option value="PARTNER_COMPLAINT">Partner Complaint</option>
                    <option value="ACCOUNT_ISSUE">Account Issue</option>
                    <option value="APP_BUG">App Bug</option>
                </select>

                <button 
                    onClick={() => setFilters({status: '', priority: '', category: ''})}
                    className="text-xs font-bold text-red-600 hover:text-red-700 ml-auto"
                >
                    Clear All
                </button>
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                <AdvancedTable
                    data={tickets}
                    columns={columns}
                    itemsPerPage={10}
                    isLoading={isLoading}
                    searchPlaceholder="Search by ticket #, subject or customer name..."
                />
            </div>
        </div>
    );
}
