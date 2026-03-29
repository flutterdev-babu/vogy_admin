'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { Loader2, Phone, KeyRound, ArrowRight, RotateCw, Car } from 'lucide-react';
import { TOKEN_KEYS } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UserLoginPage() {
    const [loginMode, setLoginMode] = useState<'otp' | 'email'>('otp');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const { sendOtp, verifyOtp, loginWithEmail } = useUserAuth();
    const router = useRouter();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(TOKEN_KEYS.user);
            if (token) {
                router.replace('/user/dashboard');
            }
        }
    }, [router]);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    const formatPhone = (value: string) => {
        // Allow only digits and +
        return value.replace(/[^+\d]/g, '');
    };

    const isValidPhone = (p: string) => {
        // Support 10 digits or E.164
        return /^\d{10}$/.test(p) || /^\+\d{10,15}$/.test(p);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone) {
            toast.error('Please enter your phone number');
            return;
        }

        if (!isValidPhone(phone)) {
            toast.error('Please enter a valid 10-digit phone number');
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

            await sendOtp(finalPhone);
            toast.success('OTP sent! Check your phone (or backend console in dev mode)');
            setPhone(finalPhone); // Update state to formatted version
            setStep('otp');
            setResendTimer(30);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || 'Failed to send OTP. Please check your phone number.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp) {
            toast.error('Please enter the OTP');
            return;
        }

        if (otp.length !== 6) {
            toast.error('OTP must be 6 digits');
            return;
        }

        setIsLoading(true);
        try {
            await verifyOtp(phone, otp);
            toast.success('Login successful!');
            router.push('/user/dashboard');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const msg = err.response?.data?.message || err.message || 'Invalid OTP';
            if (msg.toLowerCase().includes('expired')) {
                toast.error('OTP has expired. Please request a new one.');
            } else {
                toast.error(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

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
            router.push('/user/dashboard');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = useCallback(async () => {
        if (resendTimer > 0) return;
        setIsLoading(true);
        try {
            await sendOtp(phone);
            toast.success('New OTP sent!');
            setResendTimer(30);
            setOtp('');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    }, [resendTimer, phone, sendOtp]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)' }}>
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, #E32222, #ff4444)' }}>
                        <Car size={40} className="text-white" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'rgba(227, 34, 34, 0.1)', border: '1px solid rgba(227, 34, 34, 0.2)' }}>
                        <span className="w-2 h-2 rounded-full bg-[#E32222] animate-pulse" />
                        <span className="text-xs font-bold text-[#E32222] tracking-wide uppercase">Customer Portal</span>
                    </div>
                    <h1 className="text-4xl font-black text-white leading-tight">
                        Welcome to <br />
                        <span className="text-[#E32222]">ARA TRAVELS</span>
                    </h1>
                    <p className="text-gray-400 mt-3 text-lg">Sign in to book your ride</p>
                </div>

                {/* Login Form */}
                <div className="rounded-2xl p-8 animate-fade-in" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>

                    {/* Mode Toggle */}
                    <div className="flex p-1 rounded-xl bg-black/40 border border-white/10 mb-8">
                        <button
                            onClick={() => { setLoginMode('otp'); setStep('phone'); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMode === 'otp' ? 'bg-[#E32222] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            OTP Login
                        </button>
                        <button
                            onClick={() => setLoginMode('email')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMode === 'email' ? 'bg-[#E32222] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Email Login
                        </button>
                    </div>

                    {loginMode === 'otp' ? (
                        step === 'phone' ? (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Phone Number
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
                                    <p className="text-xs text-gray-500 mt-2">Enter with country code (e.g., +91 for India)</p>
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
                                    <span>{isLoading ? 'Sending OTP...' : 'Send OTP'}</span>
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="text-center mb-4">
                                    <p className="text-gray-400 text-sm">OTP sent to <span className="text-white font-semibold">{phone}</span></p>
                                    <button
                                        type="button"
                                        onClick={() => { setStep('phone'); setOtp(''); }}
                                        className="text-[#E32222] text-sm font-semibold hover:underline mt-1"
                                    >
                                        Change number
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Enter OTP
                                    </label>
                                    <div className="relative">
                                        <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-gray-500 transition-all focus:ring-2 focus:ring-[#E32222] focus:outline-none"
                                            style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                            placeholder="• • • • • •"
                                            disabled={isLoading}
                                            autoFocus
                                        />
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
                                    <span>{isLoading ? 'Verifying...' : 'Verify & Login'}</span>
                                </button>

                                {/* Resend OTP */}
                                <div className="text-center">
                                    {resendTimer > 0 ? (
                                        <p className="text-gray-500 text-sm">Resend OTP in <span className="text-white font-semibold">{resendTimer}s</span></p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isLoading}
                                            className="text-[#E32222] text-sm font-semibold hover:underline inline-flex items-center gap-1"
                                        >
                                            <RotateCw size={14} /> Resend OTP
                                        </button>
                                    )}
                                </div>
                            </form>
                        )
                    ) : (
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
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-[#E32222] focus:outline-none"
                                        style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        required
                                    />
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
                    )}

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
