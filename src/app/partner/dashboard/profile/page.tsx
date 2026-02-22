'use client';

import { useState, useEffect } from 'react';
import {
  User,
  CreditCard,
  Phone,
  Calendar,
  Flag,
  Save,
  Wrench,
  Loader2
} from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { toast } from 'react-hot-toast';

export default function PartnerProfilePage() {
  const [partner, setPartner] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await partnerService.getProfile();

      if (response.success && response.data) {
        const data = response.data;

        setPartner(data);

        // Always ensure strings (never null)
        setFormData({
          email: data.email ?? '',
          accountNumber: data.accountNumber ?? '',
          ifscCode: data.ifscCode ?? '',
          upiId: data.upiId ?? ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile');
      toast.error('Failed to load profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  if (!partner) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">
            Manage your personal and banking information.
          </p>
        </div>

        <button
          onClick={() => {
            if (isEditing) {
              document
                .getElementById('profile-form')
                ?.dispatchEvent(
                  new Event('submit', { cancelable: true, bubbles: true })
                );
            } else {
              setIsEditing(true);
            }
          }}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            isEditing
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEditing ? (
            <Save className="w-4 h-4" />
          ) : (
            <Wrench className="w-4 h-4" />
          )}
          {isSaving
            ? 'Saving...'
            : isEditing
            ? 'Save Changes'
            : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card */}
        <div className="space-y-6">
          <div className="card p-6 text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
              {partner.name?.charAt(0) || 'P'}
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              {partner.name}
            </h2>

            <div
              className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                partner.verificationStatus === 'VERIFIED'
                  ? 'bg-emerald-100 text-emerald-600'
                  : partner.verificationStatus === 'REJECTED'
                  ? 'bg-red-100 text-red-600'
                  : partner.verificationStatus === 'UNDER_REVIEW'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {partner.verificationStatus || 'UNVERIFIED'}
            </div>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg bg-gray-50">
                <Phone className="w-4 h-4 text-gray-400" />
                {partner.phone}
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-400" />
                Joined{' '}
                {new Date(
                  partner.createdAt ?? Date.now()
                ).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg bg-gray-50">
                <Flag className="w-4 h-4 text-gray-400" />
                ID:{' '}
                <span className="font-mono text-xs">
                  {partner.customId ??
                    partner.id?.slice(-8) ??
                    'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
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
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={partner.name ?? ''}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
                      isEditing
                        ? 'bg-white border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
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
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
                      isEditing
                        ? 'bg-white border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
                        isEditing
                          ? 'bg-white border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
                        isEditing
                          ? 'bg-white border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
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