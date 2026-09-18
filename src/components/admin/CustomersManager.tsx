"use client";

import React, { useState } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "@/stores/toast.store";
import { Search, UserCheck, ShieldAlert } from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
}

interface CustomersManagerProps {
  initialCustomers: CustomerRecord[];
}

export function CustomersManager({ initialCustomers }: CustomersManagerProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const toggleStatus = async (customerId: string, current: string) => {
    const nextStatus = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Patron account is now ${nextStatus}.`);
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerId ? { ...c, status: nextStatus } : c))
        );
      } else {
        toast.error("Failed to update patron status.");
      }
    } catch {
      toast.error("Network communication error.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white border border-[#E5DDCF] rounded-2xl p-4 flex gap-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#96867B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patron by name, email, or telephone..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5DDCF] rounded-xl focus:outline-hidden focus:border-[#A6875C] bg-[#FAF7F2]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E5DDCF] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E5DDCF] text-[#96867B] uppercase tracking-wider">
                <th className="py-3 px-4">Patron</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Enrolled</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Cumulative Spend</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFE6]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#241813]">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#63534B]">
                    <span>{c.email}</span>
                    {c.phone && <span className="block text-[11px] text-[#96867B]">{c.phone}</span>}
                  </td>
                  <td className="py-3.5 px-4 text-[#96867B]">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#241813]">
                    {c.totalOrders}
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#241813]">
                    {formatPrice(c.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        c.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleStatus(c.id, c.status)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        c.status === "ACTIVE"
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {c.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
