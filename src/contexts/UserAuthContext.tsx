'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAuthService, UserData } from '@/services/userAuthService';
import { userProfileService } from '@/services/userProfileService';
import { TOKEN_KEYS, USER_KEYS } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserAuthContextType {
    user: UserData | null;
    token: string | null;
    isLoading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    // 1. Initial Load from LocalStorage (Fast UI)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem(TOKEN_KEYS.user);
            const storedUser = localStorage.getItem(USER_KEYS.user);

            if (storedToken && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);
                } catch {
                    handleLogout();
                }
            }
            setIsLoading(false);
        }
    }, []);

    // 2. Background Sync (Safe Profile Sync Strategy)
    useEffect(() => {
        if (token && user) {
            const syncProfile = async () => {
                try {
                    const res = await userProfileService.getProfile();
                    if (res.success && res.data) {
                        const latestUser = res.data;
                        // If role changed or user data mismatch, update state
                        if (latestUser.role !== user.role || latestUser.id !== user.id) {
                            setUser(latestUser);
                            localStorage.setItem(USER_KEYS.user, JSON.stringify(latestUser));
                        }
                    }
                } catch (err) {
                    console.error('Background profile sync failed:', err);
                    // Do not block UI if non-critical sync fails
                }
            };
            syncProfile();
        }
    }, [token]);

    // 3. Cross-Tab Session Sync
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === TOKEN_KEYS.user && !e.newValue) {
                // Token removed in another tab
                handleLogout();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEYS.user);
        localStorage.removeItem(USER_KEYS.user);
        // Clear active booking caches on logout
        localStorage.removeItem('vogy_booking_intent_id');
        localStorage.removeItem('vogy_booking_idempotency_key');
        router.push('/');
    };



    const loginWithEmail = async (email: string, password: string) => {
        const response = await userAuthService.loginWithEmail(email, password);
        if (response.success && response.data) {
            const { token: newToken, user: newUser } = response.data;
            setToken(newToken);
            setUser(newUser);
            localStorage.setItem(TOKEN_KEYS.user, newToken);
            localStorage.setItem(USER_KEYS.user, JSON.stringify(newUser));
        } else {
            throw new Error(response.message || 'Login failed');
        }
    };

    const logout = () => {
        handleLogout();
    };

    return (
        <UserAuthContext.Provider value={{ user, token, isLoading, loginWithEmail, logout }}>
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth() {
    const context = useContext(UserAuthContext);
    if (context === undefined) {
        throw new Error('useUserAuth must be used within a UserAuthProvider');
    }
    return context;
}
