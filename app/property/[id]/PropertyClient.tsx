"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Heart,
  Star,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Printer,
  Sparkles,
  Loader2,
} from "lucide-react";

import PropertyCard from "@/components/common/PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { propertyService, Property } from "@/services/propertyService";

import { useAuthStore } from "@/store/useAuthStore";
import { favouriteService, FavoriteItem } from "@/services/favouriteService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";

export default function PropertyClient({
  id,
  initialData,
}: {
  id: string;
  initialData: Property | null;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ["property", id],
    queryFn: () => propertyService.getById(id),
    initialData: initialData ?? undefined,
  });

  const { data: relatedProps } = useQuery<Property[]>({
    queryKey: ["properties", "related", property?.property_type],
    queryFn: () =>
      propertyService.search({
        property_type: property?.property_type,
        limit: 3,
      }),
    enabled: !!property,
  });

  const { data: favorites } = useQuery<FavoriteItem[]>({
    queryKey: ["favorites"],
    queryFn: favouriteService.getFavorites,
    enabled: isAuthenticated,
  });

  const isFavorited = favorites?.some(
    (f) => f.property.property_id === property?.property_id
  );

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!property) throw new Error("No property");
      return isFavorited
        ? favouriteService.removeFavorite(property.property_id)
        : favouriteService.addFavorite(property.property_id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previous = queryClient.getQueryData(["favorites"]);

      queryClient.setQueryData(["favorites"], (old: any) => {
        if (!old || !property) return old;
        return isFavorited
          ? old.filter(
              (f: any) => f.property.property_id !== property.property_id
            )
          : [...old, { property: { property_id: property.property_id } }];
      });

      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["favorites"], context?.previous);
      toast.error("Failed to update favorites.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    toggleMutation.mutate();
  };

  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
      </div>
    );
  }

  if (error || !property) {
    return <div className="text-white text-center mt-20">Not Found</div>;
  }

  const images =
  property.media && property.media.length > 0
    ? property.media.map((m) => m.url).filter(Boolean)
    : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"];

    console.log("MEDIA FROM BACKEND:", property.media);
  const related = (relatedProps || []).filter(
    (p) => p.property_id !== property.property_id
  );
  const agency = property.builder ? {
    id: property.builder.user_id,
    name: property.builder.name,
    rating: 4.9,
  } : null;
 
    return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[1000px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* ── Navigation ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <Link href="/just-for-you" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-amber-500 transition-all">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Collection
          </Link>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              <Share2 className="w-4 h-4 text-amber-500" /> Share
            </button>
            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              <Printer className="w-4 h-4 text-amber-500" /> Print Brief
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-8 space-y-16">
            
            <section>
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[40px] overflow-hidden aspect-[16/9] mb-6 border border-white/10 shadow-2xl group"
              >
                <Image 
                  src={images[activeImg] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"} 
                  alt={property.title} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                  priority 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/60 via-transparent to-transparent" />
                
                <button 
                  onClick={handleFavoriteClick} 
                  className="absolute top-8 right-8 p-4 rounded-2xl bg-[#0A192F]/60 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all active:scale-90"
                >
                  <Heart className={`w-6 h-6 ${isFavorited ? "fill-amber-500 text-amber-500" : "text-white"}`} />
                </button>

                <div className="absolute bottom-8 left-8 flex items-center gap-3">
                  <Badge className="bg-amber-500 text-[#0A192F] font-bold px-4 py-1.5 rounded-lg border-none uppercase text-[10px] tracking-widest">
                    {activeImg + 1} / {images.length} Photos
                  </Badge>
                </div>
              </motion.div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImg(i)} 
                    className={`relative w-32 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${activeImg === i ? "border-amber-500 scale-95" : "border-white/5 opacity-40 hover:opacity-100"}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.4em]">Luxora Certified Estate</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter leading-none">{property.title}</h1>
              <p className="flex items-center gap-2 text-white/40 text-lg font-light italic font-serif">
                <MapPin className="w-5 h-5 text-amber-500" /> {property.location?.city}, {property.location?.state}
              </p>
            </section>

            <Separator className="bg-white/5" />

            <section className="max-w-3xl">
              <h2 className="font-serif text-3xl font-bold mb-8 italic text-white/80">The Narrative</h2>
              <div className="space-y-6 text-white/50 text-lg font-light leading-relaxed">
                <p>{property.description}</p>
                <p>
                  Listed in <span className="text-white font-medium">{new Date(property.date_added).getFullYear()}</span>, this 
                  <span className="text-white font-medium"> {property.size_sqft} sqft</span> sanctuary represents the peak of 
                  modern {property.property_type} architecture in {property.location?.city}.
                </p>
              </div>
            </section>

            {/* Specifications Grid */}
            <section className="bg-white/[0.02] border border-white/10 rounded-[40px] p-10">
              <h2 className="font-serif text-2xl font-bold mb-12 uppercase tracking-widest text-amber-500/80">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                {[
                  { label: "Architecture", value: property.property_type },
                  { label: "Status", value: property.status },
                  { label: "Listed", value: new Date(property.date_added).getFullYear().toString() },
                  { label: "Configuration", value: `${property.bedrooms} Bedrooms` },
                  { label: "Land Area", value: `${property.size_sqft} Sq.Ft` },
                  { label: "Reference", value: `LX-${property.property_id.slice(0, 8).toUpperCase()}` }
                ].map((spec) => (
                  <div key={spec.label} className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">{spec.label}</p>
                    <p className="text-lg font-serif font-bold text-white/80 capitalize">{spec.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="font-serif text-3xl font-bold mb-10 italic text-white/80">Estate Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.features?.map((item) => (
                  <div key={item} className="flex items-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-amber-500/40 transition-all">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest group-hover:text-white">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN: CONCIERGE ── */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="mb-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-2">Acquisition Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-serif font-bold text-amber-500 tracking-tight">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  {[
                    { icon: Bed, val: property.bedrooms, label: "Beds" },
                    { icon: Bath, val: property.bathrooms, label: "Baths" },
                    { icon: Maximize, val: property.size_sqft, label: "Sqft" }
                  ].map((stat, i) => (
                    <div key={i} className="text-center py-4 rounded-2xl bg-white/5 border border-white/5">
                      <stat.icon className="w-4 h-4 mx-auto mb-2 text-amber-500" />
                      <p className="text-[14px] font-serif font-bold text-white mb-0.5">{stat.val}</p>
                      <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Button className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-[#0A192F] rounded-2xl font-bold uppercase tracking-widest text-xs">
                    Arrange Private Tour
                  </Button>
                  <Button variant="outline" className="w-full h-16 bg-transparent border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/5">
                    Request Prospectus
                  </Button>
                </div>
              </div>

              {agency && (
                <div className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5 space-y-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Exclusive Representation</p>
                  <Link href={`/agencies/${agency.id}`} className="flex items-center gap-5 group">
                    <div className="w-16 h-16 bg-[#0D2137] border border-white/10 rounded-2xl flex items-center justify-center font-serif font-bold text-2xl text-white group-hover:border-amber-500 transition-all">
                      {agency.name[0]}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white group-hover:text-amber-500 transition-colors">{agency.name}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">
                        <Star className="w-3 h-3 fill-amber-500" /> {agency.rating} Rating
                      </div>
                    </div>
                  </Link>
                  <Separator className="bg-white/5" />
                  <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 tracking-widest uppercase">
                    <ShieldCheck className="w-4 h-4 text-blue-500/50" /> Luxora Certified Firm
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        <section className="mt-40">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 text-center md:text-left">
            <div>
              <p className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Discover More</p>
              <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-none">Similar <span className="text-white/40 italic font-light">Estates</span></h2>
            </div>
            <Link href="/just-for-you" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-amber-500 transition-colors border-b border-white/10 pb-2">
              Explore Collection
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {related.map((p, i) => (
              <PropertyCard key={p.property_id} property={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}