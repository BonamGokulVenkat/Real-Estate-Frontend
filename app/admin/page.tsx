/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/propertyService";
import { userService } from "@/services/userService";
import { Users, Building, FileText, ArrowUpRight, Loader2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdminOverview() {
  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => propertyService.search({}),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: userService.getAll,
  });

  if (propsLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  const allProps = properties || [];
  const allUsers = users || [];
  const builders = allUsers.filter((u: any) => u.role === "builder").length;

  const stats = [
    { label: "Elite Users", val: allUsers.length, sub: `${builders} Verified Partners`, icon: Users, color: "text-amber-500" },
    { label: "Active Estates", val: allProps.length, sub: "Live on Global Marketplace", icon: Building, color: "text-blue-400" },
    { label: "Portfolio Value", val: allProps.length ? `₹${(allProps.reduce((acc: number, p: any) => acc + p.price, 0) / 10000000).toFixed(1)} Cr` : "N/A", sub: "Total Asset Valuation", icon: FileText, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-10 lg:space-y-16">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-8 bg-amber-500/50" />
          <span className="text-amber-500 text-[9px] md:text-[10px] font-bold tracking-[0.4em] uppercase">Executive Dashboard</span>
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight">
          Platform <span className="text-white/40 italic font-light">Intelligence</span>
        </h1>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {stats.map((stat, i) => (
          <div key={`stat-card-${i}`} className="group relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[32px] transition-all duration-500 hover:bg-white/[0.06] hover:-translate-y-2">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-[#0D2137] border border-white/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:border-amber-500/40 transition-colors">
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="p-2 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">{stat.label}</p>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">{stat.val}</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-amber-500" />
              <p className="text-xs text-white/20 font-medium">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[32px] md:rounded-[40px] p-6 md:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Recent Registrations</h2>
            <p className="text-white/30 text-[10px] md:text-xs mt-1">Real-time audit of latest platform joiners.</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.3em] text-white/30">
                <th className="pb-6 font-bold text-left">Member Entity</th>
                <th className="pb-6 font-bold text-left">Classification</th>
                <th className="pb-6 font-bold text-right">Registry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allUsers.slice(0, 5).map((u: any, idx: number) => {
                const userKey = u.id || u.user_id || u.email || idx;
                return (
                  <tr key={userKey} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#0D2137] border border-white/10 flex items-center justify-center text-amber-500 font-bold text-xs shrink-0">
                          {u.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate group-hover:text-amber-500 transition-colors">{u.name || "Unknown Identity"}</div>
                          <div className="text-xs text-white/30 italic font-serif truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                        u.role === 'builder' ? "bg-amber-500/5 border-amber-500/20 text-amber-500" : "bg-blue-500/5 border-blue-500/20 text-blue-400"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-6 text-right text-white/40 text-xs font-medium tabular-nums">
                      {u.created_at ? format(new Date(u.created_at), 'MMM dd, yyyy') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}