'use client';

import { useState } from 'react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { DollarSign, Wallet } from 'lucide-react';

export default function PartnerEarningsPage() {
    // Mock data for now
    const earningsData = [
        { date: 'Mon', amount: 800 },
        { date: 'Tue', amount: 1200 },
        { date: 'Wed', amount: 950 },
        { date: 'Thu', amount: 1400 },
        { date: 'Fri', amount: 1100 },
        { date: 'Sat', amount: 1800 },
        { date: 'Sun', amount: 1600 },
    ];

    const transactions = [
        { id: 'TX-101', date: '2023-10-26', description: 'Ride #8821', amount: 320, type: 'Ride Earning' },
        { id: 'TX-102', date: '2023-10-26', description: 'Ride #8822', amount: 450, type: 'Ride Earning' },
        { id: 'TX-103', date: '2023-10-25', description: 'Weekly Payout', amount: 5000, type: 'Payout' },
    ];

    const columns: any[] = [
        { header: 'ID', accessor: 'id' },
        { header: 'Date', accessor: 'date' },
        { header: 'Description', accessor: 'description' },
        {
            header: 'Type', accessor: (item: any) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'Payout' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {item.type}
                </span>
            )
        },
        { header: 'Amount', accessor: (item: any) => <span className={`font-bold ${item.type === 'Payout' ? 'text-gray-900' : 'text-green-600'}`}>₹{item.amount}</span> },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
                    <p className="text-sm text-gray-500">Track your daily income and payouts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 flex items-center gap-4 bg-emerald-50 border-emerald-100">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-emerald-700 font-medium hg">Total Earnings (This Week)</p>
                        <h3 className="text-2xl font-black text-emerald-900">₹8,850</h3>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Current Balance</p>
                        <h3 className="text-2xl font-black text-gray-900">₹2,450</h3>
                        <p className="text-xs text-gray-400 mt-1">Next payout on Monday</p>
                    </div>
                </div>
            </div>

            <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Weekly Income</h2>
                <RevenueChart data={earningsData} />
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
                <AdvancedTable data={transactions} columns={columns} />
            </div>
        </div>
    );
}
