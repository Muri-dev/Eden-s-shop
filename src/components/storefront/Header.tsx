"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect scroll for sticky header elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Offers", href: "/offers" },
    { label: "Flash Sales", href: "/flash-sales" },
  ];

  const categories = [
    { name: "Fine Leather Goods", href: "/shop?category=fine-leather-goods" },
    { name: "Horology & Watches", href: "/shop?category=horology-and-watches" },
    { name: "Haute Fragrance", href: "/shop?category=haute-fragrance" },
    { name: "Fine Jewelry", href: "/shop?category=fine-jewelry" },
    { name: "Cashmere & Silk Apparel", href: "/shop?category=cashmere-and-silk-apparel" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Announcement Bar */}
      <div className="bg-[#241813] text-[#FAF8F5] text-xs py-2 px-4 text-center tracking-widest uppercase font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
        <span>
          Complimentary White-Glove Delivery on orders over KSh 75,000 | M-Pesa Supported
        </span>
        <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
      </div>

      {/* 2. Main Navigation Bar */}
      <div
        className={`w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5DDCF] transition-all ${
          isScrolled ? "py-3 shadow-sm" : "py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-[#241813] hover:text-[#A6875C] transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl tracking-wider text-[#241813] group-hover:text-[#A6875C] transition-colors font-medium">
                EDEN&apos;S
              </span>
              <span className="block text-[9px] tracking-[0.35em] text-[#96867B] uppercase -mt-1 font-sans">
                Haute Horlogerie & Maison
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors duration-200 uppercase font-medium text-[13px] ${
                    isActive
                      ? "text-[#A6875C] border-b border-[#A6875C] pb-0.5"
                      : "text-[#241813] hover:text-[#A6875C]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm tracking-wide uppercase font-medium text-[13px] text-[#241813] hover:text-[#A6875C] cursor-pointer">
                <span>Collections</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 w-60 bg-white border border-[#E5DDCF] rounded-xl shadow-xl py-2 mt-1 z-50 animate-in fade-in slide-in-from-top-1">
                  {categories.map((c) => (
                    <Link
                      key={c.name}
                      href={c.href}
                      className="block px-4 py-2.5 text-xs text-[#241813] hover:bg-[#FAF8F5] hover:text-[#A6875C] transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-[#241813] hover:text-[#A6875C] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/account/wishlist"
              className="relative p-1.5 text-[#241813] hover:text-[#A6875C] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {isMounted && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C5A880] text-[#170F0B] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Customer Account */}
            <Link
              href="/account"
              className="p-1.5 text-[#241813] hover:text-[#A6875C] transition-colors hidden sm:block"
              aria-label="Account"
            >
              <UserIcon className="w-5 h-5" />
            </Link>

            {/* Shopping Bag */}
            <Link
              href="/cart"
              className="relative p-2 bg-[#241813] text-[#FAF8F5] rounded-full hover:bg-[#3D2B22] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {isMounted && totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C5A880] text-[#170F0B] text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Search Overlay Drawer */}
      {searchOpen && (
        <div className="w-full bg-white border-b border-[#E5DDCF] py-4 px-4 shadow-md animate-in slide-in-from-top duration-200">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#96867B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search watches, leather goods, perfumes, jewelry..."
                autoFocus
                className="w-full h-12 pl-12 pr-12 bg-[#FAF8F5] border border-[#E5DDCF] rounded-full text-sm text-[#241813] placeholder-[#96867B] focus:outline-none focus:border-[#C5A880]"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 text-[#96867B] hover:text-[#241813]"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF8F5] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DDCF] mb-6">
                <span className="font-serif text-2xl tracking-wider text-[#241813]">
                  EDEN&apos;S
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#241813]"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <Link
                  href="/"
                  className="block text-base font-medium text-[#241813] hover:text-[#A6875C]"
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  className="block text-base font-medium text-[#241813] hover:text-[#A6875C]"
                >
                  All Collections
                </Link>
                <Link
                  href="/shop?sort=newest"
                  className="block text-base font-medium text-[#241813] hover:text-[#A6875C]"
                >
                  New Arrivals
                </Link>
                <Link
                  href="/offers"
                  className="block text-base font-medium text-[#241813] hover:text-[#A6875C]"
                >
                  Offers & Privileges
                </Link>
                <Link
                  href="/flash-sales"
                  className="block text-base font-medium text-[#241813] hover:text-[#A6875C]"
                >
                  Flash Sales
                </Link>

                <div className="pt-4 border-t border-[#E5DDCF]">
                  <p className="text-xs uppercase tracking-wider text-[#96867B] font-semibold mb-3">
                    Categories
                  </p>
                  <div className="space-y-2.5 pl-2">
                    {categories.map((c) => (
                      <Link
                        key={c.name}
                        href={c.href}
                        className="block text-sm text-[#63534B] hover:text-[#A6875C]"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="pt-6 border-t border-[#E5DDCF] space-y-3">
              <Link
                href="/account"
                className="flex items-center gap-3 text-sm font-medium text-[#241813] hover:text-[#A6875C]"
              >
                <UserIcon className="w-4 h-4" />
                <span>My Account & Orders</span>
              </Link>
              <Link
                href="/admin/login"
                className="flex items-center gap-3 text-xs text-[#96867B] hover:text-[#241813]"
              >
                <span>Admin Portal</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. Mobile Bottom Navigation Bar (Golden Rule 2 & 8: shortcuts and persistent access) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E5DDCF] py-2 px-6 z-40 flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 ${
            pathname === "/" ? "text-[#A6875C]" : "text-[#63534B]"
          }`}
        >
          <span className="text-[10px] tracking-wider uppercase font-medium">Home</span>
        </Link>
        <Link
          href="/shop"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith("/shop") ? "text-[#A6875C]" : "text-[#63534B]"
          }`}
        >
          <span className="text-[10px] tracking-wider uppercase font-medium">Shop</span>
        </Link>
        <Link
          href="/cart"
          className="relative flex flex-col items-center gap-1 text-[#241813]"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {isMounted && totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#C5A880] text-[#170F0B] text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase font-medium">Bag</span>
        </Link>
        <Link
          href="/account/wishlist"
          className={`flex flex-col items-center gap-1 ${
            pathname.includes("wishlist") ? "text-[#A6875C]" : "text-[#63534B]"
          }`}
        >
          <span className="text-[10px] tracking-wider uppercase font-medium">Wishlist</span>
        </Link>
        <Link
          href="/account"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith("/account") && !pathname.includes("wishlist")
              ? "text-[#A6875C]"
              : "text-[#63534B]"
          }`}
        >
          <span className="text-[10px] tracking-wider uppercase font-medium">Account</span>
        </Link>
      </div>
    </header>
  );
}
