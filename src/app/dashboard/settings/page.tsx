'use client';

import { useState } from 'react';
import { Save, Bell, DollarSign, Wrench, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        commissionRate: 15,
        referralBonus: 50,
        maintenanceMode: false,
        minWithdrawal: 500,
        pushNotifications: true,
        autoApproveDrivers: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        toast.success('Settings updated successfully');
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Settings</h1>
                <p className="text-gray-500 mt-1">Manage system-wide configurations and controls.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Financial Settings */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Financial Configurations</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Commission (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="commissionRate"
                                    value={settings.commissionRate}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-12 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                                    min="0"
                                    max="100"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Percentage taken from each ride fare.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Referral Bonus Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                <input
                                    type="number"
                                    name="referralBonus"
                                    value={settings.referralBonus}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Amount credited for successful referrals.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Withdrawal Limit</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                                <input
                                    type="number"
                                    name="minWithdrawal"
                                    value={settings.minWithdrawal}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Bell className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">System Preferences</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                                <p className="text-sm text-gray-500">Enable system-wide push notifications for all users.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="pushNotifications"
                                    checked={settings.pushNotifications}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <h3 className="font-medium text-gray-900">Auto-Approve Partners</h3>
                                <p className="text-sm text-gray-500">Automatically approve new partner registrations without manual review.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="autoApproveDrivers"
                                    checked={settings.autoApproveDrivers}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="card p-6 border-red-100 bg-red-50/30">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-100">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100 shadow-sm">
                        <div>
                            <h3 className="font-medium text-red-900 flex items-center gap-2">
                                <Wrench className="w-4 h-4" />
                                Maintenance Mode
                            </h3>
                            <p className="text-sm text-red-700/80">
                                Put the app in maintenance mode. Users will not be able to book rides.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
