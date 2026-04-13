/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/services/propertyService";
import { Search, Loader2, Trash2, Eye, MoreHorizontal, MapPin, X } from "lucide-react";
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

export default function ManageProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyToDelete, setPropertyToDelete] = useState<any>(null);
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();

  const { data: properties, isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => propertyService.search({}),
  });

  const deleteMutation = useMutation({
    mutationFn: propertyService.delete,
    onSuccess: () => {
      toast.success("Property listing removed.");
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setPropertyToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove listing.");
      setPropertyToDelete(null);
    },
  });

  const filtered = (properties || []).filter((p: any) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeColors: Record<string, string> = {
    villa: "text-amber-400",
    apartment: "text-blue-400",
    house: "text-emerald-400",
    land: "text-orange-400",
    commercial: "text-purple-400",
    townhouse: "text-cyan-400",
    mansion: "text-rose-400",
    penthouse: "text-indigo-400",
  };

  return (
    <div className="space-y-10">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-px w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">Inventory Control</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
            Estate <span className="text-white/30 italic font-light">Holdings</span>
          </h1>
          {!isLoading && (
            <p className="text-white/30 text-sm mt-2 font-light">
              {(properties || []).length} total listings
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
            placeholder="Search by title or city…"
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
          <p className="text-white/30 text-sm font-light">Loading listings…</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold">
                  <th className="px-8 py-5 text-left">Property</th>
                  <th className="px-8 py-5 text-left">Valuation</th>
                  <th className="px-8 py-5 text-left">Builder</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length > 0 ? (
                  filtered.map((p: any, idx: number) => {
                    const propKey = p.property_id || p.id || idx;
                    const typeColor = typeColors[p.property_type?.toLowerCase()] || "text-white/40";
                    return (
                      <tr key={propKey} className="group hover:bg-white/[0.025] transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#0D2137] border border-white/10 overflow-hidden shrink-0 group-hover:border-amber-500/30 transition-colors">
                              <img
                                src={
                                  p.media?.[0]?.media_url ||
                                  p.media?.[0]?.url ||
                                  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"
                                }
                                alt={p.title}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80";
                                }}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                                {p.title}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-white/30 text-[10px] font-medium">
                                <MapPin className="w-3 h-3 text-amber-500/40 shrink-0" />
                                <span className="truncate">{p.location?.city}{p.location?.state ? `, ${p.location.state}` : ""}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-base font-serif font-bold text-white tabular-nums">{formatPrice(p.price)}</div>
                          <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${typeColor}`}>
                            {p.property_type}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-sm text-white/60 font-medium">{p.builder?.name || "Private Seller"}</div>
                          {p.builder?.email && (
                            <div className="text-xs text-white/25 mt-0.5 truncate max-w-[160px]">{p.builder.email}</div>
                          )}
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
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem asChild className="focus:bg-white/5 px-3 py-2.5 cursor-pointer rounded-xl text-xs font-medium gap-3 text-white/70">
                                <Link href={`/property/${p.property_id || p.id}`}>
                                  <Eye className="w-4 h-4 text-amber-500" /> View Listing
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/5 my-1" />
                              <DropdownMenuItem
                                onClick={() => setPropertyToDelete(p)}
                                className="focus:bg-red-500/10 text-red-400 hover:text-red-300 px-3 py-2.5 cursor-pointer rounded-xl text-xs font-medium gap-3"
                              >
                                <Trash2 className="w-4 h-4" /> Remove Listing
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
                          <p className="text-sm font-medium text-white/40">No properties found</p>
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
                {filtered.length} of {(properties || []).length} listings
                {searchTerm && " (filtered)"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={!!propertyToDelete} onOpenChange={() => setPropertyToDelete(null)}>
        <AlertDialogContent className="bg-[#0D2137] border border-white/10 text-white rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-serif">Remove Listing?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm leading-relaxed">
              This will permanently remove{" "}
              <span className="text-amber-400 font-semibold">{propertyToDelete?.title}</span>
              {" "}from the platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-2">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-11 flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(propertyToDelete?.property_id || propertyToDelete?.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white border-none rounded-xl px-6 h-11 font-bold flex-1 disabled:opacity-60"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Remove Listing"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}