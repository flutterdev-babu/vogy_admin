'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn, Loader2, Car } from 'lucide-react';
import { TOKEN_KEYS } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEYS.admin);
      if (token) {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 mb-8 self-center lg:self-start">
            <span className="w-2 h-2 rounded-full bg-[#E32222] animate-pulse" />
            <span className="text-xs font-bold text-[#E32222] tracking-wide uppercase">Secure Admin Access</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight text-center lg:text-left">
            Welcome to <br />
            <span className="text-[#E32222]">ARA TRAVELS</span>
          </h1>
          <p className="text-gray-500 mt-4 text-center lg:text-left text-lg">Manage your entire mobility ecosystem from one powerful command center.</p>
        </div>

        {/* Login Form */}
        <div className="card p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogIn size={20} />
              )}
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-orange-500 hover:text-orange-600 font-semibold">
              Register
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          © 2026 Ara Travels. All rights reserved.
        </p>
      </div>
    </div>
  );
}
