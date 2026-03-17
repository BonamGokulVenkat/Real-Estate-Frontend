"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Building2, Users2 } from "lucide-react";

// Components
import HeroSection from "@/components/common/HeroSection";
import PropertyCard from "@/components/common/PropertyCard";
import WhyChooseUs from "@/components/common/WhyChooseUs";
import AgencyCard from "@/components/common/AgencyCard";
import TestimonialsSection from "@/components/common/TestimonialsSection";
import NewsletterSection from "@/components/common/NewsletterSection";

// UI Components (Shadcn)
import { Button } from "@/components/ui/button";

// Dummy Data
import { properties, agencies } from "@/data/dummyData";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" }
} as const;

export default function Index() {
  const featured = properties.filter((p) => p.featured);

  return (
    <div className="bg-[#0A192F] min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <HeroSection />

      {/* ── Featured Properties ── */}
      <section className="relative py-24 lg:py-32">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Centered Heading Section */}
          <motion.div
            {...fadeInUp}
            className="flex flex-col items-center text-center mb-16 space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-amber-500/50" />
              <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">
                Curated Collection
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

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <div className="relative border-y border-white/5">
         <WhyChooseUs />
      </div>

      {/* ── Top Agencies Section ── */}
      <section className="py-24 lg:py-32 bg-[#081426]/50 relative border-y border-white/5">
        {/* Subtle center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
                
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            {...fadeInUp}
            className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 space-y-5"
          >
            {/* Centered Badge with dividers to match WhyChooseUs style */}
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
                
          {/* Agency Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {agencies.slice(0, 3).map((a, i) => (
              <AgencyCard key={a.id} agency={a} index={i} />
            ))}
          </div>
          
          {/* Refined Link */}
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

      <TestimonialsSection />
      
      <div className="bg-gradient-to-b from-transparent to-black/20">
        <NewsletterSection />
      </div>

      {/* ── Final Call to Action ── */}
      <section className="py-24 lg:py-40 relative overflow-hidden">
        {/* Soft atmospheric glow behind the container */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative rounded-[48px] p-12 md:p-28 text-center overflow-hidden border border-white/10 bg-[#0D2137]/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            {/* The "Golden Rim" effect - a secondary subtle inner border */}
            <div className="absolute inset-0 border border-amber-500/5 rounded-[inherit] pointer-events-none" />
            
            {/* Corner Light Sources */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] opacity-50" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              {/* Floating Icon Badge */}
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
              
              {/* Refined Button Group */}
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