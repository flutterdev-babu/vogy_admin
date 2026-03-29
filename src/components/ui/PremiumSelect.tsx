'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface PremiumSelectOption {
  id: string;
  label: string;
  subLabel?: string;
}

interface PremiumSelectProps {
  label: string;
  options: PremiumSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const PremiumSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  required = false,
  error,
  icon,
  className = ""
}: PremiumSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.subLabel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={dropdownRef}>
      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-1.5 block">
        {label} {required && <span className="text-[#E32222]">*</span>}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-left flex items-center justify-between transition-all hover:bg-white/[0.05] focus:outline-none focus:border-[#E32222] focus:ring-2 focus:ring-[#E32222]/20 ${isOpen ? 'border-[#E32222] ring-2 ring-[#E32222]/20' : ''}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {icon && <div className="text-neutral-500 flex-shrink-0">{icon}</div>}
          <span className={`truncate text-sm font-medium ${selectedOption ? 'text-white' : 'text-neutral-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={16} className={`text-neutral-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-[#141414] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top border-t-[#E32222]/30">
          {options.length > 6 && (
            <div className="p-3 border-b border-white/5 bg-white/[0.02]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#E32222]/40 transition-all font-medium"
                  autoFocus
                />
              </div>
            </div>
          )}
          
          <div className="max-h-64 overflow-y-auto py-2 scrollbar-hide">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-all group relative ${opt.id === value ? 'bg-[#E32222]/10' : ''}`}
                >
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className={`truncate text-sm font-semibold tracking-tight ${opt.id === value ? 'text-[#E32222]' : 'text-neutral-300 group-hover:text-white'}`}>
                      {opt.label}
                    </span>
                    {opt.subLabel && (
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-black mt-0.5">
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                  {opt.id === value ? (
                    <Check size={16} className="text-[#E32222] flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-white/10 group-hover:border-[#E32222]/30 transition-colors" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Search size={20} className="text-neutral-600" />
                </div>
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em]">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-[#E32222] mt-1.5 font-bold italic ml-1 animate-pulse">{error}</p>}
    </div>
  );
};
