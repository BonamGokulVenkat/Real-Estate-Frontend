"use client";

import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize, MapPin, ArrowUpRight, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Property } from "@/services/propertyService"; 
import { useAuthStore } from "@/store/useAuthStore";
import { favouriteService } from "@/services/favouriteService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";

export default function PropertyCard({ property, index }: { property: Property; index: number }) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { formatPrice } = useCurrency();

  // Fetch favorites (deduped by React Query)
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: favouriteService.getFavorites,
    enabled: isAuthenticated,
  });

  const isFavorited = favorites?.some(f => f.property.property_id === property.property_id);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        return favouriteService.removeFavorite(property.property_id);
      } else {
        return favouriteService.addFavorite(property.property_id);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previousFavorites = queryClient.getQueryData(['favorites']);
      
      // Optimistic update
      queryClient.setQueryData(['favorites'], (old: any) => {
        if (!old) return old;
        if (isFavorited) {
          return old.filter((f: any) => f.property.property_id !== property.property_id);
        } else {
          return [...old, { property: { property_id: property.property_id } }];
        }
      });
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['favorites'], context?.previousFavorites);
      toast.error("Failed to update favorites.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to save properties.");
      router.push("/login");
      return;
    }
    toggleMutation.mutate();
  };

  const FALLBACK = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80';
  const firstImage = property.media?.find(
    (m) => !m.media_type?.startsWith('video')
  );
  const imageUrl = firstImage?.url || firstImage?.media_url || FALLBACK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group h-full"
    >
      <Link href={`/property/${property.property_id}`} className="block h-full">
        <div className="relative h-full bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden transition-all duration-500 hover:bg-white/[0.05] hover:border-amber-500/30 group-hover:-translate-y-1.5 shadow-2xl flex flex-col">
          
          <div className="absolute inset-0 border border-amber-500/0 group-hover:border-amber-500/10 rounded-[24px] pointer-events-none transition-colors duration-500" />

          {/* Image Section */}
          <div className="relative aspect-[16/11] overflow-hidden shrink-0">
            <Image 
              src={imageUrl} 
              alt={property.title} 
              fill 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-transparent opacity-90" />
            
            {/* Heart Button */}
            <button 
              onClick={handleFavoriteClick}
              disabled={toggleMutation.isPending}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/40 transition-all z-10 active:scale-95"
            >
              {toggleMutation.isPending ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Heart className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-amber-500 text-amber-500' : 'text-white hover:text-amber-500'}`} />
              )}
            </button>

            <div className="absolute bottom-4 left-5">
               <p className="text-white font-serif text-xl font-bold tracking-tight">
                {formatPrice(property.price)}
              </p>
            </div>
          </div>

          <div className="p-6 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {property.title}
              </h3>
              <div className="p-1.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-amber-500 transition-all shrink-0 ml-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:text-[#0A192F]" />
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-white/30 text-[11px] mb-6 font-light flex-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500/60 shrink-0" /> <span className="line-clamp-1">{property.location?.city || "Unknown Location"}</span>
            </p>

            {/* Features Row */}
            <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-auto">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Bed className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">{property.bedrooms}</span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-bold">Beds</span>
              </div>
              
              <div className="h-8 w-px bg-white/10" />

              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Bath className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">{property.bathrooms}</span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-bold">Baths</span>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Maximize className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">{property.size_sqft}</span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-bold">Sq.Ft</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}