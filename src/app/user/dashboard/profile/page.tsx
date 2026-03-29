'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { userProfileService, SavedPlace } from '@/services/userProfileService';
import {
    UserCircle,
    Loader2,
    AlertTriangle,
    Save,
    Phone,
    Mail,
    User,
    RefreshCw,
    CheckCircle2,
    Edit3,
    Home,
    Briefcase,
    MapPin,
    Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { USER_KEYS } from '@/lib/api';

const LIBRARIES: ("places")[] = ['places'];

interface Profile {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profileImage?: string;
    uniqueOtp?: string;
    referralCode?: string;
    createdAt: string;
}

export default function UserProfilePage() {
    const { user } = useUserAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingPlaces, setIsSavingPlaces] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPlaces, setIsEditingPlaces] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false);

    // Saved Places form state
    const [homeAddress, setHomeAddress] = useState('');
    const [homeCoords, setHomeCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [workAddress, setWorkAddress] = useState('');
    const [workCoords, setWorkCoords] = useState<{ lat: number, lng: number } | null>(null);

    const homeInputRef = useRef<HTMLInputElement>(null);
    const workInputRef = useRef<HTMLInputElement>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [profRes, placesRes] = await Promise.all([
                userProfileService.getProfile(),
                userProfileService.getSavedPlaces()
            ]);

            if (profRes.success && profRes.data) {
                setProfile(profRes.data);
                setEditName(profRes.data.name || '');
                setEditEmail(profRes.data.email || '');
            } else {
                setError(profRes.message || 'Failed to load profile');
            }

            if (placesRes.success && placesRes.data) {
                const places = placesRes.data as SavedPlace[];
                setSavedPlaces(places);
                const home = places.find(p => p.label === 'Home');
                const work = places.find(p => p.label === 'Work');
                if (home) {
                    setHomeAddress(home.address);
                    setHomeCoords({ lat: home.lat, lng: home.lng });
                }
                if (work) {
                    setWorkAddress(work.address);
                    setWorkCoords({ lat: work.lat, lng: work.lng });
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Initialize Autocomplete for Profile
    useEffect(() => {
        if (!isLoaded || !isEditingPlaces) return;

        if (homeInputRef.current) {
            const ac = new google.maps.places.Autocomplete(homeInputRef.current, {
                componentRestrictions: { country: 'in' },
                fields: ['formatted_address', 'geometry', 'name']
            });
            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (place.geometry?.location) {
                    const name = place.name || '';
                    const address = place.formatted_address || '';
                    const finalAddr = (name && !address.startsWith(name)) ? `${name}, ${address}` : address;
                    setHomeAddress(finalAddr);
                    setHomeCoords({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    });
                }
            });
        }

        if (workInputRef.current) {
            const ac = new google.maps.places.Autocomplete(workInputRef.current, {
                componentRestrictions: { country: 'in' },
                fields: ['formatted_address', 'geometry', 'name']
            });
            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (place.geometry?.location) {
                    const name = place.name || '';
                    const address = place.formatted_address || '';
                    const finalAddr = (name && !address.startsWith(name)) ? `${name}, ${address}` : address;
                    setWorkAddress(finalAddr);
                    setWorkCoords({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    });
                }
            });
        }
    }, [isLoaded, isEditingPlaces]);

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            toast.error('Name is required');
            return;
        }
        setIsSaving(true);
        try {
            const res = await userProfileService.updateProfile({ name: editName, email: editEmail });
            if (res.success) {
                toast.success('Profile updated');
                setProfile(res.data);
                setIsEditing(false);
                // Update local storage
                const storedUser = localStorage.getItem(USER_KEYS.user);
                if (storedUser) {
                    localStorage.setItem(USER_KEYS.user, JSON.stringify({ ...JSON.parse(storedUser), name: editName, email: editEmail }));
                }
            }
        } catch (err: any) {
            toast.error(err.message || 'Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePlaces = async () => {
        setIsSavingPlaces(true);
        try {
            const places: SavedPlace[] = [];
            if (homeAddress && homeCoords) {
                places.push({ id: 'home', label: 'Home', address: homeAddress, lat: homeCoords.lat, lng: homeCoords.lng });
            }
            if (workAddress && workCoords) {
                places.push({ id: 'work', label: 'Work', address: workAddress, lat: workCoords.lat, lng: workCoords.lng });
            }

            const res = await userProfileService.updateSavedPlaces(places);
            if (res.success) {
                toast.success('Locations updated');
                setSavedPlaces(places);
                setIsEditingPlaces(false);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to save locations');
        } finally {
            setIsSavingPlaces(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setIsUpdatingPassword(true);
        try {
            const res = await userProfileService.updatePassword(newPassword);
            if (res.success) {
                toast.success('Password updated');
                setIsPasswordChangeMode(false);
                setNewPassword('');
            }
        } catch (err: any) {
            toast.error(err.message || 'Update failed');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="text-[#E32222] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
                    <p className="text-gray-400 mt-1">Manage your identity and preferences</p>
                </div>
                <button onClick={loadData} className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all border border-white/5">
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Avatar & Core Info */}
            <div className="rounded-[32px] p-8 bg-[#0D0D0D] border border-white/5 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <User size={160} />
                </div>
                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#E32222] to-[#ff4444] p-1 shadow-lg shadow-red-900/20 mb-6">
                    <div className="w-full h-full rounded-[28px] bg-[#0D0D0D] flex items-center justify-center text-white font-black text-3xl">
                        {profile?.name?.charAt(0)?.toUpperCase()}
                    </div>
                </div>
                <h2 className="text-2xl font-black text-white">{profile?.name}</h2>
                <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest mt-2 bg-white/5 px-4 py-1.5 rounded-full">
                    <Phone size={12} className="text-[#E32222]" /> {profile?.phone}
                </div>
            </div>

            <div className="grid gap-8">
                {/* Details Section */}
                <div className="rounded-[40px] p-8 bg-[#0F0F0F] border border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-white italic tracking-tighter">PERSONAL DETAILS</h3>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[#E32222] text-xs font-black uppercase tracking-widest hover:bg-[#E32222]/10 px-4 py-2 rounded-xl transition-all">
                                <Edit3 size={14} /> Edit profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button onClick={() => setIsEditing(false)} className="text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                                <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 bg-[#E32222] text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl shadow-lg shadow-red-900/20 active:scale-95 transition-all">
                                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Details
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-600 font-black uppercase tracking-widest ml-1">Full Identity</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#E32222] transition-colors"
                                />
                            ) : (
                                <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm font-medium flex items-center gap-3">
                                    <User size={16} className="text-[#E32222]" /> {profile?.name}
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] text-gray-600 font-black uppercase tracking-widest ml-1">Email Connection</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#E32222] transition-colors"
                                    placeholder="your@email.com"
                                />
                            ) : (
                                <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm font-medium flex items-center gap-3">
                                    <Mail size={16} className="text-gray-600" /> {profile?.email || 'No email linked'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Saved Places Section */}
                <div className="rounded-[40px] p-8 bg-[#0F0F0F] border border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-white italic tracking-tighter">SAVED PLACES</h3>
                        {!isEditingPlaces ? (
                            <button onClick={() => setIsEditingPlaces(true)} className="flex items-center gap-2 text-[#E32222] text-xs font-black uppercase tracking-widest hover:bg-[#E32222]/10 px-4 py-2 rounded-xl transition-all">
                                <Edit3 size={14} /> Update Locations
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button onClick={() => setIsEditingPlaces(false)} className="text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                                <button onClick={handleSavePlaces} disabled={isSavingPlaces} className="flex items-center gap-2 bg-[#E32222] text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg shadow-red-900/20 active:scale-95 transition-all">
                                    {isSavingPlaces ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Places
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Home size={12} /> Primary Home
                                </label>
                            </div>
                            {isEditingPlaces ? (
                                <div className="relative group">
                                    <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" />
                                    <input
                                        ref={homeInputRef}
                                        type="text"
                                        defaultValue={homeAddress}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-green-500 transition-colors"
                                        placeholder="Search for your home address..."
                                    />
                                </div>
                            ) : (
                                <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm font-medium flex items-start gap-3">
                                    <MapPin size={16} className="text-green-500 shrink-0 mt-0.5" />
                                    <span>{homeAddress || <span className="text-gray-700 italic">No home address saved</span>}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase size={12} /> Workplace
                                </label>
                            </div>
                            {isEditingPlaces ? (
                                <div className="relative group">
                                    <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" />
                                    <input
                                        ref={workInputRef}
                                        type="text"
                                        defaultValue={workAddress}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Search for your workplace..."
                                    />
                                </div>
                            ) : (
                                <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm font-medium flex items-start gap-3">
                                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span>{workAddress || <span className="text-gray-700 italic">No work address saved</span>}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="rounded-[40px] p-8 bg-[#0F0F0F] border border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-white italic tracking-tighter">SECURITY</h3>
                        {isPasswordChangeMode && (
                            <button onClick={() => setIsPasswordChangeMode(false)} className="text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                        )}
                    </div>

                    {!isPasswordChangeMode ? (
                        <div className="flex items-center justify-between p-6 rounded-[24px] bg-white/[0.02] border border-white/5">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-2xl bg-[#E32222]/10 flex items-center justify-center text-[#E32222]">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold text-sm">Account Protected</p>
                                    <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest mt-0.5">Password login enabled</p>
                                </div>
                            </div>
                            <button onClick={() => setIsPasswordChangeMode(true)} className="text-xs font-black text-white hover:text-[#E32222] underline decoration-dotted transition-all">Reset Password</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-600 font-black uppercase tracking-widest ml-1">New Security Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#E32222] transition-colors"
                                    placeholder="Enter at least 6 characters"
                                />
                            </div>
                            <button
                                onClick={handlePasswordUpdate}
                                disabled={isUpdatingPassword}
                                className="w-full py-4 rounded-2xl bg-[#E32222] text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-red-900/30 flex items-center justify-center gap-3 transition-all active:scale-95"
                            >
                                {isUpdatingPassword ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Update Security
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}
