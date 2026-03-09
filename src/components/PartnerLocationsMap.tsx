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

// Default center (e.g., center of India or a default city like Bangalore)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

interface PartnerLocation {
  id: string; // Using id or partnerId
  partnerId?: string;
  customId: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  vehicleType: string;
}

export default function PartnerLocationsMap() {
  const [partners, setPartners] = useState<Map<string, PartnerLocation>>(new Map());
  const [selectedPartner, setSelectedPartner] = useState<PartnerLocation | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const socketRef = useRef<Socket | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
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
          // Normalize ID based on payload format
          const id = p.id || p.partnerId;
          if (id && p.lat && p.lng) {
            newPartnersMap.set(id, {
              id,
              customId: p.customId || 'N/A',
              name: p.name || 'Unknown',
              phone: p.phone || 'N/A',
              lat: Number(p.lat),
              lng: Number(p.lng),
              vehicleType: p.vehicleType || p.vehicle?.vehicleType?.displayName || 'Unknown'
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
        }
      }
    } catch (error) {
      console.error('Failed to fetch initial partner locations:', error);
      toast.error('Failed to load active partners on map.');
    }
  };

  useEffect(() => {
    // 1. Initial Load of Partners via REST
    fetchInitialLocations();

    // 2. Setup Socket.IO for Live Updates
    const token = localStorage.getItem(TOKEN_KEYS.admin);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

    if (token) {
      socketRef.current = io(backendUrl, {
        transports: ['websocket'],
        auth: {
          token
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Admin Socket Connected for Live Map Map:', socketRef.current?.id);
      });

      socketRef.current.on('partner:active_location', (data: any) => {
        console.log('Partner moved (socket event received):', data);
        if (data && data.partnerId && data.lat && data.lng) {
          setPartners((prevMap) => {
            const newMap = new Map(prevMap);
            const id = data.partnerId;
            newMap.set(id, {
              ...newMap.get(id), // Keep existing data if we had it, update with new
              id,
              customId: data.customId || newMap.get(id)?.customId || 'N/A',
              name: data.name || newMap.get(id)?.name || 'Unknown',
              phone: data.phone || newMap.get(id)?.phone || 'N/A',
              lat: Number(data.lat),
              lng: Number(data.lng),
              vehicleType: data.vehicleType || newMap.get(id)?.vehicleType || 'Unknown'
            });
            return newMap;
          });

          // Update info window if the currently selected partner moved
          setSelectedPartner((prevSelected) => {
            if (prevSelected && prevSelected.id === data.partnerId) {
              return {
                ...prevSelected,
                lat: Number(data.lat),
                lng: Number(data.lng)
              };
            }
            return prevSelected;
          });
        }
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket Connection Error:', err);
      });
    } else {
      console.warn("No admin token found for map socket connection.");
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
    <div className="w-full h-full min-h-[500px] relative rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      {/* Live Indicator overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">Live Partners: {partners.size}</span>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%', minHeight: '500px' }}
        center={mapCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {Array.from(partners.values()).map((partner) => (
          <Marker
            key={partner.id}
            position={{ lat: partner.lat, lng: partner.lng }}
            onClick={() => setSelectedPartner(partner)}
            icon={{
              path: google.maps?.SymbolPath?.CIRCLE || 0,
              scale: 8,
              fillColor: '#E32222',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          />
        ))}

        {selectedPartner && (
          <InfoWindow
            position={{ lat: selectedPartner.lat, lng: selectedPartner.lng }}
            onCloseClick={() => setSelectedPartner(null)}
            options={{
              pixelOffset: new google.maps.Size(0, -10),
            }}
          >
            <div className="p-1 min-w-[200px]">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#E32222]/10 flex items-center justify-center shrink-0">
                  <Navigation size={14} className="text-[#E32222]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedPartner.name}</h3>
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
    </div>
  );
}
