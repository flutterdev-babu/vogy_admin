'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { io, Socket } from 'socket.io-client';
import { Loader2, Navigation, Phone, User, Car, MapPin, UserPlus } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { TOKEN_KEYS } from '@/lib/api';
import toast from 'react-hot-toast';

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

export interface PartnerLocation {
  id: string;
  partnerId?: string;
  customId: string;
  name: string;
  phone: string;
  registrationNumber: string;
  lat: number;
  lng: number;
  vehicleType: string;
  category: 'CAR' | 'BIKE' | 'AUTO';
  isOnline: boolean;
  isOnRide: boolean;
}

export interface RideMarker {
  id: string;
  customId: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropAddress: string;
  totalFare: number;
  distanceKm: number;
  status: string;
  userName: string;
  userPhone: string;
  vehicleCategory: string;
  scheduledDateTime?: string;
  effectivePickupTime?: string;
  expiresAt?: string;
  timeRemainingMinutes?: number;
  urgencyLevel?: 'GREEN' | 'AMBER' | 'RED';
}

interface PartnerLocationsMapProps {
  refreshTrigger?: number;
  rides?: RideMarker[];
  selectedRide?: RideMarker | null;
  onRideSelect?: (ride: RideMarker) => void;
  onPartnerSelect?: (partner: PartnerLocation, ride: RideMarker) => void;
  assignMode?: boolean;
}

