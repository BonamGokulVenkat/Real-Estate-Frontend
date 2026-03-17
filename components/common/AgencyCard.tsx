"use client";

import Link from "next/link";
import { Star, MapPin, ArrowUpRight, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface Agency {
  id: string | number;
  name: string;
  rating: number;
  location: string | { city: string; country: string };
  totalProperties: number;
}

export default function AgencyCard({ agency, index }: { agency: Agency; index: number }) {
  const locationString = typeof agency.location === 'object' 
    ? `${agency.location.city}, ${agency.location.country}` 
    : agency.location;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/agencies/${agency.id}`} className="block h-full">
        <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/5">
          
          {/* Subtle Background Glow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />

          <div className="flex items-start justify-between mb-8">
            {/* Logo Placeholder / Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-[#0D2137] border border-white/10 rounded-2xl flex items-center justify-center font-serif font-bold text-2xl text-white group-hover:text-amber-400 group-hover:border-amber-500/50 transition-all duration-500">
                {agency.name[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                <Building2 className="w-3 h-3 text-[#0A192F]" />
              </div>
            </div>

            {/* Rating Badge */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold text-amber-400 tracking-wider">{agency.rating}</span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <h3 className="text-2xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
              {agency.name}
            </h3>
            
            <p className="flex items-center gap-2 text-white/40 text-sm font-light">
              <MapPin className="w-4 h-4 text-amber-500/60" />
              {locationString}
            </p>
          </div>

          <div className="flex items-end justify-between pt-6 border-t border-white/5">
            <div>
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] mb-1">Portfolio</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-serif font-bold text-white">{agency.totalProperties}</span>
                <span className="text-xs text-white/40 font-light">Listings</span>
              </div>
            </div>

            {/* Action Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center group-hover:bg-amber-500 group-hover:text-[#0A192F] group-hover:border-amber-500 transition-all duration-500 group-hover:rotate-12">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}