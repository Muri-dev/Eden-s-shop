import React from "react";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-12 bg-[#E5DDCF] rounded" />
        <span className="text-[#E5DDCF]">/</span>
        <div className="h-3 w-12 bg-[#E5DDCF] rounded" />
        <span className="text-[#E5DDCF]">/</span>
        <div className="h-3 w-24 bg-[#E5DDCF] rounded" />
      </div>

      {/* Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-[#F0ECE1] rounded-2xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 h-20 bg-[#F0ECE1] rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="h-3 w-24 bg-[#E5DDCF] rounded" />
          <div className="h-8 w-72 bg-[#E5DDCF] rounded" />
          <div className="h-6 w-32 bg-[#E5DDCF] rounded" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-[#E5DDCF] rounded" />
            <div className="h-3 w-4/5 bg-[#E5DDCF] rounded" />
            <div className="h-3 w-3/5 bg-[#E5DDCF] rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-[#E5DDCF] rounded-lg" />
            <div className="h-10 w-10 bg-[#E5DDCF] rounded-lg" />
            <div className="h-10 w-10 bg-[#E5DDCF] rounded-lg" />
          </div>
          <div className="h-12 w-full bg-[#E5DDCF] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
