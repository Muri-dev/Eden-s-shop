"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/stores/toast.store";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Welcome to Eden's, ${data.user.name}. Your patron account is ready.`);
        router.push("/account");
        router.refresh();
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch {
      toast.error("A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-serif text-3xl tracking-wider text-[#241813]">EDEN&apos;S</span>
            <span className="block text-[9px] tracking-[0.35em] text-[#96867B] uppercase -mt-1">
              Create Patron Account
            </span>
          </Link>
          <h1 className="font-serif text-2xl text-[#241813] font-medium">Join Eden&apos;s Registry</h1>
          <p className="text-xs text-[#96867B] mt-1">
            Register to save wishlists, track orders, and receive exclusive invitations.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="bg-white border border-[#E5DDCF] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5"
        >
          <Input
            label="Full Name"
            placeholder="e.g. Alexander Vance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="alexander@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number (Optional, for M-Pesa)"
            type="tel"
            placeholder="+254 712 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="relative">
            <Input
              label="Create Password (min 6 characters)"
              type={showPassword ? "text" : "password"}
              placeholder="Create a secure password"
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
            Create Account
          </Button>

          <div className="text-center text-xs text-[#96867B] pt-2">
            <p>
              Already a patron?{" "}
              <Link href="/login" className="text-[#A6875C] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
