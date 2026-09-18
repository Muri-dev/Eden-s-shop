"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toast } from "@/stores/toast.store";

interface AdminOrderUpdaterProps {
  orderId: string;
  initialStatus: string;
  initialPaymentStatus: string;
  initialTrackingNumber?: string | null;
  initialInternalNotes?: string | null;
}

export function AdminOrderUpdater({
  orderId,
  initialStatus,
  initialPaymentStatus,
  initialTrackingNumber,
  initialInternalNotes,
}: AdminOrderUpdaterProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || "");
  const [internalNotes, setInternalNotes] = useState(initialInternalNotes || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus,
          trackingNumber,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Order status and tracking recorded.");
        router.refresh();
      } else {
        toast.error(data.error || "Update failed.");
      }
    } catch {
      toast.error("Network communication error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
          Fulfillment Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
        >
          <option value="PENDING">Pending</option>
          <option value="PAYMENT_PENDING">Payment Pending</option>
          <option value="PAID">Paid (Ready for Atelier)</option>
          <option value="PROCESSING">Processing in Atelier</option>
          <option value="SHIPPED">Dispatched with Courier</option>
          <option value="DELIVERED">Delivered to Patron</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
          Payment Settlement Status
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
        >
          <option value="PENDING">PENDING</option>
          <option value="SUCCESSFUL">SUCCESSFUL (Verified)</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
          Courier Tracking Number
        </label>
        <input
          type="text"
          placeholder="e.g. DHL-KE-9988231 or G4S-8821"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#63534B]">
          Atelier / Internal Notes
        </label>
        <textarea
          rows={3}
          placeholder="Private remarks regarding packaging, custom sizing, courier instructions..."
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="sm"
        isLoading={isLoading}
        className="w-full uppercase tracking-wider font-bold text-xs"
      >
        Update Consignment
      </Button>
    </form>
  );
}
