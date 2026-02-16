'use client';

import { useState, useEffect } from 'react';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import { Download, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { corporateService } from '@/services/corporateService';

export default function CorporateBillingPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        outstanding: 0,
        creditLimit: 500000,
        utilizedPercentage: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Parallel fetch
                const [billingRes, summaryRes] = await Promise.all([
                    corporateService.getBilling(),
                    corporateService.getBillingSummary()
                ]);

                if (billingRes.success && billingRes.data) {
                    setInvoices(billingRes.data);
                }

                if (summaryRes.success && summaryRes.data) {
                    const data = summaryRes.data;
                    setSummary({
                        outstanding: data.outstanding,
                        creditLimit: 500000, // Hardcoded for now or fetch from profile
                        utilizedPercentage: (data.outstanding / 500000) * 100
                    });
                }
            } catch (error) {
                console.error('Failed to load billing data');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const columns: any[] = [
        { header: 'Invoice ID', accessor: 'id' },
        { header: 'Billing Period', accessor: 'period' },
        { header: 'Amount', accessor: (item: any) => <span className="font-bold text-gray-900">₹{item.amount.toLocaleString()}</span> },
        { header: 'Due Date', accessor: 'dueDate' },
        {
            header: 'Status', accessor: (item: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Action', accessor: (item: any) => (
                <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                    <Download className="w-4 h-4" />
                    Download
                </button>
            )
        },
    ];

    return isLoading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div> : (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
                    <p className="text-sm text-gray-500">View monthly statements and payment history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg shadow-blue-500/30">
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Outstanding</p>
                    <h3 className="text-3xl font-bold">₹{summary.outstanding.toLocaleString()}</h3>
                    <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Due by Nov 5, 2023
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-gray-500 text-sm font-medium mb-1">Credit Limit</p>
                    <h3 className="text-3xl font-bold text-gray-900">₹{summary.creditLimit.toLocaleString()}</h3>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(summary.utilizedPercentage, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{summary.utilizedPercentage.toFixed(1)}% utilized</p>
                </div>
                <div className="card p-6 flex flex-col justify-center items-center text-center">
                    <CreditCard className="w-10 h-10 text-gray-300 mb-2" />
                    <h3 className="text-gray-900 font-bold">Payment Methods</h3>
                    <p className="text-xs text-gray-500">Manage saved cards and UPI</p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Invoice History</h2>
                <AdvancedTable
                    data={invoices}
                    columns={columns}
                    itemsPerPage={10}
                />
            </div>
        </div>
    );
}
