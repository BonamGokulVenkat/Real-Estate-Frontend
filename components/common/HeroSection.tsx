"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Search, MapPin, ArrowRight, Home, Users, Building2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { propertyService } from "@/services/propertyService";

const PROPERTY_TYPES = [
  { label: "Villa", value: "villa" },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Land", value: "land" },
  { label: "Commercial", value: "commercial" },
] as const;

export default function HeroSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const heroRef = useRef<HTMLDivElement>(null);

  // Pre-fill from URL params if coming back from search
  const [location, setLocation] = useState<string>(searchParams.get("city") || "");
  const [propertyType, setPropertyType] = useState<string>(searchParams.get("type") || "");

  // ── Live cities from DB ─────────────────────────────────────────────────────
  const { data: cities = [] } = useQuery<string[]>({
    queryKey: ["property-cities"],
    queryFn: propertyService.getCities,
    staleTime: 5 * 60 * 1000,
  });

  // ── Live platform stats ─────────────────────────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ["property-stats"],
    queryFn: propertyService.getStats,
    staleTime: 10 * 60 * 1000,
  });

  const dynamicStats = [
    {
      icon: Home,
      value: stats ? `${stats.totalProperties}+` : "—",
      label: "Premium Properties",
    },
    {
      icon: Users,
      value: stats ? `${stats.totalCities}+` : "—",
      label: "Cities Covered",
    },
    {
      icon: Building2,
      value: "100%",
      label: "Verified Listings",
    },
  ];

  // ── Parallax ────────────────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const bgY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(smoothProgress, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(smoothProgress, [0, 0.7], [1, 0]);

  // ── Search handler ──────────────────────────────────────────────────────────
  const handleSearch = () => {
    const query = new URLSearchParams();
    if (location) query.set("city", location);
    if (propertyType) query.set("type", propertyType);
    router.push(`/just-for-you${query.toString() ? `?${query.toString()}` : ""}`);
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A192F] selection:bg-amber-500/30"
    >
      {/* ── Background ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Luxury property"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/80 via-[#0A192F]/40 to-[#0A192F]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F]/70 via-transparent to-[#0A192F]/30" />
      </motion.div>

      {/* ── Lighting ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Grid Pattern ── */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
      />

      {/* ── Main Content ── */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight mb-8"
          >
            Discover Newly <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Luxury Homes
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-12 font-light"
          >
            Where Elegance Meets Modern Living
          </motion.p>

          {/* ── Search Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />

            <div className="relative bg-[#0A192F]/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <div className="flex flex-col md:flex-row items-stretch gap-2">

                {/* City Selector */}
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-xl focus-within:border-amber-500/50 transition-all">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="border-0 bg-transparent text-white focus:ring-0 shadow-none h-10 px-0 font-light">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D2137] border-white/10 text-white">
                      {cities.map((city) => (
                        <SelectItem key={city} value={city} className="focus:bg-amber-500/20 focus:text-amber-400">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {location && (
                    <button
                      onClick={() => setLocation("")}
                      className="text-white/30 hover:text-white/70 text-xs ml-auto shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <Separator orientation="vertical" className="hidden md:block bg-white/10 h-10 self-center" />

                {/* Property Type Selector */}
                <div className="flex-1 flex items-center gap-3 px-4 py-1 bg-white/5 border border-white/5 rounded-xl transition-all">
                  <Search className="w-4 h-4 text-amber-500 shrink-0" />
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="border-0 bg-transparent text-white focus:ring-0 shadow-none h-10 px-0 font-light">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D2137] border-white/10 text-white">
                      {PROPERTY_TYPES.map(({ label, value }) => (
                        <SelectItem key={value} value={value} className="focus:bg-amber-500/20 focus:text-amber-400">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {propertyType && (
                    <button
                      onClick={() => setPropertyType("")}
                      className="text-white/30 hover:text-white/70 text-xs ml-auto shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  className="md:w-auto w-full h-12 md:h-auto px-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  Search
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ── Dynamic Stats ── */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-0 mt-16">
            {dynamicStats.map((stat, idx) => (
              <div key={stat.label} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + idx * 0.1 }}
                  className="px-8 lg:px-12 text-center group cursor-default"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-3.5 h-3.5 text-amber-500/60" />
                  </div>
                  <div className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/40 mt-2 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
                {idx !== dynamicStats.length - 1 && (
                  <div className="hidden md:block h-8 w-px bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}