/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/propertyService";
import { userService } from "@/services/userService";
import { Users, Building, FileText, ArrowUpRight, Loader2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminOverview() {
  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => propertyService.search({}),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: userService.getAll,
  });

  const isLoading = propsLoading || usersLoading;

  const allProps = properties || [];
  const allUsers = users || [];
  const builders = allUsers.filter((u: any) => u.role === "builder").length;
  const portfolioValue = allProps.reduce((acc: number, p: any) => acc + Number(p.price || 0), 0);

  const stats = [
    {
      label: "Total Users",
      val: isLoading ? "—" : allUsers.length,
      sub: isLoading ? "Loading…" : `${builders} builders registered`,
      icon: Users,
      color: "text-amber-500",
      glow: "bg-amber-500/5",
      href: "/admin/users",
    },
    {
      label: "Active Listings",
      val: isLoading ? "—" : allProps.length,
      sub: "Live on marketplace",
      icon: Building,
      color: "text-blue-400",
      glow: "bg-blue-500/5",
      href: "/admin/properties",
    },
    {
      label: "Portfolio Value",
      val: isLoading
        ? "—"
        : allProps.length
        ? `₹${(portfolioValue / 10000000).toFixed(1)} Cr`
        : "N/A",
      sub: "Total asset valuation",
      icon: FileText,
      color: "text-emerald-400",
      glow: "bg-emerald-500/5",
      href: "/admin/properties",
    },
  ];

  const roleBadge = (role: string) => {
    if (role === "builder") return "bg-amber-500/10 border-amber-500/25 text-amber-400";
    if (role === "admin") return "bg-purple-500/10 border-purple-500/20 text-purple-400";
    return "bg-blue-500/10 border-blue-500/20 text-blue-400";
  };

  return (
    <div className="space-y-10">
      {/* ── Header ── */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-8 bg-amber-500/50" />
          <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">Executive Dashboard</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
          Platform <span className="text-white/30 italic font-light">Intelligence</span>
        </h1>
      </header>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href}>
            <div className={cn(
              "group relative rounded-[28px] border border-white/[0.07] p-7 transition-all duration-500",
              "hover:border-amber-500/20 hover:-translate-y-1 cursor-pointer",
              stat.glow, "backdrop-blur-sm"
            )}>
              <div className="flex justify-between items-start mb-7">
                <div className="w-12 h-12 bg-[#0D2137] border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-amber-500/30 transition-colors">
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="text-white/25 text-[10px] uppercase tracking-[0.25em] font-bold mb-1.5">{stat.label}</p>
              {isLoading ? (
                <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse mb-2" />
              ) : (
                <h3 className="text-3xl font-serif font-bold text-white mb-2 tabular-nums">{stat.val}</h3>
              )}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-amber-500/60" />
                <p className="text-[11px] text-white/25 font-medium">{stat.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent Registrations Table ── */}
      <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-[32px] overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

        <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.05]">
          <div>
            <h2 className="text-lg font-serif font-bold text-white">Recent Registrations</h2>
            <p className="text-white/25 text-xs mt-0.5">Latest platform joiners</p>
          </div>
          <Link
            href="/admin/users"
            className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 hover:text-amber-500 transition-colors flex items-center gap-1.5"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : allUsers.length === 0 ? (
          <div className="text-center py-16 text-white/25 text-sm font-light">
            No users registered yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-[0.3em] text-white/25">
                  <th className="px-8 pb-4 pt-2 font-bold text-left">Member</th>
                  <th className="px-8 pb-4 pt-2 font-bold text-left">Role</th>
                  <th className="px-8 pb-4 pt-2 font-bold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {allUsers.slice(0, 6).map((u: any, idx: number) => {
                  const userKey = u.user_id || u.id || u.email || idx;
                  return (
                    <tr key={userKey} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0D2137] border border-white/10 flex items-center justify-center text-amber-500 font-bold text-xs shrink-0 group-hover:border-amber-500/25 transition-colors">
                            {u.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white/90 truncate group-hover:text-amber-400 transition-colors">
                              {u.name || "Unknown"}
                            </div>
                            <div className="text-xs text-white/25 font-mono truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border inline-flex items-center gap-1",
                          roleBadge(u.role)
                        )}>
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right text-white/30 text-xs tabular-nums">
                        {u.date_joined
                          ? format(new Date(u.date_joined), "MMM dd, yyyy")
                          : u.created_at
                          ? format(new Date(u.created_at), "MMM dd, yyyy")
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}