'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { Shield, Clock, MousePointer, Loader2 } from 'lucide-react';
import { auditLogService, AuditLog } from '@/services/auditLogService';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const response = await auditLogService.getAll();
            if (response.success && response.data) {
                setLogs(response.data);
            }
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns: any[] = [
        { header: 'Timestamp', accessor: (item: any) => <span className="text-gray-500 font-mono text-xs">{new Date(item.performedAt).toLocaleString()}</span> },
        {
            header: 'Action', accessor: (item: any) => (
                <span className="font-bold text-gray-800 flex items-center gap-2">
                    <MousePointer className="w-3 h-3 text-gray-400" />
                    {item.action}
                </span>
            )
        },
        { header: 'User', accessor: 'performedBy' },
        { header: 'Details', accessor: 'details' },
        { header: 'IP Address', accessor: (item: any) => <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{item.ipAddress}</span> },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-sm text-gray-500">Track and monitor all administrative actions.</p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Shield className="w-6 h-6" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    Recent Activity
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </h2>
                <AdvancedTable
                    data={logs}
                    columns={columns}
                    searchable={true}
                    searchKeys={['action', 'performedBy', 'details']}
                    itemsPerPage={15}
                />
            </div>
        </div>
    );
}
