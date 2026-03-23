"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Building, Settings, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_LINKS = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin" },
  { icon: Users, label: "Manage Users", path: "/admin/users" },
  { icon: Building, label: "Manage Properties", path: "/admin/properties" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#0A192F] text-white flex pt-[96px]"> {/* pt-24 to offset global navbar */}
      {/* Sidebar */}
      <aside className="w-72 bg-[#0D2137] border-r border-white/5 hidden lg:flex flex-col z-10 sticky top-[96px] h-[calc(100vh-96px)]">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <ShieldAlert className="w-6 h-6" />
            <h2 className="font-serif text-2xl font-bold tracking-tight">Admin<span className="text-white">Panel</span></h2>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">System Management</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {ADMIN_LINKS.map(link => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.path} href={link.path}>
                <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Button variant="ghost" onClick={logout} className="w-full justify-start text-white/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl px-4 py-3">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Logout Session</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
