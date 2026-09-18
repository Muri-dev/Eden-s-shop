import React from "react";

export default function CartLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 w-48 bg-[#E5DDCF] rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border border-[#E5DDCF] bg-white">
              <div className="w-24 h-28 bg-[#E5DDCF] rounded-lg" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-5 w-48 bg-[#E5DDCF] rounded" />
                <div className="h-4 w-32 bg-[#F2ECE1] rounded" />
                <div className="h-5 w-20 bg-[#E5DDCF] rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-4">
          <div className="p-6 rounded-xl border border-[#E5DDCF] bg-white h-72" />
        </div>
      </div>
    </div>
  );
}
