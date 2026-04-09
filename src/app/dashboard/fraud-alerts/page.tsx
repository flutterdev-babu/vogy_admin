'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Eye, MapPin, Clock, DollarSign, Download } from 'lucide-react';
import { fraudService } from '@/services/enterpriseService';
import { exportToCSV } from '@/utils/csvExport';
import { PageLoader } from '@/components/ui/LoadingSpinner';

interface FraudAlert {
  rideId: string;
  customId: string;
  reason: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  rideDetails: any;
}

export default function FraudAlertsPage() {
  const [data, setData] = useState<{ totalAlerts: number; highSeverity: number; mediumSeverity: number; lowSeverity: number; alerts: FraudAlert[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fraudService.getFraudAlerts();
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch fraud alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = () => {
    if (!data) return;
    const exportData = data.alerts.map(alert => ({
      'Ride ID': alert.customId,
      'Severity': alert.severity,
      'Reason': alert.reason,
      'Partner': alert.rideDetails.partnerName,
      'User': alert.rideDetails.userName,
      'Distance (km)': alert.rideDetails.distance,
      'Duration (min)': alert.rideDetails.duration || 'N/A',
      'Fare (₹)': alert.rideDetails.fare,
    }));
    exportToCSV(exportData, `Fraud_Alerts_${new Date().toISOString().slice(0, 10)}`);
  };

  if (isLoading) return <PageLoader />;

  const filteredAlerts = data?.alerts.filter(a => !filterSeverity || a.severity === filterSeverity) || [];
  const securityBlocks = (data as any)?.securityBlocks || [];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'LOW': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Security Nexus
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Intelligent Fraud Shield & Persistence Guard</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-100 border border-emerald-100 transition-all shadow-sm"
        >
          <Download size={16} /> EXPORT THREAT LOG
        </button>
      </div>

      {/* Stats Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'ANOMALY ALERTS', value: data.totalAlerts, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'SYSTEM LOCKOUTS', value: securityBlocks.filter((b: any) => b.isLocked).length, color: 'text-red-600', bg: 'bg-red-50/50' },
            { label: 'FAILED ATTEMPTS', value: securityBlocks.reduce((acc: number, b: any) => acc + b.attempts, 0), color: 'text-orange-600', bg: 'bg-orange-50/50' },
            { label: 'THREAT MITIGATION', value: '100%', color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          ].map((card, i) => (
            <div key={i} className={`bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md group`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
                  <Shield size={18} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</span>
              </div>
              <p className={`text-3xl font-black ${card.color} tracking-tighter`}>{card.value}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Monitoring</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Persistence Guard Section */}
      {securityBlocks.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
          <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                <Shield size={16} />
              </div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Persistence Guard</h3>
            </div>
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest font-mono">BRUTEFORCE_PREVENTION_ENABLED</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Signature</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Vector Load</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Lock Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto-Purge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {securityBlocks.map((block: any, i: number) => (
                  <tr key={i} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-5">
                      <p className="font-mono text-red-600 font-black text-xs">{block.ipAddress || 'Unknown IP'}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">{block.userId || 'Guest Session'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${block.attempts >= 4 ? 'bg-red-500' : 'bg-orange-500'}`}
                          style={{ width: `${(block.attempts / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mt-1.5">{block.attempts} / 5 ATTEMPTS</p>
                    </td>
                    <td className="px-8 py-5">
                      {block.isLocked ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-100">
                          <Clock size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">LOCKED_OUT</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-[10px] font-black uppercase tracking-widest">OBSERVING</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right font-mono text-[10px] font-black text-gray-400 uppercase">
                      {block.isLocked ? new Date(block.lockedUntil).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Anomaly Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Anomaly Filter</span>
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200/50 shadow-inner overflow-hidden">
            {['', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev || 'all'}
                onClick={() => setFilterSeverity(sev)}
                className={`px-8 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${filterSeverity === sev
                    ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {sev || 'Global'}
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-900 rounded-[1.5rem] flex items-center justify-between min-w-[200px]">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate mr-4">Active Anomalies</span>
          <span className="text-sm font-black text-white">{filteredAlerts.length}</span>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid gap-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <p className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-2">Zero Anomalies Detected</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">All system signatures are validated and authentic</p>
          </div>
        ) : (
          filteredAlerts.map((alert, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 ${alert.severity === 'HIGH' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'} rounded-2xl flex items-center justify-center`}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getSeverityStyles(alert.severity)}`}>
                          {alert.severity} INTENSITY
                        </span>
                        <span className="text-xs font-black text-red-600 font-mono">{alert.customId}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4 uppercase leading-tight">{alert.reason}</h3>
                  <div className="flex flex-wrap gap-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Source Region</span>
                      <span className="text-xs font-black text-gray-700 uppercase flex items-center gap-2">
                        <MapPin size={12} className="text-gray-400" />
                        {alert.rideDetails.pickup?.slice(0, 40)}...
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</span>
                      <span className="text-xs font-black text-gray-700 uppercase flex items-center gap-2">
                        <Clock size={12} className="text-gray-400" />
                        {new Date(alert.rideDetails.date).toLocaleString('en-GB')}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fiscal Impact</span>
                      <span className="text-xs font-black text-emerald-600 uppercase flex items-center gap-2">
                        <DollarSign size={12} />
                        ₹{alert.rideDetails.fare || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(selectedAlert?.rideId === alert.rideId ? null : alert)}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${selectedAlert?.rideId === alert.rideId
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-50 text-gray-300 hover:text-gray-900 hover:bg-white'
                    }`}
                >
                  <Eye size={20} />
                </button>
              </div>

              {selectedAlert?.rideId === alert.rideId && (
                <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
                  {[
                    { label: 'Subject Identity', value: alert.rideDetails.userName },
                    { label: 'Agent Signature', value: alert.rideDetails.partnerName },
                    { label: 'Temporal Velocity', value: `${alert.rideDetails.distance} km in ${alert.rideDetails.duration || 'N/A'}m` },
                    { label: 'Fleet Category', value: alert.rideDetails.vehicleType },
                  ].map((field, j) => (
                    <div key={j} className="bg-gray-50/50 rounded-[1.5rem] p-5 border border-gray-100">
                      <p className="text-[9px] font-black uppercase text-gray-400 mb-2 tracking-widest">{field.label}</p>
                      <p className="text-xs font-black text-gray-900 uppercase">{field.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>

  );
}
