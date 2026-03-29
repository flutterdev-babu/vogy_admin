'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { socketService } from '@/services/socketService';
import { Activity, Server, Database, Wifi } from 'lucide-react';

interface HealthStatus {
  backend: 'UP' | 'DOWN' | 'PENDING';
  database: 'UP' | 'DOWN' | 'PENDING';
  socket: 'UP' | 'DOWN' | 'PENDING';
}

export function SystemHealthWidget() {
  const [health, setHealth] = useState<HealthStatus>({
    backend: 'PENDING',
    database: 'PENDING',
    socket: 'PENDING'
  });

  const checkHealth = async () => {
    try {
      // The Next.js frontend is running on a different port than the backend,
      // but adminApi is already configured to talk to the backend base URL correctly.
      // However, /api/health is a root endpoint (`BASE_URL/health` not `BASE_URL/admin/health`).
      // Let's use a standard fetch using the base URL.
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/admin', '') || '';
      
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth(prev => ({ 
          ...prev, 
          backend: data.backend === 'UP' ? 'UP' : 'DOWN',
          database: data.database === 'UP' ? 'UP' : 'DOWN' 
        }));
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      setHealth(prev => ({ ...prev, backend: 'DOWN', database: 'DOWN' }));
    }
  };

  useEffect(() => {
    // Initial HTTP Check
    checkHealth();
    
    // Poll HTTP Health every 30 seconds
    const intervalId = setInterval(checkHealth, 30000);

    // Socket Connection Listener
    const handleSocketConnect = () => setHealth(prev => ({ ...prev, socket: 'UP' }));
    const handleSocketDisconnect = () => setHealth(prev => ({ ...prev, socket: 'DOWN' }));

    const socket = socketService.getSocket();
    if (socket) {
      setHealth(prev => ({ ...prev, socket: socket.connected ? 'UP' : 'DOWN' }));
      socket.on('connect', handleSocketConnect);
      socket.on('disconnect', handleSocketDisconnect);
    }

    return () => {
      clearInterval(intervalId);
      if (socket) {
        socket.off('connect', handleSocketConnect);
        socket.off('disconnect', handleSocketDisconnect);
      }
    };
  }, []);

  const StatusDot = ({ status, label, icon: Icon }: { status: string; label: string; icon: any }) => {
    let colorClass = 'bg-gray-300 text-gray-500';
    let pulseClass = '';
    
    if (status === 'UP') {
      colorClass = 'bg-green-500 text-green-700';
      pulseClass = 'animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]';
    } else if (status === 'DOWN') {
      colorClass = 'bg-red-500 text-red-700';
      pulseClass = 'shadow-[0_0_8px_rgba(239,68,68,0.6)]';
    }

    return (
      <div className="flex items-center gap-1.5 group relative" title={`${label}: ${status}`}>
        <Icon size={12} className={status === 'UP' ? 'text-green-600' : status === 'DOWN' ? 'text-red-500' : 'text-gray-400'} />
        <div className="relative flex h-2.5 w-2.5 items-center justify-center">
          <div className={`absolute inline-flex h-full w-full rounded-full opacity-30 ${status === 'UP' ? 'animate-ping bg-green-400' : ''}`} />
          <div className={`relative inline-flex rounded-full h-1.5 w-1.5 ${colorClass} ${pulseClass}`} />
        </div>
        <span className="text-[9px] font-bold uppercase text-gray-500 hidden md:block tracking-wider mx-0.5">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm gap-3 transition-all hover:bg-gray-100">
      <StatusDot status={health.backend} label="API" icon={Server} />
      <div className="h-3 w-px bg-gray-300"></div>
      <StatusDot status={health.database} label="DB" icon={Database} />
      <div className="h-3 w-px bg-gray-300"></div>
      <StatusDot status={health.socket} label="WS" icon={Wifi} />
    </div>
  );
}
