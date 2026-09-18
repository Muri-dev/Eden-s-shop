"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Clock, Sparkles, Mail, Check } from "lucide-react";
import { toast } from "@/stores/toast.store";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for joining Eden's Private Gazette.");
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-[#170F0B] text-[#FAF8F5] pt-16 pb-24 lg:pb-12 border-t border-[#3D2B22]">
      {/* 1. Value Proposition Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-[#3D2B22]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#241813] border border-[#3D2B22] text-[#C5A880] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-1">
                Authenticity Guaranteed
              </h4>
              <p className="text-xs text-[#96867B] leading-relaxed">
                Individually numbered Eden certificates of provenance and 3-year warranty with every purchase.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#241813] border border-[#3D2B22] text-[#C5A880] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-1">
                White-Glove Delivery
              </h4>
              <p className="text-xs text-[#96867B] leading-relaxed">
                Same-day private courier within Nairobi and insured express dispatch across Kenya & East Africa.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#241813] border border-[#3D2B22] text-[#C5A880] shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-1">
                14-Day Privileged Returns
              </h4>
              <p className="text-xs text-[#96867B] leading-relaxed">
                Complimentary collection and discreet exchanges for unworn pieces in presentation condition.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#241813] border border-[#3D2B22] text-[#C5A880] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-1">
                Seamless M-Pesa & Paystack
              </h4>
              <p className="text-xs text-[#96867B] leading-relaxed">
                256-bit encrypted checkout with instant Safaricom M-Pesa STK push authorization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <span className="font-serif text-3xl tracking-wider text-[#FAF8F5] block mb-2 font-medium">
              EDEN&apos;S
            </span>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C5A880] mb-4">
              The Sovereign Luxury Destination
            </p>
            <p className="text-xs text-[#96867B] leading-relaxed max-w-sm mb-6">
              Conceived for those who prize restraint, uncompromising craft, and timeless pedigree over transient trends. Handcrafted fine horology, bespoke Tuscan leather, and haute perfumery.
            </p>
            <div className="text-xs text-[#96867B] space-y-1">
              <p>Atelier: Eden Pavilion, Westlands, Nairobi</p>
              <p>Direct Concierge: +254 700 888 999</p>
              <p>Private Enquiries: concierge@edenshop.com</p>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C5A880] mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-[#ECE5D8]">
              <li>
                <Link href="/shop?category=horology-and-watches" className="hover:text-[#C5A880] transition-colors">
                  Swiss Horology & Watches
                </Link>
              </li>
              <li>
                <Link href="/shop?category=fine-leather-goods" className="hover:text-[#C5A880] transition-colors">
                  Fine Tuscan Leather Goods
                </Link>
              </li>
              <li>
                <Link href="/shop?category=haute-fragrance" className="hover:text-[#C5A880] transition-colors">
                  Haute Extraits de Parfum
                </Link>
              </li>
              <li>
                <Link href="/shop?category=fine-jewelry" className="hover:text-[#C5A880] transition-colors">
                  18K Gold & Fine Jewelry
                </Link>
              </li>
              <li>
                <Link href="/shop?category=cashmere-and-silk-apparel" className="hover:text-[#C5A880] transition-colors">
                  Cashmere & Silk Apparel
                </Link>
              </li>
              <li>
                <Link href="/flash-sales" className="hover:text-[#C5A880] transition-colors font-medium">
                  Active Flash Sales
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C5A880] mb-4">
              Client Concierge
            </h5>
            <ul className="space-y-2.5 text-xs text-[#ECE5D8]">
              <li>
                <Link href="/account/orders" className="hover:text-[#C5A880] transition-colors">
                  Track Your Consignment
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#C5A880] transition-colors">
                  Your Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="hover:text-[#C5A880] transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#C5A880] transition-colors">
                  Patron Account
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-[#96867B] hover:text-[#C5A880] transition-colors">
                  Staff & Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Private Newsletter */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C5A880] mb-4">
              The Eden Gazette
            </h5>
            <p className="text-xs text-[#96867B] leading-relaxed mb-4">
              Subscribe to receive private invitations to limited horological releases and seasonal private sales.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/50">
                <Check className="w-4 h-4" />
                <span>You have been added to the private register.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-10 px-3 bg-[#241813] border border-[#3D2B22] rounded-lg text-xs text-[#FAF8F5] placeholder-[#96867B] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 bg-[#C5A880] hover:bg-[#DFC8A8] text-[#170F0B] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Join Gazette
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Payment Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#3D2B22] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-[#96867B]">
          © {new Date().getFullYear()} Eden&apos;s Shop. All rights reserved. Crafted for excellence.
        </p>

        {/* Payment Icons / Trust Indicators */}
        <div className="flex items-center gap-4 text-[11px] text-[#96867B]">
          <span className="px-2 py-1 bg-[#241813] border border-[#3D2B22] rounded text-[#FAF8F5] font-semibold">
            M-PESA
          </span>
          <span className="px-2 py-1 bg-[#241813] border border-[#3D2B22] rounded text-[#FAF8F5] font-semibold">
            PAYSTACK
          </span>
          <span className="px-2 py-1 bg-[#241813] border border-[#3D2B22] rounded text-[#FAF8F5] font-semibold">
            VISA
          </span>
          <span className="px-2 py-1 bg-[#241813] border border-[#3D2B22] rounded text-[#FAF8F5] font-semibold">
            MASTERCARD
          </span>
          <span className="text-[#C5A880]">256-Bit SSL Encrypted</span>
        </div>
      </div>
    </footer>
  );
}
