"use client";

import { motion } from "framer-motion";
import { User, Heart, Home, FileText, Edit, ShieldCheck, ArrowUpRight, Loader2 } from "lucide-react";
import { transactions } from "@/data/dummyData";
import PropertyCard from "@/components/common/PropertyCard";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { favouriteService } from "@/services/favouriteService";
import { propertyService } from "@/services/propertyService";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrency } from "@/hooks/useCurrency";

export default function Profile() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data: favorites, isLoading: loadingFavs } = useQuery({
    queryKey: ['favorites'],
    queryFn: favouriteService.getFavorites,
    enabled: isAuthenticated && !!user,
  });

  const { data: myProperties, isLoading: loadingProps } = useQuery({
    queryKey: ['properties', 'my-listings'],
    queryFn: () => propertyService.search({ builder: user?.id }),
    enabled: isAuthenticated && user?.role === "builder",
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-[#0A192F]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  const saved = favorites?.map(f => f.property) || [];
  const listed = myProperties || [];
  const userTransactions = transactions.filter((t) => t.buyerId === user.id); // Placeholder

  const { formatPrice } = useCurrency();

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        
        {/* --- Profile Header --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white/[0.03] backdrop-blur-3xl rounded-[40px] p-8 lg:p-12 border border-white/10 shadow-2xl mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[32px] bg-[#0D2137] border border-white/10 flex items-center justify-center text-4xl font-serif font-bold text-amber-500 shadow-2xl">
                {user.name && user.name.length > 0 ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 p-2 rounded-xl shadow-lg">
                <ShieldCheck className="w-4 h-4 text-[#0A192F]" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight text-white">{user.name}</h1>
              <p className="text-white/40 text-lg font-light italic font-serif">
                {user.email} {user.phone && <span className="mx-2 opacity-20">| {user.phone}</span>}
              </p>
              <div className="pt-2">
                <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full">
                  {user.role} Member
                </span>
              </div>
            </div>

            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl gap-3 text-[10px] font-bold uppercase tracking-widest text-white/60">
              <Edit className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* --- Bento Stats --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 text-center group hover:border-amber-500/30 transition-all duration-500">
            <div className="w-12 h-12 bg-[#0D2137] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-amber-500" />
            </div>
            <div className="font-serif text-3xl font-bold text-white mb-1">
              {loadingFavs ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" /> : saved.length}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20">Saved Estates</div>
          </div>
          
          {user.role === "builder" && (
            <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 text-center group hover:border-amber-500/30 transition-all duration-500">
              <div className="w-12 h-12 bg-[#0D2137] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5 text-amber-500" />
              </div>
              <div className="font-serif text-3xl font-bold text-white mb-1">
                {loadingProps ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" /> : listed.length}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20">Your Listings</div>
            </div>
          )}

          <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 text-center group hover:border-amber-500/30 transition-all duration-500">
            <div className="w-12 h-12 bg-[#0D2137] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div className="font-serif text-3xl font-bold text-white mb-1">{userTransactions.length}</div>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20">Transactions</div>
          </div>
        </div>

        {/* --- Saved Properties --- */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
            <h2 className="font-serif text-3xl font-bold italic text-white/80">Saved Estates</h2>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Curation</div>
          </div>
          
          {loadingFavs ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : saved.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {saved.map((p: any, i: number) => (
                <PropertyCard key={p.property_id} property={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white/[0.01] rounded-[40px] border border-dashed border-white/10">
              <Heart className="w-10 h-10 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 font-serif italic text-lg">Your curated collection is empty.</p>
            </div>
          )}
        </section>

        {/* --- Builder Properties --- */}
        {user.role === "builder" && (
          <section className="mb-20">
            <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
              <h2 className="font-serif text-3xl font-bold italic text-white/80">Your Listings</h2>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Portfolio</div>
            </div>
            
            {loadingProps ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : listed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listed.map((p: any, i: number) => (
                  <PropertyCard key={p.property_id} property={p} index={i} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white/[0.01] rounded-[40px] border border-dashed border-white/10">
                <Home className="w-10 h-10 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 font-serif italic text-lg">You haven't listed any properties yet.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}