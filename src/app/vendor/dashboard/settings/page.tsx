'use client';

import { useState } from 'react';
import { User, Building, CreditCard, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function VendorSettingsPage() {
    const [profile, setProfile] = useState({
        name: 'Rajesh Kumar',
        email: 'rajesh@transports.com',
        phone: '9876543210',
        companyName: 'RK Transports Pvt Ltd',
        gst: '29ABCDE1234F1Z5',
        address: '123, Vendor Lane, Bangalore',
        bankName: 'HDFC Bank',
        accountNumber: '1234567890',
        ifsc: 'HDFC0001234',
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Profile updated successfully');
        // In future: API call to update vendor profile
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings & Profile</h1>
                <p className="text-sm text-gray-500">Manage your company details and banking information.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Personal & Company Details */}
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-500" />
                        Company Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                type="text"
                                value={profile.companyName}
                                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                            <input
                                type="text"
                                value={profile.gst}
                                onChange={(e) => setProfile({ ...profile, gst: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={profile.address}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Banking Details */}
                <div className="card p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-500" />
                        Banking Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input
                                type="text"
                                value={profile.bankName}
                                onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input
                                type="text"
                                value={profile.accountNumber}
                                onChange={(e) => setProfile({ ...profile, accountNumber: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                            <input
                                type="text"
                                value={profile.ifsc}
                                onChange={(e) => setProfile({ ...profile, ifsc: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all active:scale-95">
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
