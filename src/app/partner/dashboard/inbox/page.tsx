'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Info, CheckCircle, Loader2 } from 'lucide-react';
import { partnerService } from '@/services/partnerService';

export default function PartnerInboxPage() {
    // any type for now as notification type definition might vary
    const [alerts, setAlerts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await partnerService.getNotifications();
                if (response.success && response.data) {
                    setAlerts(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch notifications');
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'CRITICAL': return <AlertCircle className="text-red-600" />;
            case 'INFO': return <Info className="text-blue-600" />;
            case 'SUCCESS': return <CheckCircle className="text-green-600" />;
            default: return <Bell className="text-gray-600" />;
        }
    };

    const getBg = (type: string) => {
        switch (type) {
            case 'CRITICAL': return 'bg-red-50 border-red-100';
            case 'INFO': return 'bg-blue-50 border-blue-100';
            case 'SUCCESS': return 'bg-green-50 border-green-100';
            default: return 'bg-gray-50 border-gray-100';
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
                <button className="text-sm text-gray-500 hover:text-gray-900">Mark all as read</button>
            </div>

            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-xl border ${getBg(alert.type || 'INFO')} flex gap-4 transition-transform hover:scale-[1.01]`}>
                        <div className="mt-1">
                            {getIcon(alert.type || 'INFO')}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 text-sm">{alert.title}</h3>
                                <span className="text-xs text-gray-400">{alert.date || new Date(alert.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        </div>
                    </div>
                ))}
                {alerts.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p>No new notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
}
