'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, Loader2, Briefcase, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { agentService } from '@/services/agentService';
import { TOKEN_KEYS, USER_KEYS } from '@/lib/api';

export default function AgentLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const response = await agentService.login({ phone: `+91${phone}`, password });
      if (response.success && response.data) {
        const { token, agent } = response.data;
        localStorage.setItem(TOKEN_KEYS.agent, token);
        localStorage.setItem(USER_KEYS.agent, JSON.stringify(agent));
        toast.success('Login successful!');
        router.push('/agent/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid phone or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E32222]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#E32222]/10 border border-[#E32222]/20 mb-6 shadow-[0_0_20px_rgba(227,34,34,0.1)]">
            <Briefcase size={36} className="text-[#E32222]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Agent Login</h1>
          <p className="text-neutral-400">Sign in to manage operations</p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 bg-white/10 border border-r-0 border-white/10 rounded-l-xl text-neutral-400 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-white/5 border border-white/10 rounded-r-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/50 transition-all"
                  placeholder="9876543210"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222] focus:ring-1 focus:ring-[#E32222]/50 transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-sm text-[#E32222] hover:text-[#ff4d4d] font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#E32222] hover:bg-[#cc1f1f] text-white font-semibold text-lg shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <LogIn size={22} />
              )}
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <p className="text-center text-neutral-400 mt-8">
            Don&apos;t have an account?{' '}
            <Link
              href="/agent/register"
              className="text-[#E32222] hover:text-[#ff4d4d] font-semibold transition-colors"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
