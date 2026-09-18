import React from "react";

export default function CheckoutLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-8 w-56 bg-[#E5DDCF] rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl border border-[#E5DDCF] bg-white h-48" />
          <div className="p-6 rounded-xl border border-[#E5DDCF] bg-white h-48" />
          <div className="p-6 rounded-xl border border-[#E5DDCF] bg-white h-48" />
        </div>
        <div className="lg:col-span-5">
          <div className="p-6 rounded-xl border border-[#E5DDCF] bg-white h-96 sticky top-24" />
        </div>
      </div>
    </div>
  );
}
