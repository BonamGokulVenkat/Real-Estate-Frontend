"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { Search, Loader2, Trash2, Shield, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
      toast.success("User deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error("Failed to delete user. Please ensure you have admin rights.");
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  const filteredUsers = (users || []).filter((u: any) => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Manage Users</h1>
          <p className="text-white/40 text-sm">View and manage platform members, builders, and administrators.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..." 
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500 rounded-xl h-11"
          />
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02]">
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40">
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/40 italic font-serif">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0D2137] border border-white/10 flex items-center justify-center font-bold text-amber-500">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-medium text-white">{u.name || "Unknown"}</div>
                          <div className="text-white/40 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${
                        u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' :
                        u.role === 'builder' ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-xs">
                      {u.created_at ? format(new Date(u.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-white/40 hover:text-white">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0D2137] border border-white/10 text-white min-w-[160px] rounded-xl overflow-hidden shadow-2xl">
                          <DropdownMenuLabel className="text-xs uppercase tracking-widest text-white/40 font-bold px-4 py-2">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem className="focus:bg-white/5 px-4 py-2 cursor-pointer transition-colors text-xs font-bold gap-2">
                            <Shield className="w-4 h-4 text-white/40" /> Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(u.id)}
                            className="focus:bg-red-500/20 text-red-500 px-4 py-2 cursor-pointer transition-colors text-xs font-bold gap-2"
                          >
                            <Trash2 className="w-4 h-4 mt-0.5" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
