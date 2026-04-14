/* eslint-disable react-hooks/static-components */
"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: Users, label: "Manage Users", path: "/admin/users" },
  { icon: Building, label: "Manage Properties", path: "/admin/properties" },
  { icon: Settings, label: "System Settings", path: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ FIXED LOGIC HERE
  useEffect(() => {
    const token = Cookies.get("access_token");

    // ❌ No token → not logged in
    if (!token) {
      router.push("/login");
      return;
    }

    // ⏳ Token exists but Zustand not ready → wait
    if (!isAuthenticated || !user) {
      return;
    }

    // ❌ Not admin
    if (user.role !== "admin") {
      router.push("/");
    }

  }, [isAuthenticated, user, router]);

  // ✅ Prevent wrong blocking
  const token = Cookies.get("access_token");

  if (!token || !isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A192F] gap-4">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ShieldCheck className="w-6 h-6 text-amber-500" />
        </motion.div>
        <p className="text-white/40 text-sm font-light tracking-widest">
          Verifying credentials…
        </p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <>
      <Link href="/" className="block">
        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-shadow">
              <ShieldCheck className="text-[#0A192F] w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-white">Luxora</span>
              <span className="text-[9px] uppercase tracking-[0.4em] text-amber-500 font-bold leading-none mt-1">
                Admin Portal
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Admin user badge */}
      <div className="mx-4 mt-4 mb-2 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-[#0A192F] font-bold text-xs shrink-0">
          {user.name?.[0]?.toUpperCase() || "A"}
        </div>
        <div className="min-w-0">
          <div className="text-white text-xs font-semibold truncate">{user.name}</div>
          <div className="text-white/30 text-[10px] truncate">{user.email}</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link key={link.path} href={link.path} onClick={() => setIsMobileMenuOpen(false)}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group",
                  isActive
                    ? "bg-amber-500 text-[#0A192F] font-bold shadow-lg shadow-amber-500/20"
                    : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-4">
                  <link.icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-[#0A192F]" : "group-hover:text-amber-500 transition-colors"
                    )}
                  />
                  <span className="text-sm tracking-wide">{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-6 transition-all group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-bold text-[10px] uppercase tracking-widest">
            Terminate Session
          </span>
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A192F] text-white">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#081426]/90 border-b border-white/5 flex items-center justify-between px-4 z-[60] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:bg-white/5 rounded-xl"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-amber-500 w-5 h-5" />
            <span className="font-serif text-lg font-bold">Luxora</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-[#0A192F] font-bold text-xs">
          {user.name?.[0]?.toUpperCase() || "A"}
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#081426] z-[70] flex flex-col border-r border-white/10 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#081426] border-r border-white/5 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative pt-16 lg:pt-0">
        <div className="relative z-10 p-6 md:p-10 lg:p-14 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}