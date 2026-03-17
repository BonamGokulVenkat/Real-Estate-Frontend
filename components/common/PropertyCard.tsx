"use client";

import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Maximize, MapPin, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Property } from "@/types"; // Make sure this is importing the updated interface

export default function PropertyCard({ property, index }: { property: Property; index: number }) {
  // Logic to handle Indian formatting for the price
  const formatIndianPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group"
    >
      <Link href={`/property/${property.id}`} className="block h-full">
        <div className="relative h-full bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden transition-all duration-500 hover:bg-white/[0.05] hover:border-amber-500/30 group-hover:-translate-y-1.5 shadow-2xl">
          
          <div className="absolute inset-0 border border-amber-500/0 group-hover:border-amber-500/10 rounded-[24px] pointer-events-none transition-colors duration-500" />

          {/* Image Section */}
          <div className="relative aspect-[16/11] overflow-hidden">
            <Image 
              src={property.images[0]} 
              alt={property.title} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-4 left-5">
               <p className="text-white font-serif text-xl font-bold tracking-tight">
                {formatIndianPrice(property.price)}
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {property.title}
              </h3>
              <div className="p-1.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-amber-500 transition-all">
                <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:text-[#0A192F]" />
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-white/30 text-[11px] mb-6 font-light">
              <MapPin className="w-3.5 h-3.5 text-amber-500/60" /> {property.location.city}
            </p>

            {/* Features Row - Updated to use bedrooms, bathrooms, and size */}
            <div className="flex items-center justify-between pt-5 border-t border-white/5">
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
                  <span className="text-sm">{property.size}</span>
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