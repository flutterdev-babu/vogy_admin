'use client';

import { useState } from 'react';
import { Paperclip, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AttachmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Entity Attachments</h1>
          <p className="text-gray-500 text-sm">Manage links between Partners, Vehicles, and Vendors.</p>
        </div>
        <Link 
          href="/dashboard/attachments/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-medium whitespace-nowrap"
        >
          <Plus size={18} />
          <span>New Attachment</span>
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search attachments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <Paperclip size={48} className="mb-4 text-gray-200" />
          <p className="text-lg font-medium text-gray-600">No attachments found</p>
          <p className="text-sm max-w-xs mx-auto mt-1">
            Start by linking a Partner to a Vehicle and a Vendor to enable operations.
          </p>
        </div>
      </div>
    </div>
  );
}
