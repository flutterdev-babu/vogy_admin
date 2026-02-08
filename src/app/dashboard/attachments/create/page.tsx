'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Info } from 'lucide-react';
import Link from 'next/link';

export default function CreateAttachmentPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link 
        href="/dashboard/attachments"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="font-medium">Back to Attachments</span>
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Attachment</h1>
          <p className="text-gray-500 text-sm">Link a Partner to a Vehicle and Vendor.</p>
        </div>
      </div>

      <div className="card p-6 space-y-8">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
          <Info className="flex-shrink-0" size={18} />
          <p>
            Attachments ensure operational integrity. A partner must be linked to a vehicle and a vendor to perform rides.
          </p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Select Partner</label>
              <select className="input-field">
                <option value="">Choose a Partner</option>
                {/* Select will be populated with Partners from API */}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Select Vehicle</label>
              <select className="input-field">
                <option value="">Choose a Vehicle</option>
                {/* Select will be populated with Vehicles from API */}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Select Vendor</label>
              <select className="input-field">
                <option value="">Choose a Vendor</option>
                {/* Select will be populated with Vendors from API */}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? 'Creating...' : (
                <>
                  <Save size={18} />
                  <span>Create Attachment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
