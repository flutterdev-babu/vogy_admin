'use client';

import React, { useState } from 'react';
import { Link, Upload, X, Check, Image as ImageIcon } from 'lucide-react';

interface DocImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const DocImageInput: React.FC<DocImageInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "Enter Image URL",
  required = false,
  className = ""
}) => {
  const [mode, setMode] = useState<'URL' | 'UPLOAD'>(value && !value.startsWith('blob:') ? 'URL' : 'URL');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to S3/Cloudinary.
      // For now, we use a local preview URL or placeholder
      const previewUrl = URL.createObjectURL(file);
      onChange(previewUrl);
    }
  };

  const isUrl = value && (value.startsWith('http') || value.startsWith('/'));

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
          {label} {required && <span className="text-[#E32222]">*</span>}
        </label>
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setMode('URL')}
            className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase transition-all ${mode === 'URL' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode('UPLOAD')}
            className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase transition-all ${mode === 'UPLOAD' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Upload
          </button>
        </div>
      </div>

      <div className="relative group">
        {mode === 'URL' ? (
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#E32222] focus-within:ring-2 focus-within:ring-[#E32222]/10 transition-all bg-white shadow-sm hover:border-gray-300 h-10">
            <div className="px-3 bg-gray-50 border-r border-gray-100 flex items-center justify-center h-full">
              <Link size={14} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={value.startsWith('blob:') ? '' : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent font-medium"
            />
            {value && !value.startsWith('blob:') && (
              <button 
                type="button" 
                onClick={() => onChange('')}
                className="p-1 px-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="relative border-2 border-dashed border-gray-200 rounded-xl transition-all hover:border-[#E32222]/30 hover:bg-red-50/10 group h-10 flex items-center px-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center gap-2 text-gray-400 font-medium">
              <Upload size={14} className="group-hover:text-red-500 transition-colors" />
              <span className="text-xs truncate max-w-[150px]">
                {value.startsWith('blob:') ? 'Image Selected' : 'Select Image File'}
              </span>
            </div>
            {value.startsWith('blob:') && (
              <div className="ml-auto flex items-center gap-2">
                <Check size={14} className="text-green-500" />
                <button 
                  type="button" 
                  onClick={() => onChange('')}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors relative z-20"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Simple inline preview badge */}
        {value && (
          <div className="absolute -right-1 -top-1">
             <div className="w-4 h-4 rounded-full bg-green-500 border border-white shadow-sm flex items-center justify-center animate-bounce">
                <Check size={8} className="text-white" />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
