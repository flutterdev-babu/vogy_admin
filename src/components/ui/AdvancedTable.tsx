'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface AdvancedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  itemsPerPage?: number;
  isLoading?: boolean;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    options: { label: string; value: string }[];
    onFilterChange: (value: string) => void;
  }[];
  onExport?: () => void;
}

export function AdvancedTable<T extends { id?: string | number }>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  itemsPerPage = 10,
  isLoading = false,
  searchPlaceholder = "Search...",
  filters = [],
  onExport,
}: AdvancedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = Array.isArray(data) ? data.filter((item) => {
    if (!searchable || !searchTerm) return true;

    // If no specific keys provided, search all string/number values
    if (searchKeys.length === 0) {
      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return searchKeys.some((key) =>
      String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  // Simple Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      {(searchable || filters.length > 0 || onExport) && (
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          {searchable && (
            <div className="flex-1 min-w-[280px] relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-gray-900 transition-colors" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((filter, index) => (
              <div key={index} className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <select
                  className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl text-xs font-black text-gray-600 appearance-none focus:ring-2 focus:ring-gray-200 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                  onChange={(e) => {
                    filter.onFilterChange(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {onExport && (
              <button
                onClick={onExport}
                className="px-5 py-3 flex items-center gap-2 bg-gray-900 text-white rounded-2xl text-xs font-bold hover:bg-black shadow-lg shadow-gray-200 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <Download size={14} /> Export Data
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className={`px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-9 h-9 border-[3px] border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Synchronizing Data...</span>
                    </div>
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((item, rowIndex) => (
                  <tr key={item.id || rowIndex} className="group transition-all duration-200 hover:bg-gray-50/50">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-6 py-5 text-[13px] font-medium text-gray-600">
                        {typeof col.accessor === 'function'
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-24 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Search size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No records matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Premium Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing <span className="text-gray-900 font-black">{startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of {filteredData.length} records
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[32px] h-8 rounded-xl text-xs font-bold transition-all ${currentPage === page
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-110'
                        : 'text-gray-400 hover:text-gray-900 hover:bg-white'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}
