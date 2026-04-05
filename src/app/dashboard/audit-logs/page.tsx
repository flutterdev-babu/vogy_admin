'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Clock, Search, Filter, ChevronLeft, ChevronRight, X, ArrowUpDown, Eye } from 'lucide-react';
import { auditLogService, AuditLog, AuditLogFilters } from '@/services/auditLogService';

const ACTION_COLORS: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    STATUS_CHANGE: 'bg-yellow-100 text-yellow-700',
    ASSIGNMENT: 'bg-purple-100 text-purple-700',
    LOGIN: 'bg-teal-100 text-teal-700',
    LOGOUT: 'bg-gray-100 text-gray-600',
};

const MODULES = [
    'VEHICLE_TYPE', 'PARTNER', 'VENDOR', 'VEHICLE', 'RIDE',
    'PRICING', 'USER', 'AGENT', 'ATTACHMENT', 'CORPORATE', 'BILLING'
];

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'ASSIGNMENT', 'LOGIN', 'LOGOUT'];

// Fields to hide from audit log detail view (internal/sensitive data)
const HIDDEN_FIELDS = new Set([
    'id', '_id', 'createdAt', 'updatedAt', 'deletedAt',
    'pricingGroupIds', 'agentId', 'cityCodeId', 'vendorId',
    'vehicleTypeId', 'vehicleId', 'partnerId', 'userId',
    'adminId', 'corporateId', 'referenceId', 'entityId',
    'password', 'token', 'otp', 'secretKey',
    'updatedByAdminId', 'createdByAdminId',
]);

const sanitizeData = (data: any): Record<string, any> | null => {
    if (!data || typeof data !== 'object') return null;
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        if (HIDDEN_FIELDS.has(key)) continue;
        if (key.endsWith('Id') || key.endsWith('_id')) continue;
        clean[key] = value;
    }
    return Object.keys(clean).length > 0 ? clean : null;
};

const formatFieldName = (key: string): string => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, s => s.toUpperCase())
        .trim();
};

const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return stripIds(JSON.stringify(value));
    return stripIds(String(value));
};

