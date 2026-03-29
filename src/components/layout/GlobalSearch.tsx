'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, Car, Users, Route } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { adminRideService } from '@/services/adminRideService';
import { vendorService } from '@/services/vendorService';
import { SearchSkeleton } from '@/components/ui/Skeletons';

interface SearchResult {
  type: 'partner' | 'vendor' | 'ride';
  id: string;
  label: string;
  meta: string;
  href: string;
  icon: any;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Arrow navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleNavigation = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (results.length || 1)) % (results.length || 1));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        r(results[selectedIndex].href);
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, results, selectedIndex]);

  const r = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSelectedIndex(0);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const rawQuery = searchQuery.trim().toLowerCase();
      
      const [partnerRes, rideRes, vendorRes] = await Promise.allSettled([
        partnerService.getAll(),
        adminRideService.getAllRides({}),
        vendorService.getAll()
      ]);

      const newResults: SearchResult[] = [];

      // Partners
      if (partnerRes.status === 'fulfilled' && partnerRes.value.success) {
        partnerRes.value.data?.forEach((p: any) => {
          if (p.name?.toLowerCase().includes(rawQuery) || p.phone?.includes(rawQuery) || p.customId?.toLowerCase().includes(rawQuery)) {
            newResults.push({ type: 'partner', id: p.id, label: p.name, meta: p.customId || p.phone, href: `/dashboard/partners/${p.id}/edit`, icon: Users });
          }
        });
      }

      // Rides
      if (rideRes.status === 'fulfilled' && rideRes.value.success) {
        rideRes.value.data?.forEach((r: any) => {
          if (r.customId?.toLowerCase().includes(rawQuery) || r.user?.phone?.includes(rawQuery) || r.partner?.phone?.includes(rawQuery)) {
            newResults.push({ type: 'ride', id: r.id, label: `Ride ${r.customId || r.id.slice(0,6)}`, meta: `${r.status} • ${r.user?.name || 'Unknown User'}`, href: `/dashboard/rides`, icon: Route });
          }
        });
      }

      // Vendors
      if (vendorRes.status === 'fulfilled' && vendorRes.value.success) {
        vendorRes.value.data?.forEach((v: any) => {
          if (v.companyName?.toLowerCase().includes(rawQuery) || v.name?.toLowerCase().includes(rawQuery) || v.phone?.includes(rawQuery)) {
            newResults.push({ type: 'vendor', id: v.id, label: v.companyName || v.name, meta: v.phone, href: `/dashboard/vendors/${v.id}/edit`, icon: Car });
          }
        });
      }

      if (!abortControllerRef.current.signal.aborted) {
        setResults(newResults.slice(0, 10)); // Top 10
      }
    } catch (error) {
       console.error("[GLOBAL SEARCH] Failed:", error);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(query);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [query, performSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-center items-start pt-[10vh] px-4 animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-100 bg-gray-50/50">
          <Search size={20} className="text-[#E32222] shrink-0" />
          <input
            autoFocus
            type="text"
            className="w-full py-4 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
            placeholder="Search partners, rides, vendors by ID, phone, or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading && query.length >= 2 ? (
            <SearchSkeleton />
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((res, i) => {
                const isSelected = i === selectedIndex;
                const Icon = res.icon;
                return (
                  <button
                    key={`${res.type}-${res.id}`}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${isSelected ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                    onClick={() => r(res.href)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isSelected ? 'bg-[#E32222] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{res.label}</span>
                      <span className="text-[10px] text-gray-400 font-mono mt-0.5">{res.meta}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {res.type}
                      </span>
                      {isSelected && <kbd className="hidden sm:block text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-white text-gray-400 shadow-sm">Enter</kbd>}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                 <Search size={20} className="text-gray-400" />
              </div>
              <p className="font-bold text-gray-700">No results found for "{query}"</p>
              <p className="text-xs mt-1 text-gray-400">Try searching by custom ID, phone number, or exact name.</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm font-medium">
              Type at least 2 characters to trigger system-wide search.
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-medium">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="flex bg-white px-1 shadow-sm border border-gray-200 rounded">↑</span>
              <span className="flex bg-white px-1 shadow-sm border border-gray-200 rounded">↓</span>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex bg-white px-1.5 shadow-sm border border-gray-200 rounded">Enter</span>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <span className="flex bg-white px-1.5 shadow-sm border border-gray-200 rounded">Esc</span>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
