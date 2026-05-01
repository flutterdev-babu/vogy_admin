'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userAuthService } from '@/services/userAuthService';
import { UserPlus, Loader2, Car, Phone, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserRegisterPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const formatPhone = (value: string) => {
        // Only allow digits and +
        return value.replace(/[^+\d]/g, '');
    };

    const isValidPhone = (p: string) => {
        // Support 10 digits or E.164
        return /^\d{10}$/.test(p) || /^\+\d{10,15}$/.test(p);
    };

    const isValidEmail = (e: string) => {
        if (!e) return true; // email is optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter your full name');
            return;
        }
        if (name.trim().length < 2) {
            toast.error('Name must be at least 2 characters');
            return;
        }
        if (!phone) {
            toast.error('Please enter your phone number');
            return;
        }
        if (!isValidPhone(phone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        if (email.trim() && !isValidEmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (!password) {
            toast.error('Please create a password for your account');
            return;
        }

        setIsLoading(true);
        try {
            // Auto-format for API if 10 digits
            let finalPhone = phone;
            if (/^\d{10}$/.test(phone)) {
                finalPhone = `+91${phone}`;
            } else if (/^91\d{10}$/.test(phone)) {
                finalPhone = `+${phone}`;
            }

            const payload = {
                name: name.trim(),
                phone: finalPhone,
                email: email.trim(),
                password,
            };

            await userAuthService.register(payload);
            toast.success('Registration successful! You can now login.');
            router.push('/user/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8 animate-fade-in">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #E32222, #ff4444)' }}>
                        <Car size={40} className="text-white" />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(227, 34, 34, 0.1)', border: '1px solid rgba(227, 34, 34, 0.2)' }}>
                        <span className="w-2 h-2 rounded-full bg-[#E32222] animate-pulse" />
                        <span className="text-[10px] font-bold text-[#E32222] tracking-widest uppercase">Customer Portal</span>
                    </div>
                    <h1 className="text-3xl font-black text-white">Create Your Account</h1>
                    <p className="text-gray-400 mt-2">Join ARA Travels and start booking rides</p>
                </div>

                {/* Register Form */}
                <div className="rounded-2xl p-8 animate-fade-in" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', animationDelay: '0.1s' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-[#E32222] focus:outline-none"
                                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                    placeholder="Enter your full name"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Phone Number <span className="text-[#E32222]">*</span>
                            </label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-[#E32222] focus:outline-none"
                                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                    placeholder="+919876543210"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-[#E32222] focus:outline-none"
                                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Create Password <span className="text-[#E32222]">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-[#E32222] focus:outline-none"
                                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                    placeholder="min. 6 characters"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #E32222, #cc1e1e)' }}
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <UserPlus size={20} />
                            )}
                            <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link href="/user/login" className="text-[#E32222] hover:text-red-400 font-semibold">
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-sm mt-8">
                    © 2026 Ara Travels. All rights reserved.
                </p>
            </div>
        </div>
    );
}
