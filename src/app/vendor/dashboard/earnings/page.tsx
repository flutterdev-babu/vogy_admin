'use client';

import { useState } from 'react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { DollarSign, CreditCard, Wallet } from 'lucide-react';

export default function VendorEarningsPage() {
    // Mock data for now
    const earningsData = [
        { date: 'Mon', amount: 4500 },
        { date: 'Tue', amount: 5200 },
        { date: 'Wed', amount: 3800 },
        { date: 'Thu', amount: 6100 },
        { date: 'Fri', amount: 5900 },
        { date: 'Sat', amount: 7200 },
        { date: 'Sun', amount: 6800 },
    ];

    const transactions = [
        { id: 'TRX-9821', date: '2023-10-25', description: 'Weekly Payout', amount: 25000, status: 'Completed', type: 'Payout' },
        { id: 'TRX-9822', date: '2023-10-24', description: 'Ride #12345 Commission', amount: 450, status: 'Completed', type: 'Earning' },
        { id: 'TRX-9823', date: '2023-10-24', description: 'Ride #12346 Commission', amount: 320, status: 'Pending', type: 'Earning' },
    ];

    const columns: any[] = [
        { header: 'Transaction ID', accessor: 'id' },
        { header: 'Date', accessor: 'date' },
        { header: 'Description', accessor: 'description' },
        {
            header: 'Type', accessor: (item: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'Payout' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {item.type}
                </span>
            )
        },
        { header: 'Amount', accessor: (item: any) => <span className="font-bold">₹{item.amount}</span> },
        { header: 'Status', accessor: 'status' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
                    <p className="text-sm text-gray-500">Track your revenue and withdrawal history.</p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">
                    Request Payout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl text-green-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
                        <h3 className="text-2xl font-black text-gray-900">₹45,200</h3>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Available Balance</p>
                        <h3 className="text-2xl font-black text-gray-900">₹12,500</h3>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pending Payout</p>
                        <h3 className="text-2xl font-black text-gray-900">₹5,000</h3>
                    </div>
                </div>
            </div>

            <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Weekly Earnings Trend</h2>
                <RevenueChart data={earningsData} />
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
                <AdvancedTable data={transactions} columns={columns} />
            </div>
        </div>
    );
}
