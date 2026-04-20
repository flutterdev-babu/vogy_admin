'use client';

import React, { useRef, useState } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  label: string;
  placeholder?: string;
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  required?: boolean;
}

const libraries: ("places")[] = ["places"];

export default function AddressAutocomplete({ 
  label, 
  placeholder, 
  onAddressSelect, 
  required = false 
}: AddressAutocompleteProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries
  });

  const [inputValue, setInputValue] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      // Safety check: ensure we have useable data
      if (!place || !place.geometry || !place.geometry.location) {
        return;
      }
      
      const name = place.name;
      const formattedAddress = place.formatted_address;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      const displayAddress = name || formattedAddress || '';
      
      if (displayAddress && lat !== undefined && lng !== undefined) {
        setInputValue(displayAddress);
        onAddressSelect(formattedAddress || displayAddress, lat, lng);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Prevent the Enter key from submitting the parent form
      e.preventDefault();
    }
  };

  if (loadError) return <div className="text-red-500 text-xs mt-1">Error loading maps</div>;
  if (!isLoaded) return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Loading map suggestions...</span>
    </div>
  );

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin size={16} />
        </div>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: "in" }, // Restrict to India by default as per project context
            fields: ["address_components", "geometry", "formatted_address", "name"]
          }}
        >
          <input
            type="text"
            required={required}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            placeholder={placeholder}
            value={inputValue}
            onKeyDown={handleKeyDown}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </Autocomplete>
      </div>
    </div>
  );
}
