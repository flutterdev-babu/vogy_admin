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
                    {new Date(item.createdAt).toLocaleDateString()}<br />
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
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Support Center</h1>
                    <p className="text-sm text-gray-500 font-medium">Resolution hub for customer and partner queries</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
                        <div className="px-4 py-2 border-r border-gray-50 flex flex-col items-center">
                            <span className="text-xl font-black text-gray-900 leading-none">{stats?.open || 0}</span>
                            <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter mt-1">Open</span>
                        </div>
                        <div className="px-4 py-2 flex flex-col items-center">
                            <span className="text-xl font-black text-gray-900 leading-none">{stats?.total || 0}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Total</span>
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-3 bg-white text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <AlertCircle size={28} />
                    </div>
                    <div className="mt-5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Open Tickets</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{stats?.open || 0}</p>
                    </div>
                </div>
                <div className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Clock size={28} />
                    </div>
                    <div className="mt-5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">In Progress</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{stats?.inProgress || 0}</p>
                    </div>
                </div>
                <div className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={28} />
                    </div>
                    <div className="mt-5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resolved Today</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{stats?.resolvedToday || 0}</p>
                    </div>
                </div>
                <div className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <LifeBuoy size={28} />
                    </div>
                    <div className="mt-5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Overall Volume</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{stats?.total || 0}</p>
                    </div>
                </div>
            </div>

            {/* Tickets Table Section */}
            <AdvancedTable
                data={tickets}
                columns={columns}
                itemsPerPage={10}
                isLoading={isLoading}
                searchPlaceholder="Search by ticket #, subject or customer..."
                filters={[
                    {
                        label: 'All Statuses',
                        options: [
                            { label: 'Open', value: 'OPEN' },
                            { label: 'In Progress', value: 'IN_PROGRESS' },
                            { label: 'Customer Action', value: 'WAITING_ON_CUSTOMER' },
                            { label: 'Resolved', value: 'RESOLVED' },
                            { label: 'Closed', value: 'CLOSED' }
                        ],
                        onFilterChange: (val) => setFilters({ ...filters, status: val })
                    },
                    {
                        label: 'Priority',
                        options: [
                            { label: 'Urgent', value: 'URGENT' },
                            { label: 'High', value: 'HIGH' },
                            { label: 'Medium', value: 'MEDIUM' },
                            { label: 'Low', value: 'LOW' }
                        ],
                        onFilterChange: (val) => setFilters({ ...filters, priority: val })
                    },
                    {
                        label: 'Category',
                        options: [
                            { label: 'Ride Issue', value: 'RIDE_ISSUE' },
                            { label: 'Payment', value: 'PAYMENT_ISSUE' },
                            { label: 'Partner', value: 'PARTNER_COMPLAINT' },
                            { label: 'Account', value: 'ACCOUNT_ISSUE' },
                            { label: 'Technical', value: 'APP_BUG' }
                        ],
                        onFilterChange: (val) => setFilters({ ...filters, category: val })
                    }
                ]}
            />
        </div>
    );
}
