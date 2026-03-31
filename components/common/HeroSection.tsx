"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Search, MapPin, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { propertyService } from "@/services/propertyService";
// Optimized Data constants
const STATS = [
  { value: "200+", label: "Premium Properties" },
  { value: "50+", label: "Top Agencies" },
  { value: "100%", label: "New Builds" },
] as const;

const PROPERTY_TYPES = ["Villa", "Penthouse", "Apartment", "Townhouse", "Estate"] as const;


export default function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const searchParams = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<string>(
  searchParams.get("type") || "all");
  const [cityFilter, setCityFilter] = useState<string>(
  searchParams.get("city") || "all");
  const [propertyType, setPropertyType] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const { data: cities = [] } = useQuery({
  queryKey: ["property-cities"],
  queryFn: propertyService.getCities,
});
  // Parallax logic with smoother spring physics
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if(typeFilter !== "all") params.set("type", typeFilter);
    if(cityFilter !== "all") params.set("city", cityFilter);
  }, [typeFilter, cityFilter, router]);

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const bgY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(smoothProgress, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(smoothProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A192F] selection:bg-amber-500/30"
    >
      {/* ── Background Layer ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg" // Ensure this exists in your public folder
          alt="Luxury property"
          fill
          priority
          className="object-cover object-center transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/80 via-[#0A192F]/40 to-[#0A192F]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F]/70 via-transparent to-[#0A192F]/30" />
      </motion.div>

      {/* ── Lighting Effects ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* ── Grid Pattern ── */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem'
        }}
      />

      {/* ── Main Content ── */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* <Badge
              variant="outline"
              className="mb-8 px-4 py-1.5 border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] sm:text-xs tracking-[0.2em] uppercase backdrop-blur-md"
            >
              <Sparkles className="w-3 h-3 mr-2 text-amber-500" />
              Premium New-Build Properties
            </Badge> */}
          </motion.div>

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

          {/* ── Search Bar Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
            
            <div className="relative bg-[#0A192F]/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <div className="flex flex-col md:flex-row items-stretch gap-2">
                
                {/* Location Input */}
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-xl focus-within:border-amber-500/50 transition-all">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="border-0 bg-transparent text-white focus:ring-0 shadow-none h-10 px-0 font-light">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>

                    <SelectContent className="bg-[#0D2137] border-white/10 text-white">
                      {cities.map((city: string) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator orientation="vertical" className="hidden md:block bg-white/10 h-10 self-center" />

                {/* Property Type */}
                <div className="flex-1 flex items-center gap-3 px-4 py-1 bg-white/5 border border-white/5 rounded-xl transition-all">
                  <Search className="w-4 h-4 text-amber-500" />
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="border-0 bg-transparent text-white focus:ring-0 shadow-none h-10 px-0 font-light">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D2137] border-white/10 text-white">
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()} className="focus:bg-amber-500 focus:text-navy-950">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => {
                    const query = new URLSearchParams();

                    if (location) query.append("city", location);
                    if (propertyType) query.append("type", propertyType);
                    
                     router.push(`just-for-you?${query.toString()}`);
                  }}
                  className="md:w-auto w-full h-12 md:h-auto px-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all"
                >
                  Search
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-4 px-4 pt-3 pb-1">
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Trending</span>
                {["Miami", "Malibu", "NYC"].map((city) => (
                  <button
                    key={city}
                    onClick={() => setLocation(city)}
                    className="text-xs text-white/50 hover:text-amber-400 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Stats ── */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-0 mt-16">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className="flex items-center">
                <div className="px-8 lg:px-12 text-center">
                  <div className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/40 mt-2 font-medium">
                    {stat.label}
                  </div>
                </div>
                {idx !== STATS.length - 1 && (
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