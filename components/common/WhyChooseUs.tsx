"use client";

import { motion } from "framer-motion";
import { Shield, Building, Award, Headphones, Sparkles } from "lucide-react";

const features = [
  { 
    icon: Building, 
    title: "New Builds Only", 
    description: "Every property is newly constructed with modern architecture and premium materials." 
  },
  { 
    icon: Shield, 
    title: "Verified Listings", 
    description: "All properties are thoroughly verified for quality, legality, and builder reputation." 
  },
  { 
    icon: Award, 
    title: "Premium Quality", 
    description: "Curated selection of the finest luxury residences from top global developers." 
  },
  { 
    icon: Headphones, 
    title: "Concierge Service", 
    description: "Dedicated luxury concierge to guide you through every step of your journey." 
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#0A192F] overflow-hidden">
      {/* ── Background Elements ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Fully Centered Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 space-y-5"
        >
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">
              The Luxora Standard
            </span>
            <span className="h-[1px] w-8 bg-amber-500/50" />
          </div>
          
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Elevating the <span className="italic font-light text-white/40">Experience</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg font-light leading-relaxed max-w-2xl">
            Beyond square footage and locations, we curate lifestyles defined by excellence, privacy, and security.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="group relative"
            >
              {/* Card Hover Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-b from-amber-500/10 to-transparent rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              
              <div className="relative h-full bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-[24px] transition-all duration-500 group-hover:bg-white/[0.04] group-hover:-translate-y-1.5">
                
                {/* Refined Icon Container (Scaled down for sophistication) */}
                <div className="w-12 h-12 mb-6 rounded-xl bg-[#0D2137] border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-amber-500/40 transition-all duration-500">
                  <f.icon className="w-5 h-5 text-white/90 group-hover:text-amber-500 transition-colors duration-500" />
                  <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="font-serif text-lg font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                  {f.title}
                </h3>
                
                <p className="text-white/40 text-xs md:text-sm leading-relaxed font-light group-hover:text-white/60 transition-colors">
                  {f.description}
                </p>

                {/* Animated Bottom Line */}
                <div className="mt-6 h-[1px] w-0 bg-amber-500/30 group-hover:w-full transition-all duration-700 ease-in-out" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}