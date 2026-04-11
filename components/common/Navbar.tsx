"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User, Search, BadgeDollarSign, LayoutGrid, X, ChevronDown, LogOut } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { CurrencyCode } from "@/store/useCurrencyStore";
import { useAuthStore } from "@/store/useAuthStore";
import Cookies from "js-cookie";

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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const CURRENCIES: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

  const { user, isAuthenticated, logout } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fix: Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    setProfileOpen(false);
    // Using window.location.href for a full reload to clear all state definitely
    window.location.href = "/login";
  };

  // Logic remains same, but ensures variables are stable
  const visibleNavLinks = NAV_LINKS.filter((link) => {
    if (link.path === "/sell") {
      return user?.role !== "individual" && user?.role !== "admin";
    }
    return true;
  });

  const isLoggedIn = mounted && isAuthenticated && !!user;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const ProfileAvatar = ({ size = "sm" }: { size?: "sm" | "lg" }) => (
    <div className={cn(
      "rounded-full bg-amber-500 flex items-center justify-center font-bold text-[#0A192F] select-none shrink-0",
      size === "sm" ? "w-9 h-9 text-sm" : "w-12 h-12 text-base"
    )}>
      {initials}
    </div>
  );

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex items-center",
      scrolled 
        ? "bg-[#0A192F]/90 backdrop-blur-xl border-b border-white/5 h-20 shadow-2xl" 
        : "bg-transparent h-24"
    )}>
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
        
        {/* ── Mobile Side Toggle ── */}
        <div className="lg:hidden flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="left" 
              className="bg-[#0A192F] border-r border-white/10 text-white w-[300px] p-0 flex flex-col z-[110] [&>button]:hidden"
            >
              <VisuallyHidden.Root>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Access main pages and account settings</SheetDescription>
              </VisuallyHidden.Root>

              <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0A192F]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
                    <span className="text-[#0A192F] font-bold text-lg">L</span>
                  </div>
                  <span className="font-serif text-white text-xl font-bold">Luxora</span>
                </div>
                <SheetClose className="rounded-full p-2 hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white/50" />
                </SheetClose>
              </div>

              <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                {visibleNavLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <SheetClose asChild key={link.path}>
                      <Link
                        href={link.path}
                        className={cn(
                          "flex items-center gap-4 px-4 py-4 rounded-xl transition-all",
                          isActive 
                            ? "bg-amber-500 text-[#0A192F] font-bold" 
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <link.icon className={cn("w-5 h-5", isActive ? "text-[#0A192F]" : "text-amber-500")} />
                        <span className="text-base font-medium">{link.label}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 space-y-3">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-2 mb-2">
                      <ProfileAvatar size="lg" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-semibold text-sm truncate">{user.name}</span>
                        <span className="text-white/40 text-xs truncate">{user.email}</span>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl h-12 border border-white/10">
                        <Link href="/profile">
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button 
                        onClick={handleLogout}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl h-12"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl h-14 border border-white/10">
                        <Link href="/login">
                          <User className="w-4 h-4 mr-2" />
                          Sign In
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-amber-500 hover:bg-amber-400 text-[#0A192F] font-bold rounded-xl h-14 shadow-lg shadow-amber-500/10">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
                <div className="flex items-center justify-between mt-6 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs uppercase font-bold tracking-widest">Currency</span>
                    <select 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="bg-transparent text-amber-500 font-bold text-sm outline-none cursor-pointer appearance-none ml-2"
                    >
                      {CURRENCIES.map(code => (
                        <option key={code} value={code} className="bg-[#0A192F] text-white">{code}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* ── Logo ── */}
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-2 group shrink-0 transition-opacity duration-300",
            isOpen ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center transition-transform group-hover:rotate-12">
            <span className="text-[#0A192F] font-bold text-lg">L</span>
          </div>
          <span className="font-serif text-xl lg:text-2xl font-bold tracking-tight text-white">
            Luxora <span className="text-amber-500">Estates</span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-1.5 py-1.5">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                pathname === link.path ? "bg-amber-500 text-[#0A192F]" : "text-white/60 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Right Action (Mobile) ── */}
        <div className={cn(
          "shrink-0 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-0" : "opacity-100"
        )}>
          {isLoggedIn ? (
            <Link href="/profile">
              <ProfileAvatar size="sm" />
            </Link>
          ) : (
            <Link href="/login" className="text-white/80">
              <User className="w-6 h-6" />
            </Link>
          )}
        </div>

        {/* ── Right Actions (Desktop) ── */}
        <div className="hidden lg:flex items-center gap-6 relative">
          
          {/* Currency Dropdown */}
          <div className="relative group cursor-pointer flex items-center gap-1.5 text-white/60 hover:text-amber-500 font-medium text-sm transition-colors">
            <span>{currency}</span>
            <ChevronDown className="w-4 h-4" />
            <div className="absolute top-full right-0 mt-2 w-24 bg-[#0A192F]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              {CURRENCIES.map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/10",
                    currency === code ? "text-amber-500 font-bold" : "text-white/80"
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <ProfileAvatar size="sm" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-white text-sm font-semibold max-w-[100px] truncate">{user.name}</span>
                  <span className="text-white/40 text-xs capitalize">{user.role}</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", profileOpen && "rotate-180")} />
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-3 w-52 bg-[#0A192F]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[110]">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-white/40 text-xs truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                    >
                      <User className="w-4 h-4 text-amber-500" />
                      My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild className="rounded-xl px-6 h-11 bg-white/10 hover:bg-white/20 text-white border border-white/10 font-semibold">
                <Link href="/login" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Sign In
                </Link>
              </Button>
              <Button asChild className="rounded-xl px-6 h-11 bg-amber-500 hover:bg-amber-400 text-[#0A192F] font-bold shadow-lg shadow-amber-500/10 transition-all">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}