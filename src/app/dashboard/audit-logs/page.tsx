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
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-sm text-gray-500">Track and monitor all administrative actions across the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{pagination.total} total logs</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs by description, user, module..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Module</label>
                            <select
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Modules</option>
                                {MODULES.map(m => (
                                    <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Actions</option>
                                {ACTIONS.map(a => (
                                    <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Timestamp</span>
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                                    <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Action</span>
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Module</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Description</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-600">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                            Loading audit logs...
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="text-gray-500 font-mono text-xs">
                                                {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                <br />
                                                {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <span className="font-medium text-gray-800">{log.userName || 'System'}</span>
                                                {log.userRole && (
                                                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase">
                                                        {log.userRole}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                {log.module.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs truncate text-gray-600">{stripIds(log.description)}</td>
                                        <td className="py-3 px-4 text-center">
                                            {(log.oldData || log.newData) && (
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View changes"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                        <span className="text-xs text-gray-500">
                            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => loadLogs(pagination.page - 1)}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => loadLogs(pagination.page + 1)}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Change Details</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{stripIds(selectedLog.description)}</p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
                            {/* Meta */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400 text-xs">Performed By</span>
                                    <p className="font-medium text-gray-800">{selectedLog.userName || 'System'} <span className="text-gray-400">({selectedLog.userRole})</span></p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs">Timestamp</span>
                                    <p className="font-medium text-gray-800">{new Date(selectedLog.createdAt).toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs">Module</span>
                                    <p className="font-medium text-gray-800">{selectedLog.module.replace(/_/g, ' ')}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs">Action</span>
                                    <p className="font-medium text-gray-800">{selectedLog.action.replace(/_/g, ' ')}</p>
                                </div>
                            </div>

                            {/* Old vs New Data */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedLog.oldData && sanitizeData(selectedLog.oldData) && (
                                    <div>
                                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Previous Values</span>
                                        <div className="mt-2 bg-red-50 border border-red-100 rounded-lg overflow-hidden">
                                            <table className="w-full text-xs">
                                                <tbody>
                                                    {Object.entries(sanitizeData(selectedLog.oldData)!).map(([key, value]) => (
                                                        <tr key={key} className="border-b border-red-100 last:border-0">
                                                            <td className="px-3 py-2 font-medium text-gray-600 bg-red-100/50 w-1/3">{formatFieldName(key)}</td>
                                                            <td className="px-3 py-2 text-gray-700 break-all">{formatValue(value)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {selectedLog.newData && sanitizeData(selectedLog.newData) && (
                                    <div>
                                        <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">Updated Values</span>
                                        <div className="mt-2 bg-green-50 border border-green-100 rounded-lg overflow-hidden">
                                            <table className="w-full text-xs">
                                                <tbody>
                                                    {Object.entries(sanitizeData(selectedLog.newData)!).map(([key, value]) => (
                                                        <tr key={key} className="border-b border-green-100 last:border-0">
                                                            <td className="px-3 py-2 font-medium text-gray-600 bg-green-100/50 w-1/3">{formatFieldName(key)}</td>
                                                            <td className="px-3 py-2 text-gray-700 break-all">{formatValue(value)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
