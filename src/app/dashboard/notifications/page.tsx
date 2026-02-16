'use client';

import { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { toast } from 'react-hot-toast';
import { notificationService, Notification } from '@/services/notificationService';

export default function NotificationCenterPage() {
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [notification, setNotification] = useState({
        title: '',
        message: '',
        target: 'ALL', // ALL, PARTNERS, VENDORS
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
            // toast.error('Failed to load history'); // Optional: don't spam toasts on load
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notification.title || !notification.message) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSending(true);
        try {
            const response = await notificationService.send({
                title: notification.title,
                message: notification.message,
                type: 'INFO', // Defaulting to INFO for now
                targetAudience: notification.target as any,
            });

            if (response.success) {
                toast.success(`Notification broadcasted to ${notification.target}`);
                setNotification({ title: '', message: '', target: 'ALL' });
                setActiveTab('history');
            } else {
                toast.error(response.message || 'Failed to send notification');
            }
        } catch (error) {
            toast.error('An error occurred while sending');
        } finally {
            setIsSending(false);
        }
    };

    const columns: any[] = [
        { header: 'Title', accessor: 'title' },
        { header: 'Message', accessor: 'message' },
        { header: 'Target Audience', accessor: (item: any) => <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{item.targetAudience}</span> },
        { header: 'Sent At', accessor: (item: any) => new Date(item.sentAt).toLocaleString() },
        { header: 'Status', accessor: (item: any) => <span className="text-green-600 font-bold text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {item.status}</span> },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
                <p className="text-sm text-gray-500">Broadcast messages and announcements to your users.</p>
            </div>

            <div className="flex gap-4 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('compose')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'compose' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Compose Message
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'history' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Sent History
                </button>
            </div>

            {activeTab === 'compose' ? (
                <div className="max-w-2xl">
                    <form onSubmit={handleSend} className="card p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                            <div className="flex gap-4">
                                {['ALL', 'PARTNERS', 'VENDORS', 'USERS'].map((type) => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="target"
                                            value={type}
                                            checked={notification.target === type}
                                            onChange={(e) => setNotification({ ...notification, target: e.target.value })}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={notification.title}
                                onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                placeholder="e.g. Important Update"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                value={notification.message}
                                onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                                placeholder="Type your announcement here..."
                            />
                        </div>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                            <p className="text-sm text-yellow-700">
                                This message will be sent as a push notification to all devices in the selected target group. Ensure the content is appropriate.
                            </p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSending}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-lg shadow-lg shadow-red-500/30 transition-all active:scale-95"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {isSending ? 'Sending...' : 'Broadcast Notification'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="card p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        Broadcast History
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </h3>
                    <AdvancedTable data={history} columns={columns} />
                </div>
            )}
        </div>
    );
}
