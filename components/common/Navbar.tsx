"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  User,
  Search,
  BadgeDollarSign,
  LayoutGrid,
  X,
  ChevronDown,
  LogOut
} from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Cookies from "js-cookie";

import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { CurrencyCode } from "@/store/useCurrencyStore";
import { useAuthStore } from "@/store/useAuthStore";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Home", path: "/", icon: LayoutGrid },
  { label: "Just For You", path: "/just-for-you", icon: LayoutGrid },
  { label: "Find Agencies", path: "/agencies", icon: Search },
  { label: "Sell Property", path: "/sell", icon: BadgeDollarSign },
] as const;

const CURRENCIES: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const { user, isAuthenticated, logout } = useAuthStore();

  const profileRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check authentication on mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);

    if (isAuthenticated && !Cookies.get("access_token")) {
      logout();
    }
  }, [isAuthenticated, logout]);

  const handleLogout = useCallback(() => {
    logout();
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/login";
  }, [logout]);

  const isLoggedIn = mounted && isAuthenticated && !!user && !!Cookies.get("access_token");

  const visibleNavLinks = NAV_LINKS.filter((link) => {
    if (link.path === "/sell") {
      // Hide "Sell Property" for individuals and admins, keep it for builders (and guests to prompt login)
      return user?.role !== "individual" && user?.role !== "admin";
    }
    return true;
  });

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getUserInitials();

  const ProfileAvatar = ({ size = "sm" }: { size?: "sm" | "lg" }) => (
    <div className={cn(
      "rounded-full bg-amber-500 flex items-center justify-center font-bold text-[#0A192F] select-none shrink-0",
      size === "sm" ? "w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm" : "w-12 h-12 text-base"
    )}>
      {initials}
    </div>
  );

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-[#0A192F]/95 backdrop-blur-md border-b border-white/10 h-16 lg:h-20"
        : "bg-transparent h-20 lg:h-24"
    )}>
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 -ml-2"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              showCloseButton={false}
              className="bg-[#0A192F] border-r border-white/10 text-white w-[280px] sm:w-[320px] p-0 flex flex-col"
            >
              <VisuallyHidden.Root>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Access main pages and account settings</SheetDescription>
              </VisuallyHidden.Root>

              {/* Header */}
              <div className="p-5 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
                    <span className="text-[#0A192F] font-bold text-lg">L</span>
                  </div>
                  <span className="font-serif text-white text-xl font-bold">Luxora</span>
                </div>
                <SheetClose className="rounded-full p-2 hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white/60" />
                </SheetClose>
              </div>

              {/* Currency Selector (Top of drawer) */}
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-white/60 text-xs uppercase tracking-wider font-semibold">Currency</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                >
                  {CURRENCIES.map(code => (
                    <option key={code} value={code} className="bg-[#0A192F] text-white">{code}</option>
                  ))}
                </select>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {visibleNavLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <SheetClose asChild key={link.path}>
                      <Link
                        href={link.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                          isActive
                            ? "bg-amber-500 text-[#0A192F] font-semibold"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <link.icon className={cn("w-5 h-5", isActive ? "text-[#0A192F]" : "text-amber-500")} />
                        <span className="text-base">{link.label}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>

              {/* User Actions */}
              <div className="p-5 border-t border-white/10 space-y-3">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-2 pb-3">
                      <ProfileAvatar size="lg" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-white font-semibold text-sm truncate">{user.name}</span>
                        <span className="text-white/40 text-xs truncate">{user.email}</span>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-white/10 hover:bg-white/20 text-white rounded-lg h-11">
                        <Link href="/profile">
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="w-full rounded-lg h-11"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-lg h-11">
                        <Link href="/login">
                          <User className="w-4 h-4 mr-2" />
                          Sign In
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-amber-500 hover:bg-amber-400 text-[#0A192F] font-semibold rounded-lg h-11">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 group shrink-0"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-amber-500 rounded flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
            <span className="text-[#0A192F] font-bold text-sm sm:text-base lg:text-lg">L</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm sm:text-lg lg:text-xl font-bold text-white whitespace-nowrap">
              Luxora <span className="text-amber-500">Estates</span>
            </span>
            <span className="hidden sm:block text-[10px] lg:text-xs text-amber-400/70 leading-tight">
              Luxury Property Opportunities
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                pathname === link.path
                  ? "bg-amber-500 text-[#0A192F]"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Currency Dropdown (Always visible on top for mobile & desktop) */}
          <div className="relative shrink-0" ref={currencyRef}>
            <button
              onClick={() => setCurrencyDropdownOpen(prev => !prev)}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs sm:text-sm font-semibold transition-colors bg-amber-500/10 hover:bg-amber-500/20 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-amber-500/30"
              aria-label="Select currency"
            >
              <span>{currency}</span>
              <ChevronDown className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform", currencyDropdownOpen && "rotate-180")} />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-24 bg-[#0A192F] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                {CURRENCIES.map(code => (
                  <button
                    key={code}
                    onClick={() => {
                      setCurrency(code);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/10",
                      currency === code ? "text-amber-500 font-semibold" : "text-white/80"
                    )}
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Profile Icon (Visible only if logged in) */}
          <div className="lg:hidden">
            {isLoggedIn ? (
              <Link href="/profile">
                <ProfileAvatar size="sm" />
              </Link>
            ) : (
              <Link href="/login" className="text-white hover:text-amber-500 transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 focus:outline-none group"
                  aria-label="Profile menu"
                >
                  <ProfileAvatar size="sm" />
                  <div className="hidden xl:flex flex-col items-start leading-tight">
                    <span className="text-white text-sm font-semibold max-w-[120px] truncate">{user.name}</span>
                    <span className="text-white/40 text-xs capitalize">{user.role}</span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-white/40 transition-transform", profileDropdownOpen && "rotate-180")} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-[#0A192F] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-white/40 text-xs truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 text-sm transition-colors"
                      >
                        <User className="w-4 h-4 text-amber-500" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" className="text-white hover:bg-white/10 rounded-lg h-10">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-amber-500 hover:bg-amber-400 text-[#0A192F] font-semibold rounded-lg h-10 px-5 transition-transform active:scale-95">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}