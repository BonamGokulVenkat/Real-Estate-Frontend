/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { Search, Loader2, Trash2, Shield, MoreHorizontal, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: userService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      toast.success("Identity purged successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;

  const filtered = (users || []).filter((u: any) => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">Identity Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Platform <span className="text-white/40 italic font-light">Users</span></h1>
        </div>
        
        <div className="relative group w-full md:w-80">
          <div className="absolute -inset-1 bg-amber-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30 z-10" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter identities..." 
            className="pl-12 bg-white/5 border-white/10 text-white rounded-2xl h-14 focus-visible:ring-amber-500 w-full"
          />
        </div>
      </header>

      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white/[0.02]">
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
                <th className="px-8 py-6 text-left">Member Entity</th>
                <th className="px-8 py-6 text-left">Status</th>
                <th className="px-8 py-6 text-left">Joined Registry</th>
                <th className="px-8 py-6 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u: any, idx: number) => {
                const userKey = u.id || u.user_id || u.email || idx;
                return (
                  <tr key={userKey} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#0D2137] border border-white/10 flex items-center justify-center font-bold text-amber-500 shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{u.name || "Anonymous User"}</div>
                          <div className="text-xs text-white/30 italic truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border flex items-center gap-1.5 w-fit",
                        u.role === 'admin' ? 'bg-purple-500/5 border-purple-500/20 text-purple-400' :
                        u.role === 'builder' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' : 
                        'bg-blue-500/5 border-blue-500/20 text-blue-400'
                      )}>
                        <div className="w-1 h-1 rounded-full bg-current" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-white/40 text-xs font-medium tabular-nums">
                      {u.created_at ? format(new Date(u.created_at), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0D2137] border border-white/10 text-white min-w-[200px] rounded-2xl p-2 shadow-2xl">
                          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-white/30 px-4 py-2">Security Control</DropdownMenuLabel>
                          <DropdownMenuItem className="focus:bg-white/5 px-4 py-3 cursor-pointer rounded-xl text-xs font-bold gap-3"><UserCheck className="w-4 h-4 text-amber-500" /> Verify Entity</DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-white/5 px-4 py-3 cursor-pointer rounded-xl text-xs font-bold gap-3"><Shield className="w-4 h-4 text-white/40" /> Change Clearances</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate(u.id)}
                            className="focus:bg-red-500/10 text-red-500 px-4 py-3 cursor-pointer rounded-xl text-xs font-bold gap-3"
                          >
                            <Trash2 className="w-4 h-4" /> Purge Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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