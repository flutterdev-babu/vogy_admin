'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '@/contexts/UserAuthContext';
import UserSidebar from '@/components/UserSidebar';

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useUserAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/user/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#E32222] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
            <UserSidebar />
            <main className="lg:ml-72 min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
