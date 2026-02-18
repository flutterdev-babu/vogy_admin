'use client';

import { RevenueChart } from '@/components/dashboard/RevenueChart';

export default function CorporateReportsPage() {
    const spendingData = [
        { date: 'Sales', amount: 45000 },
        { date: 'Marketing', amount: 32000 },
        { date: 'Eng', amount: 12000 },
        { date: 'HR', amount: 5000 },
        { date: 'Ops', amount: 28000 },
    ];

    const trendData = [
        { date: 'Mon', amount: 2500 },
        { date: 'Tue', amount: 4200 },
        { date: 'Wed', amount: 3800 },
        { date: 'Thu', amount: 5100 },
        { date: 'Fri', amount: 4900 },
        { date: 'Sat', amount: 1200 },
        { date: 'Sun', amount: 800 },
    ];

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-500">Deep dive into your company's travel spending.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Spending by Department</h2>
                    <RevenueChart data={spendingData} color="#3b82f6" />
                </div>
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Daily Spending Trend</h2>
                    <RevenueChart data={trendData} color="#10b981" />
                </div>
            </div>
        </div>
    );
}
