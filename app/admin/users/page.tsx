/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { Search, Loader2, Trash2, MoreHorizontal, UserCheck, Shield, X } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: userService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      toast.success("User purged successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to purge user.");
      setUserToDelete(null);
    },
  });

  const filtered = (users || []).filter((u: any) =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const roleMeta: Record<string, { bg: string; border: string; text: string }> = {
    admin:    { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
    builder:  { bg: "bg-amber-500/10",  border: "border-amber-500/25",  text: "text-amber-400"  },
    individual: { bg: "bg-blue-500/10", border: "border-blue-500/20",   text: "text-blue-400"   },
  };

  return (
    <div className="space-y-10">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">Identity Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Platform <span className="text-white/30 italic font-light">Users</span>
          </h1>
          {!isLoading && (
            <p className="text-white/30 text-sm mt-2 font-light">
              {(users || []).length} total members
            </p>
          )}
        </div>

        {/* Search bar */}
        <div className="relative group w-full md:w-80 shrink-0">
          <div className="absolute -inset-0.5 bg-amber-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/25 z-10 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-11 pr-10 relative bg-white/[0.04] border-white/10 text-white rounded-2xl h-12 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/40 w-full placeholder:text-white/20 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors z-10 p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-white/30 text-sm font-light">Loading identities…</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold">
                  <th className="px-8 py-5 text-left">Member</th>
                  <th className="px-8 py-5 text-left">Role</th>
                  <th className="px-8 py-5 text-left">Joined</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length > 0 ? (
                  filtered.map((u: any, idx: number) => {
                    const userKey = u.user_id || u.id || u.email || idx;
                    const role = u.role || "individual";
                    const rm = roleMeta[role] || roleMeta.individual;
                    return (
                      <tr key={userKey} className="group hover:bg-white/[0.025] transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-[#0D2137] border border-white/10 flex items-center justify-center font-bold text-amber-500 shrink-0 text-sm capitalize group-hover:border-amber-500/30 transition-colors">
                              {u.name?.[0] || "U"}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                                {u.name || "Anonymous User"}
                              </div>
                              <div className="text-xs text-white/30 truncate mt-0.5">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border inline-flex items-center gap-1.5",
                            rm.bg, rm.border, rm.text
                          )}>
                            <span className="w-1 h-1 rounded-full bg-current" />
                            {role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-white/35 text-xs font-medium tabular-nums">
                          {u.date_joined
                            ? format(new Date(u.date_joined), "MMM dd, yyyy")
                            : u.created_at
                            ? format(new Date(u.created_at), "MMM dd, yyyy")
                            : "—"}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-9 w-9 p-0 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[#0D2137] border border-white/10 text-white min-w-[180px] rounded-2xl p-2 shadow-2xl"
                            >
                              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-white/25 px-3 py-2">
                                Controls
                              </DropdownMenuLabel>
                              <DropdownMenuItem className="focus:bg-white/5 px-3 py-2.5 cursor-pointer rounded-xl text-xs font-medium gap-3 text-white/70">
                                <UserCheck className="w-4 h-4 text-amber-500" /> Verify Entity
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-white/5 px-3 py-2.5 cursor-pointer rounded-xl text-xs font-medium gap-3 text-white/70">
                                <Shield className="w-4 h-4 text-white/30" /> Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/5 my-1" />
                              <DropdownMenuItem
                                onClick={() => setUserToDelete(u)}
                                className="focus:bg-red-500/10 text-red-400 hover:text-red-300 px-3 py-2.5 cursor-pointer rounded-xl text-xs font-medium gap-3"
                              >
                                <Trash2 className="w-4 h-4" /> Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center">
                          <Search className="w-6 h-6 text-white/15" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/40">No users found</p>
                          {searchTerm && (
                            <p className="text-xs text-white/20 mt-1">
                              No results for &quot;{searchTerm}&quot;
                            </p>
                          )}
                        </div>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-xs text-amber-500/60 hover:text-amber-500 transition-colors"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">
                {filtered.length} of {(users || []).length} users
                {searchTerm && " (filtered)"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="bg-[#0D2137] border border-white/10 text-white rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-serif">Delete User?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm leading-relaxed">
              This is permanent and cannot be undone. All data associated with{" "}
              <span className="text-amber-400 font-semibold">{userToDelete?.email}</span>{" "}
              will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-2">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-11 flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(userToDelete?.user_id || userToDelete?.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white border-none rounded-xl px-6 h-11 font-bold flex-1 disabled:opacity-60"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}