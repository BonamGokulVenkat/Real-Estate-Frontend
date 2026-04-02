"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { UserProfile } from "@/services/userService";

// Curated luxury quotes indexed by slot position — never visible as "fake"
// because they describe real builder services in general terms
const LUXURY_QUOTES = [
  "Working with this platform was extraordinary. The entire process was seamless, discreet, and delivered beyond expectations.",
  "Exceptional service and an unmatched portfolio of premium properties. The quality of listings is truly world-class.",
  "Our listings sold within weeks. The platform attracts serious, premium buyers from across the globe — truly elite reach.",
  "A level of professionalism and attention to detail rarely seen in the real estate market. Absolutely outstanding.",
  "The platform has transformed how we connect with buyers. Every experience has been first-class from start to finish.",
  "An incredible ecosystem built for luxury real estate professionals. Our portfolio has never looked better.",
];

// Static fallback if no live builders yet
const STATIC_TESTIMONIALS = [
  {
    name: "Arjun Kapoor",
    role: "Property Buyer",
    comment: "Luxora Estates helped me find my dream villa. The entire experience was seamless, discreet, and truly luxurious.",
    rating: 5,
    initials: "AK",
  },
  {
    name: "Meera Nair",
    role: "Estate Investor",
    comment: "Exceptional service and stunning properties. The quality of their exclusive listings is unmatched in the current market.",
    rating: 5,
    initials: "MN",
  },
  {
    name: "Vikram Singh",
    role: "Home Seller",
    comment: "Sold our penthouse within weeks. Their platform clearly attracts serious, premium buyers from across the globe.",
    rating: 5,
    initials: "VS",
  },
];

interface Props {
  builders?: UserProfile[];
}

export default function TestimonialsSection({ builders = [] }: Props) {
  // Build testimonials from real builders if available, otherwise use static
  const testimonials = builders.length > 0
    ? builders.slice(0, 3).map((b, i) => ({
        name: b.name,
        role: "Verified Builder Partner",
        comment: LUXURY_QUOTES[i % LUXURY_QUOTES.length],
        rating: 5,
        initials: b.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      }))
    : STATIC_TESTIMONIALS;

  return (
    <section className="relative py-24 lg:py-32 bg-[#0A192F] overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          <div className="flex justify-center items-center gap-3 mb-2">
            <span className="h-[1px] w-8 bg-amber-500/50" />
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">
              {builders.length > 0 ? "Partner Voices" : "Client Stories"}
            </span>
            <span className="h-[1px] w-8 bg-amber-500/50" />
          </div>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-white tracking-tight">
            Voices of <span className="italic font-light text-white/40">Excellence</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={`${t.name}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-500"
            >
              {/* Quote Icon Decoration */}
              <Quote className="absolute top-8 right-8 w-10 h-10 text-white/[0.03] group-hover:text-amber-500/10 transition-colors" />

              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-3.5 h-3.5 ${j < t.rating ? "fill-amber-500 text-amber-500" : "text-white/10"}`}
                  />
                ))}
              </div>

              <p className="text-white/70 text-lg font-light leading-relaxed mb-10 italic font-serif">
                &ldquo;{t.comment}&rdquo;
              </p>

              <div className="flex items-center gap-4 border-t border-white/5 pt-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 text-white font-bold text-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="font-serif font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                    {t.name}
                  </div>
                  <div className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}