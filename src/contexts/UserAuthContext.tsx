'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAuthService, UserData } from '@/services/userAuthService';
import { TOKEN_KEYS, USER_KEYS } from '@/lib/api';

interface UserAuthContextType {
    user: UserData | null;
    token: string | null;
    isLoading: boolean;
    sendOtp: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, code: string) => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem(TOKEN_KEYS.user);
            const storedUser = localStorage.getItem(USER_KEYS.user);

            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } catch {
                    localStorage.removeItem(TOKEN_KEYS.user);
                    localStorage.removeItem(USER_KEYS.user);
                }
            }
            setIsLoading(false);
        }
    }, []);

    const sendOtp = async (phone: string) => {
        const response = await userAuthService.sendOtp(phone);
        if (!response.success) {
            throw new Error(response.message || 'Failed to send OTP');
        }
    };

    const verifyOtp = async (phone: string, code: string) => {
        const response = await userAuthService.verifyOtp(phone, code);
        if (response.success && response.data) {
            const { token: newToken, user: newUser } = response.data;
            setToken(newToken);
            setUser(newUser);
            localStorage.setItem(TOKEN_KEYS.user, newToken);
            localStorage.setItem(USER_KEYS.user, JSON.stringify(newUser));
        } else {
            throw new Error(response.message || 'OTP verification failed');
        }
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
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEYS.user);
        localStorage.removeItem(USER_KEYS.user);
    };

    return (
        <UserAuthContext.Provider value={{ user, token, isLoading, sendOtp, verifyOtp, loginWithEmail, logout }}>
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
