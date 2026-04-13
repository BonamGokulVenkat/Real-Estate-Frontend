"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A192F] text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="h-px w-8 bg-amber-500/50" />
          <span className="text-amber-500 text-[10px] font-bold tracking-[0.4em] uppercase">Error 404</span>
          <span className="h-px w-8 bg-amber-500/50" />
        </div>

        <h1 className="font-serif text-7xl md:text-9xl font-bold text-white/10 mb-2 tracking-tighter select-none">
          404
        </h1>
        <h2 className="font-serif text-3xl font-bold text-white mb-4 -mt-4">
          Page <span className="text-white/40 italic font-light">Not Found</span>
        </h2>
        <p className="text-white/40 text-sm font-light leading-relaxed mb-10 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a different address.
        </p>

        <Button asChild className="h-14 px-10 bg-amber-500 hover:bg-amber-400 text-[#0A192F] rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          <Link href="/" className="flex items-center gap-3">
            <Home className="w-4 h-4" />
            Return to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}