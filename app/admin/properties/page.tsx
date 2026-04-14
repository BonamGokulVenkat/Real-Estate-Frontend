/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Bed,
  Bath,
  Maximize,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Star,
  Building,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
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

// ─────────────────────────────────────────────────────────────────────────────
// Property Preview Modal
// ─────────────────────────────────────────────────────────────────────────────
function PropertyPreviewModal({
  propertyId,
  onClose,
  onApprove,
  onReject,
  isPending: isActionPending,
}: {
  propertyId: string;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isPending?: boolean;
}) {
  const [activeImg, setActiveImg] = useState(0);
  const { formatPrice } = useCurrency();

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ["property-preview", propertyId],
    queryFn: () => propertyService.getById(propertyId),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#0A192F]/95 backdrop-blur-2xl flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#0A192F]/95 backdrop-blur-2xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Failed to load property details.</p>
          <Button onClick={onClose} variant="outline" className="border-white/10 text-white hover:bg-white/5">
            Close
          </Button>
        </div>
      </div>
    );
  }

  const mediaItems: { url: string; type: "image" | "video" }[] =
    property.media && property.media.length > 0
      ? property.media
        .filter((m) => m.url)
        .map((m) => ({
          url: m.url,
          type: (m.media_type?.startsWith("video") ? "video" : "image") as "image" | "video",
        }))
      : [{ url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80", type: "image" }];

  const activeItem = mediaItems[activeImg];
  const prev = () => setActiveImg((i) => (i - 1 + mediaItems.length) % mediaItems.length);
  const next = () => setActiveImg((i) => (i + 1) % mediaItems.length);

  const isPendingStatus = property.status === "pending";

  return (
    <div className="fixed inset-0 z-[999] bg-[#020D18]/90 backdrop-blur-2xl overflow-y-auto">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-[#020D18]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500/60">Admin Preview</p>
            <h2 className="text-sm font-semibold text-white line-clamp-1 italic">{property.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border-none ${property.status === "pending"
                ? "bg-amber-500/10 text-amber-400"
                : property.status === "available"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
          >
            {property.status}
          </Badge>

          {isPendingStatus && onApprove && onReject && (
            <>
              <Button
                onClick={() => onReject(property.property_id)}
                disabled={isActionPending}
                className="h-9 px-4 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                {isActionPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><XCircle className="w-3.5 h-3.5 mr-1.5" />Reject</>}
              </Button>
              <Button
                onClick={() => onApprove(property.property_id)}
                disabled={isActionPending}
                className="h-9 px-5 bg-emerald-500 hover:bg-emerald-400 text-white border-none rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
              >
                {isActionPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Approve</>}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Media Gallery ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
          {/* Main viewer */}
          <div className="lg:col-span-8 relative rounded-[32px] overflow-hidden aspect-[16/9] border border-white/10 shadow-2xl group bg-[#0D2137]">
            {activeItem?.type === "video" ? (
              <video
                key={activeItem.url}
                src={activeItem.url}
                controls
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={activeItem?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/50 via-transparent to-transparent pointer-events-none" />

            {mediaItems.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-black/60 transition-all z-10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-black/60 transition-all z-10">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-4 z-10">
              <Badge className="bg-amber-500 text-[#0A192F] font-bold px-3 py-1 rounded-lg border-none text-[10px] tracking-widest uppercase">
                {activeImg + 1} / {mediaItems.length} {activeItem?.type === "video" ? "Video" : "Photo"}
              </Badge>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="lg:col-span-4 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[360px] pb-2 lg:pb-0 pr-0 lg:pr-2">
            {mediaItems.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative shrink-0 rounded-2xl overflow-hidden border-2 transition-all bg-[#0D2137] ${activeImg === i
                    ? "border-amber-500 shadow-lg shadow-amber-500/10"
                    : "border-white/5 opacity-50 hover:opacity-100"
                  }`}
                style={{ width: "100%", aspectRatio: "16/9", minWidth: "140px" }}
              >
                {item.type === "video" ? (
                  <>
                    <video src={item.url} className="absolute inset-0 w-full h-full object-cover" muted playsInline preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <PlayCircle className="w-7 h-7 text-amber-500 drop-shadow-lg" />
                    </div>
                  </>
                ) : (
                  <Image src={item.url} alt="" fill className="object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Two-column content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: details */}
          <div className="lg:col-span-8 space-y-10">

            {/* Title block */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.4em]">Submitted for Review</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-none">{property.title}</h1>
              <p className="flex items-center gap-2 text-white/40 text-base font-light italic font-serif">
                <MapPin className="w-4 h-4 text-amber-500" />
                {property.location?.address && `${property.location.address}, `}
                {property.location?.city}, {property.location?.state}
              </p>
            </div>

            {/* Specs grid */}
            <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8">
              <h3 className="font-serif text-lg font-bold mb-8 uppercase tracking-widest text-amber-500/80">Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {[
                  { label: "Type", value: property.property_type },
                  { label: "Status", value: property.status },
                  { label: "Bedrooms", value: `${property.bedrooms} BHK` },
                  { label: "Bathrooms", value: `${property.bathrooms}` },
                  { label: "Area", value: `${property.size_sqft} Sq.Ft` },
                  { label: "Listed", value: new Date(property.date_added).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                ].map((s) => (
                  <div key={s.label} className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/20">{s.label}</p>
                    <p className="text-base font-serif font-bold text-white/80 capitalize">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold italic text-white/80">Description</h3>
              <p className="text-white/50 text-base font-light leading-relaxed">{property.description}</p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="space-y-5">
                <h3 className="font-serif text-2xl font-bold italic text-white/80">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((f) => (
                    <div key={f} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-amber-500/30 transition-all">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: price + builder */}
          <div className="lg:col-span-4 space-y-6">
            {/* Price card */}
            <div className="bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-3xl -mr-14 -mt-14" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-2">Listing Price</p>
              <p className="text-4xl font-serif font-bold text-amber-500 tracking-tight mb-8">
                {formatPrice(property.price)}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Bed, val: property.bedrooms, label: "Beds" },
                  { icon: Bath, val: property.bathrooms, label: "Baths" },
                  { icon: Maximize, val: property.size_sqft, label: "Sqft" },
                ].map((stat, i) => (
                  <div key={i} className="text-center py-4 rounded-2xl bg-white/5 border border-white/5">
                    <stat.icon className="w-4 h-4 mx-auto mb-2 text-amber-500" />
                    <p className="text-sm font-serif font-bold text-white mb-0.5">{stat.val}</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Builder card */}
            {property.builder && (
              <div className="bg-white/[0.02] p-7 rounded-[32px] border border-white/5 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-3.5 h-3.5 text-blue-400/60" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Builder / Seller</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#0D2137] border border-white/10 rounded-2xl flex items-center justify-center font-serif font-bold text-xl text-white">
                    {property.builder.name?.[0] ?? "B"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-bold text-white">{property.builder.name}</h3>
                    <p className="text-[10px] text-white/30 truncate mt-0.5">{property.builder.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/25 tracking-widest uppercase">
                  <ShieldCheck className="w-4 h-4 text-blue-400/40" />
                  Registered Builder
                </div>
              </div>
            )}

            {/* Location coords (if available) */}
            {property.location?.lat && property.location?.lng && (
              <div className="bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 mb-3">Coordinates</p>
                <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                  <MapPin className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
                  {Number(property.location.lat).toFixed(5)}, {Number(property.location.lng).toFixed(5)}
                </div>
              </div>
            )}

            {/* Action buttons (sticky at bottom for pending) */}
            {isPendingStatus && onApprove && onReject && (
              <div className="space-y-3 pt-2">
                <Button
                  onClick={() => onApprove(property.property_id)}
                  disabled={isActionPending}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-white border-none rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {isActionPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" />Approve Listing</>}
                </Button>
                <Button
                  onClick={() => onReject(property.property_id)}
                  disabled={isActionPending}
                  className="w-full h-14 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all"
                >
                  {isActionPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-2" />Reject Listing</>}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ManageProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyToDelete, setPropertyToDelete] = useState<any>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();

  // --- Queries ---
  const { data: properties, isLoading: isLoadingActive } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => propertyService.search({}),
  });

  const { data: pendingProperties, isLoading: isLoadingPending } = useQuery({
    queryKey: ["pending-properties"],
    queryFn: propertyService.getPending,
  });

  // --- Mutations ---
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

  const approveMutation = useMutation({
    mutationFn: propertyService.approve,
    onSuccess: () => {
      toast.success("Property Approved ✓");
      queryClient.invalidateQueries({ queryKey: ["pending-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setPreviewId(null);
    },
    onError: () => toast.error("Failed to approve property."),
  });

  const rejectMutation = useMutation({
    mutationFn: propertyService.reject,
    onSuccess: () => {
      toast.success("Property Rejected");
      queryClient.invalidateQueries({ queryKey: ["pending-properties"] });
      setPreviewId(null);
    },
    onError: () => toast.error("Failed to reject property."),
  });

  const isActionPending = approveMutation.isPending || rejectMutation.isPending;

  // --- Logic ---
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
    <>
      {/* ── Property Preview Modal ── */}
      {previewId && (
        <PropertyPreviewModal
          propertyId={previewId}
          onClose={() => setPreviewId(null)}
          onApprove={(id) => approveMutation.mutate(id)}
          onReject={(id) => rejectMutation.mutate(id)}
          isPending={isActionPending}
        />
      )}

      <div className="space-y-16 pb-20">
        {/* ── SECTION: ACTIVE PROPERTIES ── */}
        <section className="space-y-10">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="h-px w-8 bg-amber-500/50" />
                <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">Inventory Control</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
                Estate <span className="text-white/30 italic font-light">Holdings</span>
              </h1>
              {!isLoadingActive && (
                <p className="text-white/30 text-sm mt-2 font-light">
                  {(properties || []).length} total listings
                </p>
              )}
            </div>

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

          {isLoadingActive ? (
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
                                    src={p.media?.[0]?.media_url || p.media?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"}
                                    alt={p.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1 italic">{p.title}</div>
                                  <div className="flex items-center gap-1.5 mt-1 text-white/30 text-[10px] font-medium uppercase tracking-wider">
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
                              {p.builder?.email && <div className="text-xs text-white/25 mt-0.5 truncate max-w-[160px]">{p.builder.email}</div>}
                            </td>
                            <td className="px-8 py-5 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-9 w-9 p-0 text-white/20 hover:text-white hover:bg-white/5 rounded-xl">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#0D2137] border border-white/10 text-white min-w-[180px] rounded-2xl p-2 shadow-2xl">
                                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-white/25 px-3 py-2">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => setPreviewId(p.property_id || p.id)}
                                    className="focus:bg-white/5 px-3 py-2.5 cursor-pointer rounded-xl text-xs font-medium gap-3 text-white/70"
                                  >
                                    <Eye className="w-4 h-4 text-amber-500" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                                  <DropdownMenuItem onClick={() => setPropertyToDelete(p)} className="focus:bg-red-500/10 text-red-400 px-3 py-2.5 cursor-pointer rounded-xl text-xs font-medium gap-3">
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
                        <td colSpan={4} className="px-8 py-24 text-center text-white/20 text-sm">No properties found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── SECTION: PENDING PROPERTIES ── */}
        <section className="space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="h-px w-8 bg-blue-500/50" />
              <span className="text-blue-400 text-[10px] font-bold tracking-[0.4em] uppercase">Approval Queue</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              Pending <span className="text-white/30 italic font-light">Submissions</span>
            </h2>
            {!isLoadingPending && (
              <p className="text-white/30 text-sm mt-2 font-light">
                {(pendingProperties || []).length} awaiting review
              </p>
            )}
          </div>

          {isLoadingPending ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-bold">
                      <th className="px-8 py-5 text-left">Property Submission</th>
                      <th className="px-8 py-5 text-left">Price Request</th>
                      <th className="px-8 py-5 text-left">Builder</th>
                      <th className="px-8 py-5 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {(pendingProperties ?? []).length > 0 ? (
                      (pendingProperties ?? []).map((p: any) => (
                        <tr key={p.property_id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#0D2137] border border-white/10 overflow-hidden shrink-0">
                                {p.media?.[0]?.url || p.media?.[0]?.media_url ? (
                                  <img
                                    src={p.media?.[0]?.url || p.media?.[0]?.media_url}
                                    alt={p.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-400/50" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white italic">{p.title}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-amber-500/40" />
                                  {p.location?.city}{p.location?.state ? `, ${p.location.state}` : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-base font-serif font-bold text-white">{formatPrice(p.price)}</p>
                            <p className="text-[10px] text-blue-400/60 font-bold uppercase mt-0.5 tracking-tighter">{p.property_type}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm text-white/60 font-medium">{p.builder?.name || "Unknown"}</div>
                            {p.builder?.email && <div className="text-xs text-white/25 mt-0.5 truncate max-w-[160px]">{p.builder.email}</div>}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-end gap-2 flex-wrap">
                              {/* ── View Details button */}
                              <Button
                                onClick={() => setPreviewId(p.property_id)}
                                variant="outline"
                                className="h-9 px-4 bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1.5" />View
                              </Button>
                              <Button
                                onClick={() => approveMutation.mutate(p.property_id)}
                                disabled={approveMutation.isPending}
                                className="h-9 px-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                              >
                                {approveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Approve</>}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => rejectMutation.mutate(p.property_id)}
                                disabled={rejectMutation.isPending}
                                className="h-9 px-4 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                              >
                                {rejectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><XCircle className="w-3.5 h-3.5 mr-1.5" />Reject</>}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-16 text-center">
                          <p className="text-sm text-white/20 font-light italic">Queue is currently empty.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── Delete Confirmation Dialog ── */}
        <AlertDialog open={!!propertyToDelete} onOpenChange={() => setPropertyToDelete(null)}>
          <AlertDialogContent className="bg-[#0D2137] border border-white/10 text-white rounded-3xl max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-serif">Remove Listing?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/50 text-sm leading-relaxed">
                This will permanently remove <span className="text-amber-400 font-semibold">{propertyToDelete?.title}</span> from the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-2">
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-11 flex-1">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(propertyToDelete?.property_id || propertyToDelete?.id)}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white border-none rounded-xl px-6 h-11 font-bold flex-1 disabled:opacity-60"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Remove Listing"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}