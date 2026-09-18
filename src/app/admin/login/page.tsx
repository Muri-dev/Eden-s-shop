"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/stores/toast.store";
import { ShieldCheck, Eye, EyeOff, Lock, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Please enter your administrator credentials.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Welcome to Executive Suite, ${data.admin.name}.`);
        router.push("/admin");
        router.refresh();
      } else {
        toast.error(data.message || "Authentication failed.");
      }
    } catch {
      toast.error("Network communication error.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@edenshop.com");
    setPassword("AdminEden2026!");
  };

  return (
    <div className="min-h-screen bg-[#1A120E] flex items-center justify-center px-4 py-12 selection:bg-[#A6875C] selection:text-white">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#241813] border border-[#DFC8A8]/30 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7 text-[#DFC8A8]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal tracking-wide">
            EDEN&apos;S ATELIER
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#A6875C] mt-1 font-medium">
            Executive Portal & Store Management
          </p>
        </div>

        {/* Login Box */}
        <form
          onSubmit={handleLogin}
          className="bg-[#241813] border border-[#3A2920] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5"
        >
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#DFC8A8]">
              Executive Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@edenshop.com"
              required
              className="w-full px-4 py-3 bg-[#1A120E] border border-[#4A382D] rounded-xl text-sm text-[#FAF7F2] placeholder-[#736357] focus:outline-hidden focus:border-[#DFC8A8] transition-colors"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#DFC8A8]">
              Security Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 bg-[#1A120E] border border-[#4A382D] rounded-xl text-sm text-[#FAF7F2] placeholder-[#736357] focus:outline-hidden focus:border-[#DFC8A8] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-[#96867B] hover:text-[#DFC8A8] cursor-pointer"
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#A6875C] to-[#8C6D43] hover:from-[#B8986B] hover:to-[#9D7D50] text-[#1A120E] font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Authenticating Key..." : "Authorize Access"}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-[#DFC8A8] hover:text-white transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Executive Admin Demo Credentials</span>
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#736357] hover:text-[#DFC8A8] transition-colors uppercase tracking-wider"
          >
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
