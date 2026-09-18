import React from "react";

export default function AccountLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="h-8 w-48 bg-[#E5DDCF] rounded mb-2" />
      <div className="h-3 w-64 bg-[#E5DDCF] rounded mb-10" />

      {/* Profile Card Skeleton */}
      <div className="bg-white border border-[#E5DDCF] rounded-2xl p-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#F0ECE1]" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-[#E5DDCF] rounded" />
            <div className="h-3 w-56 bg-[#E5DDCF] rounded" />
          </div>
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#E5DDCF] rounded-2xl p-6 h-32" />
        ))}
      </div>
    </div>
  );
}
