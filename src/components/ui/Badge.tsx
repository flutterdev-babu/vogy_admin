'use client';

import { RideStatus } from '@/types';

interface StatusBadgeProps {
  status: RideStatus;
}

const statusConfig: Record<RideStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
  ACCEPTED: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Accepted' },
  ARRIVED: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Arrived' },
  STARTED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'In Progress' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  
  return (
    <span className={`badge ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

interface OnlineBadgeProps {
  isOnline: boolean;
}

export function OnlineBadge({ isOnline }: OnlineBadgeProps) {
  return (
    <span className={`badge ${isOnline ? 'badge-success' : 'badge-muted'}`}>
      <span className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}

interface CategoryBadgeProps {
  category: 'BIKE' | 'AUTO' | 'CAR';
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = {
    BIKE: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    AUTO: { bg: 'bg-amber-100', text: 'text-amber-700' },
    CAR: { bg: 'bg-blue-100', text: 'text-blue-700' },
  };
  
  return (
    <span className={`badge ${config[category].bg} ${config[category].text}`}>
      {category}
    </span>
  );
}

interface ActiveBadgeProps {
  isActive: boolean;
}

export function ActiveBadge({ isActive }: ActiveBadgeProps) {
  return (
    <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