// Haversine distance in km
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function PartnerLocationsMap({
  refreshTrigger = 0,
  rides = [],
  selectedRide = null,
  onRideSelect,
  onPartnerSelect,
  assignMode = false,
}: PartnerLocationsMapProps) {
  const [partners, setPartners] = useState<Map<string, PartnerLocation>>(new Map());
  const [selectedPartner, setSelectedPartner] = useState<PartnerLocation | null>(null);
  const [hoveredRide, setHoveredRide] = useState<RideMarker | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(5);
  const socketRef = useRef<Socket | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const fetchInitialLocations = async () => {
    try {
      const response = await partnerService.getActivePartnerLocations();
      if (response.success && response.data) {
        const newPartnersMap = new Map<string, PartnerLocation>();
        let avgLat = 0;
        let avgLng = 0;
        let count = 0;

        response.data.forEach((p: any) => {
          const id = p.id || p.partnerId;
          if (id && p.lat && p.lng) {
            newPartnersMap.set(id, {
              id,
              customId: p.customId || 'N/A',
              name: p.name || 'Unknown',
              phone: p.phone || 'N/A',
              lat: Number(p.lat),
              lng: Number(p.lng),
              vehicleType: p.vehicleType || 'Unknown',
              category: p.category || 'CAR',
              isOnline: !!p.isOnline,
              isOnRide: !!p.isOnRide,
              registrationNumber: p.registrationNumber || 'N/A'
            });
            avgLat += Number(p.lat);
            avgLng += Number(p.lng);
            count++;
          }
        });

        setPartners(newPartnersMap);

        if (count > 0) {
          setMapCenter({ lat: avgLat / count, lng: avgLng / count });
          setMapZoom(12);
        } else {
          setMapCenter(defaultCenter);
        }
      }
    } catch (error) {
      console.error('Failed to fetch initial partner locations:', error);
      toast.error('Failed to load active partners on map.');
    }
  };

  useEffect(() => {
    fetchInitialLocations();

    const token = localStorage.getItem(TOKEN_KEYS.admin);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');
    if (!backendUrl) return;

    if (token) {
      socketRef.current = io(backendUrl, {
        transports: ['websocket'],
        auth: { token }
      });

      socketRef.current.on('connect', () => {
        console.log('Admin Socket Connected for Live Map:', socketRef.current?.id);
      });

      socketRef.current.on('partner:active_location', (data: any) => {
        if (data && data.partnerId && data.lat && data.lng) {
          setPartners((prevMap) => {
            const newMap = new Map(prevMap);
            const id = data.partnerId;
            newMap.set(id, {
              ...newMap.get(id),
              id,
              customId: data.customId || newMap.get(id)?.customId || 'N/A',
              name: data.name || newMap.get(id)?.name || 'Unknown',
              phone: data.phone || newMap.get(id)?.phone || 'N/A',
              lat: Number(data.lat),
              lng: Number(data.lng),
              vehicleType: data.vehicleType || newMap.get(id)?.vehicleType || 'Unknown',
              category: data.category || newMap.get(id)?.category || 'CAR',
              isOnline: data.isOnline !== undefined ? !!data.isOnline : (newMap.get(id)?.isOnline ?? true),
              isOnRide: data.isOnRide !== undefined ? !!data.isOnRide : (newMap.get(id)?.isOnRide ?? false),
              registrationNumber: data.registrationNumber || newMap.get(id)?.registrationNumber || 'N/A'
            });
            return newMap;
          });

          setSelectedPartner((prevSelected) => {
            if (prevSelected && prevSelected.id === data.partnerId) {
              return {
                ...prevSelected,
                lat: Number(data.lat),
                lng: Number(data.lng),
                isOnline: data.isOnline !== undefined ? !!data.isOnline : prevSelected.isOnline,
                isOnRide: data.isOnRide !== undefined ? !!data.isOnRide : prevSelected.isOnRide,
                registrationNumber: data.registrationNumber || prevSelected.registrationNumber || 'N/A'
              };
            }
            return prevSelected;
          });
        }
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket Connection Error:', err);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [refreshTrigger]);

  // When selectedRide changes, pan the map to the ride pickup location
  useEffect(() => {
    if (selectedRide && mapRef.current) {
      mapRef.current.panTo({ lat: selectedRide.pickupLat, lng: selectedRide.pickupLng });
      mapRef.current.setZoom(14);
    }
  }, [selectedRide]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback() {
    mapRef.current = null;
  }, []);

  const handlePartnerClick = (partner: PartnerLocation) => {
    if (assignMode && selectedRide && onPartnerSelect) {
      // In assign mode, clicking a partner triggers assignment
      if (!partner.isOnline) {
        toast.error('This driver is offline');
        return;
      }
      if (partner.isOnRide) {
        toast.error('This driver is currently on a ride');
        return;
      }
      onPartnerSelect(partner, selectedRide);
    } else {
      setSelectedPartner(partner);
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 text-red-600 rounded-2xl h-full border border-red-100">
        <h3 className="text-lg font-bold mb-2">Error Loading Map</h3>
        <p className="text-sm">Please check your Google Maps API Key configuration.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-2xl animate-pulse min-h-[500px]">
        <Loader2 className="animate-spin text-gray-400 mb-4" size={32} />
        <p className="text-sm font-medium text-gray-500">Initializing Map Engine...</p>
      </div>
    );
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
            { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] }
          ]
        }}
      >
        {/* ====== DRIVER MARKERS ====== */}
        {Array.from(partners.values()).map((partner) => {
          const emoji = partner.category === 'BIKE' ? '🏍️' : partner.category === 'AUTO' ? '🛺' : '🚗';
          const isRed = partner.isOnline && partner.isOnRide;
          const isGreen = partner.isOnline && !partner.isOnRide;
          const strokeColor = isRed ? '#E32222' : isGreen ? '#10B981' : '#6B7280';
          const fillColor = isRed || isGreen ? 'white' : '#DFDFDF';

          // In assign mode, highlight available drivers near the selected ride
          let isNearby = false;
          let distFromPickup = 0;
          if (assignMode && selectedRide && isGreen) {
            distFromPickup = haversineKm(selectedRide.pickupLat, selectedRide.pickupLng, partner.lat, partner.lng);
            isNearby = distFromPickup <= 5;
          }

          const glowSvg = assignMode && isNearby ? `
            <circle cx="20" cy="20" r="14" fill="#10B981">
              <animate attributeName="r" from="14" to="20" dur="1.2s" begin="0s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="1.2s" begin="0s" repeatCount="indefinite" />
            </circle>
          ` : '';

          const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              ${isRed ? `
              <circle cx="20" cy="20" r="14" fill="#E32222">
                <animate attributeName="r" from="14" to="20" dur="1.5s" begin="0s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" begin="0s" repeatCount="indefinite" />
              </circle>
              ` : ''}
              ${glowSvg}
              <circle cx="20" cy="20" r="18" fill="${fillColor}" stroke="${assignMode && isNearby ? '#10B981' : strokeColor}" stroke-width="${assignMode && isNearby ? '3' : '2'}" />
              <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="20" style="filter: ${partner.isOnline ? 'none' : 'grayscale(1) opacity(0.7)'}">${emoji}</text>
            </svg>
          `;

          return (
            <Marker
              key={partner.id}
              position={{ lat: partner.lat, lng: partner.lng }}
              onClick={() => handlePartnerClick(partner)}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
                scaledSize: new google.maps.Size(assignMode && isNearby ? 48 : 40, assignMode && isNearby ? 48 : 40),
                anchor: new google.maps.Point(assignMode && isNearby ? 24 : 20, assignMode && isNearby ? 24 : 20),
              }}
              zIndex={assignMode && isNearby ? 100 : 10}
            />
          );
        })}

        {/* ====== RIDE PICKUP MARKERS ====== */}
        {rides.map((ride) => {
          const isSelected = selectedRide?.id === ride.id;
          
          // Determine urgency color
          let primaryColor = '#F59E0B'; // AMBER default
          let secondaryColor = '#D97706';
          
          if (ride.urgencyLevel === 'RED') {
            primaryColor = '#EF4444';
            secondaryColor = '#DC2626';
          } else if (ride.urgencyLevel === 'GREEN') {
            primaryColor = '#10B981';
            secondaryColor = '#059669';
          }
          
          const pinSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
              ${isSelected || ride.urgencyLevel === 'RED' ? `
              <circle cx="18" cy="18" r="14" fill="${primaryColor}">
                <animate attributeName="r" from="14" to="18" dur="1s" begin="0s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.4" to="0" dur="1s" begin="0s" repeatCount="indefinite" />
              </circle>` : ''}
              <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${secondaryColor}" />
              <circle cx="18" cy="18" r="8" fill="white" />
              <text x="18" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="${secondaryColor}">📍</text>
            </svg>
          `;

          return (
            <Marker
              key={`ride-${ride.id}`}
              position={{ lat: ride.pickupLat, lng: ride.pickupLng }}
              onClick={() => onRideSelect?.(ride)}
              onMouseOver={() => setHoveredRide(ride)}
              onMouseOut={() => setHoveredRide(null)}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
                scaledSize: new google.maps.Size(isSelected ? 44 : 36, isSelected ? 56 : 48),
                anchor: new google.maps.Point(isSelected ? 22 : 18, isSelected ? 56 : 48),
              }}
              zIndex={isSelected ? 200 : ride.urgencyLevel === 'RED' ? 150 : 50}
            />
          );
        })}

        {/* ====== RIDE TOOLTIP ====== */}
        {hoveredRide && !selectedRide && (
          <InfoWindow
            position={{ lat: hoveredRide.pickupLat, lng: hoveredRide.pickupLng }}
            onCloseClick={() => setHoveredRide(null)}
            options={{ pixelOffset: new google.maps.Size(0, -40) }}
          >
            <div className="bg-white p-2 min-w-[200px] rounded-lg shadow-xl shadow-gray-200">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <MapPin size={14} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-800">Ride {hoveredRide.customId}</span>
              </div>
              <div className="space-y-1.5 mb-2">
                <p className="text-[10px] text-gray-500 leading-tight">
                  <span className="font-semibold text-gray-700">Pickup:</span> {hoveredRide.effectivePickupTime ? new Date(hoveredRide.effectivePickupTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                </p>
                <p className="text-[10px] text-gray-500 leading-tight">
                  <span className="font-semibold text-gray-700">Expires:</span> {hoveredRide.expiresAt ? new Date(hoveredRide.expiresAt).toLocaleTimeString([], { timeStyle: 'short' }) : 'N/A'}
                </p>
              </div>
              <div className={`mt-2 px-2 py-1.5 rounded text-center text-[10px] font-black uppercase tracking-wider ${
                hoveredRide.urgencyLevel === 'RED' ? 'bg-red-50 text-red-600 border border-red-100' :
                hoveredRide.urgencyLevel === 'GREEN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                {hoveredRide.timeRemainingMinutes !== undefined 
                  ? `Expires in ${hoveredRide.timeRemainingMinutes} min` 
                  : 'Time computing...'}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* ====== RADIUS CIRCLE AROUND SELECTED RIDE ====== */}
        {selectedRide && (
          <Circle
            center={{ lat: selectedRide.pickupLat, lng: selectedRide.pickupLng }}
            radius={5000}
            options={{
              fillColor: '#3B82F6',
              fillOpacity: 0.06,
              strokeColor: '#3B82F6',
              strokeOpacity: 0.3,
              strokeWeight: 2,
            }}
          />
        )}

        {/* ====== PARTNER INFO WINDOW (non-assign mode) ====== */}
        {selectedPartner && !assignMode && (
          <InfoWindow
            position={{ lat: selectedPartner.lat, lng: selectedPartner.lng }}
            onCloseClick={() => setSelectedPartner(null)}
            options={{ pixelOffset: new google.maps.Size(0, -10) }}
          >
            <div className="p-1 min-w-[200px]">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#E32222]/10 flex items-center justify-center shrink-0">
                  <Navigation size={14} className="text-[#E32222]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{selectedPartner.name}</h3>
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                      !selectedPartner.isOnline
                        ? 'bg-gray-100 text-gray-500 border border-gray-200'
                        : selectedPartner.isOnRide
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {!selectedPartner.isOnline ? 'Offline' : selectedPartner.isOnRide ? 'On Ride' : 'Available'}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#E32222] mt-0.5">
                    {selectedPartner.customId} • {selectedPartner.registrationNumber}
                  </p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  <span className="text-xs font-medium">{selectedPartner.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Car size={14} className="text-gray-400 shrink-0" />
                  <span className="text-xs font-medium">{selectedPartner.vehicleType}</span>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* ====== DRIVER INFO (assign mode) ====== */}
        {selectedPartner && assignMode && (
          <InfoWindow
            position={{ lat: selectedPartner.lat, lng: selectedPartner.lng }}
            onCloseClick={() => setSelectedPartner(null)}
            options={{ pixelOffset: new google.maps.Size(0, -10) }}
          >
            <div className="p-1 min-w-[220px]">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <UserPlus size={14} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedPartner.name}</h3>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mt-0.5">
                    {selectedPartner.customId} • {selectedPartner.registrationNumber}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2"><Phone size={12} /> {selectedPartner.phone}</div>
                <div className="flex items-center gap-2"><Car size={12} /> {selectedPartner.vehicleType}</div>
                {selectedRide && (
                  <div className="flex items-center gap-2 text-blue-600 font-bold">
                    <MapPin size={12} />
                    {haversineKm(selectedRide.pickupLat, selectedRide.pickupLng, selectedPartner.lat, selectedPartner.lng).toFixed(1)} km from pickup
                  </div>
                )}
              </div>
              {selectedRide && (
                <button
                  onClick={() => onPartnerSelect?.(selectedPartner, selectedRide)}
                  className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus size={12} />
                  Assign to This Ride
                </button>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </>
  );
}
