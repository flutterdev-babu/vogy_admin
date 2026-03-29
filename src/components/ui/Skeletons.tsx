'use client';

import React from 'react';

export const CardSkeleton = () => (
  <div className="card p-4 block border border-gray-100 bg-white rounded-2xl animate-pulse">
    <div className="flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
      <div>
        <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-8 pb-12 w-full">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded md:block hidden"></div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-32 h-10 bg-gray-200 rounded-2xl"></div>
        <div className="w-36 h-10 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>

    {/* Entity Cards Skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={`entity-skel-${i}`} />)}
    </div>

    {/* Analytics Section Skeleton */}
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded-xl"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={`stat-skel-${i}`} className="p-6 rounded-2xl border border-gray-100 bg-white h-36 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
            <div>
              <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom Section Skeleton */}
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 min-h-[300px]">
         <div className="h-6 w-40 bg-gray-200 rounded mb-8"></div>
         <div className="w-48 h-48 rounded-full bg-gray-200 mx-auto"></div>
      </div>
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 min-h-[500px]">
        <div className="p-6 border-b border-gray-100">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="w-full h-[400px] bg-gray-100"></div>
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    <td className="p-4"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
    <td className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200"></div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
      </div>
    </td>
    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
    <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
    <td className="p-4"><div className="h-8 w-8 bg-gray-200 rounded ml-auto"></div></td>
  </tr>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
          <tr>
            <th className="p-4 w-12"><div className="h-4 w-4 bg-gray-300 rounded"></div></th>
            <th className="p-4"><div className="h-4 w-24 bg-gray-300 rounded"></div></th>
            <th className="p-4"><div className="h-4 w-20 bg-gray-300 rounded"></div></th>
            <th className="p-4"><div className="h-4 w-16 bg-gray-300 rounded"></div></th>
            <th className="p-4 text-right"><div className="h-4 w-16 bg-gray-300 rounded ml-auto"></div></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => <TableRowSkeleton key={i} />)}
        </tbody>
      </table>
    </div>
  </div>
);

export const SearchSkeleton = () => (
  <div className="p-2 space-y-2 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
    ))}
  </div>
);
