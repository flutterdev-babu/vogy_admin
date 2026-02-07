'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, DollarSign, Percent, Info } from 'lucide-react';
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
      toast.error('Rider percentage and app commission must sum to 100%');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await pricingService.update({
        baseFare,
        partnerPercentage: riderPercentage,
        appCommission,
      });
      setConfig(response.data);
      toast.success('Pricing configuration updated successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Update failed');
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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Pricing Configuration</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Configure global pricing and commission settings</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Form Card */}
        <div className="card p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Base Fare */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign size={16} className="text-orange-500" />
                Global Base Fare (₹)
              </label>
              <input
                type="number"
                value={baseFare}
                onChange={(e) => setBaseFare(Number(e.target.value))}
                className="input"
                placeholder="20"
                min="0"
              />
              <p className="text-xs text-gray-400 mt-1">
                Default base fare. Vehicle types can override this.
              </p>
            </div>

            {/* Rider Percentage */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Percent size={16} className="text-green-500" />
                Captain Earnings (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={riderPercentage}
                  onChange={(e) => handleRiderPercentageChange(Number(e.target.value))}
                  className="input"
                  placeholder="80"
                  min="0"
                  max="100"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* App Commission */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Percent size={16} className="text-orange-500" />
                App Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={appCommission}
                  onChange={(e) => handleAppCommissionChange(Number(e.target.value))}
                  className="input"
                  placeholder="20"
                  min="0"
                  max="100"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="text-gray-400">%</span>
                </div>
              </div>
              <p className={`text-xs mt-1 ${riderPercentage + appCommission === 100 ? 'text-green-500' : 'text-red-500'}`}>
                Total: {riderPercentage + appCommission}% {riderPercentage + appCommission === 100 ? '✓' : '(must equal 100%)'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || riderPercentage + appCommission !== 100}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              <span>{isSubmitting ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </form>
        </div>

        {/* Example Calculation Card */}
        <div className="card p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-center gap-2 mb-4">
            <Info size={20} className="text-orange-500" />
            <h3 className="font-bold text-gray-800">Example Calculation</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-orange-100">
              <span className="text-gray-600">Distance</span>
              <span className="font-semibold">{exampleDistance} km</span>
            </div>
            <div className="flex justify-between py-2 border-b border-orange-100">
              <span className="text-gray-600">Price per KM</span>
              <span className="font-semibold">₹{examplePricePerKm}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-orange-100">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-semibold">₹{baseFare}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-orange-200 bg-orange-100 -mx-2 px-2 rounded">
              <span className="text-gray-800 font-semibold">Total Fare</span>
              <span className="font-bold text-orange-600">₹{exampleTotal}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-orange-100">
              <span className="text-gray-600">Captain Earnings ({riderPercentage}%)</span>
              <span className="font-semibold text-green-600">₹{exampleRiderEarnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">App Commission ({appCommission}%)</span>
              <span className="font-semibold text-orange-600">₹{exampleAppEarnings.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
            <p className="text-xs text-gray-500">
              <strong>Formula:</strong> Total = baseFare + (pricePerKm × distance)
            </p>
          </div>
        </div>
      </div>

      {/* Current Config Info */}
      {config && (
        <div className="mt-8 card p-4 bg-gray-50">
          <p className="text-sm text-gray-500">
            Last updated: {new Date(config.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
