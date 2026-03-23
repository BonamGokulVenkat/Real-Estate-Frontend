"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/propertyService";
import { userService } from "@/services/userService";
import { Users, Building, FileText, ArrowUpRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminOverview() {
  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => propertyService.search({}), // get all
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: userService.getAll,
  });

  if (propsLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  const allProps = properties || [];
  const allUsers = users || [];
  
  const builders = allUsers.filter((u: any) => u.role === "builder").length;
  const standardUsers = allUsers.filter((u: any) => u.role === "individual").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-white/40 text-sm">Real-time statistics and summaries of the Luxora platform.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-green-500 text-xs font-bold flex items-center bg-green-500/10 px-2 py-1 rounded-full">
              +12% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Total Users</p>
          <h3 className="text-3xl font-serif font-bold text-white mb-2">{allUsers.length}</h3>
          <p className="text-[10px] text-white/30">{builders} Builders | {standardUsers} Individuals</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Building className="w-6 h-6" />
            </div>
            <span className="text-green-500 text-xs font-bold flex items-center bg-green-500/10 px-2 py-1 rounded-full">
              +4% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Active Listings</p>
          <h3 className="text-3xl font-serif font-bold text-white">{allProps.length}</h3>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">Avg Price</p>
          <h3 className="text-2xl font-serif font-bold text-amber-500">
            {allProps.length ? `₹${(allProps.reduce((acc, p) => acc + p.price, 0) / allProps.length / 10000000).toFixed(1)} Cr` : "N/A"}
          </h3>
        </div>
      </div>

      {/* Recent Activity (Dummy for now) */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
        <h2 className="text-lg font-serif font-bold text-white mb-6">Recent User Registrations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40">
                <th className="pb-4 font-bold">User</th>
                <th className="pb-4 font-bold">Role</th>
                <th className="pb-4 font-bold">Join Date</th>
              </tr>
            </thead>
            <tbody className="text-sm border-b border-white/5">
              {allUsers.slice(0, 5).map((u: any) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="font-medium text-white">{u.name || "Unknown"}</div>
                    <div className="text-white/40 text-xs">{u.email}</div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${u.role === 'builder' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 text-white/60">
                    {u.created_at ? format(new Date(u.created_at), 'MMM dd, yyyy') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