// Strip MongoDB ObjectIDs (24-char hex) and any UUID-like patterns from display text
const stripIds = (text: string): string => {
    return text
        .replace(/[a-f0-9]{24}/gi, '')
        .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '')
        .replace(/:\s*$/g, '')       // remove trailing colon
        .replace(/:\s*,/g, ',')
        .replace(/:\s*}/g, '}')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    // Filters
    const [search, setSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const loadLogs = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const filters: AuditLogFilters = {
                page,
                limit: 20,
                ...(search && { search }),
                ...(moduleFilter && { module: moduleFilter }),
                ...(actionFilter && { action: actionFilter }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
            };
            const response = await auditLogService.getAll(filters);
            if (response.success) {
                setLogs(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    }, [search, moduleFilter, actionFilter, startDate, endDate]);

    useEffect(() => {
        loadLogs(1);
    }, [loadLogs]);

    const clearFilters = () => {
        setSearch('');
        setModuleFilter('');
        setActionFilter('');
        setStartDate('');
        setEndDate('');
    };

    const hasActiveFilters = search || moduleFilter || actionFilter || startDate || endDate;

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
                        Chronos Audit
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">High-Fidelity Platform activity Trace</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-gray-900 rounded-2xl">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{pagination.total} ENTRIES LOGGED</span>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                        <Shield size={24} />
                    </div>
                </div>
            </div>

            {/* Search & Filter Terminal */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 relative w-full group">
                        <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH ACTIVITY SIGNATURES..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[1.5rem] text-[11px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all uppercase tracking-widest placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${showFilters
                                    ? 'bg-gray-900 text-white shadow-xl shadow-gray-200'
                                    : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            TERMINAL FILTERS
                            {hasActiveFilters && (
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-4 text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
                            >
                                PURGE FILTERS
                            </button>
                        )}
                    </div>
                </div>

                {/* Expansion Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-50 animate-fade-in-up">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Domain Module</label>
                            <select
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-[10px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none uppercase tracking-widest"
                            >
                                <option value="">All Domains</option>
                                {MODULES.map(m => (
                                    <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Action Vector</label>
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-[10px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none uppercase tracking-widest"
                            >
                                <option value="">All Vectors</option>
                                {ACTIONS.map(a => (
                                    <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Temporal Start</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-[10px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none uppercase tracking-widest"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Temporal End</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 text-[10px] font-black text-gray-900 focus:ring-2 focus:ring-gray-200 outline-none uppercase tracking-widest"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Logs Data Grid */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp Signature</th>
                                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operator Asset</th>
                                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity Vector</th>
                                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Domain</th>
                                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Event Description</th>
                                <th className="text-center py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Telemetry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Trace Logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Shield size={48} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Activity Traces detected</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-gray-50/50 transition-all">
                                        <td className="py-5 px-8">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-900 font-mono uppercase tracking-tighter">
                                                    {new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-widest">
                                                    {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center font-black text-[10px]">
                                                    {log.userName?.[0] || 'S'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-900 tracking-tight uppercase">{log.userName || 'System Engine'}</span>
                                                    {log.userRole && (
                                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
                                                            {log.userRole}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full border border-current opacity-90 tracking-widest ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-5 px-8">
                                            <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-gray-100">
                                                {log.module.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-5 px-8">
                                            <p className="text-[11px] font-bold text-gray-600 max-w-sm truncate uppercase tracking-tight" title={stripIds(log.description)}>
                                                {stripIds(log.description)}
                                            </p>
                                        </td>
                                        <td className="py-5 px-8 text-center">
                                            {(log.oldData || log.newData) ? (
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-300 hover:text-gray-900 hover:bg-white rounded-xl transition-all shadow-sm"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <div className="w-10 h-10 flex items-center justify-center text-gray-200 opacity-30">
                                                    <Shield size={16} />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Terminal */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-6 bg-gray-50/50 border-t border-gray-50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} – {Math.min(pagination.page * pagination.limit, pagination.total)} OF {pagination.total} ENTRIES
                        </span>
                        <div className="flex items-center gap-4 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => loadLogs(pagination.page - 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-20 transition-all font-black"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="px-6 flex items-center gap-2">
                                <span className="text-xs font-black text-gray-900">PAGE {pagination.page}</span>
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">OF {pagination.totalPages}</span>
                            </div>
                            <button
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => loadLogs(pagination.page + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-20 transition-all font-black"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Change Detail Terminal Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-gray-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-gray-200">
                                    <Search size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Delta Analysis</h2>
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em] mt-1">{stripIds(selectedLog.description)}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-gray-900 hover:bg-white rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                            {/* Summary Block */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Operator Signature', value: selectedLog.userName || 'SYSTEM_CORE', sub: selectedLog.userRole },
                                    { label: 'Temporal Marker', value: new Date(selectedLog.createdAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' }) },
                                    { label: 'Domain Module', value: selectedLog.module.replace(/_/g, ' ') },
                                    { label: 'Action Vector', value: selectedLog.action.replace(/_/g, ' ') },
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50/50 rounded-[1.5rem] p-6 border border-gray-100 flex flex-col justify-between">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{item.label}</span>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{item.value}</p>
                                            {item.sub && <p className="text-[9px] font-black text-indigo-500 uppercase mt-1 tracking-widest">{item.sub}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-gray-900 rounded-[2rem] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="px-3 py-1 bg-gray-800 text-gray-400 rounded-lg font-mono text-[10px] uppercase font-black tracking-widest">NETWORK_SIGNATURE</div>
                                    <span className="font-mono text-sm text-indigo-400 font-black">{selectedLog.ipAddress || '--- EXTERNAL ---'}</span>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">TELEMETRY_HEADER</span>
                                    <p className="text-[10px] font-black text-white max-w-[300px] truncate uppercase font-mono tracking-tighter" title={selectedLog.userAgent || ''}>{selectedLog.userAgent || 'ANONYMOUS_AGENT'}</p>
                                </div>
                            </div>

                            {/* Delta Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {selectedLog.oldData && sanitizeData(selectedLog.oldData) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 ml-2">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Previous State (Legacy)</span>
                                        </div>
                                        <div className="bg-red-50/30 border border-red-100 rounded-[2rem] overflow-hidden">
                                            <table className="w-full">
                                                <tbody>
                                                    {Object.entries(sanitizeData(selectedLog.oldData)!).map(([key, value]) => (
                                                        <tr key={key} className="border-b border-red-100/50 last:border-0 hover:bg-red-100/20 transition-all">
                                                            <td className="px-6 py-4 text-[9px] font-black text-red-600/60 uppercase tracking-widest w-1/3 border-r border-red-100/30">{formatFieldName(key)}</td>
                                                            <td className="px-6 py-4 text-[11px] font-black text-gray-700 uppercase tracking-tight">{formatValue(value)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {selectedLog.newData && sanitizeData(selectedLog.newData) && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 ml-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Current State (Mutated)</span>
                                        </div>
                                        <div className="bg-emerald-50/30 border border-emerald-100 rounded-[2rem] overflow-hidden">
                                            <table className="w-full">
                                                <tbody>
                                                    {Object.entries(sanitizeData(selectedLog.newData)!).map(([key, value]) => (
                                                        <tr key={key} className="border-b border-emerald-100/50 last:border-0 hover:bg-emerald-100/20 transition-all">
                                                            <td className="px-6 py-4 text-[9px] font-black text-emerald-600/60 uppercase tracking-widest w-1/3 border-r border-emerald-100/30">{formatFieldName(key)}</td>
                                                            <td className="px-6 py-4 text-[11px] font-black text-gray-900 uppercase tracking-tight">{formatValue(value)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-black transition-all"
                            >
                                CLOSE TELEMETRY
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
