'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, ServerCog } from 'lucide-react';
import { publicApi } from '@/lib/api';

export function HealthCheck({ children }: { children: React.ReactNode }) {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 12;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const res = await publicApi.get('/health');
        if (res.data?.status === 'OK') {
          setIsHealthy(true);
        } else {
          handleFailure();
        }
      } catch (err) {
        handleFailure();
      }
    };

    const handleFailure = () => {
      if (retryCount < MAX_RETRIES) {
        timeoutId = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 5000);
      } else {
        setIsHealthy(false);
      }
    };

    if (isHealthy === null) checkHealth();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [retryCount, isHealthy]);

  if (isHealthy === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        {retryCount >= 2 ? (
          <>
            <ServerCog size={48} className="text-orange-500 animate-bounce mb-6" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Waking up backend server...</h2>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              The dashboard is currently waking up the securely hosted database and APIs. This usually takes about ~50 seconds on cold start. 
            </p>
            <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full font-bold text-xs uppercase tracking-wider">
              Attempt {retryCount}/{MAX_RETRIES}
            </span>
          </>
        ) : (
          <>
            <RefreshCw size={40} className="text-[#E32222] animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Connecting to secure servers...</h2>
          </>
        )}
      </div>
    );
  }

  if (isHealthy === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-black text-gray-900 mb-2">Backend Unavailable</h1>
        <p className="text-gray-500 max-w-md mb-8">
          We cannot establish a secure connection to the backend servers. The environment may be misconfigured or the servers are currently down. 
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-[#E32222] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-red-700 shadow-lg active:scale-95 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
