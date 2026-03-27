'use client';

import { AuditTimelineItem } from '@/types';
import { Clock, User, Shield, Activity } from 'lucide-react';

interface SystemHealthTimelineProps {
    items: AuditTimelineItem[];
}

export function SystemHealthTimeline({ items }: SystemHealthTimelineProps) {
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <Activity size={48} className="mb-4 opacity-20" />
                <p>No recent activity logs</p>
            </div>
        );
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {items.map((item, idx) => (
                    <li key={item.id}>
                        <div className="relative pb-8">
                            {idx !== items.length - 1 ? (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white">
                                        <Activity className="h-4 w-4 text-[#E32222]" />
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {item.description}{' '}
                                            <span className="font-bold text-gray-900">{item.module}</span>
                                        </p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <User size={12} />
                                                {item.userName}
                                            </span>
                                            <span className="flex items-center gap-1 uppercase">
                                                <Shield size={12} />
                                                {item.userRole}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
