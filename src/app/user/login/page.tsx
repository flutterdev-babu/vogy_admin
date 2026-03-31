'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { Loader2, ArrowRight, Car, Eye, EyeOff } from 'lucide-react';
import { TOKEN_KEYS } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UserLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { loginWithEmail } = useUserAuth();
    const router = useRouter();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(TOKEN_KEYS.user);
            if (token) {
                router.replace('/user/dashboard/book');
            }
        }
    }, [router]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            await loginWithEmail(email, password);
            toast.success('Login successful!');
            router.push('/user/dashboard/book');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || 'Invalid email or password');
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
                    <h1 className="text-4xl font-black text-white leading-tight">
                        Welcome to <br />
                        <span className="text-[#E32222]">ARA TRAVELS</span>
                    </h1>
                    <p className="text-gray-400 mt-3 text-lg">Sign in to book your ride</p>
                </div>

                {/* Login Form */}
                <div className="rounded-2xl p-8 animate-fade-in" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>

                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-[#E32222] focus:outline-none"
                                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 rounded-xl text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-[#E32222] focus:outline-none"
                                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    style={{ zIndex: 10 }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #E32222, #cc1e1e)' }}
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <ArrowRight size={20} />
                            )}
                             <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="text-center text-gray-400 mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/user/register" className="text-[#E32222] hover:text-red-400 font-semibold">
                            Register
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
