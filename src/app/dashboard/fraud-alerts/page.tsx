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

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'LOW': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Shield className="text-red-500" size={28} /> Fraud Detection
          </h1>
          <p className="text-sm text-gray-500 mt-1">Anomalous rides flagged by our detection engine</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-lg hover:bg-green-100 border border-green-200 transition-all"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Alerts', value: data.totalAlerts, color: 'text-gray-800', bg: 'bg-white' },
            { label: 'High Severity', value: data.highSeverity, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Medium Severity', value: data.mediumSeverity, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Low Severity', value: data.lowSeverity, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map((card, i) => (
            <div key={i} className={`${card.bg} rounded-2xl p-5 border border-gray-100`}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{card.label}</p>
              <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 items-center">
        <span className="text-xs font-bold text-gray-500 uppercase">Filter:</span>
        {['', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
          <button
            key={sev || 'all'}
            onClick={() => setFilterSeverity(sev)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterSeverity === sev
              ? 'bg-[#E32222] text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {sev || 'All'}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Shield size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">No fraud alerts detected</p>
            <p className="text-sm">All rides look legitimate! 🎉</p>
          </div>
        ) : (
          filteredAlerts.map((alert, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle size={18} className={alert.severity === 'HIGH' ? 'text-red-500' : 'text-orange-500'} />
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getSeverityStyles(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm font-bold text-[#E32222]">{alert.customId}</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium mb-3">{alert.reason}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {alert.rideDetails.pickup?.slice(0, 30)}...</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(alert.rideDetails.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} /> ₹{alert.rideDetails.fare || 0}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(selectedAlert?.rideId === alert.rideId ? null : alert)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye size={16} className="text-gray-400" />
                </button>
              </div>

              {selectedAlert?.rideId === alert.rideId && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'User', value: alert.rideDetails.userName },
                    { label: 'Partner', value: alert.rideDetails.partnerName },
                    { label: 'Distance', value: `${alert.rideDetails.distance} km` },
                    { label: 'Duration', value: alert.rideDetails.duration ? `${alert.rideDetails.duration} min` : 'N/A' },
                    { label: 'Vehicle', value: alert.rideDetails.vehicleType },
                    { label: 'Fare', value: `₹${alert.rideDetails.fare || 0}` },
                    { label: 'Pickup', value: alert.rideDetails.pickup?.slice(0, 40) },
                    { label: 'Drop', value: alert.rideDetails.drop?.slice(0, 40) },
                  ].map((field, j) => (
                    <div key={j} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{field.label}</p>
                      <p className="text-xs font-bold text-gray-700">{field.value}</p>
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
