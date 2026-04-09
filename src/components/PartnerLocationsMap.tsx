'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { io, Socket } from 'socket.io-client';
import { Loader2, Navigation, Phone, User, Car } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { TOKEN_KEYS } from '@/lib/api';
import toast from 'react-hot-toast';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center (center of India)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

interface PartnerLocation {
  id: string;
  partnerId?: string;
  customId: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  vehicleType: string;
  category: 'CAR' | 'BIKE' | 'AUTO';
  isOnline: boolean;
}

interface PartnerLocationsMapProps {
  refreshTrigger?: number;
}

export default function PartnerLocationsMap({ refreshTrigger = 0 }: PartnerLocationsMapProps) {
  const [partners, setPartners] = useState<Map<string, PartnerLocation>>(new Map());
  const [selectedPartner, setSelectedPartner] = useState<PartnerLocation | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
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
              isOnline: !!p.isOnline
            });
            avgLat += Number(p.lat);
            avgLng += Number(p.lng);
            count++;
          }
        });

        setPartners(newPartnersMap);

        if (count > 0) {
          setMapCenter({
            lat: avgLat / count,
            lng: avgLng / count
          });
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
              isOnline: data.isOnline !== undefined ? !!data.isOnline : (newMap.get(id)?.isOnline ?? true)
            });
            return newMap;
          });

          setSelectedPartner((prevSelected) => {
            if (prevSelected && prevSelected.id === data.partnerId) {
              return {
                ...prevSelected,
                lat: Number(data.lat),
                lng: Number(data.lng),
                isOnline: data.isOnline !== undefined ? !!data.isOnline : prevSelected.isOnline
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

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = null;
  }, []);

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
        zoom={partners.size > 0 ? 12 : 5}
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
        {Array.from(partners.values()).map((partner) => {
          const emoji = partner.category === 'BIKE' ? '🏍️' : partner.category === 'AUTO' ? '🛺' : '🚗';
          const strokeColor = partner.isOnline ? '#E32222' : '#6B7280';
          const fillColor = partner.isOnline ? 'white' : '#DFDFDF';
          const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" />
              <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="20" style="filter: ${partner.isOnline ? 'none' : 'grayscale(1) opacity(0.7)'}">${emoji}</text>
            </svg>
          `;
          
          return (
            <Marker
              key={partner.id}
              position={{ lat: partner.lat, lng: partner.lng }}
              onClick={() => setSelectedPartner(partner)}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
              }}
            />
          );
        })}

        {selectedPartner && (
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
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${selectedPartner.isOnline ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                      {selectedPartner.isOnline ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#E32222] mt-0.5">{selectedPartner.customId}</p>
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
      </GoogleMap>
    </>
  );
}
