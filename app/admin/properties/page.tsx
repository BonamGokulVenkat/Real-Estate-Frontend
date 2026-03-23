"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/services/propertyService";
import { Search, Loader2, Trash2, Building, Eye, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
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
    queryFn: () => propertyService.search({}), // Get all properties
  });

  const deleteMutation = useMutation({
    mutationFn: propertyService.delete,
    onSuccess: () => {
      toast.success("Property deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] }); // Invalidate all property caches
    },
    onError: () => {
      toast.error("Failed to delete property. Check permissions.");
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
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

  const filteredProperties = (properties || []).filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.builder?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Manage Properties</h1>
          <p className="text-white/40 text-sm">Review, moderate, and remove listed estates.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, city, builder..." 
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-amber-500 rounded-xl h-11"
          />
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#0A192F]/50">
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40">
                <th className="px-6 py-4 font-bold">Property Details</th>
                <th className="px-6 py-4 font-bold">Location</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Builder</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-white/40 italic font-serif">
                    <Building className="w-10 h-10 text-white/10 mx-auto mb-4" />
                    No properties found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProperties.map(p => (
                  <tr key={p.property_id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                          <img 
                            src={p.media?.[0]?.media_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"} 
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-white max-w-[200px] truncate">{p.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold bg-amber-500/10 text-amber-500">
                              {p.property_type}
                            </span>
                            <span className="text-white/30 text-xs">{p.size_sqft} sqft</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-white/80">{p.location?.city || "Unknown"}</div>
                      <div className="text-white/40 text-[10px] uppercase tracking-widest">{p.location?.state || "N/A"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-serif font-bold text-amber-500">{formatPrice(p.price)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-white/80">{p.builder?.name || "Independent"}</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-white/40 hover:text-white">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0D2137] border border-white/10 text-white min-w-[160px] rounded-xl overflow-hidden shadow-2xl">
                          <DropdownMenuLabel className="text-xs uppercase tracking-widest text-white/40 font-bold px-4 py-2">Property Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem asChild className="focus:bg-white/5 px-4 py-2 cursor-pointer transition-colors text-xs font-bold gap-2">
                            <Link href={`/property/${p.property_id}`}>
                               <Eye className="w-4 h-4 text-white/40" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(p.property_id)}
                            className="focus:bg-red-500/20 text-red-500 px-4 py-2 cursor-pointer transition-colors text-xs font-bold gap-2"
                          >
                            <Trash2 className="w-4 h-4 mt-0.5" /> Remove Listed
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
