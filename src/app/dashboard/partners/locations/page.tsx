'use client';

import { useState } from 'react';
import PartnerLocationsMap from '@/components/PartnerLocationsMap';
import { Globe, Shield, Zap, RotateCcw } from 'lucide-react';

export default function PartnerLocationsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in space-y-8 max-w-7xl mx-auto pb-10 px-2 lg:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Fleet Intelligence
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Real-Time Geospatial Tracking of Active Fleet</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={14} className={refreshTrigger > 0 ? 'animate-spin' : ''} />
            Sync Telemetry
          </button>
          <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live Telemetry Online
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gray-100">
            <Globe size={16} className="text-red-500" />
            Global Fleet View
          </div>
        </div>
      </div>

      {/* Map Terminal */}
      <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-100 p-2 overflow-hidden group">
        <div className="absolute top-10 right-10 z-10 space-y-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-4 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-800 text-white shadow-2xl">
            <div className="flex items-center gap-2 mb-2 text-red-500">
              <Shield size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Signal Encryption</span>
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter leading-relaxed">
              Bi-directional JWT secured telemetry <br />
              Stream latency: &lt; 200ms
            </p>
          </div>
        </div>
        <div className="w-full h-full rounded-[2.25rem] overflow-hidden">
          <PartnerLocationsMap refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Terminal Footer Info */}
      <div className="flex items-center justify-center gap-6 px-8 py-4 bg-gray-50 rounded-full border border-gray-100 w-fit mx-auto shrink-0">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-amber-500" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Node Sync: Instantaneous</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Grid Status: NOMINAL
        </p>
      </div>
    </div>
  );
}
