"use client";

import { motion } from "framer-motion";
import {
  Heart, Home, Edit, ShieldCheck, Loader2, ArrowUpRight,
  Phone, Mail, Building2, Sparkles, MapPin, Star
} from "lucide-react";
import PropertyCard from "@/components/common/PropertyCard";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { favouriteService } from "@/services/favouriteService";
import { propertyService } from "@/services/propertyService";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import EditProfileModal from "@/components/common/EditProfileModel";
import Link from "next/link";

export default function Profile() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: favorites, isLoading: loadingFavs } = useQuery({
    queryKey: ["favorites"],
    queryFn: favouriteService.getFavorites,
    enabled: isAuthenticated && !!user,
  });

  const { data: myProperties, isLoading: loadingProps } = useQuery({
    queryKey: ["properties", "my-listings", user?.user_id],
    queryFn: () => propertyService.search({ builder: user?.user_id }),
    enabled: isAuthenticated && user?.role === "builder",
  });

  const { formatPrice, getConvertedPrice } = useCurrency();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pt-32 flex justify-center bg-[#0A192F]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  const saved = favorites?.map((f) => f.property) || [];
  const listed = myProperties || [];
  const totalValue = listed.reduce(
    (sum, p) => sum + getConvertedPrice(p.price),
    0
  );
  const experienceYears = new Date().getFullYear() - new Date(user.date_joined ?? new Date()).getFullYear();

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#0A192F] text-white selection:bg-amber-500/30">
      {/* Atmospheric glow */}
      <div className="absolute top-0 left-0 w-full h-[700px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">

        {/* ── Hero Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative bg-white/[0.03] backdrop-blur-3xl rounded-[40px] border border-white/10 shadow-2xl mb-8 overflow-hidden"
        >
          {/* Subtle corner glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="p-8 lg:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-[28px] overflow-hidden border-2 border-white/10 bg-[#0D2137] flex items-center justify-center shadow-2xl">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif font-bold text-4xl text-amber-500">{initials}</span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-500 p-1.5 rounded-xl shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-[#0A192F]" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight text-white">
                    {user.name}
                  </h1>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-bold uppercase tracking-[0.3em] rounded-full">
                      {user.role}
                    </span>
                    {user.role === "builder" && (
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-[0.3em] rounded-full flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-emerald-400" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact row */}
                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mb-4">
                  <span className="flex items-center gap-2 text-white/40 text-sm">
                    <Mail className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-2 text-white/40 text-sm">
                      <Phone className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
                      {user.phone}
                    </span>
                  )}
                  {user.role === "builder" && user.company_name && (
                    <span className="flex items-center gap-2 text-white/40 text-sm">
                      <Building2 className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
                      {user.company_name}
                    </span>
                  )}
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-white/50 text-sm font-light leading-relaxed max-w-lg mb-4 italic font-serif">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                )}

                {/* Specializations */}
                {user.role === "builder" && user.specializations && user.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.specializations.map((s) => (
                      <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit button */}
              <div className="shrink-0">
                <Button
                  onClick={() => setIsEditOpen(true)}
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/40 rounded-2xl gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-amber-400 transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Builder Agency Link ── */}
        {user.role === "builder" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Link
              href={`/agencies/${user.user_id}`}
              className="group flex items-center justify-between bg-amber-500/[0.05] border border-amber-500/20 rounded-[24px] px-7 py-5 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">View Your Public Agency Profile</p>
                  <p className="text-white/30 text-xs">See how clients view your listings and profile</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-amber-500/60 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          </motion.div>
        )}

        {/* ── Stats Bento ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`grid gap-6 mb-12 ${user.role === "builder" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}
        >
          {/* Saved */}
          <div className="bg-white/[0.02] border border-white/10 rounded-[28px] p-7 text-center group hover:border-amber-500/30 transition-all duration-500">
            <div className="w-11 h-11 bg-[#0D2137] rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-amber-500" />
            </div>
            <div className="font-serif text-3xl font-bold text-white mb-1 tabular-nums">
              {loadingFavs ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-500" /> : saved.length}
            </div>
            <div className="text-[9px] uppercase font-bold tracking-[0.25em] text-white/20">Saved Estates</div>
          </div>

          {/* Builder stats */}
          {user.role === "builder" && (
            <>
              <div className="bg-white/[0.02] border border-white/10 rounded-[28px] p-7 text-center group hover:border-amber-500/30 transition-all duration-500">
                <div className="w-11 h-11 bg-[#0D2137] rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform">
                  <Home className="w-5 h-5 text-amber-500" />
                </div>
                <div className="font-serif text-3xl font-bold text-white mb-1 tabular-nums">
                  {loadingProps ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-500" /> : listed.length}
                </div>
                <div className="text-[9px] uppercase font-bold tracking-[0.25em] text-white/20">Your Listings</div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-[28px] p-7 text-center group hover:border-amber-500/30 transition-all duration-500">
                <div className="w-11 h-11 bg-[#0D2137] rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div className="font-serif text-3xl font-bold text-white mb-1 tabular-nums">
                  {loadingProps ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-amber-500" /> : formatPrice(totalValue)}
                </div>
                <div className="text-[9px] uppercase font-bold tracking-[0.25em] text-white/20">Portfolio Value</div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-[28px] p-7 text-center group hover:border-amber-500/30 transition-all duration-500">
                <div className="w-11 h-11 bg-[#0D2137] rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                </div>
                <div className="font-serif text-3xl font-bold text-white mb-1 tabular-nums">
                  {experienceYears > 0 ? `${experienceYears}y` : "<1y"}
                </div>
                <div className="text-[9px] uppercase font-bold tracking-[0.25em] text-white/20">Experience</div>
              </div>
            </>
          )}
        </motion.div>

        {/* ── Saved Properties ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500/60 mb-1">Collection</p>
              <h2 className="font-serif text-3xl font-bold text-white/80">Saved Estates</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              {saved.length} properties
            </span>
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
            <div className="py-24 text-center bg-white/[0.01] rounded-[40px] border border-dashed border-white/10">
              <Heart className="w-10 h-10 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 font-serif italic text-lg">Your curated collection is empty.</p>
              <p className="text-white/20 text-sm mt-2">Browse properties and save the ones you love.</p>
            </div>
          )}
        </motion.section>

        {/* ── Builder Listings ── */}
        {user.role === "builder" && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-20"
          >
            <div className="flex items-end justify-between mb-10 border-b border-white/5 pb-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-500/60 mb-1">Portfolio</p>
                <h2 className="font-serif text-3xl font-bold text-white/80">Your Listings</h2>
              </div>
              <Link
                href="/sell"
                className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 hover:text-amber-500 transition-colors flex items-center gap-1"
              >
                + Add New
              </Link>
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
              <div className="py-24 text-center bg-white/[0.01] rounded-[40px] border border-dashed border-white/10">
                <Home className="w-10 h-10 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 font-serif italic text-lg">No listings yet.</p>
                <Link href="/sell">
                  <Button className="mt-6 bg-amber-500 hover:bg-amber-400 text-[#0A192F] rounded-xl font-bold text-[10px] uppercase tracking-widest h-11 px-8">
                    List Your First Property
                  </Button>
                </Link>
              </div>
            )}
          </motion.section>
        )}
      </div>

      {/* Edit modal */}
      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
}