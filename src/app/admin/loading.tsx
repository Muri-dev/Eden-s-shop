import React from "react";

export default function AdminLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDCF] pb-5">
        <div>
          <div className="h-7 w-48 bg-[#E5DDCF] rounded mb-2" />
          <div className="h-4 w-64 bg-[#F2ECE1] rounded" />
        </div>
        <div className="h-9 w-32 bg-[#E5DDCF] rounded" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-[#E5DDCF] bg-white space-y-3">
            <div className="h-4 w-24 bg-[#E5DDCF] rounded" />
            <div className="h-8 w-32 bg-[#E5DDCF] rounded" />
            <div className="h-3 w-20 bg-[#F2ECE1] rounded" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-[#E5DDCF] bg-white h-72" />
        <div className="p-6 rounded-xl border border-[#E5DDCF] bg-white h-72" />
      </div>
    </div>
  );
}
