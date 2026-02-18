'use client';

import { useState, useEffect } from 'react';
import { User, CreditCard, Mail, Phone, Calendar, Flag, Save, Wrench, Loader2 } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { toast } from 'react-hot-toast';

export default function PartnerProfilePage() {
    const [partner, setPartner] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        bankAccountNumber: '',
        ifscCode: '',
        upiId: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await partnerService.getProfile();
            if (response.success && response.data) {
                setPartner(response.data);
                setFormData({
                    email: response.data.email || '',
                    bankAccountNumber: response.data.bankAccountNumber || '',
                    ifscCode: response.data.ifscCode || '',
                    upiId: response.data.upiId || '',
                });
            }
        } catch (error) {
            console.error('Failed to load profile');
            // toast.error('Failed to load profile');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await partnerService.updateProfile(formData);
            if (response.success && response.data) {
                setPartner(response.data);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            } else {
                toast.error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    if (!partner) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500">Manage your personal and banking information.</p>
                </div>
                <button
                    onClick={() => {
                        if (isEditing) document.getElementById('profile-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        else setIsEditing(true);
                    }}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${isEditing
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? <Save className="w-4 h-4" /> : <Wrench className="w-4 h-4" />)}
                    {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Basic Info Card */}
                <div className="space-y-6">
                    <div className="card p-6 text-center">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-500/30 mb-4">
                            {partner.name?.charAt(0) || 'P'}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{partner.name}</h2>
                        <p className="text-sm text-emerald-600 font-medium">Verified Partner</p>

                        <div className="mt-6 space-y-3 text-left">
                            <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg bg-gray-50">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {partner.phone}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg bg-gray-50">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Joined {new Date(partner.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg bg-gray-50">
                                <Flag className="w-4 h-4 text-gray-400" />
                                ID: <span className="font-mono text-xs">{partner.customId || partner.id?.slice(-8)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Editable Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <form id="profile-form" onSubmit={handleSubmit}>
                        {/* Personal Details */}
                        <div className="card p-6 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-600" />
                                Personal Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={partner.name}
                                        disabled
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={isEditing ? formData.email : partner.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full px-3 py-2 border rounded-lg transition-all outline-none ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Banking Details */}
                        <div className="card p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-600" />
                                Banking Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bank Account Number</label>
                                    <input
                                        type="text"
                                        name="bankAccountNumber"
                                        value={isEditing ? formData.bankAccountNumber : partner.bankAccountNumber}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder={isEditing ? "Enter Account Number" : "Not Provided"}
                                        className={`w-full px-3 py-2 border rounded-lg transition-all outline-none ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">IFSC Code</label>
                                        <input
                                            type="text"
                                            name="ifscCode"
                                            value={isEditing ? formData.ifscCode : partner.ifscCode}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder={isEditing ? "Enter IFSC" : "Not Provided"}
                                            className={`w-full px-3 py-2 border rounded-lg transition-all outline-none ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">UPI ID</label>
                                        <input
                                            type="text"
                                            name="upiId"
                                            value={isEditing ? formData.upiId : partner.upiId}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder={isEditing ? "user@upi" : "Not Provided"}
                                            className={`w-full px-3 py-2 border rounded-lg transition-all outline-none ${isEditing ? 'bg-white border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500' : 'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
