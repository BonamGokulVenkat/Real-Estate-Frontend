"use client";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-20 lg:py-28 bg-navy-gradient">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-gold text-sm font-medium tracking-[0.2em] uppercase mb-3">Stay Updated</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-foreground mb-4">
            Never Miss a Luxury Listing
          </h2>
          <p className="text-navy-foreground/60 text-sm max-w-lg mx-auto mb-10">
            Subscribe to receive exclusive new property alerts, market insights, and curated collections.
          </p>

          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-xl bg-navy-foreground/10 border border-navy-foreground/20 text-navy-foreground placeholder:text-navy-foreground/40 outline-none focus:border-gold transition-colors text-sm"
            />
            <button className="px-6 py-3 bg-gold text-gold-foreground rounded-xl font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2">
              <Send className="w-4 h-4" />
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
