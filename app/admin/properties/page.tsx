// app/admin/manage-properties/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService, Property } from "@/services/propertyService";
import {
  Search,
  Loader2,
  Trash2,
  Eye,
  MoreHorizontal,
  MapPin,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ManageProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyToDelete, setPropertyToDelete] = useState<any>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();

  // Queries
  const { data: properties = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => propertyService.search({}),
  });

  const { data: pendingProperties = [], isLoading: isLoadingPending } = useQuery({
    queryKey: ["pending-properties"],
    queryFn: propertyService.getPending,
  });

  const { data: pendingRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["pending-requests"],
    queryFn: propertyService.getPendingRequests,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: propertyService.directDelete,
    onSuccess: () => {
      toast.success("Property permanently removed.");
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      setPropertyToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove listing.");
    },
  });

  const approveMutation = useMutation({
    mutationFn: propertyService.approve,
    onSuccess: () => {
      toast.success("Property Approved ✓");
      queryClient.invalidateQueries({ queryKey: ["pending-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setPreviewId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: propertyService.reject,
    onSuccess: () => {
      toast.success("Property Rejected");
      queryClient.invalidateQueries({ queryKey: ["pending-properties"] });
      setPreviewId(null);
    },
  });

  const approveEditMutation = useMutation({
    mutationFn: propertyService.approveEdit,
    onSuccess: () => {
      toast.success("Edit Approved ✓ Property updated");
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setPreviewId(null);
    },
  });

  const rejectEditMutation = useMutation({
    mutationFn: propertyService.rejectEdit,
    onSuccess: () => {
      toast.success("Edit Request Rejected");
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      setPreviewId(null);
    },
  });

  const approveDeleteMutation = useMutation({
    mutationFn: propertyService.approveDelete,
    onSuccess: () => {
      toast.success("Property Deleted ✓");
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setPreviewId(null);
    },
  });

  const rejectDeleteMutation = useMutation({
    mutationFn: propertyService.rejectDelete,
    onSuccess: () => {
      toast.success("Deletion Request Rejected. Property restored.");
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setPreviewId(null);
    },
  });

  const filtered = (properties || []).filter((p: Property) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-8 bg-amber-500/50" />
          <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">Admin Control</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
          Property <span className="text-white/30 italic font-light">Management</span>
        </h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-white/[0.03] border border-white/10 rounded-2xl p-1 w-full max-w-md">
          <TabsTrigger value="active" className="text-xs font-bold uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-[#0A192F]">
            Active Listings
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs font-bold uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-[#0A192F]">
            New Pending ({pendingProperties.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="text-xs font-bold uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-[#0A192F]">
            Requests ({ (pendingRequests?.edit_pending?.length || 0) + (pendingRequests?.delete_pending?.length || 0) })
          </TabsTrigger>
        </TabsList>

        {/* Active Properties Tab */}
        <TabsContent value="active" className="mt-8 space-y-6">
          <div className="relative group w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/25 z-10" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search listings..."
              className="pl-11 bg-white/[0.04] border-white/10 text-white rounded-2xl h-12 focus-visible:ring-amber-500/50 w-full"
            />
          </div>

          {isLoadingActive ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
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
                    {filtered.map((p: Property) => (
                      <tr key={p.property_id} className="group hover:bg-white/[0.025] transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#0D2137] border border-white/10 overflow-hidden shrink-0">
                              <img
                                src={p.media?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white line-clamp-1 italic">{p.title}</div>
                              <div className="flex items-center gap-1.5 mt-1 text-white/30 text-[10px]">
                                <MapPin className="w-3 h-3 text-amber-500/40" />
                                <span>{p.location?.city}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-base font-serif font-bold text-white">{formatPrice(p.price)}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5 text-white/40">
                            {p.property_type}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="text-sm text-white/60">{p.builder?.name || "Private Seller"}</div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 text-white/20 hover:text-white hover:bg-white/5 rounded-xl">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#0D2137] border border-white/10 text-white min-w-[180px] rounded-2xl p-2">
                              <DropdownMenuItem
                                onClick={() => setPreviewId(p.property_id)}
                                className="focus:bg-white/5 px-3 py-2.5 cursor-pointer rounded-xl text-xs gap-3 text-white/70"
                              >
                                <Eye className="w-4 h-4 text-amber-500" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/5 my-1" />
                              <DropdownMenuItem onClick={() => setPropertyToDelete(p)} className="focus:bg-red-500/10 text-red-400 px-3 py-2.5 cursor-pointer rounded-xl text-xs gap-3">
                                <Trash2 className="w-4 h-4" /> Delete Permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* New Pending Properties Tab */}
        <TabsContent value="pending" className="mt-8">
          {isLoadingPending ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" /></div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold">
                      <th className="px-8 py-5 text-left">Property</th>
                      <th className="px-8 py-5 text-left">Price</th>
                      <th className="px-8 py-5 text-left">Builder</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProperties.map((p: Property) => (
                      <tr key={p.property_id} className="hover:bg-white/[0.01]">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#0D2137] border border-white/10 overflow-hidden">
                              <img src={p.media?.[0]?.url} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white italic">{p.title}</p>
                              <p className="text-[10px] text-white/30 mt-1">{p.location?.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-base font-serif font-bold text-white">{formatPrice(p.price)}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm text-white/60">{p.builder?.name || "Unknown"}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => setPreviewId(p.property_id)} variant="outline" className="h-9 px-4 bg-white/5 text-white/60 border-white/10 rounded-xl text-[10px]">
                              <Eye className="w-3.5 h-3.5 mr-1.5" />View
                            </Button>
                            <Button onClick={() => approveMutation.mutate(p.property_id)} className="h-9 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 rounded-xl text-[10px]">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Approve
                            </Button>
                            <Button onClick={() => rejectMutation.mutate(p.property_id)} className="h-9 px-4 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 rounded-xl text-[10px]">
                              <XCircle className="w-3.5 h-3.5 mr-1.5" />Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Edit/Delete Requests Tab */}
        <TabsContent value="requests" className="mt-8">
          {isLoadingRequests ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" /></div>
          ) : (
            <div className="space-y-8">
              {/* Edit Requests */}
              {pendingRequests?.edit_pending?.length > 0 && (
                <div>
                  <h3 className="text-lg font-serif font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Requests ({pendingRequests.edit_pending.length})
                  </h3>
                  <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/[0.02] border-b border-white/5">
                        <tr className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold">
                          <th className="px-8 py-5 text-left">Property</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.edit_pending.map((p: Property) => (
                          <tr key={p.property_id} className="hover:bg-white/[0.01]">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#0D2137] border border-white/10 overflow-hidden">
                                  <img src={p.media?.[0]?.url} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">{p.title}</p>
                                  <p className="text-[10px] text-white/30">{p.location?.city}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <Button onClick={() => setPreviewId(p.property_id)} variant="outline" className="h-9 px-4 bg-white/5 text-white/60 border-white/10 rounded-xl text-[10px]">
                                  <Eye className="w-3.5 h-3.5 mr-1.5" />Review
                                </Button>
                                <Button onClick={() => approveEditMutation.mutate(p.property_id)} className="h-9 px-4 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 rounded-xl text-[10px]">
                                  <Check className="w-3.5 h-3.5 mr-1.5" />Approve Edit
                                </Button>
                                <Button onClick={() => rejectEditMutation.mutate(p.property_id)} className="h-9 px-4 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 rounded-xl text-[10px]">
                                  <XCircle className="w-3.5 h-3.5 mr-1.5" />Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Delete Requests */}
              {pendingRequests?.delete_pending?.length > 0 && (
                <div>
                  <h3 className="text-lg font-serif font-bold text-orange-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Delete Requests ({pendingRequests.delete_pending.length})
                  </h3>
                  <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-white/[0.02] border-b border-white/5">
                        <tr className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold">
                          <th className="px-8 py-5 text-left">Property</th>
                          <th className="px-8 py-5 text-left">Builder</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.delete_pending.map((p: Property) => (
                          <tr key={p.property_id} className="hover:bg-white/[0.01]">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#0D2137] border border-white/10 overflow-hidden">
                                  <img src={p.media?.[0]?.url} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">{p.title}</p>
                                  <p className="text-[10px] text-white/30">{p.location?.city}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-white/60 text-sm">{p.builder?.name}</td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <Button onClick={() => setPreviewId(p.property_id)} variant="outline" className="h-9 px-4 bg-white/5 text-white/60 border-white/10 rounded-xl text-[10px]">
                                  <Eye className="w-3.5 h-3.5 mr-1.5" />Review
                                </Button>
                                <Button onClick={() => rejectDeleteMutation.mutate(p.property_id)} className="h-9 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 rounded-xl text-[10px]">
                                  <Check className="w-3.5 h-3.5 mr-1.5" />Keep Property
                                </Button>
                                <Button onClick={() => approveDeleteMutation.mutate(p.property_id)} className="h-9 px-4 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 rounded-xl text-[10px]">
                                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(!pendingRequests?.edit_pending?.length && !pendingRequests?.delete_pending?.length) && (
                <div className="text-center py-20 text-white/30">No pending edit or delete requests.</div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!propertyToDelete} onOpenChange={() => setPropertyToDelete(null)}>
        <AlertDialogContent className="bg-[#0D2137] border border-white/10 text-white rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-serif">Permanently Delete Property?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-sm">
              This action cannot be undone. This will permanently delete <span className="text-amber-400">{propertyToDelete?.title}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(propertyToDelete?.property_id)} className="bg-red-500 hover:bg-red-600 rounded-xl">
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}