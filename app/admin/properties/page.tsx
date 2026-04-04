/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/services/propertyService";
import { Search, Loader2, Trash2, Eye, MoreHorizontal, MapPin } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useCurrency } from "@/hooks/useCurrency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ManageProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => propertyService.search({}),
  });

  const deleteMutation = useMutation({
    mutationFn: propertyService.delete,
    onSuccess: () => {
      toast.success("Estate listing removed.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    }
  });

  if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;

  const filtered = (properties || []).filter((p: any) => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">Inventory Control</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Estate <span className="text-white/40 italic font-light">Holdings</span></h1>
        </div>
        
        <div className="relative group w-full md:w-80">
          <div className="absolute -inset-1 bg-amber-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30 z-10" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Locate estate..." 
            className="pl-12 bg-white/5 border-white/10 text-white rounded-2xl h-14 focus-visible:ring-amber-500 w-full"
          />
        </div>
      </header>

      <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-white/[0.02]">
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
                <th className="px-8 py-6 text-left">Property Profile</th>
                <th className="px-8 py-6 text-left">Market Valuation</th>
                <th className="px-8 py-6 text-left">Entity Partner</th>
                <th className="px-8 py-6 text-right">Registry Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p: any, idx: number) => {
                const propKey = p.id || p.property_id || idx;
                return (
                  <tr key={propKey} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-[#0D2137] border border-white/10 overflow-hidden shrink-0 group-hover:border-amber-500 transition-colors">
                          <img 
                            src={p.media?.[0]?.media_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"} 
                            alt={p.title} 
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-serif font-bold text-white group-hover:text-amber-500 transition-colors line-clamp-1">{p.title}</div>
                          <div className="flex items-center gap-2 mt-1 text-white/30 text-[10px] font-bold uppercase tracking-widest truncate">
                            <MapPin className="w-3 h-3 text-amber-500/50 shrink-0" /> {p.location?.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-lg font-serif font-bold text-white tabular-nums">{formatPrice(p.price)}</div>
                      <div className="text-[10px] text-white/20 uppercase tracking-widest mt-1">{p.property_type}</div>
                    </td>
                    <td className="px-8 py-6 text-white/60 text-sm font-medium">
                      {p.builder?.name || "Private Seller"}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0D2137] border border-white/10 text-white min-w-[200px] rounded-2xl p-2 shadow-2xl">
                          <DropdownMenuItem asChild className="focus:bg-white/5 px-4 py-3 cursor-pointer rounded-xl text-xs font-bold gap-3">
                            <Link href={`/property/${p.property_id || p.id}`}><Eye className="w-4 h-4 text-amber-500" /> Inspect Listing</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate(p.property_id || p.id)}
                            className="focus:bg-red-500/10 text-red-500 px-4 py-3 cursor-pointer rounded-xl text-xs font-bold gap-3"
                          >
                            <Trash2 className="w-4 h-4" /> Remove Holding
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