'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
    data: any[];
    filename?: string;
    label?: string;
    className?: string;
}

export function ExportButton({
    data,
    filename = 'export',
    label = 'Export CSV',
    className = ''
}: ExportButtonProps) {

    const handleExport = () => {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        // Extract headers from the first object
        const headers = Object.keys(data[0]);

        // Create CSV content
        const csvContent = [
            headers.join(','), // Header row
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    // Handle types: wrap strings in quotes if they contain commas, handle nulls
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
                    return value;
                }).join(',')
            )
        ].join('\n');

        // Create a Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${className}`}
        >
            <Download className="w-4 h-4" />
            {label}
        </button>
    );
}
