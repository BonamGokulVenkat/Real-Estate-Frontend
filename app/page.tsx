"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Users2, Loader2, MapPin, LocateFixed } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/hooks/useLocation";

// Components
import HeroSection from "@/components/common/HeroSection";
import PropertyCard from "@/components/common/PropertyCard";
import WhyChooseUs from "@/components/common/WhyChooseUs";
import AgencyCard from "@/components/common/AgencyCard";
import TestimonialsSection from "@/components/common/TestimonialsSection";
import NewsletterSection from "@/components/common/NewsletterSection";

// UI Components (Shadcn)
import { Button } from "@/components/ui/button";

// Services
import { propertyService, Property } from "@/services/propertyService";
import { userService, UserProfile } from "@/services/userService";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" }
} as const;

const RADIUS_KM = 250;

export default function Index() {
  const { city, latitude, longitude, isLoading: locationLoading } = useLocation();

  const hasCoords = latitude !== null && longitude !== null;

  // ── Featured Properties ────────────────────────────────────────────────────
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['properties', 'featured', latitude, longitude, city],
    enabled: !locationLoading,
    queryFn: async () => {
      if (hasCoords) {
        const nearby = await propertyService.search({
          lat: latitude,
          lng: longitude,
          radius_km: RADIUS_KM,
          limit: 8,
        });
        if (nearby && nearby.length > 0) return nearby;
      }
      if (city) {
        const localProps = await propertyService.search({ city, limit: 8 });
        if (localProps && localProps.length > 0) return localProps;
      }
      return propertyService.search({ limit: 8 });
    },
  });

  // ── Live Builders (agencies) ───────────────────────────────────────────────
  const { data: builders = [], isLoading: buildersLoading } = useQuery<UserProfile[]>({
    queryKey: ['builders'],
    queryFn: userService.getBuilders,
    staleTime: 5 * 60 * 1000,
  });

  const featured = properties || [];

  const locationLabel = hasCoords && city
    ? `Within ${RADIUS_KM} km of ${city}`
    : hasCoords
    ? `Within ${RADIUS_KM} km radius`
    : city
    ? `Curated for you in ${city}`
    : "Curated Collection";

  return (
    <div className="bg-[#0A192F] min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <HeroSection />

      {/* ── Featured Properties ── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            {...fadeInUp}
            className="flex flex-col items-center text-center mb-16 space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-amber-500/50" />
              <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase flex items-center gap-2">
                {hasCoords ? (
                  <LocateFixed className="w-3 h-3" />
                ) : city ? (
                  <MapPin className="w-3 h-3" />
                ) : null}
                {locationLabel}
              </span>
              <span className="h-[1px] w-8 bg-amber-500/50" />
            </div>

            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight leading-tight">
              Featured <span className="text-white/40 italic font-light">Properties</span>
            </h2>

            <Button
              asChild
              variant="outline"
              className="mt-6 rounded-xl border-white/10 bg-white/5 hover:bg-amber-500 hover:text-[#0A192F] transition-all px-6 h-11 group backdrop-blur-sm"
            >
              <Link href="/just-for-you" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
                Explore All Listings
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">Failed to load properties. Please try again later.</div>
          ) : featured.length === 0 ? (
            <div className="text-center text-white/40 py-20 font-light font-serif italic text-lg">No properties found in your area yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {featured.map((p, i) => (
                <PropertyCard key={p.property_id} property={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <div className="relative border-y border-white/5">
        <WhyChooseUs />
      </div>

      {/* ── Top Agencies Section ── */}
      <section className="py-24 lg:py-32 bg-[#081426]/50 relative border-y border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            {...fadeInUp}
            className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 space-y-5"
          >
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-amber-500/50" />
              <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">
                Trusted Partners
              </span>
              <span className="h-[1px] w-8 bg-amber-500/50" />
            </div>

            <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-white leading-tight">
              Market Leading <span className="text-white/40 italic font-light">Agencies</span>
            </h2>

            <p className="text-white/40 text-base md:text-lg font-light leading-relaxed max-w-2xl">
              Collaborating with the world&apos;s most prestigious firms to bring you exclusive, off-market luxury listings.
            </p>
          </motion.div>

          {/* Agency Grid — live builders */}
          {buildersLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
          ) : builders.length === 0 ? (
            <div className="text-center text-white/30 font-serif italic py-16">No agencies registered yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {builders.slice(0, 3).map((builder, i) => (
                <AgencyCard
                  key={builder.user_id || builder.id}
                  agency={{
                    id: builder.user_id || builder.id,
                    name: builder.name,
                    email: builder.email,
                    phone: builder.phone,
                    date_joined: builder.date_joined || builder.created_at,
                  }}
                  index={i}
                />
              ))}
            </div>
          )}

          <motion.div {...fadeInUp} className="mt-20 text-center">
            <Link
              href="/agencies"
              className="inline-flex items-center gap-4 text-white/30 hover:text-amber-400 font-bold uppercase tracking-[0.3em] text-[9px] transition-all group"
            >
              <Users2 className="w-4 h-4 transition-colors group-hover:text-amber-500" />
              <span>Discover all partner agencies</span>
              <div className="w-8 h-[1px] bg-white/10 group-hover:bg-amber-500 group-hover:w-16 transition-all duration-500" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials (dynamic from live builders) ── */}
      <TestimonialsSection builders={builders} />

      <div className="bg-gradient-to-b from-transparent to-black/20">
        <NewsletterSection />
      </div>

      {/* ── Final Call to Action ── */}
      <section className="py-24 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative rounded-[48px] p-12 md:p-28 text-center overflow-hidden border border-white/10 bg-[#0D2137]/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute inset-0 border border-amber-500/5 rounded-[inherit] pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] opacity-50" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-10"
              >
                <Sparkles className="w-8 h-8 text-amber-500" />
              </motion.div>

              <h2 className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 tracking-tighter leading-[0.9]">
                Ready to Find Your <br />
                <span className="bg-gradient-to-r from-amber-100 via-amber-500 to-orange-400 bg-clip-text text-transparent italic font-light py-2 inline-block">
                  Dream Home?
                </span>
              </h2>

              <p className="text-white/40 max-w-xl mx-auto mb-14 text-lg md:text-xl font-light leading-relaxed">
                Join our exclusive community of homeowners and experience a new standard of luxury living tailored to your legacy.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <Button
                  asChild
                  className="h-16 px-10 bg-amber-500 hover:bg-amber-400 text-[#0A192F] font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] active:scale-95"
                >
                  <Link href="/just-for-you">Browse Properties</Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold text-[10px] uppercase tracking-[0.3em] backdrop-blur-md transition-all active:scale-95"
                >
                  <Link href="/sell">List Property</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}