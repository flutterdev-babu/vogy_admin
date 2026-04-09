'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useJsApiLoader } from '@react-google-maps/api';
import { userRideService, CreateRidePayload } from '@/services/userRideService';
import { userProfileService, SavedPlace } from '@/services/userProfileService';
import {
    MapPin,
    Navigation,
    Car,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    Zap,
    Smartphone,
    CreditCard,
    Info,
    Search,
    Home,
    Briefcase,
    Globe,
    AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const LIBRARIES: ("places")[] = ['places'];

interface VehicleType {
    id: string;
    name: string;
    displayName: string;
    category: string;
    pricePerKm: number;
    baseFare?: number;
    isActive: boolean;
}

interface CityCode {
    id: string;
    code: string;
    cityName: string;
    isActive: boolean;
    isAvailable: boolean;
}

interface FareEstimate {
    vehicleTypeId: string;
    displayName: string;
    baseFare: number;
    perKmPrice: number;
    totalFare: number;
    distanceKm: number;
}

export default function BookRidePage() {
    const router = useRouter();
    const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
    const [advanceAmount, setAdvanceAmount] = useState<number>(0);
    const [transactionId, setTransactionId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Hardening: Idempotency & Intent State
    const [idempotencyKey, setIdempotencyKey] = useState<string>('');
    const [currentIntentId, setCurrentIntentId] = useState<string | null>(null);
    const [intentExpiry, setIntentExpiry] = useState<Date | null>(null);

    // Form state
    const [pickupAddress, setPickupAddress] = useState('');
    const [dropAddress, setDropAddress] = useState('');
    const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [distanceKm, setDistanceKm] = useState<number | null>(null);
    const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [paymentMode, setPaymentMode] = useState('UPI');
    const [altMobile, setAltMobile] = useState('');
    const [rideType, setRideType] = useState('LOCAL');

    // Data
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [cityCodes, setCityCodes] = useState<CityCode[]>([]);
    const [fareEstimates, setFareEstimates] = useState<FareEstimate[]>([]);
    const [selectedFare, setSelectedFare] = useState<FareEstimate | null>(null);
    const [createdRide, setCreatedRide] = useState<any>(null);
    const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
    const cityCodesRef = useRef<CityCode[]>([]);

    useEffect(() => {
        cityCodesRef.current = cityCodes;
    }, [cityCodes]);

    // Maps Autocomplete Refs
    const pickupInputRef = useRef<HTMLInputElement | null>(null);
    const dropInputRef = useRef<HTMLInputElement | null>(null);
    const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const dropAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
    });

    // 1. Recovery Logic: On App Load (Session Resilience)
    useEffect(() => {
        const recoverSession = async () => {
            setIsLoadingData(true);
            try {
                // Only recover if the local storage indicates an active session
                const storedIntentId = localStorage.getItem('vogy_booking_intent_id');
                let intent = null;

                if (storedIntentId) {
                    // Fetch active intent from backend (Truth)
                    const intentRes = await userRideService.getActiveIntent();
                    if (intentRes.success && intentRes.data) {
                        intent = intentRes.data;
                    }
                }

                if (intent) {
                    console.log('RECOVERED INTENT:', intent);

                    setCurrentIntentId(intent.id);
                    setAdvanceAmount(intent.amount);
                    setIntentExpiry(new Date(intent.expiresAt));
                    setIdempotencyKey(intent.idempotencyKey);

                    // Restore form details from intent
                    if (intent.rideDetails) {
                        const rd = intent.rideDetails;
                        if (rd.pickupAddress) setPickupAddress(rd.pickupAddress);
                        if (rd.dropAddress) setDropAddress(rd.dropAddress);
                        if (rd.pickupCoords) setPickupCoords(rd.pickupCoords);
                        if (rd.dropCoords) setDropCoords(rd.dropCoords);
                        if (rd.distanceKm) setDistanceKm(rd.distanceKm);
                        if (rd.rideType) setRideType(rd.rideType);
                        if (rd.selectedFare) setSelectedFare(rd.selectedFare);
                    }

                    // Determine step based on status
                    if (intent.status === 'VERIFIED') {
                        setStep('payment'); // Already verified, will attempt Link
                        setTransactionId(intent.transactionId || '');
                    } else if (intent.status === 'PENDING') {
                        setStep('payment');
                    }
                } else {
                    // No valid intent or session cleared (e.g., from logout), clear lingering keys
                    localStorage.removeItem('vogy_booking_intent_id');
                    localStorage.removeItem('vogy_booking_idempotency_key');
                    setStep('form');
                }

                // Load other data
                const [vtRes, ccRes, spRes] = await Promise.all([
                    userRideService.getVehicleTypes(),
                    userRideService.getCityCodes(),
                    userProfileService.getSavedPlaces()
                ]);

                if (vtRes.success) setVehicleTypes(vtRes.data.filter((vt: any) => vt.isActive));
                if (ccRes.success && ccRes.data) {
                    setCityCodes(ccRes.data);
                    if (ccRes.data.length > 0 && !selectedCityId) setSelectedCityId(ccRes.data[0].id);
                }
                if (spRes.success && spRes.data) setSavedPlaces(spRes.data);

            } catch (error) {
                console.error('Session recovery failed:', error);
                toast.error('Failed to restore your booking session');
            } finally {
                setIsLoadingData(false);
            }
        };

        recoverSession();
    }, []);

    // Initialize Autocomplete
    useEffect(() => {
        if (!isLoaded) return;

        if (pickupInputRef.current && !pickupAutocompleteRef.current) {
            const ac = new google.maps.places.Autocomplete(pickupInputRef.current, {
                componentRestrictions: { country: 'in' },
                fields: ['formatted_address', 'geometry', 'address_components', 'name'],
            });
            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                console.log('Pickup Place Selected:', place);

                if (place.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    setPickupCoords({ lat, lng });

                    // Construction: Prefer Name + Formatted Address if Name is a landmark
                    const name = place.name || '';
                    const address = place.formatted_address || '';
                    const finalAddr = (name && !address.startsWith(name)) ? `${name}, ${address}` : address;
                    setPickupAddress(finalAddr);
                    if (pickupInputRef.current) {
                        pickupInputRef.current.value = finalAddr;
                    }

                    // Detect city more robustly
                    const cityComp = place.address_components?.find(c =>
                        c.types.includes('locality') ||
                        c.types.includes('administrative_area_level_2') ||
                        c.types.includes('administrative_area_level_1')
                    );

                    if (cityComp) {
                        const cityName = cityComp.long_name;
                        console.log('Detected City Name:', cityName);
                        const matchedCity = cityCodesRef.current.find(c =>
                            cityName.toLowerCase().includes(c.cityName.toLowerCase()) ||
                            c.cityName.toLowerCase().includes(cityName.toLowerCase())
                        );
                        if (matchedCity) {
                            console.log('Matched City:', matchedCity.cityName);
                            setSelectedCityId(matchedCity.id);
                        }
                    }
                }
            });
            pickupAutocompleteRef.current = ac;
        }

        if (dropInputRef.current && !dropAutocompleteRef.current) {
            const ac = new google.maps.places.Autocomplete(dropInputRef.current, {
                componentRestrictions: { country: 'in' },
                fields: ['formatted_address', 'geometry', 'name'],
            });
            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                console.log('Drop Place Selected:', place);

                if (place.geometry?.location) {
                    setDropCoords({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    });

                    const name = place.name || '';
                    const address = place.formatted_address || '';
                    const finalAddr = (name && !address.startsWith(name)) ? `${name}, ${address}` : address;
                    setDropAddress(finalAddr);
                    if (dropInputRef.current) dropInputRef.current.value = finalAddr;
                }
            });
            dropAutocompleteRef.current = ac;
        }
    }, [isLoaded, cityCodes]);

    // Handle distance and price calculation
    const updatePriceEstimate = useCallback(async () => {
        if (!distanceKm || !selectedCityId) return;

        try {
            const res = await userRideService.estimateFare({
                distanceKm,
                cityCodeId: selectedCityId,
                rideType,
                pickupLat: pickupCoords?.lat,
                pickupLng: pickupCoords?.lng,
            });

            if (res.success && res.data) {
                const estimates = res.data.fareEstimates || (Array.isArray(res.data) ? res.data : []);
                setFareEstimates(estimates);

                if (selectedVehicleTypeId) {
                    const match = estimates.find((e: any) => e.vehicleTypeId === selectedVehicleTypeId);
                    if (match) setSelectedFare(match);
                } else if (estimates.length > 0) {
                    setSelectedFare(estimates[0]);
                    setSelectedVehicleTypeId(estimates[0].vehicleTypeId);
                }
            }
        } catch (err) {
            console.error('❌ Fare estimation failed:', err);
        }
    }, [distanceKm, selectedCityId, rideType, selectedVehicleTypeId, pickupCoords]);

    useEffect(() => {
        if (pickupCoords && dropCoords && isLoaded) {
            const service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix({
                origins: [new google.maps.LatLng(pickupCoords.lat, pickupCoords.lng)],
                destinations: [new google.maps.LatLng(dropCoords.lat, dropCoords.lng)],
                travelMode: google.maps.TravelMode.DRIVING,
            }, (response, status) => {
                if (response?.rows?.[0]?.elements?.[0]?.distance?.value !== undefined) {
                    const distance_km = (response.rows[0].elements[0].distance.value / 1000).toFixed(1);
                    setDistanceKm(parseFloat(distance_km));
                } else {
                    setDistanceKm(0);
                    console.warn('❌ Could not calculate distance for this route.');
                }
            });
        }
    }, [pickupCoords, dropCoords, isLoaded]);

    useEffect(() => {
        updatePriceEstimate();
    }, [updatePriceEstimate]);

    const handleBookRide = async () => {
        if (!pickupAddress) return toast.error('Pickup address is missing');
        if (!dropAddress) return toast.error('Drop address is missing');
        if (!pickupCoords) return toast.error('Pickup coordinates are missing');
        if (!dropCoords) return toast.error('Drop coordinates are missing');
        if (!selectedVehicleTypeId) return toast.error('Please select a vehicle type');

        if (!selectedFare) {
            return toast.error('Please wait for the fare estimate to calculate before booking.');
        }

        setIsLoading(true);
        try {
            const advance = Math.ceil(selectedFare.totalFare * 0.26);

            // Step 1: Initiate Intent on Backend
            let key = idempotencyKey || crypto.randomUUID();
            setIdempotencyKey(key);

            const res = await userRideService.initiatePayment(({
                amount: advance,
                idempotencyKey: key,
                rideDetails: {
                    pickupAddress, dropAddress, pickupCoords, dropCoords,
                    distanceKm, rideType, selectedFare, selectedVehicleTypeId
                }
            }));

            if (res.success && res.data) {
                setCurrentIntentId(res.data.id);
                setAdvanceAmount(advance);
                setIntentExpiry(new Date(res.data.expiresAt));
                setStep('payment');

                localStorage.setItem('vogy_booking_intent_id', res.data.id);
                localStorage.setItem('vogy_booking_idempotency_key', key);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to initiate booking intent');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!transactionId || transactionId.trim().length < 8) {
            return toast.error('Please enter a valid Alphanumeric Transaction ID');
        }
        if (!currentIntentId) return toast.error('Booking session expired. Please refresh.');

        setIsVerifying(true);
        try {
            // STEP 2: Verify Payment Intent
            const verifyRes = await userRideService.verifyPayment({
                verificationId: currentIntentId,
                transactionId: transactionId.trim()
            });

            if (!verifyRes.success) {
                toast.error(verifyRes.message || 'Payment verification failed');
                setIsVerifying(false);
                return;
            }

            // STEP 3: Create Ride (Atomic Linking)
            let finalCityId = selectedCityId;
            if (!finalCityId && cityCodes.length > 0) finalCityId = cityCodes[0].id;

            const payload: any = {
                vehicleTypeId: selectedVehicleTypeId,
                pickupLat: pickupCoords!.lat,
                pickupLng: pickupCoords!.lng,
                pickupAddress: pickupAddress.trim(),
                dropLat: dropCoords!.lat,
                dropLng: dropCoords!.lng,
                dropAddress: dropAddress.trim(),
                distanceKm: distanceKm || 0,
                paymentMode: 'UPI',
                expectedFare: selectedFare?.totalFare,
                cityCodeId: finalCityId,
                rideType: rideType,
                advanceAmount: advanceAmount,
                transactionId: transactionId.trim(),
                // FINAL HARDENING
                idempotencyKey: idempotencyKey,
                paymentVerificationId: currentIntentId
            };

            if (altMobile.trim()) payload.altMobile = altMobile.trim();

            const res = await userRideService.createRide(payload);
            if (res.success) {
                setCreatedRide(res.data);
                setStep('success');
                toast.success('Ride confirmed and linked successfully!');

                // Clear state ONLY after success
                localStorage.removeItem('vogy_booking_intent_id');
                localStorage.removeItem('vogy_booking_idempotency_key');
            } else {
                toast.error(res.message || 'Ride creation failed but payment is verified. Retrying...');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'System error during booking');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSavedPlaceSelect = (place: SavedPlace, type: 'pickup' | 'drop') => {
        if (type === 'pickup') {
            setPickupAddress(place.address);
            setPickupCoords({ lat: place.lat, lng: place.lng });
            if (pickupInputRef.current) pickupInputRef.current.value = place.address;
        } else {
            setDropAddress(place.address);
            setDropCoords({ lat: place.lat, lng: place.lng });
            if (dropInputRef.current) dropInputRef.current.value = place.address;
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-[#E32222] animate-spin" />
                    <p className="text-gray-400 font-medium">Preparing your experience...</p>
                </div>
            </div>
        );
    }

    if (step === 'payment') {
        const upiId = "7569645049@slc";
        const upiDeepLink = `upi://pay?pa=${upiId}&pn=ARA%20Travels&am=${advanceAmount}&cu=INR`;

        return (
            <div className="max-w-md mx-auto py-10 animate-fade-in">
                <div className="rounded-[40px] p-8 sm:p-10 space-y-8 bg-[#0D0D0D] border border-white/5 shadow-2xl relative overflow-hidden">
                    <button onClick={() => setStep('form')} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                        <ArrowLeft size={16} /> Edit Ride
                    </button>

                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter">SECURE PAYMENT</h2>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 text-[10px] font-black tracking-widest uppercase">Total Agreed</span>
                            <span className="text-white text-3xl font-black italic tracking-tighter">₹{Math.round(selectedFare?.totalFare || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center px-6 py-4 bg-white/5">
                            <span className="text-green-400 text-[10px] font-bold tracking-widest uppercase">Confirmation Fee</span>
                            <span className="text-green-400 text-xl font-black italic tracking-tighter">₹{Math.round((selectedFare?.totalFare || 0) * 0.26)}</span>
                        </div>
                        <div className="flex justify-between items-center px-6 py-5 bg-[#E32222]/10">
                            <span className="text-[#E32222] text-[10px] font-black tracking-wider uppercase">Pay to Driver later</span>
                            <span className="text-[#E32222] text-2xl font-black italic tracking-tighter">₹{Math.round((selectedFare?.totalFare || 0) - Math.round((selectedFare?.totalFare || 0) * 0.26))}</span>
                        </div>
                        <div className="pt-3 border-t border-white/5 mt-2">
                            <p className="text-[9px] text-gray-500 leading-relaxed italic">
                                * Note: Refund of confirmation fee is only possible if cancelled more than 3 hours before the ride start time.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">UPI ID</p>
                            <p className="text-white font-mono text-lg font-bold">{upiId}</p>
                        </div>

                        <a
                            href={upiDeepLink}
                            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest transition-all hover:bg-gray-200 active:scale-95"
                        >
                            <Smartphone size={20} /> Pay via UPI App
                        </a>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest ml-1">Transaction ID (Ref No.)</label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter Transaction ID"
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-[#E32222] transition-all font-mono"
                            />
                        </div>

                        <button
                            onClick={handleConfirmPayment}
                            disabled={isVerifying || !transactionId}
                            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-[#E32222] text-white font-black text-sm uppercase tracking-widest transition-all hover:bg-[#cc1f1f] active:scale-95 disabled:opacity-50"
                        >
                            {isVerifying ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                            Confirm & Book Ride
                        </button>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-900/50">
                        <Info size={16} className="text-gray-500 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
                                Your ride will be confirmed immediately after verification of the UPI Transaction ID.
                            </p>
                            {intentExpiry && (
                                <p className="text-[10px] text-[#E32222] font-black uppercase tracking-widest">
                                    Link expires at {intentExpiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'success' && createdRide) {
        return (
            <div className="max-w-md mx-auto py-10">
                <div className="text-center rounded-3xl p-8 bg-[#0D0D0D] border border-green-500/20 shadow-2xl animate-fade-in shadow-green-500/5">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-green-400" />
                    </div>
                    <h2 className="text-white font-bold text-3xl mb-2 tracking-tight">Booking Successful!</h2>
                    <p className="text-gray-400 mb-8 font-medium">Professional Booking Receipt Attached</p>

                    <div className="rounded-2xl p-6 mb-8 text-left space-y-4 bg-white/5 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap size={64} className="text-[#E32222]" />
                        </div>

                        <div className="space-y-4 pb-4 border-b border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Official Ride ID</span>
                                <span className="text-white text-sm font-black italic">{createdRide?.customId || createdRide?.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Transaction Ref</span>
                                <span className="text-gray-400 text-[10px] font-mono">{createdRide?.transactionId || 'UPI_VERIFIED'}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0 animate-pulse" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Pickup</p>
                                    <p className="text-white text-xs line-clamp-1 font-medium">{createdRide?.pickupAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Drop</p>
                                    <p className="text-white text-xs line-clamp-1 font-medium">{createdRide?.dropAddress}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <div className="flex justify-between items-center px-2 py-3 rounded-xl bg-white/[0.03]">
                                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total Value</span>
                                <span className="text-white font-black text-xl tracking-tighter">₹{Math.round(createdRide.totalFare)}</span>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Advance Paid</span>
                                <span className="text-green-400 font-black text-lg tracking-tighter">₹{Math.round(createdRide.advanceAmount || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center px-2 pt-2 border-t border-white/5">
                                <span className="text-[#E32222] text-[10px] font-black uppercase tracking-wider">Pay to Driver</span>
                                <span className="text-[#E32222] font-black text-2xl italic tracking-tighter">₹{Math.round(createdRide.totalFare - (createdRide.advanceAmount || 0))}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={() => router.push('/user/dashboard')} className="w-full px-5 py-4 rounded-2xl text-white text-sm font-black uppercase tracking-widest bg-[#E32222] transition-all hover:bg-[#cc1f1f] active:scale-95 shadow-lg shadow-red-900/30">
                            Back to Dashboard
                        </button>
                        <button onClick={() => router.push('/user/dashboard/history')} className="w-full px-5 py-4 rounded-2xl text-white text-sm font-black uppercase tracking-widest bg-white/10 hover:bg-white/15 transition-all border border-white/10">
                            Track My Ride
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const homePlace = savedPlaces.find(p => p.label === 'Home');
    const workPlace = savedPlaces.find(p => p.label === 'Work');

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="relative">
                <button onClick={() => router.back()} className="group mb-6 flex items-center gap-2 text-gray-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-2 underline decoration-[#E32222] decoration-4 underline-offset-8">
                            BOOK A <span className="text-[#E32222]">VOGY</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-md">Seamless city travel at your fingertips. Choose your destination and let&apos;s get moving.</p>
                    </div>
                    {/* Status Pill */}
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black tracking-widest uppercase">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Booking Active
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-start">

                {/* Main Form Module */}
                <div className="lg:col-span-7 space-y-8">

                    {/* Ride Type Switcher - Premium Style */}
                    <div className="bg-[#0D0D0D] p-1.5 rounded-3xl border border-white/5 flex gap-1 shadow-2xl overflow-x-auto no-scrollbar">
                        {['LOCAL', 'RENTAL', 'OUTSTATION', 'AIRPORT'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setRideType(type)}
                                className={`flex-1 min-w-[80px] py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${rideType === type
                                    ? 'bg-[#E32222] text-white shadow-[0_10px_20px_rgba(227,34,34,0.3)] scale-100'
                                    : 'text-gray-600 hover:text-gray-400'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-[40px] p-8 sm:p-10 space-y-8 bg-[#0F0F0F] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E32222]/5 rounded-full blur-[80px] pointer-events-none" />

                        {/* Locations Module */}
                        <div className="space-y-6 relative">
                            {/* Visual Connector */}
                            <div className="absolute left-[31px] top-[140px] bottom-[50px] w-0.5 border-l-2 border-dashed border-gray-800 hidden sm:block" />

                            {/* City Selection */}
                            <div className="space-y-3 relative z-20">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest px-1">Select Operations City</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-focus-within:bg-purple-500 group-focus-within:text-white transition-all">
                                        <Globe size={18} />
                                    </div>
                                    <select
                                        value={selectedCityId}
                                        onChange={(e) => setSelectedCityId(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] py-5 pl-16 pr-10 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-white/[0.05] transition-all font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-[#0F0F0F]">Select your city</option>
                                        {cityCodes.filter(city => city.isAvailable !== false).map(city => (
                                            <option key={city.id} value={city.id} className="bg-[#0F0F0F]">
                                                {city.cityName} ({city.code})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>

                            </div>

                            {/* Pickup */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Starting Point</label>
                                    <div className="flex gap-2">
                                        {homePlace && (
                                            <button onClick={() => handleSavedPlaceSelect(homePlace, 'pickup')} className="p-1 px-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-tighter">
                                                <Home size={10} /> Home
                                            </button>
                                        )}
                                        {workPlace && (
                                            <button onClick={() => handleSavedPlaceSelect(workPlace, 'pickup')} className="p-1 px-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-tighter">
                                                <Briefcase size={10} /> Work
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-focus-within:bg-green-500 group-focus-within:text-white transition-all">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        ref={pickupInputRef}
                                        type="text"
                                        defaultValue={pickupAddress}
                                        onChange={(e) => setPickupAddress(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] py-5 pl-16 pr-4 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-green-500 focus:bg-white/[0.05] transition-all font-medium"
                                        placeholder="Enter pickup location..."
                                    />
                                </div>
                            </div>

                            {/* Drop */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Where to?</label>
                                    <div className="flex gap-2">
                                        {homePlace && (
                                            <button onClick={() => handleSavedPlaceSelect(homePlace, 'drop')} className="p-1 px-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-tighter">
                                                <Home size={10} /> Home
                                            </button>
                                        )}
                                        {workPlace && (
                                            <button onClick={() => handleSavedPlaceSelect(workPlace, 'drop')} className="p-1 px-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-gray-400 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-tighter">
                                                <Briefcase size={10} /> Work
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-focus-within:bg-red-500 group-focus-within:text-white transition-all">
                                        <Navigation size={18} />
                                    </div>
                                    <input
                                        ref={dropInputRef}
                                        type="text"
                                        defaultValue={dropAddress}
                                        onChange={(e) => setDropAddress(e.target.value)}
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] py-5 pl-16 pr-4 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-red-500 focus:bg-white/[0.05] transition-all font-medium"
                                        placeholder="Where do you want to go?"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Secondary Fields */}
                        <div className="grid grid-cols-1 gap-6 pt-4">
                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest ml-1">Payment Method</label>
                                <div className="flex p-1 bg-white/[0.03] rounded-2xl border border-white/5">
                                    <div className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black tracking-widest bg-blue-600 text-white shadow-lg">
                                        <Smartphone size={14} />
                                        UPI (MANDATORY)
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-500 italic ml-1">* Confirmation fee required for all bookings. Remaining to be paid to driver.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] text-gray-600 uppercase font-black tracking-widest ml-1">Guest Number (Optional)</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={16} />
                                    <input
                                        type="tel"
                                        value={altMobile}
                                        onChange={(e) => setAltMobile(e.target.value)}
                                        placeholder="+91 Phone"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-white text-sm focus:outline-none focus:border-white/10 transition-all font-medium placeholder-gray-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fare Summary & Action Area */}
                        {selectedFare && (
                            <div className="mt-8 space-y-6 animate-slide-up">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">Base Fare</p>
                                        <p className="text-white font-black text-lg">₹{selectedFare.baseFare || 0}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">Distance Charge</p>
                                        <p className="text-white font-black text-lg">₹{Math.max(0, (selectedFare.totalFare || 0) - (selectedFare.baseFare || 0)).toFixed(0)}</p>
                                    </div>
                                </div>

                                {/* Main Payable Result */}
                                <div className="relative group/pay overflow-hidden rounded-[32px] p-8 shadow-[0_20px_40px_rgba(227,34,34,0.15)] bg-gradient-to-br from-[#E32222] to-[#ff4444]">
                                    <div className="absolute top-0 right-0 p-8 text-white/10 group-hover/pay:scale-110 transition-transform">
                                        <CreditCard size={120} />
                                    </div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] mb-1">Est. Payable</p>
                                            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-4">Includes Tolls & Taxes</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-white italic">₹</span>
                                                <span className="text-4xl font-black text-white tracking-tighter">{(selectedFare.totalFare || 0).toFixed(0)}</span>
                                            </div>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm self-end">
                                            <Zap size={32} className="fill-current" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Booking Action */}
                        <div className="pt-4">
                            {(!distanceKm || !selectedFare) ? (
                                <div className="w-full py-6 rounded-[32px] bg-gray-800 text-gray-500 font-black text-center text-xs uppercase tracking-[0.2em] border border-white/5">
                                    {!selectedCityId ? 'Select a city to continue' : 'Finding Route...'}
                                </div>
                            ) : (
                                <button
                                    onClick={handleBookRide}
                                    disabled={isLoading || !distanceKm || !selectedFare}
                                    className="w-full relative group overflow-hidden py-6 rounded-[32px] bg-[#E32222] text-white font-black text-xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:scale-100"
                                >
                                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                    <div className="relative flex items-center justify-center gap-4 uppercase tracking-[0.2em]">
                                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="fill-current" />}
                                        <span>{isLoading ? 'Processing...' : (distanceKm ? 'Book Now' : 'Finding Route...')}</span>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summaries & Vehicle Selection Module */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="rounded-[40px] p-8 sm:p-10 space-y-8 bg-[#0D0D0D] border border-white/5 shadow-2xl sticky top-24">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white italic">VEHICLES</h2>
                            {distanceKm && (
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-[#E32222] font-black uppercase tracking-widest">Est. Distance</span>
                                    <p className="text-white font-black text-xl leading-none">{distanceKm} KM</p>
                                </div>
                            )}
                        </div>

                        {/* Vehicle Choice List */}
                        {vehicleTypes.length > 0 ? (
                            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                                {vehicleTypes.map((vt) => {
                                    const estimate = fareEstimates.find(e => e.vehicleTypeId === vt.id);
                                    const isSelected = selectedVehicleTypeId === vt.id;

                                    return (
                                        <button
                                            key={vt.id}
                                            onClick={() => setSelectedVehicleTypeId(vt.id)}
                                            className={`w-full group relative flex items-center gap-5 p-5 rounded-3xl text-left transition-all border-2 overflow-hidden ${isSelected
                                                ? 'bg-[#E32222] border-[#E32222] shadow-[0_15px_30px_rgba(227,34,34,0.2)]'
                                                : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                        >
                                            {/* Vehicle Glow Background */}
                                            {isSelected && (
                                                <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-white/10">
                                                    <Car size={160} className="rotate-12" />
                                                </div>
                                            )}

                                            <div className={`p-4 rounded-2xl relative z-10 ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300'} transition-all`}>
                                                <Car size={32} />
                                            </div>

                                            <div className="flex-1 min-w-0 relative z-10">
                                                <p className={`font-black text-lg truncate tracking-tight ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                                    {vt.displayName || vt.name}
                                                </p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-600'}`}>
                                                    {estimate ? `₹${(estimate.totalFare || 0).toFixed(0)} Total` : `₹${vt.pricePerKm}/km Rate`}
                                                </p>
                                            </div>

                                            <div className="text-right relative z-10">
                                                {isSelected ? (
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#E32222]">
                                                        <Zap size={16} className="fill-current" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                                                        {estimate ? 'Selected' : (
                                                            <>
                                                                <Loader2 size={12} className="animate-spin" />
                                                                <span>Calc...</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-10 text-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-700 mx-auto">
                                    <Car size={32} />
                                </div>
                                <p className="text-gray-500 font-bold">No vehicles available for this route</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}
