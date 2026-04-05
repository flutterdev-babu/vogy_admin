'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, DollarSign, Percent, Info, Clock, Plus, Zap, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { pricingService } from '@/services/pricingService';
import { PricingConfig } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [baseFare, setBaseFare] = useState(20);
  const [riderPercentage, setRiderPercentage] = useState(80);
  const [appCommission, setAppCommission] = useState(20);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await pricingService.get();
        if (response.data) {
          setConfig(response.data);
          setBaseFare(response.data.baseFare);
          setRiderPercentage(response.data.partnerPercentage);
          setAppCommission(response.data.appCommission);
        }
      } catch (error) {
        console.error('Failed to fetch pricing config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleRiderPercentageChange = (value: number) => {
    setRiderPercentage(value);
    setAppCommission(100 - value);
  };

  const handleAppCommissionChange = (value: number) => {
    setAppCommission(value);
    setRiderPercentage(100 - value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (riderPercentage + appCommission !== 100) {
      toast.error('Yield distribution must sum to 100%');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Synchronizing financial protocols...');
    try {
      const response = await pricingService.update({
        baseFare,
        partnerPercentage: riderPercentage,
        appCommission,
      });
      setConfig(response.data);
      toast.success('System yield configuration successfully updated', { id: toastId });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Update failure', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  // Example calculation
  const exampleDistance = 10;
  const examplePricePerKm = 15;
  const exampleTotal = baseFare + (examplePricePerKm * exampleDistance);
  const exampleRiderEarnings = (exampleTotal * riderPercentage) / 100;
  const exampleAppEarnings = (exampleTotal * appCommission) / 100;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Fiscal Architecture
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Global Pricing & Yield Distribution Engine</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100">
          <Shield size={16} />
          Active Financial Protocol
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Form Card */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm space-y-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Base Fare */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">
                Global Base Fare (INR)
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                  <DollarSign size={20} />
                </div>
                <input
                  type="number"
                  value={baseFare}
                  onChange={(e) => setBaseFare(Number(e.target.value))}
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-[1.5rem] text-lg font-black text-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-300"
                  placeholder="20"
                  min="0"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter ml-1">
                Default baseline for all transactions. Regional overrides apply.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rider Percentage */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">
                  Captain Yield (%)
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500">
                    <Percent size={18} />
                  </div>
                  <input
                    type="number"
                    value={riderPercentage}
                    onChange={(e) => handleRiderPercentageChange(Number(e.target.value))}
                    className="w-full pl-14 pr-6 py-5 bg-emerald-50/30 border border-emerald-100/50 rounded-[1.5rem] text-lg font-black text-emerald-700 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="80"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* App Commission */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">
                  System Commission (%)
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500">
                    <Percent size={18} />
                  </div>
                  <input
                    type="number"
                    value={appCommission}
                    onChange={(e) => handleAppCommissionChange(Number(e.target.value))}
                    className="w-full pl-14 pr-6 py-5 bg-indigo-50/30 border border-indigo-100/50 rounded-[1.5rem] text-lg font-black text-indigo-700 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    placeholder="20"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${riderPercentage + appCommission === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <span>Yield Integrity Status</span>
              <span>Total Distribution: {riderPercentage + appCommission}% {riderPercentage + appCommission === 100 ? '✓' : '(Must Equal 100%)'}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || riderPercentage + appCommission !== 100}
              className="w-full py-5 bg-gray-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-gray-200 transition-all active:scale-95 disabled:bg-gray-100 disabled:shadow-none min-w-[200px] flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{isSubmitting ? 'SYNCHRONIZING...' : 'AUTHORIZE FINANCIAL SETTINGS'}</span>
            </button>
          </form>
        </div>

        {/* Example Calculation Card */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl shadow-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Yield Simulation</h3>
              <TrendingUp size={20} className="text-emerald-500" />
            </div>

            <div className="space-y-6">
              {[
                { label: 'DISTANCE PARAMETER', value: `${exampleDistance} KM` },
                { label: 'YIELD PER UNIT', value: `₹${examplePricePerKm}` },
                { label: 'BASELINE FARE', value: `₹${baseFare}` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-[10px] font-black text-gray-500 tracking-wider font-mono">{item.label}</span>
                  <span className="text-sm font-black text-white">{item.value}</span>
                </div>
              ))}

              <div className="p-6 bg-red-600 rounded-[1.5rem] space-y-1">
                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">GROSS PROJECTED FARE</span>
                <div className="text-3xl font-black text-white">₹{exampleTotal.toLocaleString()}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gray-800 rounded-2xl border border-gray-700/50 space-y-1">
                  <span className="text-[9px] font-black text-gray-500 uppercase">CAPTAIN NET</span>
                  <div className="text-xl font-black text-emerald-400">₹{exampleRiderEarnings.toFixed(2)}</div>
                </div>
                <div className="p-5 bg-gray-800 rounded-2xl border border-gray-700/50 space-y-1">
                  <span className="text-[9px] font-black text-gray-500 uppercase">SYSTEM YIELD</span>
                  <div className="text-xl font-black text-indigo-400">₹{exampleAppEarnings.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-xl flex gap-3">
              <Info size={16} className="text-gray-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-gray-500 uppercase leading-relaxed font-mono">
                Formula: Total = Base + (UnitRate × Volume) <br />
                Net = Total × (Yield% / 100)
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/peak-hour-charges"
            className="group block p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100/50 transition-all hover:bg-amber-100/50 shadow-sm"
          >
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <Clock size={18} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Dynamic Surge Config</h4>
                </div>
                <p className="text-[10px] text-amber-800/60 font-medium uppercase leading-relaxed">Adjust yield protocols for high-demand windows and regional hotspots.</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Sync Footer */}
      {config && (
        <div className="flex items-center gap-3 px-8 py-4 bg-gray-50 rounded-full border border-gray-100 w-fit mx-auto">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Last Protocol Synchronization: {new Date(config.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
