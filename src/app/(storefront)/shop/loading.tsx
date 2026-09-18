import React from "react";

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center max-w-lg mx-auto mb-12">
        <div className="h-3 w-32 bg-[#E5DDCF] rounded mx-auto mb-3" />
        <div className="h-8 w-64 bg-[#E5DDCF] rounded mx-auto mb-2" />
        <div className="h-0.5 w-10 bg-[#DFC8A8] mx-auto mt-4" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-12 bg-white border border-[#E5DDCF] rounded-2xl mb-8" />

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#E5DDCF] rounded-2xl overflow-hidden"
          >
            <div className="aspect-[4/5] bg-[#F0ECE1]" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-20 bg-[#E5DDCF] rounded" />
              <div className="h-5 w-40 bg-[#E5DDCF] rounded" />
              <div className="h-4 w-24 bg-[#E5DDCF] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
