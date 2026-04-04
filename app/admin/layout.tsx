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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user && user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A192F]">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="text-amber-500 font-serif italic text-xl tracking-widest underline decoration-amber-500/30 underline-offset-8"
        >
          Authenticating Admin...
        </motion.div>
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
        <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent hover:bg-white/[0.04] transition-colors cursor-pointer">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <ShieldCheck className="text-[#0A192F] w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight">Luxora</span>
              <span className="text-[9px] uppercase tracking-[0.4em] text-amber-500 font-bold leading-none mt-1">Admin Portal</span>
            </div>
          </div>
        </div>
      </Link>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link key={link.path} href={link.path} onClick={() => setIsMobileMenuOpen(false)}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-amber-500 text-[#0A192F] font-bold shadow-lg" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <link.icon className={cn("w-5 h-5", isActive ? "text-[#0A192F]" : "group-hover:text-amber-500")} />
                  <span className="text-sm tracking-wide">{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-[#061020]/50">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-6"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-bold text-[10px] uppercase tracking-widest">Terminate Session</span>
        </Button>
      </div>
    </>
  );

  return (
  <div className="flex h-screen overflow-hidden bg-[#0A192F] text-white selection:bg-amber-500/30">
    
    {/* ── Mobile Top Bar (Remains sticky at top) ── */}
    <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-[#081426]/80 border-b border-white/5 flex items-center justify-between px-6 z-[60] backdrop-blur-md">
       <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:bg-white/5 -ml-2"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-amber-500 w-5 h-5" />
            <span className="font-serif text-lg font-bold">Luxora</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-[#0A192F] font-bold text-xs">
          {user.name?.[0].toUpperCase()}
        </div>
    </header>

    {/* ── Mobile Sidebar Drawer ── */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[65] lg:hidden"
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

    {/* ── Desktop Sidebar (FIXED) ── */}
    <aside className="hidden lg:flex flex-col w-80 bg-[#081426] border-r border-white/5 h-screen sticky top-0 flex-shrink-0 overflow-hidden">
      <SidebarContent />
    </aside>

    {/* ── Main Dashboard Content (SCROLLABLE) ── */}
    <main className="flex-1 h-screen overflow-y-auto relative pt-20 lg:pt-0 custom-scrollbar">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-amber-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
      
      <div className="p-6 md:p-12 lg:p-16 max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  </div>
);
}