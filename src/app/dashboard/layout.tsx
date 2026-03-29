'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { PageLoader } from '@/components/ui/LoadingSpinner';

import { SystemHealthWidget } from '@/components/layout/SystemHealthWidget';

import { GlobalSearch } from '@/components/layout/GlobalSearch';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/login');
    }
  }, [admin, isLoading, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <GlobalSearch />
      <Sidebar />
      <main className="lg:ml-72 min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex justify-end mb-4">
            <SystemHealthWidget />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
