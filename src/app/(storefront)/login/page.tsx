"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/stores/toast.store";
import { Sparkles, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Welcome back, ${data.user.name}.`);
        router.push("/account");
        router.refresh();
      } else {
        toast.error(data.message || "Login failed.");
      }
    } catch {
      toast.error("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand Mark */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-serif text-3xl tracking-wider text-[#241813]">EDEN&apos;S</span>
            <span className="block text-[9px] tracking-[0.35em] text-[#96867B] uppercase -mt-1">
              Patron Portal
            </span>
          </Link>
          <h1 className="font-serif text-2xl text-[#241813] font-medium">Welcome Back</h1>
          <p className="text-xs text-[#96867B] mt-1">
            Sign in to track orders, manage wishlist, and access exclusive privileges.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white border border-[#E5DDCF] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
        >
          <Input
            label="Email Address"
            type="email"
            placeholder="alexander@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Your secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-[#96867B] hover:text-[#241813] cursor-pointer"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full uppercase tracking-wider text-xs font-bold"
          >
            Sign In
          </Button>

          <div className="text-center text-xs text-[#96867B] space-y-2 pt-2">
            <p>
              New to Eden&apos;s?{" "}
              <Link href="/register" className="text-[#A6875C] font-semibold hover:underline">
                Create a Patron Account
              </Link>
            </p>
          </div>
        </form>

        {/* Demo Credentials Notice */}
        <div className="mt-6 p-4 bg-[#FAF2E6] border border-[#DFC8A8] rounded-xl text-xs text-[#63534B] text-center">
          <div className="flex items-center justify-center gap-2 mb-1 text-[#A6875C] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Account Available</span>
          </div>
          <p>Email: <strong>customer@edenshop.com</strong> | Password: <strong>CustomerEden2026!</strong></p>
        </div>
      </div>
    </div>
  );
}
