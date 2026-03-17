"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search, LayoutGrid } from "lucide-react";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Custom Components
import PropertyCard from "@/components/common/PropertyCard";
import { properties } from "@/data/dummyData";

const types = ["all", "villa", "apartment", "penthouse", "townhouse", "mansion"] as const;

export default function JustForYou() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [maxPrice, setMaxPrice] = useState<number[]>([500000000]);
  const [minBeds, setMinBeds] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return properties
      .filter((p) => {
        if (typeFilter !== "all" && p.type.toLowerCase() !== typeFilter) return false;
        if (p.price > maxPrice[0]) return false;
        if ((p.beds || 0) < minBeds) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return 0;
      });
  }, [typeFilter, sortBy, maxPrice, minBeds]);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#0A192F] text-white selection:bg-amber-500/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* ── Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col items-center text-center mb-16 space-y-4"
        >
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-amber-500/50" />
            <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-500 px-4 py-1 uppercase tracking-[0.3em] text-[10px]">
              Exclusive Selection
            </Badge>
            <span className="h-[1px] w-8 bg-amber-500/50" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
            Just For <span className="text-white/40 italic font-light">You</span>
          </h1>
        </motion.div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12 p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "default" : "ghost"}
                onClick={() => setTypeFilter(t)}
                className={`rounded-xl text-[10px] font-bold uppercase tracking-widest h-10 px-6 transition-all ${
                  typeFilter === t 
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-amber-500 focus:ring-0">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-[#0D2137] border-white/10 text-white">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low → High</SelectItem>
                <SelectItem value="price-desc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest px-4 rounded-xl"
            >
              {showFilters ? <X className="w-4 h-4 mr-2" /> : <SlidersHorizontal className="w-4 h-4 mr-2" />}
              Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* ── Sidebar Filters ── */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-72 shrink-0`}>
            <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[32px] p-7 border border-white/10 sticky top-32 space-y-8 shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif text-lg font-bold text-white">Refine</h3>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-amber-500/50 hover:text-amber-500 text-[9px] uppercase font-bold p-0 h-auto tracking-widest"
                  onClick={() => { setMaxPrice([1000000000]); setMinBeds(0); setTypeFilter("all"); }}
                >
                  Reset
                </Button>
              </div>

              <Separator className="bg-white/5" />

              {/* 1. Price Range - Refined Scale */}
              <div className="space-y-5">
  {/* Header with Dynamic Value Label */}
  <div className="flex justify-between items-end">
    <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
      Max Budget
    </label>
    <div className="text-right">
      <span className="text-xl font-serif font-bold text-amber-500 tabular-nums">
        {maxPrice[0] >= 10000000 
          ? `₹${(maxPrice[0] / 10000000).toFixed(1)}` 
          : `₹${(maxPrice[0] / 100000).toFixed(maxPrice[0] < 1000000 ? 0 : 1)}`
        }
      </span>
      <span className="text-[9px] uppercase font-sans text-white/20 tracking-widest ml-1 font-bold">
        {maxPrice[0] >= 10000000 ? "Cr" : "Lakh"}
      </span>
    </div>
  </div>

  {/* Refined Slider */}
  <div className="relative py-2">
    <Slider
      defaultValue={[5000000]} // Default to 50 Lakhs
      max={100000000}          // 10 Cr
      min={100000}             // 1 Lakh
      step={maxPrice[0] < 1000000 ? 50000 : 500000} // Smarter steps: 50k for low range, 5 Lakh for high range
      value={maxPrice}
      onValueChange={setMaxPrice}
      className="relative flex items-center select-none touch-none w-full"
    />
    
    <style jsx global>{`
      /* Slim Track Styling */
      .relative.flex.items-center.w-full > span:first-child {
        height: 2px !important;
        background-color: rgba(255, 255, 255, 0.05) !important;
      }
      /* Active Amber Range */
      .relative.flex.items-center.w-full span > span {
        background-color: #f59e0b !important;
      }
      /* Luxury Knob (Dark center with amber ring) */
      .relative.flex.items-center.w-full [role="slider"] {
        height: 14px !important;
        width: 14px !important;
        border: 2px solid #f59e0b !important;
        background-color: #0a192f !important;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.3) !important;
        cursor: grab !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
      }
      .relative.flex.items-center.w-full [role="slider"]:active {
        cursor: grabbing !important;
      }
      .relative.flex.items-center.w-full [role="slider"]:hover {
        transform: scale(1.2) !important;
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.5) !important;
      }
    `}</style>
  </div>

  {/* Min/Max Guides */}
  <div className="flex justify-between text-[8px] font-bold uppercase tracking-[0.2em] text-white/10">
    <span>1 Lakh</span>
    <span>10 Cr</span>
  </div>
</div>

              {/* 2. Bedrooms - Compact Buttons */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Bedrooms</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      variant="outline"
                      onClick={() => setMinBeds(n)}
                      className={`h-9 rounded-lg text-[10px] font-bold transition-all border-white/5 ${
                        minBeds === n 
                        ? "bg-amber-500 text-slate-950 border-amber-500" 
                        : "bg-white/5 hover:bg-white/10 text-white/40"
                      }`}
                    >
                      {n === 0 ? "Any" : n + "+"}
                    </Button>
                  ))}
                </div>
              </div>
                
              {/* 3. Status Filter (New) */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Construction</label>
                <Select defaultValue="any">
                  <SelectTrigger className="h-9 bg-white/5 border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/60 rounded-lg focus:ring-amber-500/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0D2137] border-white/10 text-white">
                    <SelectItem value="any">All Status</SelectItem>
                    <SelectItem value="ready">Ready to Move</SelectItem>
                    <SelectItem value="under">Under Construction</SelectItem>
                    <SelectItem value="new">Newly Launched</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                
              {/* 4. Amenities - Micro Toggles (New) */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Amenities</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Pool", "Gym", "Parking", "Garden", "Security"].map((amenity) => (
                    <button
                      key={amenity}
                      className="px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-tighter text-white/40 hover:border-amber-500/50 hover:text-white transition-all"
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
                
              {/* 5. Construction Quality Badge (New Decor) */}
              <div className="pt-4">
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                  <p className="text-[9px] text-amber-500/80 font-bold uppercase tracking-[0.2em] mb-1">Expert Note</p>
                  <p className="text-[10px] text-white/40 leading-relaxed italic">
                    Prices are trending upwards in Beverly Hills and South Mumbai.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Property Grid ── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 px-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
                Showing {filtered.length} curated listings
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filtered.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-32 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01]">
                <Search className="w-12 h-12 text-white/10 mx-auto mb-6" />
                <h3 className="text-2xl font-serif font-bold text-white/60">No properties match your filters</h3>
                <p className="text-sm text-white/20 mt-2 font-light max-w-xs mx-auto">Try adjusting the price range or property type to see more results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}